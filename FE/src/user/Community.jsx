import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  useResource,
  Button,
  State,
  Notice,
  PageHeading,
  PageControls,
} from "./ui";
import { listOf, userError, statusLabel, isTestContent } from "./data";
import { request } from "./api";
export function Community({ mine, go, user, flash }) {
  const [page, setPage] = useState(1);
  const resource = useResource(
    () =>
      request(
        `${mine ? "/community/posts/mine" : "/community/posts"}?page.Page=${page}&page.PageSize=12`,
      ),
    [mine, page],
  );
  const [busy, setBusy] = useState(null);
  const [selected, setSelected] = useState(null);
  const [comment, setComment] = useState("");
  const [detail, setDetail] = useState(null);
  const detailRef = useRef(null);
  useEffect(() => {
    if (detail) {
      detailRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
      detailRef.current?.focus({ preventScroll: true });
    }
  }, [detail]);
  const action = async (fn, message, refresh = true) => {
    if (busy) return;
    setBusy(true);
    try {
      await fn();
      if (message) flash(message);
      if (refresh) resource.reload();
    } catch (e) {
      flash(userError(e));
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <PageHeading
        eyebrow="Chia sẻ từ những căn bếp"
        title={mine ? "Bài viết của tôi" : "Cộng đồng"}
      >
        <Button onClick={() => go(user ? "create-post" : "login")}>
          <Plus size={17} />
          Viết bài
        </Button>
      </PageHeading>
      <State resource={resource} empty="Chưa có bài chia sẻ">
        <div className="vp-community-list">
          {listOf(resource.data)
            .filter((post) => !isTestContent(post))
            .map((post) => (
              <article key={post.id} className="vp-list-card">
                <span className="vp-eyebrow">
                  {post.authorName || post.author || "Thành viên"}
                  {mine ? ` · ${statusLabel(post.status)}` : ""}
                </span>
                <h2>{post.title}</h2>
                <p>{post.content?.slice(0, 240)}</p>
                <div className="vp-actions">
                  <Button
                    secondary
                    disabled={!!busy}
                    onClick={() =>
                      action(
                        async () => {
                          setSelected(post);
                          setDetail(
                            await request(`/community/posts/${post.id}`),
                          );
                        },
                        undefined,
                        false,
                      )
                    }
                  >
                    Đọc bài
                  </Button>
                  {user && (
                    <button
                      className="vp-text-button"
                      disabled={!!busy}
                      onClick={() =>
                        action(
                          () =>
                            request(
                              `/community/posts/${post.id}/vote`,
                              { value: post.myVote === 1 ? 0 : 1 },
                              "PUT",
                            ),
                          "Đã gửi lượt thích.",
                        )
                      }
                    >
                      {post.myVote === 1 ? "Bỏ thích" : "Thích"} ·{" "}
                      {post.score ?? "—"}
                    </button>
                  )}
                  {mine && (
                    <button
                      className="vp-text-button"
                      disabled={!!busy}
                      onClick={() => {
                        if (
                          window.confirm(
                            "Xóa bài viết này? Thao tác không thể hoàn tác.",
                          )
                        )
                          action(
                            () =>
                              request(
                                `/community/posts/${post.id}`,
                                undefined,
                                "DELETE",
                              ),
                            "Đã xóa bài viết.",
                          );
                      }}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </article>
            ))}
        </div>
      </State>
      <PageControls
        data={resource.data}
        page={page}
        setPage={setPage}
        disabled={resource.loading}
      />
      {selected && detail && (
        <section
          ref={detailRef}
          tabIndex={-1}
          className="vp-panel vp-post-detail"
        >
          <button
            className="vp-text-button"
            onClick={() => {
              setSelected(null);
              setDetail(null);
            }}
          >
            Đóng bài viết
          </button>
          <h2>{detail.title}</h2>
          <div className="vp-prose">
            <ReactMarkdown>{detail.content || ""}</ReactMarkdown>
          </div>
          <h3>Bình luận</h3>
          {detail.comments?.map((c) => (
            <p key={c.id}>
              <strong>{c.authorName || "Thành viên"}</strong> {c.content}
            </p>
          ))}
          {user && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                action(async () => {
                  await request(`/community/posts/${selected.id}/comments`, {
                    content: comment,
                  });
                  setComment("");
                  setDetail(await request(`/community/posts/${selected.id}`));
                });
              }}
            >
              <label>
                Bình luận
                <textarea
                  required
                  maxLength={2000}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </label>
              <Button disabled={!!busy}>Gửi bình luận</Button>
            </form>
          )}
        </section>
      )}
    </>
  );
}
export function CreatePost({ go }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await request("/community/posts", {
        postType: "blog",
        title: title.trim(),
        content: content.trim(),
      });
      setSuccess(true);
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading title="Chia sẻ từ căn bếp của bạn" />
      <div className="vp-narrow">
        {success ? (
          <div className="vp-panel">
            <h2>Đã gửi bài viết</h2>
            <p>Trạng thái xuất bản do hệ thống kiểm duyệt quyết định.</p>
            <Button onClick={() => go("user-posts")}>
              Xem bài viết của tôi
            </Button>
          </div>
        ) : (
          <form className="vp-panel" onSubmit={submit}>
            <p>
              Chia sẻ cách nấu, trải nghiệm ăn chay hoặc mẹo chọn nguyên liệu.
            </p>
            <label>
              Tiêu đề
              <input
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Nội dung
              <textarea
                required
                minLength={10}
                maxLength={10000}
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </label>
            {error && <Notice error>{error}</Notice>}
            <Button disabled={busy || !title.trim() || !content.trim()}>
              {busy ? "Đang gửi…" : "Gửi bài viết"}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
