import { useState, useEffect } from "react";
import {
  ArrowRight,
  MessageCircle,
  Search,
  PenLine,
  Video,
  BookOpen,
  Trash2,
  ArrowUp,
} from "lucide-react";
import { useResource, Button, State, PageControls, Notice } from "./ui";
import { listOf, isTestContent, statusLabel, userError } from "./data";
import { request } from "./api";
import { PostMeta, PostMedia, CommunityDialog } from "./PostParts";

export function Community({ mine, go, user, flash, videos = false }) {
  const initial = new URLSearchParams(window.location.search);
  const [page, setPage] = useState(() =>
    Math.max(1, Math.min(100000, Number(initial.get("page")) || 1)),
  );
  const [search, setSearch] = useState(initial.get("q")?.slice(0, 200) || "");
  const [keyword, setKeyword] = useState(initial.get("q")?.slice(0, 200) || "");
  const [type, setType] = useState(
    videos
      ? "video"
      : ["blog", "video"].includes(initial.get("type"))
        ? initial.get("type")
        : "",
  );
  const [sort, setSort] = useState(
    initial.get("sort") === "top" ? "top" : "newest",
  );
  useEffect(() => {
    const query = new URLSearchParams();
    if (page > 1) query.set("page", page);
    if (!mine) {
      if (keyword) query.set("q", keyword);
      if (type) query.set("type", type);
      if (sort === "top") query.set("sort", sort);
    }
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query.size ? "?" + query : ""}`,
    );
  }, [page, keyword, type, sort, mine]);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const resource = useResource(
    (signal) => {
      const query = new URLSearchParams({
        "page.Page": page,
        "page.PageSize": 12,
      });
      if (!mine) {
        if (keyword) query.set("keyword", keyword);
        if (type) query.set("postType", type);
        query.set("sort", sort);
      }
      return request(
        `/community/posts${mine ? "/mine" : ""}?${query}`,
        undefined,
        undefined,
        signal,
      );
    },
    [mine, page, keyword, type, sort, user?.id],
  );
  const items = listOf(resource.data).filter((post) => !isTestContent(post));
  const remove = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const removed = await request(
        `/community/posts/${deleting.id}`,
        undefined,
        "DELETE",
      );
      if (removed !== true)
        throw new Error(
          "Chưa xác nhận được bài đã xóa. Tải lại danh sách để kiểm tra.",
        );
      setDeleting(null);
      flash("Đã xóa bài viết.");
      if (items.length === 1 && page > 1) setPage(page - 1);
      else resource.reload();
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="vp-community">
      <header
        className={`vp-editorial-banner vp-community-banner ${mine ? "is-mine" : ""}`}
      >
        <div>
          <span className="vp-eyebrow">Chuyện từ căn bếp</span>
          <h1>{mine ? "Bài viết của tôi" : "Cộng đồng"}</h1>
          <p>
            {mine
              ? "Xem bài đã gửi và trạng thái kiểm duyệt."
              : "Xem mọi người nấu gì và chia sẻ món bạn vừa thử."}
          </p>
          <Button onClick={() => go("create-post")}>
            <PenLine size={18} />
            Viết bài
          </Button>
        </div>
        {!mine && (
          <img
            src="/images/brand/shared-table.webp"
            width="960"
            height="640"
            alt=""
          />
        )}
      </header>
      <div className="vp-community-layout">
        <div className="vp-community-feed">
          <nav className="vp-community-tabs" aria-label="Không gian cộng đồng">
            <a
              href="/community"
              aria-current={!mine ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go("community");
              }}
            >
              Khám phá
            </a>
            <a
              href="/user-posts"
              aria-current={mine ? "page" : undefined}
              onClick={(e) => {
                e.preventDefault();
                go("user-posts");
              }}
            >
              Bài của tôi
            </a>
          </nav>
          {!mine && (
            <div className="vp-community-filters">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  setPage(1);
                  setKeyword(search.trim());
                }}
              >
                <label className="vp-community-search">
                  <Search size={19} />
                  <input
                    type="search"
                    aria-label="Tìm bài viết"
                    maxLength={200}
                    placeholder="Tìm chuyện bếp, mẹo nấu…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <Button secondary>Tìm</Button>
              </form>
              <div className="vp-community-filter-row">
                <div
                  className="vp-type-filter"
                  role="group"
                  aria-label="Loại bài viết"
                >
                  {[
                    ["", "Tất cả"],
                    ["blog", "Bài viết"],
                    ["video", "Video"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      aria-pressed={type === value}
                      onClick={() => {
                        setType(value);
                        setPage(1);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <select
                  aria-label="Sắp xếp bài viết"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="top">Nổi bật</option>
                </select>
              </div>
              {keyword && (
                <p className="vp-search-summary">
                  Kết quả cho “{keyword}”{" "}
                  <button
                    className="vp-text-button"
                    onClick={() => {
                      setSearch("");
                      setKeyword("");
                      setPage(1);
                    }}
                  >
                    Xóa tìm kiếm
                  </button>
                </p>
              )}
            </div>
          )}
          {mine && (
            <p className="vp-mine-hint">
              Theo dõi bài đã gửi và trạng thái duyệt tại đây.
            </p>
          )}
          <State
            resource={resource}
            empty={mine ? "Bạn chưa có bài chia sẻ" : "Chưa có bài phù hợp"}
          >
            {items.length ? (
              <div className="vp-community-list">
                {items.map((post) => (
                  <article key={post.id} className="vp-post-card">
                    <PostMeta post={post} />
                    <div className="vp-post-labels">
                      <span>
                        {post.postType === "video" ? (
                          <Video size={15} />
                        ) : (
                          <BookOpen size={15} />
                        )}
                        {post.postType === "video" ? "Video" : "Chia sẻ"}
                      </span>
                      {mine && (
                        <span
                          className="vp-post-status"
                          data-status={post.status}
                        >
                          {statusLabel(post.status)}
                        </span>
                      )}
                    </div>
                    {post.postType === "blog" && post.mediaUrl && (
                      <a
                        className="vp-post-preview"
                        href={`/post-detail?id=${post.id}`}
                        aria-label={`Đọc ${post.title}`}
                        onClick={(event) => {
                          event.preventDefault();
                          go("post-detail", post.id);
                        }}
                      >
                        <PostMedia post={post} />
                      </a>
                    )}
                    <h2>
                      <a
                        href={`/post-detail?id=${post.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          go("post-detail", post.id);
                        }}
                      >
                        {post.title}
                      </a>
                    </h2>
                    <div className="vp-post-card-footer">
                      <div className="vp-post-stats">
                        <span title="Điểm cộng đồng">
                          <ArrowUp size={16} />
                          {post.score ?? 0}
                        </span>
                        <a
                          href={`/post-detail?id=${post.id}#post-comments`}
                          onClick={(e) => {
                            e.preventDefault();
                            go("post-detail", post.id);
                            window.history.replaceState(
                              {},
                              "",
                              `${window.location.pathname}${window.location.search}#post-comments`,
                            );
                          }}
                        >
                          <MessageCircle size={16} />
                          {post.commentCount ?? 0} bình luận
                        </a>
                      </div>
                      <div className="vp-post-card-actions">
                        {mine && (
                          <button
                            className="vp-icon"
                            aria-label={`Xóa bài ${post.title}`}
                            onClick={() => {
                              setError("");
                              setDeleting(post);
                            }}
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                        <a
                          className="vp-read-post"
                          href={`/post-detail?id=${post.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            go("post-detail", post.id);
                          }}
                        >
                          Đọc bài
                          <ArrowRight size={16} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="vp-empty">
                <BookOpen size={28} />
                <h2>Chưa có bài phù hợp</h2>
                <p>Thử loại bài khác hoặc sang trang tiếp theo.</p>
              </div>
            )}
          </State>
          <PageControls
            data={resource.data}
            page={page}
            setPage={setPage}
            disabled={resource.loading}
          />
        </div>
        <aside className="vp-community-aside">
          <span className="vp-aside-mark">
            <PenLine size={25} strokeWidth={1.5} />
          </span>
          <h2>Khi chia sẻ</h2>
          <p>
            Kể từ trải nghiệm của bạn. Nếu nhắc đến kiến thức dinh dưỡng, thêm
            nguồn để người đọc tra cứu.
          </p>
          {!user && (
            <button className="vp-text-button" onClick={() => go("login")}>
              Đăng nhập để tham gia
              <ArrowRight size={16} />
            </button>
          )}
        </aside>
      </div>
      {deleting && (
        <CommunityDialog
          title="Xóa bài viết?"
          busy={busy}
          close={() => setDeleting(null)}
        >
          <p>“{deleting.title}” sẽ được gỡ. Thao tác không thể hoàn tác.</p>
          {error && <Notice error>{error}</Notice>}
          <div className="vp-actions">
            <Button secondary disabled={busy} onClick={() => setDeleting(null)}>
              Giữ bài viết
            </Button>
            <Button disabled={busy} onClick={remove}>
              {busy ? "Đang xóa…" : "Xóa bài viết"}
            </Button>
          </div>
        </CommunityDialog>
      )}
    </div>
  );
}
