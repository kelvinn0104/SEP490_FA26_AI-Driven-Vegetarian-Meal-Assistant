import { useState } from "react";
import { Play, ExternalLink, VideoOff } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { postDate, postMedia, mediaLink } from "./postData";
import { Dialog } from "./ui";
import { imgUrl } from "../api/client";
import { request } from "./api";

export async function updatePostLike(post, liked) {
  if (post.likeCount == null) {
    const score = await request(`/community/posts/${post.id}/vote`, { value: liked ? 1 : 0 }, "PUT");
    if (!Number.isInteger(score)) throw new Error("Chưa xác nhận được lượt phản hồi.");
    return { liked, score };
  }

  const reaction = await request(`/community/posts/${post.id}/like`, { liked }, "PUT");
  if (typeof reaction?.liked !== "boolean" || !Number.isInteger(reaction.likeCount))
    throw new Error("Chưa xác nhận được lượt thích.");
  return reaction;
}

export function PostMeta({ post }) {
  const author = post.authorName || "Thành viên";
  return (
    <div className="vp-post-meta">
      <span className="vp-author-initial" aria-hidden="true">
        {author.trim().slice(0, 1).toUpperCase()}
      </span>
      <div>
        <strong>{author}</strong>
        {postDate(post.createdAt) && (
          <time dateTime={post.createdAt}>{postDate(post.createdAt)}</time>
        )}
      </div>
    </div>
  );
}

export function PostBody({ content }) {
  return (
    <div className="vp-prose vp-post-prose">
      <ReactMarkdown
        components={{
          img: ({ src, alt }) =>
            mediaLink(src) ? (
              <img
                src={mediaLink(src).href}
                alt={alt || "Ảnh trong bài viết"}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : null,
          a: ({ href, children }) => (
            <a href={href} rel="noopener noreferrer nofollow">
              {children}
            </a>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}

export function PostMedia({ post }) {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const media = postMedia(post.mediaUrl, imgUrl("/"));
  if (!media)
    return post.postType === "video" ? (
      <p className="vp-media-error">Chưa có liên kết video hợp lệ.</p>
    ) : null;
  if (post.postType !== "video")
    return failed ? (
      <p className="vp-media-error">Ảnh đính kèm chưa tải được.</p>
    ) : (
      <img
        className="vp-post-cover"
        src={media.src}
        alt={post.title || "Ảnh đính kèm bài viết"}
        onError={() => setFailed(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  if (failed && media.src.startsWith(imgUrl("/uploads/"))) {
    return <div className="vp-media-unavailable">
      <VideoOff size={22} aria-hidden="true" />
      <span>Video đính kèm hiện không khả dụng.</span>
    </div>;
  }
  if (media.kind === "link" || failed)
    return (
      <div className="vp-video-fallback">
        <p>
          {failed
            ? "Video chưa phát được tại đây."
            : "Video được chia sẻ qua liên kết ngoài."}
        </p>
        <a href={media.src} target="_blank" rel="noopener noreferrer">
          Mở liên kết video
          <ExternalLink size={16} />
        </a>
      </div>
    );
  if (media.kind === "video")
    return (
      <div className="vp-post-video">
        <video src={media.src} controls playsInline preload="metadata"
          onError={() => setFailed(true)} aria-label={post.title || "Video đính kèm"} />
      </div>
    );
  if (!started)
    return (
      <button
        type="button"
        className="vp-video-start"
        onClick={() => setStarted(true)}
      >
        <span>
          <Play size={28} />
        </span>
        Xem video
        <small>Phát từ YouTube</small>
      </button>
    );
  return (
    <div className="vp-post-video">
      <iframe
        src={media.src}
        title={post.title || "Video bài viết"}
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

export function CommunityDialog(props) {
  return <Dialog {...props} className="vp-community-dialog" />;
}
