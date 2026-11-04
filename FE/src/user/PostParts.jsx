import { useState, useEffect, useRef } from "react";
import { Play, ExternalLink, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { postDate, postMedia, mediaLink } from "./postData";

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
  const media = postMedia(post.mediaUrl);
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
        alt={post.title}
        onError={() => setFailed(true)}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
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
        <small>
          {media.kind === "youtube" ? "Phát từ YouTube" : "Phát video đính kèm"}
        </small>
      </button>
    );
  return (
    <div className="vp-post-video">
      {media.kind === "youtube" ? (
        <iframe
          src={media.src}
          title={post.title || "Video bài viết"}
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video
          src={media.src}
          controls
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
          aria-label={post.title}
        />
      )}
    </div>
  );
}

export function CommunityDialog({ title, children, close, busy = false }) {
  const ref = useRef(null);
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="vp-community-dialog"
      aria-labelledby="community-dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            closeRef.current();
        }
      }}
    >
      <div className="vp-dialog-heading">
        <h2 id="community-dialog-title">{title}</h2>
        <button
          type="button"
          className="vp-icon"
          aria-label="Đóng hộp thoại"
          disabled={busy}
          onClick={close}
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
