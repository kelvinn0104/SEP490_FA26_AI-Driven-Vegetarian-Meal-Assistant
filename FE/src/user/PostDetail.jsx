import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Link,
  Flag,
  Trash2,
  Send,
  CookingPot,
  ArrowRight,
} from "lucide-react";
import { Button, State, Notice, useResource } from "./ui";
import { request } from "./api";
import { isTestContent, statusLabel, userError } from "./data";
import { postDate } from "./postData";
import { PostMeta, PostMedia, PostBody, CommunityDialog } from "./PostParts";

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
        if (!post?.id || isTestContent(post))
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
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [showLink, setShowLink] = useState(false);
  const lock = useRef(false);
  const published = post?.status === "published";
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
  const vote = (value) => {
    if (!user) return go("login");
    const nextVote = post.myVote === value ? 0 : value;
    mutate("vote", async () => {
      const score = await request(
        `/community/posts/${id}/vote`,
        { value: nextVote },
        "PUT",
      );
      if (!Number.isFinite(score))
        throw new Error(
          "Chưa nhận được điểm bình chọn mới. Tải lại bài để kiểm tra.",
        );
      setChanged({ ...post, score, myVote: nextVote });
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
  const link = `${window.location.origin}/post-detail?id=${id}`;
  return (
    <div className="vp-post-reader">
      <button className="vp-back" onClick={() => go("community")}>
        <ArrowLeft size={18} />
        Cộng đồng
      </button>
      <State resource={resource}>
        {post && (
          <>
            <article className="vp-post-article">
              <PostMedia key={post.mediaUrl} post={post} />
              <div className="vp-post-reader-top">
                <span className="vp-eyebrow">
                  {post.postType === "video"
                    ? "Video từ cộng đồng"
                    : "Chuyện từ căn bếp"}
                </span>
                {!published && (
                  <span className="vp-post-status" data-status={post.status}>
                    {statusLabel(post.status)}
                  </span>
                )}
              </div>
              <h1>{post.title}</h1>
              <PostMeta post={post} />
              {!published && (
                <Notice>
                  Bài chưa hiển thị công khai. Bình chọn và bình luận mở khi bài
                  được duyệt.
                </Notice>
              )}
              <PostBody content={post.content} />
              {post.videoSummary && (
                <details className="vp-video-summary">
                  <summary>Tóm tắt video</summary>
                  <PostBody content={post.videoSummary} />
                </details>
              )}
              {post.recipeId && (
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
                  <div
                    className="vp-votes"
                    role="group"
                    aria-label="Bình chọn bài viết"
                  >
                    <button
                      disabled={!!busy}
                      aria-label="Hữu ích"
                      aria-pressed={post.myVote === 1}
                      onClick={() => vote(1)}
                    >
                      <ArrowUp size={20} />
                    </button>
                    <output aria-label="Điểm cộng đồng">
                      {post.score ?? 0}
                    </output>
                    <button
                      disabled={!!busy}
                      aria-label="Chưa hữu ích"
                      aria-pressed={post.myVote === -1}
                      onClick={() => vote(-1)}
                    >
                      <ArrowDown size={20} />
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
                {published && (
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
                    const own =
                      user?.id != null &&
                      String(user.id) === String(entry.userId);
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
                        <p>{entry.content}</p>
                        {user && (
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
                        )}
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
