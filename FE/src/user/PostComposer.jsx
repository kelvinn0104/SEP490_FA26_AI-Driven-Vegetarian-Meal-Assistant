import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CookingPot, Image, Link2, Video, X } from "lucide-react";
import { Button, Notice, State, useResource } from "./ui";
import { request } from "./api";
import { listOf, postStatusLabel, userError } from "./data";
import { postMedia, recipeNumber, validatePost } from "./postData";
import { PostMedia, PostMeta } from "./PostParts";

const accept = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
const empty = { content: "", recipeId: "", mediaUrl: "", postType: "blog" };

export function EditPost({ id, go, user }) {
  const resource = useResource(
    (signal) => request(`/community/posts/${id}`, undefined, undefined, signal),
    [id],
  );
  return <State resource={resource}>
    {resource.data?.canEdit
      ? <CreatePost go={go} user={user} editPost={resource.data} />
      : resource.data && <Notice error>Bạn không thể sửa bài viết này.</Notice>}
  </State>;
}

export function CreatePost({ go, user, video = false, editPost = null }) {
  const key = `veggie:community-draft:v1:${user.id ?? user.email}`;
  const [draft, setDraft] = useState(() => {
    if (editPost) return {
      ...empty, content: editPost.content || "", recipeId: String(editPost.recipeId ?? ""),
      mediaUrl: editPost.mediaUrl || "", postType: editPost.postType,
    };
    try {
      const saved = JSON.parse(sessionStorage.getItem(key));
      if (saved && typeof saved.content === "string")
        return { ...empty, ...saved, content: saved.content.slice(0, 20000) };
    } catch { /* Storage may be disabled. */ }
    return { ...empty, postType: video ? "video" : "blog" };
  });
  const [attachment, setAttachment] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showRecipes, setShowRecipes] = useState(Boolean(draft.recipeId));
  const [recipeSearch, setRecipeSearch] = useState("");
  const [showLink, setShowLink] = useState(video || Boolean(draft.mediaUrl));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const fileInput = useRef(null);
  const upload = useRef(null);
  const lock = useRef(false);
  const recipes = useResource(
    (signal) => showRecipes ? request("/Recipes", undefined, undefined, signal) : [],
    [showRecipes],
  );
  const search = recipeSearch.trim().toLocaleLowerCase("vi-VN");
  const choices = listOf(recipes.data).filter((recipe) =>
    recipe.status === "published" && recipeNumber(recipe.id) &&
    (recipeNumber(recipe.id) === recipeNumber(draft.recipeId) || recipe.title.toLocaleLowerCase("vi-VN").includes(search)),
  );
  useEffect(() => {
    if (editPost || result) return;
    try { sessionStorage.setItem(key, JSON.stringify(draft)); } catch { /* Optional draft persistence. */ }
  }, [draft, key, editPost, result]);
  useEffect(() => {
    if (!attachment) { setPreview(null); return; }
    const url = URL.createObjectURL(attachment);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  function update(values) {
    setError("");
    setDraft((previous) => ({ ...previous, ...values }));
  }

  function selectFile(event) {
    const file = event.target.files[0];
    event.target.value = "";
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (!accept.split(",").includes(file.type) || !file.size || file.size > (isVideo ? 50 : 8) * 1024 ** 2) {
      setError("Chọn ảnh JPG, PNG, WebP, GIF tối đa 8 MB hoặc video MP4, WebM, MOV tối đa 50 MB.");
      return;
    }
    upload.current = null;
    setAttachment(file);
    update({ mediaUrl: "", postType: isVideo ? "video" : "blog" });
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    const content = draft.content.trim();
    const validation = validatePost(draft, attachment);
    if (validation) {
      setError(validation);
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      let mediaUrl = draft.mediaUrl.trim() || null;
      const linkedMedia = postMedia(mediaUrl);
      let postType = mediaUrl && (draft.postType === "video" || ["video", "youtube"].includes(linkedMedia?.kind)) ? "video" : "blog";
      if (attachment) {
        if (upload.current?.file !== attachment) {
          const form = new FormData();
          form.append("File", attachment);
          form.append("Purpose", "post");
          const media = await request("/uploads", form);
          if (!media?.url || !["image", "video"].includes(media.kind))
            throw new Error("Máy chủ chưa trả về tệp đính kèm hợp lệ.");
          upload.current = { file: attachment, media };
        }
        mediaUrl = upload.current.media.url;
        postType = upload.current.media.kind === "video" ? "video" : "blog";
      }
      const response = await request(editPost ? `/community/posts/${editPost.id}` : "/community/posts", {
        postType, content: content || null, mediaUrl,
        title: editPost && editPost.content?.trim().split("\n")[0]?.slice(0, 200) !== editPost.title
          ? editPost.title
          : content.split("\n")[0].slice(0, 200) || (postType === "video" ? "Video chia sẻ" : "Ảnh chia sẻ"),
        recipeId: recipeNumber(draft.recipeId),
      }, editPost ? "PUT" : "POST");
      if (!response?.id) throw new Error("Kiểm tra Bài của tôi trước khi gửi lại.");
      setResult(response);
      try { sessionStorage.removeItem(key); } catch { /* Optional draft persistence. */ }
    } catch (cause) {
      setError(userError(cause));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  if (result) return <div className="vp-thread-shell">
    <h1>{postStatusLabel(result)}</h1>
    <p>{result.status === "published" ? "Bài đã xuất hiện trên bảng tin." : "Bài sẽ xuất hiện sau khi được duyệt."}</p>
    <div className="vp-actions">
      <Button onClick={() => go("post-detail", result.id)}>Mở bài viết</Button>
      <Button secondary onClick={() => go("community")}>Về bảng tin</Button>
    </div>
  </div>;

  return <div className="vp-thread-shell">
    <button className="vp-back" onClick={() => go("community")} disabled={busy}><ArrowLeft size={18} /> Cộng đồng</button>
    <h1>{editPost ? "Sửa bài viết" : "Bài viết mới"}</h1>
    <form className="vp-thread-compose" onSubmit={submit}>
      <PostMeta post={{ authorName: user.displayName || user.name }} />
      <textarea aria-label="Nội dung bài viết" autoFocus rows={5} maxLength={20000}
        placeholder="Bạn muốn chia sẻ gì?" value={draft.content} disabled={busy}
        onChange={(event) => update({ content: event.target.value })} />
      {attachment && preview && <div className="vp-thread-attachment">
        {attachment.type.startsWith("video/")
          ? <video controls preload="metadata" src={preview} />
          : <img src={preview} alt="Xem trước ảnh đính kèm" />}
        <button type="button" className="vp-icon" aria-label="Bỏ tệp đính kèm" disabled={busy}
          onClick={() => { setAttachment(null); upload.current = null; }}><X size={19} /></button>
      </div>}
      {!attachment && draft.mediaUrl && <div className="vp-thread-attachment">
        <PostMedia key={draft.mediaUrl} post={draft} />
        <button type="button" className="vp-icon" aria-label="Bỏ liên kết đính kèm" disabled={busy}
          onClick={() => update({ mediaUrl: "", postType: "blog" })}><X size={19} /></button>
      </div>}
      {showLink && !attachment && <div className="vp-thread-link">
        <input type="text" inputMode="url" placeholder="Liên kết media HTTPS" aria-label="Liên kết media" maxLength={500}
          value={draft.mediaUrl} disabled={busy} onChange={(event) => update({ mediaUrl: event.target.value })} />
        <select aria-label="Loại liên kết media" disabled={busy} value={draft.postType}
          onChange={(event) => update({ postType: event.target.value })}>
          <option value="blog">Ảnh</option><option value="video">Video</option>
        </select>
      </div>}
      {showRecipes && <div className="vp-thread-recipe-picker">
        <input type="search" aria-label="Tìm công thức để đính kèm" placeholder="Tìm công thức đã duyệt…"
          value={recipeSearch} onChange={(event) => setRecipeSearch(event.target.value)} disabled={busy || recipes.loading} />
        <select aria-label="Công thức đính kèm" value={draft.recipeId} disabled={busy || recipes.loading}
          onChange={(event) => update({ recipeId: event.target.value })}>
          <option value="">Không đính kèm</option>
          {draft.recipeId && !choices.some((recipe) => recipeNumber(recipe.id) === recipeNumber(draft.recipeId)) &&
            <option value={draft.recipeId}>Công thức cũ hiện không khả dụng</option>}
          {choices.map((recipe) => <option key={recipe.id} value={recipeNumber(recipe.id)}>{recipe.title}</option>)}
        </select>
        {recipes.error && <span role="alert">Chưa tải được công thức.</span>}
        {!recipes.loading && !recipes.error && !choices.length && <small>Chưa có công thức phù hợp.</small>}
      </div>}
      {error && <Notice error>{error}</Notice>}
      <div className="vp-thread-toolbar">
        <div>
          <input ref={fileInput} type="file" accept={accept} hidden onChange={selectFile} />
          <button type="button" aria-label="Thêm ảnh hoặc video" title="Thêm ảnh hoặc video" className="vp-icon"
            disabled={busy} onClick={() => fileInput.current?.click()}><Image size={19} /></button>
          <button type="button" aria-label="Gắn công thức" title="Gắn công thức" className="vp-icon"
            disabled={busy} aria-expanded={showRecipes} onClick={() => setShowRecipes((open) => !open)}><CookingPot size={19} /></button>
          <button type="button" aria-label="Thêm liên kết media" title="Thêm liên kết media" className="vp-icon"
            disabled={busy} aria-expanded={showLink} onClick={() => setShowLink((open) => !open)}>{video ? <Video size={19} /> : <Link2 size={19} />}</button>
        </div>
        <Button disabled={busy || (!draft.content.trim() && !draft.mediaUrl.trim() && !attachment)}>
          {busy ? "Đang gửi…" : editPost ? "Lưu và gửi duyệt" : "Gửi bài"}
        </Button>
      </div>
    </form>
  </div>;
}
