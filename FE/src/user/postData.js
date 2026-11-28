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

export function mediaLink(value, base = "https://veggieai-api.onrender.com") {
  const source = value?.trim();
  if (!source) return null;
  try {
    const url = new URL(source, base);
    if (url.username || url.password) return null;
    if (/^https:\/\//i.test(source) && url.protocol === "https:") return url;
    if (source.startsWith("/uploads/") && url.origin === new URL(base).origin && url.pathname.startsWith("/uploads/")) return url;
    return null;
  } catch {
    return null;
  }
}

export function postMedia(value, base) {
  const url = mediaLink(value, base);
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
  if (/\.(mp4|webm|ogv|mov)$/i.test(url.pathname)) {
    if (!url.hash) url.hash = "t=0.001";
    return { kind: "video", src: url.href };
  }
  return { kind: "link", src: url.href };
}

export function recipeNumber(value) {
  const match = String(value ?? "").match(/^r?([1-9]\d*)$/i);
  const number = match ? Number(match[1]) : null;
  return Number.isSafeInteger(number) && number <= 2147483647 ? number : null;
}

export function validatePost(post, attachment) {
  if (post.title?.trim().length > 200) return "Tiêu đề tối đa 200 ký tự.";
  if (post.content.length > 20000) return "Nội dung tối đa 20.000 ký tự.";
  if (!attachment && !post.content.trim() && !post.mediaUrl.trim())
    return "Viết nội dung hoặc đính kèm ảnh, video.";
  if (
    post.mediaUrl &&
    (!mediaLink(post.mediaUrl) || post.mediaUrl.length > 500)
  )
    return "Liên kết media phải dùng HTTPS, tối đa 500 ký tự.";
  if (post.recipeId && !recipeNumber(post.recipeId))
    return "Chọn lại công thức đính kèm.";
  return "";
}
