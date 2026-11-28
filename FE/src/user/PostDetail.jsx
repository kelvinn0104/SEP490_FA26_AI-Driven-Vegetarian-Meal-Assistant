import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Link,
  Flag,
  Trash2,
  Send,
  CookingPot,
  ArrowRight,
  PenLine,
} from "lucide-react";
import { Button, State, Notice, useResource } from "./ui";
import { request } from "./api";
import { isTestContent, postStatusLabel, userError } from "./data";
import { postDate } from "./postData";
import { PostMeta, PostMedia, PostBody, CommunityDialog, updatePostLike } from "./PostParts";

const reportCategories = [
  ["spam", "Spam hoặc quảng cáo"],
  ["offensive", "Xúc phạm hoặc quấy rối"],
  ["inappropriate", "Nội dung không phù hợp"],
  ["nutrition_misinformation", "Thông tin dinh dưỡng sai lệch"],
  ["other", "Lý do khác"],
];

function ReportForm({ target, submit, busy }) {
  const [category, setCategory] = useState("spam");
  const [reason, setReason] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          targetType: target.type,
          targetId: target.id,
          category,
          reason: reason.trim() || null,
        });
      }}
    >
      <p>Báo cáo sẽ được gửi riêng tới đội ngũ kiểm duyệt.</p>
      <label>
        Lý do báo cáo
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={busy}
        >
          {reportCategories.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Thông tin thêm (không bắt buộc)
        <textarea
          rows={3}
          maxLength={1000}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={busy}
        />
      </label>
      <Button disabled={busy}>{busy ? "Đang gửi…" : "Gửi báo cáo"}</Button>
    </form>
  );
}

