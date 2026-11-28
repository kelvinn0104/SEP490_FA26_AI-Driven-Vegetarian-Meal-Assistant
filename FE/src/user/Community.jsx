import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Clock3, CookingPot, Film, Heart, Image, MessageCircle, PenLine, Search, Share2, Trash2, Users } from "lucide-react";
import { useResource, Button, State, PageControls, Notice } from "./ui";
import { listOf, isTestContent, postStatusLabel, userError } from "./data";
import { request } from "./api";
import { PostMeta, PostMedia, CommunityDialog, updatePostLike } from "./PostParts";

import { CreatePost } from "./PostComposer";

function FeedPost({ post, user, mine, go, remove, flash }) {
  const [reaction, setReaction] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
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
  async function share() {
    const url = new URL(`/post-detail?id=${post.id}`, location.origin).href;
    try {
      if (navigator.share && (!navigator.canShare || navigator.canShare({ title: post.title, url }))) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        flash("Đã sao chép liên kết.");
      }
    } catch (cause) {
      if (cause.name !== "AbortError") setShareUrl(url);
    }
  }

  const postUrl = `/post-detail?id=${post.id}`;
  return <article className="vp-thread-post">
    <div className="vp-thread-post-head">
      <PostMeta post={post} />
      {mine && <span className="vp-post-status" data-status={post.status}>
        {post.status === "pending" && !post.moderation?.decision && <Clock3 size={13} aria-hidden="true" />} {postStatusLabel(post)}
      </span>}
    </div>
    {mine && post.moderation?.note && <Notice>{post.moderation.note}</Notice>}
    <a href={postUrl} aria-label={`Mở bài ${post.title}`}
      className="vp-thread-copy" onClick={open}>
      {!titleIsExcerpt && <h2>{post.title}</h2>}
      {post.excerpt && <span>{post.excerpt}</span>}
      {post.excerpt?.endsWith("…") && <small className="vp-social-readmore">Xem thêm</small>}
    </a>
    {post.mediaUrl && <PostMedia key={post.mediaUrl} post={post} />}
    {post.recipeId && post.recipeTitle && <a className="vp-thread-recipe" href={`/article-detail?id=r${post.recipeId}`}
      onClick={(event) => { event.preventDefault(); go("article-detail", `r${post.recipeId}`); }}>
      <CookingPot size={20} aria-hidden="true" /><span><small>Công thức đính kèm</small><strong>{post.recipeTitle}</strong></span><ArrowUpRight size={16} aria-hidden="true" />
    </a>}
    {post.status === "published" && <div className="vp-social-stats">
      <span><Heart size={15} aria-hidden="true" /> {count ?? 0} {likes == null ? "điểm hữu ích" : "lượt thích"}</span>
      <a href={`/post-detail?id=${post.id}#post-comments`} onClick={(event) => open(event, true)}>{post.commentCount ?? 0} bình luận</a>
    </div>}
    {(post.status === "published" || (mine && (post.canEdit || post.canDelete))) && <div className="vp-thread-actions vp-social-actions">
      {post.status === "published" && <>
        <button type="button" aria-pressed={liked} disabled={saving} onClick={toggleLike}>
          <Heart size={19} fill={liked ? "currentColor" : "none"} aria-hidden="true" />{liked ? "Đã thích" : "Thích"}
        </button>
        <a href={`/post-detail?id=${post.id}#post-comments`} onClick={(event) => open(event, true)}>
          <MessageCircle size={19} aria-hidden="true" />Bình luận
        </a>
        <button type="button" onClick={share}><Share2 size={18} aria-hidden="true" />Chia sẻ</button>
      </>}
      {mine && post.canEdit && <button type="button" onClick={() => go("create-post", post.id)}><PenLine size={18} />Sửa bài</button>}
      {mine && post.canDelete && <button type="button" onClick={() => remove(post)}><Trash2 size={17} />Xóa bài</button>}
    </div>}
    {error && <Notice error>{error}</Notice>}
    {shareUrl && <CommunityDialog title="Chia sẻ bài viết" close={() => setShareUrl("")}>
      <label>Liên kết bài viết
        <input readOnly value={shareUrl} onFocus={(event) => event.target.select()} />
      </label>
    </CommunityDialog>}
  </article>;
}

