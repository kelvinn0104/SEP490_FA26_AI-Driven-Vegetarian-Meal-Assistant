import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Video,
  Eye,
  PenLine,
  Check,
  Trash2,
  Bold,
  List,
  Link,
} from "lucide-react";
import { useResource, Button, Notice, PageHeading } from "./ui";
import { request } from "./api";
import { listOf, isTestContent, statusLabel, userError } from "./data";
import { validatePost, recipeNumber } from "./postData";
import { PostMedia, PostBody, CommunityDialog } from "./PostParts";

export function CreatePost({ go, user, video = false }) {
  const draftKey = `veggie:community-draft:v1:${user.id ?? user.email}`;
  const [draft, setDraft] = useState(() => {
    const blank = {
      postType: video ? "video" : "blog",
      title: "",
      content: "",
      mediaUrl: "",
      recipeId: "",
    };
    try {
      const saved = JSON.parse(sessionStorage.getItem(draftKey));
      if (!saved || !["blog", "video"].includes(saved.postType)) return blank;
      for (const field of ["title", "content", "mediaUrl", "recipeId"])
        if (typeof saved[field] !== "string") return blank;
      return {
        postType: saved.postType,
        title: saved.title.slice(0, 200),
        content: saved.content.slice(0, 20000),
        mediaUrl: saved.mediaUrl.slice(0, 500),
        recipeId: saved.recipeId,
      };
    } catch {
      return blank;
    }
  });
  const [preview, setPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draftStored, setDraftStored] = useState(false);
  const [result, setResult] = useState(null);
  const [discard, setDiscard] = useState(false);
  const lock = useRef(false);
  const contentField = useRef(null);
  const recipes = useResource(
    (signal) => request("/Recipes", undefined, undefined, signal),
    [],
  );
  const recipeOptions = listOf(recipes.data).filter(
    (recipe) =>
      recipe.status === "published" &&
      !isTestContent(recipe) &&
      recipeNumber(recipe.id),
  );
  const dirty = !!(
    draft.title ||
    draft.content ||
    draft.mediaUrl ||
    draft.recipeId
  );
  useEffect(() => {
    if (result) return;
    try {
      if (dirty) sessionStorage.setItem(draftKey, JSON.stringify(draft));
      else sessionStorage.removeItem(draftKey);
      setDraftStored(dirty);
    } catch {
      setDraftStored(false);
    }
  }, [draft, draftKey, dirty, result]);
  useEffect(() => {
    if (!dirty || result || draftStored) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, result, draftStored]);
  const update = (field, value) =>
    setDraft((previous) => ({ ...previous, [field]: value }));
  const format = (kind) => {
    const field = contentField.current;
    if (!field) return;
    const start = field.selectionStart;
    const end = field.selectionEnd;
    const selected = draft.content.slice(start, end);
    const text = selected || (kind === "link" ? "Tên liên kết" : "Nội dung");
    const insertion =
      kind === "bold"
        ? `**${text}**`
        : kind === "link"
          ? `[${text}](https://)`
          : `${start && draft.content[start - 1] !== "\n" ? "\n" : ""}- ${text.replaceAll("\n", "\n- ")}`;
    const next =
      draft.content.slice(0, start) + insertion + draft.content.slice(end);
    if (next.length > 20000) {
      setError("Nội dung tối đa 20.000 ký tự.");
      return;
    }
    update("content", next);
    window.requestAnimationFrame(() => {
      field.focus();
      field.setSelectionRange(start, start + insertion.length);
    });
  };
  const submit = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    const validation = validatePost(draft);
    if (validation) {
      setError(validation);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const response = await request("/community/posts", {
        postType: draft.postType,
        title: draft.title.trim(),
        content: draft.content.trim() || null,
        mediaUrl: draft.mediaUrl.trim() || null,
        recipeId: draft.recipeId ? recipeNumber(draft.recipeId) : null,
      });
      if (!response?.id)
        throw new Error(
          "Chưa xác nhận được bài đã gửi. Kiểm tra Bài của tôi trước khi gửi lại.",
        );
      setResult(response);
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* Draft storage may be unavailable. */
      }
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  if (result)
    return (
      <div className="vp-compose-success">
        <span className="vp-welcome-mark">
          <Check size={30} />
        </span>
        <span className="vp-eyebrow">{statusLabel(result.status)}</span>
        <h1>Đã gửi bài viết</h1>
        <p>
          “{result.title}”
          {result.status === "published"
            ? " đã hiển thị trong cộng đồng."
            : " đang chờ kiểm duyệt. Bạn có thể theo dõi tại Bài của tôi."}
        </p>
        <div className="vp-actions">
          <Button onClick={() => go("post-detail", result.id)}>
            Xem bài vừa gửi
            <ArrowRight size={17} />
          </Button>
          <Button secondary onClick={() => go("user-posts")}>
            Bài của tôi
          </Button>
        </div>
      </div>
    );
  return (
    <div className="vp-post-composer">
      <button
        className="vp-back"
        disabled={busy}
        onClick={() => go("community")}
      >
        <ArrowLeft size={18} />
        Cộng đồng
      </button>
      <PageHeading
        eyebrow="Gửi một điều hữu ích"
        title="Chia sẻ từ căn bếp của bạn"
      />
      <form onSubmit={submit}>
        <div className="vp-composer-toolbar">
          <div
            role="group"
            aria-label="Định dạng bài đăng"
            className="vp-type-filter"
          >
            <button
              type="button"
              disabled={busy}
              aria-pressed={draft.postType === "blog"}
              onClick={() => update("postType", "blog")}
            >
              <BookOpen size={17} />
              Bài viết
            </button>
            <button
              type="button"
              disabled={busy}
              aria-pressed={draft.postType === "video"}
              onClick={() => update("postType", "video")}
            >
              <Video size={17} />
              Video
            </button>
          </div>
          <button
            type="button"
            className="vp-text-button"
            onClick={() => setPreview(!preview)}
          >
            {preview ? <PenLine size={17} /> : <Eye size={17} />}
            {preview ? "Tiếp tục viết" : "Xem trước"}
          </button>
        </div>
        {preview ? (
          <section
            className="vp-compose-preview"
            aria-label="Xem trước bài viết"
          >
            <span className="vp-eyebrow">Bản xem trước · chưa gửi</span>
            <h2>{draft.title || "Tiêu đề bài viết"}</h2>
            <PostMedia
              key={`${draft.postType}:${draft.mediaUrl}`}
              post={draft}
            />
            <PostBody content={draft.content} />
            {draft.recipeId && (
              <p className="vp-preview-recipe">
                Công thức:{" "}
                {recipeOptions.find(
                  (recipe) =>
                    String(recipeNumber(recipe.id)) === draft.recipeId,
                )?.title || "Đã chọn"}
              </p>
            )}
          </section>
        ) : (
          <div className="vp-composer-fields">
            <label>
              Tiêu đề
              <input
                aria-label="Tiêu đề"
                required
                maxLength={200}
                placeholder="Bạn muốn chia sẻ điều gì?"
                value={draft.title}
                disabled={busy}
                onChange={(e) => update("title", e.target.value)}
              />
              <small>{draft.title.length}/200</small>
            </label>
            <label>
              {draft.postType === "video"
                ? "Liên kết video"
                : "Ảnh bìa (URL, không bắt buộc)"}
              <input
                type="url"
                aria-label={
                  draft.postType === "video"
                    ? "Liên kết video"
                    : "Ảnh bìa (URL, không bắt buộc)"
                }
                required={draft.postType === "video"}
                maxLength={500}
                placeholder={
                  draft.postType === "video"
                    ? "https://youtu.be/… hoặc liên kết video"
                    : "https://…"
                }
                value={draft.mediaUrl}
                disabled={busy}
                onChange={(e) => update("mediaUrl", e.target.value)}
              />
              <small>
                {draft.postType === "video"
                  ? "YouTube hoặc video MP4/WebM. Liên kết khác sẽ mở ở trang nguồn."
                  : "Dùng liên kết ảnh công khai mà bạn có quyền chia sẻ."}
              </small>
            </label>
            <div className="vp-content-field">
              <label htmlFor="compose-content">
                {draft.postType === "video"
                  ? "Nội dung (không bắt buộc)"
                  : "Nội dung"}
              </label>
              <div
                className="vp-format-toolbar"
                role="group"
                aria-label="Định dạng nội dung"
              >
                {[
                  ["bold", "In đậm", Bold],
                  ["list", "Danh sách", List],
                  ["link", "Chèn liên kết", Link],
                ].map(([kind, label, Icon]) => (
                  <button
                    key={kind}
                    type="button"
                    title={label}
                    aria-label={label}
                    disabled={busy}
                    onClick={() => format(kind)}
                  >
                    <Icon size={17} />
                  </button>
                ))}
              </div>
              <textarea
                id="compose-content"
                ref={contentField}
                aria-label={
                  draft.postType === "video"
                    ? "Nội dung (không bắt buộc)"
                    : "Nội dung"
                }
                required={draft.postType === "blog"}
                maxLength={20000}
                rows={12}
                placeholder="Kể cách bạn nấu, điều đã thử hoặc một mẹo muốn chia sẻ…"
                value={draft.content}
                disabled={busy}
                onChange={(e) => update("content", e.target.value)}
              />
              <small>
                {draft.content.length.toLocaleString("vi-VN")}/20.000 · Có thể
                viết như bình thường hoặc dùng công cụ định dạng.
              </small>
            </div>
            <label>
              Công thức đính kèm (không bắt buộc)
              <select
                value={draft.recipeId}
                disabled={busy || recipes.loading || !!recipes.error}
                onChange={(e) => update("recipeId", e.target.value)}
              >
                <option value="">Không đính kèm</option>
                {recipeOptions.map((recipe) => (
                  <option key={recipe.id} value={recipeNumber(recipe.id)}>
                    {recipe.title}
                  </option>
                ))}
              </select>
            </label>
            {recipes.error && (
              <Notice error>
                Chưa tải được công thức đính kèm.
                <button type="button" onClick={recipes.reload}>
                  Thử lại
                </button>
              </Notice>
            )}
          </div>
        )}
        {error && <Notice error>{error}</Notice>}
        <div className="vp-composer-submit">
          <div>
            <strong>Bài mới sẽ được kiểm duyệt trước khi xuất bản.</strong>
            <small>
              {dirty
                ? draftStored
                  ? "Bản nháp được giữ trong tab này, chưa gửi lên cộng đồng."
                  : "Chưa giữ được bản nháp trên thiết bị. Giữ tab mở để tránh mất nội dung."
                : "Chỉ chia sẻ nội dung bạn có quyền sử dụng."}
            </small>
          </div>
          <Button
            disabled={
              busy ||
              !draft.title.trim() ||
              (draft.postType === "blog"
                ? !draft.content.trim()
                : !draft.mediaUrl.trim())
            }
          >
            {busy ? "Đang gửi…" : "Gửi bài viết"}
            <ArrowRight size={17} />
          </Button>
        </div>
        {dirty && (
          <button
            type="button"
            className="vp-text-button vp-discard-draft"
            disabled={busy}
            onClick={() => setDiscard(true)}
          >
            <Trash2 size={15} />
            Xóa bản nháp
          </button>
        )}
      </form>
      {discard && (
        <CommunityDialog title="Xóa bản nháp?" close={() => setDiscard(false)}>
          <p>Nội dung đang soạn sẽ bị xóa khỏi tab này.</p>
          <div className="vp-actions">
            <Button secondary onClick={() => setDiscard(false)}>
              Tiếp tục viết
            </Button>
            <Button
              onClick={() => {
                setDraft({
                  postType: "blog",
                  title: "",
                  content: "",
                  mediaUrl: "",
                  recipeId: "",
                });
                setPreview(false);
                setError("");
                setDiscard(false);
              }}
            >
              Xóa bản nháp
            </Button>
          </div>
        </CommunityDialog>
      )}
    </div>
  );
}