export function PostDetail({ id, go, user, flash }) {
  const resource = useResource(
    async (signal) => {
      if (!/^[1-9]\d*$/.test(id || ""))
        throw new Error("Liên kết bài viết không hợp lệ.");
      try {
        const post = await request(
          `/community/posts/${id}`,
          undefined,
          undefined,
          signal,
        );
        // FE lưu id người dùng dạng "USR-0003" nên không so sánh được với authorId số: dùng cờ canEdit do BE trả (chỉ tác giả).
        if (!post?.id || (!post.canEdit && isTestContent(post)))
          throw new Error("Bài viết này chưa sẵn sàng.");
        return post;
      } catch (error) {
        if (error.status === 404)
          throw new Error(
            "Bài viết không còn hiển thị hoặc bạn chưa có quyền xem.",
          );
        throw error;
      }
    },
    [id, user?.id],
  );
  const [changed, setChanged] = useState(null);
  const post = changed || resource.data;
  const [comment, setComment] = useState("");
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const lock = useRef(false);
  const published = post?.status === "published";
  const ownPost = !!post?.canEdit;
  useEffect(() => {
    if (resource.data && window.location.hash === "#post-comments")
      document.getElementById("post-comments")?.scrollIntoView();
    if (resource.data?.title)
      document.title = `${resource.data.title} · VeggieAI`;
  }, [resource.data]);
  const mutate = async (key, fn) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(key);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy("");
    }
  };
  const toggleLike = () => {
    if (!user) return go("login");
    mutate("vote", async () => {
      const { liked, ...count } = await updatePostLike(post, post.myVote !== 1);
      setChanged({ ...post, ...count, myVote: liked ? 1 : 0 });
    });
  };
  const addComment = (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    mutate("comment", async () => {
      const saved = await request(`/community/posts/${id}/comments`, {
        content: comment.trim(),
      });
      if (!saved?.id)
        throw new Error(
          "Chưa xác nhận được bình luận. Tải lại bài để kiểm tra trước khi gửi tiếp.",
        );
      const comments = [...(post.comments || []), saved];
      setChanged({ ...post, comments, commentCount: comments.length });
      setComment("");
      flash("Đã gửi bình luận.");
    });
  };
  const saveComment = (e) => {
    e.preventDefault();
    if (!editing?.content.trim()) return;
    mutate("edit-comment", async () => {
      const saved = await request(`/community/comments/${editing.id}`, { content: editing.content.trim() }, "PUT");
      if (saved?.id !== editing.id) throw new Error("Chưa xác nhận được thay đổi.");
      setChanged({ ...post, comments: post.comments.map((entry) => entry.id === saved.id ? saved : entry) });
      setEditing(null);
      flash("Đã sửa bình luận.");
    });
  };
  const link = `${window.location.origin}/post-detail?id=${id}`;
  return (
    <div className="vp-post-reader vp-thread-shell">
      <button className="vp-back" onClick={() => go("community")}>
        <ArrowLeft size={18} />
        Cộng đồng
      </button>
      <State resource={resource}>
        {post && (
          <>
            <article className="vp-post-article">
              <header className="vp-thread-post-head">
                <PostMeta post={post} />
                {!published && <span className="vp-post-status" data-status={post.status}>{postStatusLabel(post)}</span>}
              </header>
              <h1 className={post.content?.trim().split("\n")[0]?.slice(0, 200) === post.title ? "vp-thread-visually-hidden" : "vp-thread-post-title"}>{post.title}</h1>
              {!published && (
                <Notice>
                  {post.moderation?.decision === "rejected"
                    ? "Bài không được duyệt và chưa hiển thị công khai."
                    : post.moderation?.decision === "revision"
                      ? "Người duyệt đề nghị chỉnh sửa trước khi đăng."
                      : "Bài đang chờ duyệt. Sau khi đăng, mọi người có thể thích và bình luận."}
                  {post.moderation?.note && (
                    <>
                      {" "}
                      <strong>Ghi chú:</strong> {post.moderation.note}
                    </>
                  )}
                  {post.canEdit && " Bạn có thể sửa và gửi duyệt lại."}
                </Notice>
              )}
              <PostBody content={post.content} />
              <PostMedia key={post.mediaUrl} post={post} />
              {post.videoSummary && (
                <details className="vp-video-summary">
                  <summary>Tóm tắt video</summary>
                  <PostBody content={post.videoSummary} />
                </details>
              )}
              {post.recipeId && post.recipeTitle && (
                <a
                  className="vp-linked-recipe"
                  href={`/article-detail?id=r${post.recipeId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    go("article-detail", `r${post.recipeId}`);
                  }}
                >
                  <CookingPot size={24} />
                  <span>
                    <small>Công thức trong bài</small>
                    <strong>
                      {post.recipeTitle || "Xem công thức đính kèm"}
                    </strong>
                  </span>
                  <ArrowRight size={19} />
                </a>
              )}
              <div className="vp-post-interactions">
                {published && (
                  <div className="vp-thread-actions">
                    <button
                      disabled={!!busy}
                      aria-label={post.myVote === 1 ? "Bỏ thích" : "Thích"}
                      aria-pressed={post.myVote === 1}
                      onClick={toggleLike}
                    >
                      <Heart size={20} fill={post.myVote === 1 ? "currentColor" : "none"} />
                      {post.likeCount ?? post.score ?? ""}
                    </button>
                  </div>
                )}
                <a className="vp-text-button" href="#post-comments">
                  Bình luận ({post.comments?.length ?? post.commentCount ?? 0})
                </a>
                <button
                  className="vp-text-button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(link);
                      flash("Đã sao chép liên kết.");
                    } catch {
                      setShowLink(true);
                    }
                  }}
                >
                  <Link size={17} />
                  Sao chép liên kết
                </button>
                {post.canEdit && (
                  <button
                    className="vp-text-button"
                    onClick={() => go("create-post", post.id)}
                  >
                    <PenLine size={16} />
                    Sửa bài
                  </button>
                )}
                {published && !ownPost && (
                  <button
                    className="vp-text-button"
                    disabled={!!busy}
                    onClick={() => {
                      if (!user) return go("login");
                      setError("");
                      setDialog({ kind: "report", type: "post", id: post.id });
                    }}
                  >
                    <Flag size={16} />
                    Báo cáo
                  </button>
                )}
              </div>
              {showLink && (
                <label>
                  Liên kết bài viết
                  <input
                    readOnly
                    value={link}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
              )}
            </article>
            {error && !dialog && <Notice error>{error}</Notice>}
            <section
              id="post-comments"
              className="vp-post-comments"
              aria-labelledby="post-comments-title"
            >
              <h2 id="post-comments-title">
                Bình luận{" "}
                <span>{post.comments?.length ?? post.commentCount ?? 0}</span>
              </h2>
              {published &&
                (user ? (
                  <form className="vp-comment-compose" onSubmit={addComment}>
                    <label htmlFor="post-comment">
                      Chia sẻ suy nghĩ của bạn
                    </label>
                    <textarea
                      id="post-comment"
                      placeholder="Thêm một câu chuyện hoặc câu hỏi…"
                      rows={3}
                      maxLength={2000}
                      required
                      value={comment}
                      disabled={busy === "comment"}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div>
                      <small>{comment.length}/2000</small>
                      <Button disabled={!!busy || !comment.trim()}>
                        <Send size={16} />
                        {busy === "comment" ? "Đang gửi…" : "Gửi bình luận"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="vp-comment-login">
                    <p>Tham gia cuộc trò chuyện cùng mọi người.</p>
                    <Button secondary onClick={() => go("login")}>
                      Đăng nhập để bình luận
                    </Button>
                  </div>
                ))}
              <div className="vp-comment-list">
                {post.comments?.length ? (
                  post.comments.map((entry) => {
                    const own = !!entry.canEdit;
                    return (
                      <article key={entry.id} className="vp-comment">
                        <div className="vp-comment-heading">
                          <strong>
                            {entry.authorName || "Thành viên"}
                            {own && <small>Bạn</small>}
                          </strong>
                          <time dateTime={entry.createdAt}>
                            {postDate(entry.createdAt)}
                          </time>
                        </div>
                        {editing?.id === entry.id ? (
                          <form className="vp-comment-compose" onSubmit={saveComment}>
                            <textarea aria-label="Sửa nội dung bình luận" rows={3} maxLength={2000}
                              disabled={!!busy} value={editing.content}
                              onChange={(e) => setEditing({ ...editing, content: e.target.value })} />
                            <div><Button type="button" secondary disabled={!!busy} onClick={() => setEditing(null)}>Hủy</Button>
                              <Button disabled={!!busy || !editing.content.trim()}>Lưu bình luận</Button></div>
                          </form>
                        ) : <p>{entry.content}</p>}
                        {user && editing?.id !== entry.id && <div className="vp-comment-actions">
                          {own && published && <button className="vp-text-button" disabled={!!busy}
                            onClick={() => { setError(""); setEditing({ id: entry.id, content: entry.content }); }}>
                            <PenLine size={14} /> Sửa
                          </button>}
                          <button
                            className="vp-text-button"
                            disabled={!!busy}
                            aria-label={`${own ? "Xóa" : "Báo cáo"} bình luận của ${entry.authorName || "thành viên"}`}
                            onClick={() => {
                              setError("");
                              setDialog(
                                own
                                  ? { kind: "delete", entry }
                                  : {
                                      kind: "report",
                                      type: "comment",
                                      id: entry.id,
                                    },
                              );
                            }}
                          >
                            {own ? <Trash2 size={14} /> : <Flag size={14} />}
                            {own ? "Xóa" : "Báo cáo"}
                          </button>
                        </div>}
                      </article>
                    );
                  })
                ) : (
                  <p className="vp-no-comments">
                    Chưa có bình luận.
                    {published ? " Bạn có thể mở đầu cuộc trò chuyện." : ""}
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </State>
      {dialog && (
        <CommunityDialog
          title={
            dialog.kind === "report" ? "Báo cáo nội dung" : "Xóa bình luận?"
          }
          busy={!!busy}
          close={() => {
            setDialog(null);
            setError("");
          }}
        >
          {error && <Notice error>{error}</Notice>}
          {dialog.kind === "report" ? (
            <ReportForm
              target={dialog}
              busy={!!busy}
              submit={(body) =>
                mutate("report", async () => {
                  const saved = await request("/community/reports", body);
                  if (!saved?.id)
                    throw new Error(
                      "Chưa xác nhận được báo cáo. Vui lòng kiểm tra lại sau.",
                    );
                  setDialog(null);
                  flash("Đã gửi báo cáo tới đội ngũ kiểm duyệt.");
                })
              }
            />
          ) : (
            <>
              <p>Bình luận sẽ được gỡ khỏi cuộc trò chuyện.</p>
              <div className="vp-actions">
                <Button
                  secondary
                  disabled={!!busy}
                  onClick={() => setDialog(null)}
                >
                  Giữ bình luận
                </Button>
                <Button
                  disabled={!!busy}
                  onClick={() =>
                    mutate("delete", async () => {
                      const removed = await request(
                        `/community/comments/${dialog.entry.id}`,
                        undefined,
                        "DELETE",
                      );
                      if (removed !== true)
                        throw new Error(
                          "Chưa xác nhận được bình luận đã xóa. Tải lại bài để kiểm tra.",
                        );
                      const comments = post.comments.filter(
                        (entry) => entry.id !== dialog.entry.id,
                      );
                      setChanged({
                        ...post,
                        comments,
                        commentCount: comments.length,
                      });
                      setDialog(null);
                      flash("Đã xóa bình luận.");
                    })
                  }
                >
                  {busy ? "Đang xóa…" : "Xóa bình luận"}
                </Button>
              </div>
            </>
          )}
        </CommunityDialog>
      )}
    </div>
  );
}
