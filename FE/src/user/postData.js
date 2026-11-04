export function postDate(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

export function mediaLink(value) {
  if (!value?.trim()) return null;
  if (!/^https:\/\//i.test(value.trim()) && !/^\/(?!\/)/.test(value.trim()))
    return null;
  try {
    const url = new URL(value, "https://veggieai-api.onrender.com");
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export function postMedia(value) {
  const url = mediaLink(value);
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  let id;
  if (
    [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
    ].includes(host)
  ) {
    id =
      url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
  } else if (host === "youtu.be") id = url.pathname.slice(1);
  if (id && /^[\w-]{11}$/.test(id))
    return {
      kind: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${id}`,
    };
  if (/\.(mp4|webm|ogv)$/i.test(url.pathname))
    return { kind: "video", src: url.href };
  return { kind: "link", src: url.href };
}

export function recipeNumber(value) {
  const match = String(value ?? "").match(/^r?([1-9]\d*)$/i);
  const number = match ? Number(match[1]) : null;
  return Number.isSafeInteger(number) && number <= 2147483647 ? number : null;
}

export function validatePost(post) {
  if (!["blog", "video"].includes(post.postType))
    return "Chọn định dạng bài viết hoặc video.";
  if (!post.title.trim() || post.title.trim().length > 200)
    return "Tiêu đề cần từ 1 đến 200 ký tự.";
  if (post.content.length > 20000) return "Nội dung tối đa 20.000 ký tự.";
  if (post.postType === "blog" && !post.content.trim())
    return "Thêm nội dung trước khi gửi bài.";
  if (post.postType === "video" && !mediaLink(post.mediaUrl))
    return "Thêm liên kết video HTTPS hợp lệ.";
  if (
    post.mediaUrl &&
    (!/^https:\/\//i.test(post.mediaUrl.trim()) ||
      !mediaLink(post.mediaUrl) ||
      post.mediaUrl.length > 500)
  )
    return "Liên kết media phải dùng HTTPS, tối đa 500 ký tự.";
  if (post.recipeId && !recipeNumber(post.recipeId))
    return "Chọn lại công thức đính kèm.";
  return "";
}