export function Community({ mine, go, user, flash, videos = false }) {
  const initial = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(() => Math.max(1, Math.min(100000, Math.floor(Number(initial.get("page")) || 1))));
  const [search, setSearch] = useState(initial.get("q")?.slice(0, 200) || "");
  const [keyword, setKeyword] = useState(search);
  const [sort, setSort] = useState(initial.get("sort") === "top" ? "top" : "newest");
  const [composing, setComposing] = useState(null);
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
      if (listOf(resource.data).length === 1 && page > 1) setPage(page - 1);
      else resource.reload();
    } catch (cause) {
      setError(userError(cause));
    } finally {
      setBusy(false);
    }
  }
  const compose = (tool = "text") => user ? setComposing(tool) : go("create-post");
  return <div className="vp-social-layout">
    <header className="vp-social-sidebar">
      <h1>{mine ? "Bài của tôi" : videos ? "Video cộng đồng" : "Cộng đồng"}</h1>
      <nav className="vp-community-tabs" aria-label="Cộng đồng">
        {[
          ["community", "Bảng tin", Users, !mine && !videos],
          ["videos", "Video", Film, videos],
          ...(user ? [["user-posts", "Bài của tôi", PenLine, mine]] : []),
        ].map(([route, label, Icon, current]) => (
          <a key={route} href={`/${route}`} aria-current={current ? "page" : undefined}
            onClick={(event) => { if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); go(route); } }}>
            <Icon size={19} aria-hidden="true" />{label}
          </a>
        ))}
      </nav>
    </header>
    <section className="vp-thread-shell" aria-label="Bài viết cộng đồng">
      <div className="vp-social-composer-card">
        <button className="vp-thread-prompt" type="button" onClick={() => compose()}>
          <span className="vp-author-initial" aria-hidden="true">{(user?.displayName || user?.name || "V").trim().slice(0, 1).toUpperCase()}</span>
          <span>{user ? "Bạn muốn chia sẻ gì?" : "Đăng nhập để viết bài"}</span>
        </button>
        <div className="vp-thread-actions vp-social-actions">
          <button type="button" onClick={() => compose("file")}><Image size={19} aria-hidden="true" />Ảnh / video</button>
          <button type="button" onClick={() => compose("recipe")}><CookingPot size={19} aria-hidden="true" />Công thức</button>
        </div>
      </div>
      {mine ? <div className="vp-social-review-note"><Clock3 size={17} aria-hidden="true" /> Bài chờ duyệt chỉ hiện ở đây. Sau khi duyệt, bài sẽ lên bảng tin.</div> : <>
      <div className="vp-thread-tools">
        <form role="search" onSubmit={(event) => { event.preventDefault(); setKeyword(search.trim()); setPage(1); }}>
          <Search size={17} />
          <input type="search" aria-label="Tìm bài viết" placeholder="Tìm bài viết…" maxLength={200} value={search}
            onChange={(event) => { setSearch(event.target.value); if (!event.target.value) { setPage(1); setKeyword(""); } }} />
          <button type="submit">Tìm</button>
        </form>
        <select aria-label="Sắp xếp bài viết" value={sort} onChange={(event) => { setPage(1); setSort(event.target.value); }}>
          <option value="newest">Mới nhất</option><option value="top">Nổi bật</option>
        </select>
      </div>
    </>}
    <State resource={{ ...resource, data: items }}
      empty={mine ? "Bạn chưa có bài viết" : keyword ? "Không tìm thấy bài viết" : videos ? "Chưa có video" : "Chưa có bài viết"}
      emptyAction={keyword
        ? <Button secondary onClick={() => { setSearch(""); setKeyword(""); setPage(1); }}>Xóa tìm kiếm</Button>
        : mine && <Button onClick={() => compose()}>Viết bài đầu tiên</Button>}>
      <div className="vp-thread-list">{items.map((post) =>
        <FeedPost key={post.id} post={post} user={user} mine={mine} go={go} flash={flash} remove={(value) => { setError(""); setDeleting(value); }} />
      )}</div>
    </State>
    <PageControls data={resource.data} page={page} setPage={(next) => {
      setPage(next);
      document.querySelector(".vp-social-layout")?.scrollIntoView({ block: "start" });
    }} disabled={resource.loading} />
    </section>
    {composing && user && <CreatePost go={go} user={user} tool={composing} close={(saved) => { setComposing(null); if (saved === true) resource.reload(); }} />}
    {deleting && <CommunityDialog title="Xóa bài viết?" busy={busy} close={() => setDeleting(null)}>
      <p>Bài viết sẽ được gỡ khỏi cộng đồng.</p>
      {error && <Notice error>{error}</Notice>}
      <div className="vp-actions">
        <Button secondary disabled={busy} onClick={() => setDeleting(null)}>Giữ bài</Button>
        <Button disabled={busy} onClick={remove}>{busy ? "Đang xóa…" : "Xóa bài"}</Button>
      </div>
    </CommunityDialog>}
  </div>;
}
