"""DB-first scaffolder: reads schema `veggieai` from PostgreSQL and emits
EF Core 8 entity classes + DbContext (same conventions as `dotnet ef dbcontext scaffold`)."""
import os, re, sys, collections
import psycopg2

OUT = sys.argv[1]
SCHEMA = "veggieai"
conn = psycopg2.connect(host="localhost", dbname="veggieai_db", user="veggieadmin", password="veggiepassword123")
cur = conn.cursor()

def q(sql, *a):
    cur.execute(sql, a); return cur.fetchall()

tables = [r[0] for r in q("""select table_name from information_schema.tables
    where table_schema=%s and table_type='BASE TABLE' order by table_name""", SCHEMA)]

cols = collections.OrderedDict()
for t in tables:
    cols[t] = q("""select column_name, data_type, is_nullable='YES', column_default, character_maximum_length,
        numeric_precision, numeric_scale, is_identity='YES'
        from information_schema.columns where table_schema=%s and table_name=%s order by ordinal_position""", SCHEMA, t)

def constraint_cols(conname):
    return [r[0] for r in q("""select a.attname from pg_constraint c
        join lateral unnest(c.conkey) with ordinality k(attnum, ord) on true
        join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.attnum
        where c.conname=%s and c.connamespace=%s::regnamespace order by k.ord""", conname, SCHEMA)]

pks, uniques, fks = {}, collections.defaultdict(list), []
for conname, contype, tbl, ftbl, deltype in q("""select c.conname, c.contype, cl.relname, fcl.relname, c.confdeltype
        from pg_constraint c join pg_class cl on cl.oid=c.conrelid
        left join pg_class fcl on fcl.oid=c.confrelid
        where c.connamespace=%s::regnamespace and c.contype in ('p','u','f') order by c.conname""", SCHEMA):
    cc = constraint_cols(conname)
    if contype == 'p': pks[tbl] = (conname, cc)
    elif contype == 'u': uniques[tbl].append((conname, cc))
    else: fks.append(dict(name=conname, tbl=tbl, col=cc[0], ref=ftbl, delete=deltype))

indexes = collections.defaultdict(list)
for tbl, idx, idef in q("""select tablename, indexname, indexdef from pg_indexes where schemaname=%s
        and indexname like 'IX_%%' order by indexname""", SCHEMA):
    c = re.findall(r'"(\w+)"', idef.split("USING")[1])
    indexes[tbl].append((idx, c))

# ---------- helpers ----------
def plural(n):
    if n.endswith("Data"): return n
    if re.search(r"[^aeiou]y$", n): return n[:-1] + "ies"
    if n.endswith("s"): return n + "es"
    return n + "s"

def clr(dt, nullable):
    m = {"integer": "int", "bigint": "long", "smallint": "short", "character varying": "string", "text": "string",
         "numeric": "decimal", "date": "DateOnly", "timestamp with time zone": "DateTime", "boolean": "bool",
         "jsonb": "string"}[dt]
    if nullable: return m + "?"
    return m

def literal_default(dt, d):
    """Return C# initializer for literal DB defaults (avoids EF sentinel pitfalls)."""
    if d is None or "now()" in d or "nextval" in d: return None
    m = re.match(r"'(.*)'::", d)
    if m: return f'"{m.group(1)}"'
    if d in ("true", "false"): return d
    if re.fullmatch(r"-?\d+(\.\d+)?", d):
        return d + ("m" if dt == "numeric" else "")
    return None

# join tables -> skip navigations
join_tables = {}
for t in tables:
    tf = [f for f in fks if f["tbl"] == t]
    if len(cols[t]) == 2 and len(tf) == 2 and t in pks and len(pks[t][1]) == 2:
        join_tables[t] = tf

def is_unique_col(t, c):
    return any(cc == [c] for _, cc in uniques[t]) or (t in pks and pks[t][1] == [c])

# navigation names
for f in fks:
    c = f["col"]
    if f["tbl"] in join_tables: continue
    if c == f["ref"] + "Id": nav = f["ref"]
    elif c.endswith("Id"): nav = c[:-2]
    else: nav = c + "Navigation"
    f["nav"] = nav
    f["one"] = is_unique_col(f["tbl"], c)
for f in fks:
    if f["tbl"] in join_tables: continue
    siblings = [g for g in fks if g["tbl"] == f["tbl"] and g["ref"] == f["ref"]]
    if f["one"]: f["inv"] = f["tbl"] if len(siblings) == 1 else f["tbl"] + f["nav"]
    else: f["inv"] = plural(f["tbl"]) if len(siblings) == 1 else f["tbl"] + plural(f["nav"])

# ---------- entities ----------
os.makedirs(f"{OUT}/Entities", exist_ok=True)
for t in tables:
    if t in join_tables: continue
    L = ["namespace VeggieAI.Domain.Entities;", "", f"public partial class {t}", "{"]
    for name, dt, nullable, d, *_ in cols[t]:
        typ = clr(dt, nullable)
        init = literal_default(dt, d)
        if typ == "string": init = init or "null!"
        L.append(f"    public {typ} {name} {{ get; set; }}" + (f" = {init};" if init else ""))
    L.append("")
    for f in fks:
        if f.get("nav") and f["tbl"] == t:
            nullable = next(c[2] for c in cols[t] if c[0] == f["col"])
            L.append(f"    public virtual {f['ref']}{'?' if nullable else ''} {f['nav']} {{ get; set; }}" + ("" if nullable else " = null!;"))
    for f in fks:
        if f.get("nav") and f["ref"] == t:
            if f["one"]: L.append(f"    public virtual {f['tbl']}? {f['inv']} {{ get; set; }}")
            else: L.append(f"    public virtual ICollection<{f['tbl']}> {f['inv']} {{ get; set; }} = new List<{f['tbl']}>();")
    for jt, (a, b) in join_tables.items():
        for me, other in ((a, b), (b, a)):
            if me["ref"] == t:
                L.append(f"    public virtual ICollection<{other['ref']}> {plural(other['ref'])} {{ get; set; }} = new List<{other['ref']}>();")
    while L[-1] == "": L.pop()
    L.append("}")
    open(f"{OUT}/Entities/{t}.cs", "w").write("\n".join(L) + "\n")

