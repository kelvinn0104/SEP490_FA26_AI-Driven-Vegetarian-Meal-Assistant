import { useEffect, useRef, useState } from "react";
import { CookingPot, Heart, Image, MessageCircle, PenLine, Search, Trash2 } from "lucide-react";
import { useResource, Button, State, PageControls, Notice } from "./ui";
import { listOf, isTestContent, postStatusLabel, userError } from "./data";
import { request } from "./api";
import { PostMeta, PostMedia, CommunityDialog, updatePostLike } from "./PostParts";

function FeedPost({ post, user, mine, go, remove }) {
  const [reaction, setReaction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const liked = reaction?.liked ?? post.myVote === 1;
  const likes = reaction?.likeCount ?? post.likeCount;
  const count = likes ?? reaction?.score ?? post.score;
  const titleIsExcerpt = post.excerpt && (post.excerpt.startsWith(post.title) || post.title.startsWith(post.excerpt.replace(/…$/, "")));
  const open = (event, comments = false) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go("post-detail", post.id);
    if (comments) window.history.replaceState({}, "", `${location.pathname}${location.search}#post-comments`);
  };
  async function toggleLike() {
    if (!user) return go("login");
    if (lock.current) return;
    lock.current = true;
    setSaving(true);
    setError("");
    try {
      setReaction(await updatePostLike(post, !liked));
    } catch (cause) {
      setError(userError(cause));
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  return <article className="vp-thread-post">
    <div className="vp-thread-post-head">
      <PostMeta post={post} />
      {mine && <span className="vp-post-status" data-status={post.status}>{postStatusLabel(post)}</span>}
    </div>
    {mine && post.moderation?.note && <Notice>{post.moderation.note}</Notice>}
    <a href={`/post-detail?id=${post.id}`} aria-label={`Mở bài ${post.title}`}
      className="vp-thread-copy" onClick={open}>
      {!titleIsExcerpt && <strong>{post.title}</strong>}
      {post.excerpt && <span>{post.excerpt}</span>}
    </a>
    {post.mediaUrl && <PostMedia key={post.mediaUrl} post={post} />}
    {post.recipeId && post.recipeTitle && <a className="vp-thread-recipe" href={`/article-detail?id=r${post.recipeId}`}
      onClick={(event) => { event.preventDefault(); go("article-detail", `r${post.recipeId}`); }}>
      <CookingPot size={17} /> <span>{post.recipeTitle}</span>
    </a>}
    <div className="vp-thread-actions">
      {post.status === "published" && <>
        <button type="button" aria-pressed={liked}
          aria-label={`${liked ? "Bỏ thích" : "Thích"}${count == null ? "" : `, ${count} ${likes == null ? "điểm hữu ích" : "lượt thích"}`}`}
          disabled={saving} onClick={toggleLike}>
          <Heart size={20} fill={liked ? "currentColor" : "none"} />{count ?? ""}
        </button>
        <a href={`/post-detail?id=${post.id}#post-comments`} aria-label={`Bình luận (${post.commentCount ?? 0})`} onClick={(event) => open(event, true)}>
          <MessageCircle size={20} />{post.commentCount ?? 0}
        </a>
      </>}
      {mine && post.canEdit && <button aria-label="Sửa bài" onClick={() => go("create-post", post.id)}><PenLine size={18} /></button>}
      {mine && post.canDelete && <button aria-label="Xóa bài" onClick={() => remove(post)}><Trash2 size={17} /></button>}
    </div>
    {error && <Notice error>{error}</Notice>}
  </article>;
}

export function Community({ mine, go, user, flash, videos = false }) {
  const initial = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(() => Math.max(1, Math.min(100000, Number(initial.get("page")) || 1)));
  const [search, setSearch] = useState(initial.get("q")?.slice(0, 200) || "");
  const [keyword, setKeyword] = useState(search);
  const [sort, setSort] = useState(initial.get("sort") === "top" ? "top" : "newest");
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const query = new URLSearchParams();
    if (page > 1) query.set("page", page);
    if (keyword) query.set("q", keyword);
    if (sort === "top") query.set("sort", sort);
    window.history.replaceState({}, "", `${location.pathname}${query.size ? "?" + query : ""}`);
  }, [page, keyword, sort]);
  const resource = useResource((signal) => {
    const query = new URLSearchParams({ "page.Page": page, "page.PageSize": 12, sort });
    if (keyword) query.set("keyword", keyword);
    if (videos) query.set("postType", "video");
    return request(`/community/posts${mine ? "/mine" : ""}?${query}`, undefined, undefined, signal);
  }, [mine, page, keyword, sort, videos, user?.id]);
  const items = listOf(resource.data).filter((item) => mine || !isTestContent(item));
  async function remove() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (await request(`/community/posts/${deleting.id}`, undefined, "DELETE") !== true)
        throw new Error("Chưa xác nhận được bài đã xóa.");
      setDeleting(null);
      flash("Đã xóa bài viết.");
      if (items.length === 1 && page > 1) setPage(page - 1);
      else resource.reload();
    } catch (cause) {
      setError(userError(cause));
    } finally {
      setBusy(false);
    }
  }
  return <div className="vp-thread-shell">
    <header className="vp-thread-heading">
      <div><h1>{videos ? "Video cộng đồng" : "Cộng đồng"}</h1><p>Chuyện quanh mâm cơm chay</p></div>
      <Button onClick={() => go("create-post")}><PenLine size={17} /> Viết bài</Button>
    </header>
    <nav className="vp-community-tabs" aria-label="Bảng tin cộng đồng">
      <a href="/community" aria-current={!mine && !videos ? "page" : undefined} onClick={(event) => { event.preventDefault(); go("community"); }}>Bảng tin</a>
      <a href="/videos" aria-current={videos ? "page" : undefined} onClick={(event) => { event.preventDefault(); go("videos"); }}>Video</a>
      <a href="/user-posts" aria-current={mine ? "page" : undefined} onClick={(event) => { event.preventDefault(); go("user-posts"); }}>Bài của tôi</a>
    </nav>
    {!mine && <>
      <button className="vp-thread-prompt" type="button" onClick={() => go("create-post")}>
        <span className="vp-author-initial" aria-hidden="true">{(user?.displayName || user?.name || "V").slice(0, 1)}</span>
        <span>Bạn muốn chia sẻ gì?</span><Image size={20} aria-hidden="true" />
      </button>
      <div className="vp-thread-tools">
        <form role="search" onSubmit={(event) => { event.preventDefault(); setKeyword(search.trim()); setPage(1); }}>
          <Search size={17} />
          <input type="search" aria-label="Tìm bài viết" placeholder="Tìm bài viết…" maxLength={200} value={search}
            onChange={(event) => { setSearch(event.target.value); if (!event.target.value) { setPage(1); setKeyword(""); } }} />
        </form>
        <select aria-label="Sắp xếp bài viết" value={sort} onChange={(event) => { setPage(1); setSort(event.target.value); }}>
          <option value="newest">Mới nhất</option><option value="top">Nổi bật</option>
        </select>
      </div>
    </>}
    <State resource={resource}>
      {items.length ? <div className="vp-thread-list">{items.map((post) =>
        <FeedPost key={post.id} post={post} user={user} mine={mine} go={go} remove={(value) => { setError(""); setDeleting(value); }} />
      )}</div> : <div className="vp-empty"><MessageCircle size={25} /><h2>{mine ? "Bạn chưa có bài viết" : "Chưa có bài phù hợp"}</h2></div>}
    </State>
    <PageControls data={resource.data} page={page} setPage={setPage} disabled={resource.loading} />
    {deleting && <CommunityDialog title="Xóa bài viết?" busy={busy} close={() => setDeleting(null)}>
      {error && <Notice error>{error}</Notice>}
      <div className="vp-actions">
        <Button secondary disabled={busy} onClick={() => setDeleting(null)}>Giữ bài</Button>
        <Button disabled={busy} onClick={remove}>{busy ? "Đang xóa…" : "Xóa bài"}</Button>
      </div>
    </CommunityDialog>}
  </div>;
}