# ---------- DbContext ----------
D = ["using Microsoft.EntityFrameworkCore;", "using VeggieAI.Domain.Entities;", "",
     "namespace VeggieAI.Infrastructure.Persistence;", "",
     "/// <summary>Generated (DB-first) from VeggieAI_Database.sql — schema \"veggieai\".</summary>",
     "public partial class VeggieAiDbContext : DbContext", "{",
     "    public VeggieAiDbContext(DbContextOptions<VeggieAiDbContext> options) : base(options) { }", ""]
for t in tables:
    if t in join_tables: continue
    D.append(f"    public virtual DbSet<{t}> {plural(t)} => Set<{t}>();")
D += ["", "    protected override void OnModelCreating(ModelBuilder modelBuilder)", "    {",
      f'        modelBuilder.HasDefaultSchema("{SCHEMA}");', ""]
DEL = {"c": "DeleteBehavior.Cascade", "n": "DeleteBehavior.SetNull"}
for t in tables:
    if t in join_tables: continue
    D.append(f"        modelBuilder.Entity<{t}>(entity =>")
    D.append("        {")
    pkname, pkc = pks[t]
    keyexpr = f"e => e.{pkc[0]}" if len(pkc) == 1 else "e => new { " + ", ".join(f"e.{c}" for c in pkc) + " }"
    D.append(f'            entity.HasKey({keyexpr}).HasName("{pkname}");')
    D.append(f'            entity.ToTable("{t}");')
    for idx, ic in indexes[t]:
        ie = f"e => e.{ic[0]}" if len(ic) == 1 else "e => new { " + ", ".join(f"e.{c}" for c in ic) + " }"
        D.append(f'            entity.HasIndex({ie}, "{idx}");')
    for un, uc in uniques[t]:
        ie = f"e => e.{uc[0]}" if len(uc) == 1 else "e => new { " + ", ".join(f"e.{c}" for c in uc) + " }"
        D.append(f'            entity.HasIndex({ie}, "{un}").IsUnique();')
    for name, dt, nullable, d, maxlen, prec, scale, ident in cols[t]:
        parts = []
        if maxlen: parts.append(f".HasMaxLength({maxlen})")
        if dt == "numeric": parts.append(f".HasPrecision({prec}, {scale})")
        if dt == "jsonb": parts.append('.HasColumnType("jsonb")')
        if d and "now()" in d: parts.append('.HasDefaultValueSql("now()")')
        if ident and len(pkc) == 1 and pkc[0] == name: parts.append(".UseIdentityByDefaultColumn()")
        if parts: D.append(f"            entity.Property(e => e.{name}){''.join(parts)};")
    for f in fks:
        if f.get("nav") and f["tbl"] == t:
            nullable = next(c[2] for c in cols[t] if c[0] == f["col"])
            beh = DEL.get(f["delete"], "DeleteBehavior.ClientSetNull" if nullable else "DeleteBehavior.Restrict")
            if f["one"]:
                D.append(f"            entity.HasOne(d => d.{f['nav']}).WithOne(p => p.{f['inv']})"
                         f".HasForeignKey<{t}>(d => d.{f['col']}).OnDelete({beh}).HasConstraintName(\"{f['name']}\");")
            else:
                D.append(f"            entity.HasOne(d => d.{f['nav']}).WithMany(p => p.{f['inv']})"
                         f".HasForeignKey(d => d.{f['col']}).OnDelete({beh}).HasConstraintName(\"{f['name']}\");")
    for jt, (a, b) in join_tables.items():
        if a["ref"] == t:
            D.append(f"            entity.HasMany(d => d.{plural(b['ref'])}).WithMany(p => p.{plural(a['ref'])})")
            D.append(f"                .UsingEntity<Dictionary<string, object>>(\"{jt}\",")
            D.append(f"                    r => r.HasOne<{b['ref']}>().WithMany().HasForeignKey(\"{b['col']}\").OnDelete(DeleteBehavior.Cascade).HasConstraintName(\"{b['name']}\"),")
            D.append(f"                    l => l.HasOne<{a['ref']}>().WithMany().HasForeignKey(\"{a['col']}\").OnDelete(DeleteBehavior.Cascade).HasConstraintName(\"{a['name']}\"),")
            D.append(f"                    j => {{ j.HasKey(\"{pks[jt][1][0]}\", \"{pks[jt][1][1]}\").HasName(\"{pks[jt][0]}\"); j.ToTable(\"{jt}\"); }});")
    D.append("        });")
    D.append("")
D += ["        OnModelCreatingPartial(modelBuilder);", "    }", "",
      "    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);", "}"]
open(f"{OUT}/VeggieAiDbContext.cs", "w").write("\n".join(D) + "\n")
print("tables:", len(tables), "join:", list(join_tables))
