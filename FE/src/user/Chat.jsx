import { useState, useEffect, useRef } from "react";
import { ArrowRight, Send, History, Plus, Copy, Check } from "lucide-react";
import { AiActivity } from "./AiActivity";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useResource, Button, Notice, PageHeading, Dialog } from "./ui";
import { listOf, userError, isUnavailableChat } from "./data";
import { request } from "./api";
function historyPreview(message) {
  if (!message || isUnavailableChat(message))
    return "Cuộc trò chuyện chưa có phản hồi";
  return message
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

const markdownComponents = {
  table: ({ children }) => (
    <div
      className="vp-chat-table"
      tabIndex={0}
      role="region"
      aria-label="Bảng trong câu trả lời"
    >
      <table>{children}</table>
    </div>
  ),
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <a href={src} target="_blank" rel="noopener noreferrer">
      {alt || "Xem ảnh đính kèm"}
    </a>
  ),
};

function Answer({ content }) {
  const [copyState, setCopyState] = useState("");
  return (
    <>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
      <div className="vp-answer-tools">
        <button
          type="button"
          className="vp-text-button"
          aria-label="Sao chép câu trả lời"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(content);
              setCopyState("Đã sao chép");
            } catch {
              setCopyState(
                "Chưa sao chép được. Bạn có thể chọn văn bản để sao chép.",
              );
            }
          }}
        >
          {copyState === "Đã sao chép" ? (
            <Check size={14} />
          ) : (
            <Copy size={14} />
          )}{" "}
          Sao chép
        </button>
        <span role="status">{copyState}</span>
      </div>
    </>
  );
}

function ChatHistory({ sessions, session, busy, select }) {
  return (
    <>
      {sessions.loading ? (
        <p role="status">Đang tải…</p>
      ) : sessions.error ? (
        <>
          <p>{userError(sessions.error)}</p>
          <button className="vp-text-button" onClick={sessions.reload}>
            Thử lại
          </button>
        </>
      ) : listOf(sessions.data).length ? (
        listOf(sessions.data).map((s) => (
          <button
            key={s.id}
            disabled={busy}
            aria-pressed={session === s.id}
            onClick={() => select(s.id)}
          >
            {historyPreview(s.lastMessage)}
            <small>{new Date(s.createdAt).toLocaleDateString("vi-VN")}</small>
          </button>
        ))
      ) : (
        <p>Chưa có cuộc trò chuyện.</p>
      )}
    </>
  );
}
export function Chat() {
  const sessions = useResource(
    (signal) => request("/chat/sessions", undefined, undefined, signal),
    [],
  );
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const end = useRef();
  const composer = useRef(null);
  const lock = useRef(false);
  const workspace = useRef(null);
  useEffect(() => {
    const viewport = window.visualViewport;
    const root = workspace.current?.closest(".vp-screen-chatbot");
    if (!viewport || !root) return;
    const resize = () => {
      root.style.setProperty("--chat-viewport-height", viewport.height + "px");
      root.toggleAttribute(
        "data-chat-keyboard",
        window.innerHeight - viewport.height > 120,
      );
    };
    resize();
    viewport.addEventListener("resize", resize);
    return () => {
      viewport.removeEventListener("resize", resize);
      root.style.removeProperty("--chat-viewport-height");
      root.removeAttribute("data-chat-keyboard");
    };
  }, []);
  useEffect(() => {
    const input = composer.current;
    if (!input) return;
    input.style.height = "auto";
    input.style.height = Math.min(144, Math.max(44, input.scrollHeight)) + "px";
  }, [text]);
  useEffect(() => {
    const container = end.current?.parentElement;
    container?.scrollTo({
      top: container.scrollHeight,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [messages, busy]);
  const select = async (id) => {
    if (lock.current) return;
    lock.current = true;
    setBusy("history");
    setError("");
    try {
      const data = await request(`/chat/sessions/${id}/messages`);
      const history = listOf(data);
      setMessages(
        history.filter(
          (m) => m.sender === "user" || !isUnavailableChat(m.content),
        ),
      );
      if (
        history.some((m) => m.sender !== "user" && isUnavailableChat(m.content))
      )
        setError("Có câu hỏi chưa nhận được phản hồi từ trợ lý.");
      setSession(id);
      setHistoryOpen(false);
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || lock.current) return;
    lock.current = true;
    setBusy("send");
    setError("");
    const content = text.trim();
    try {
      let id = session;
      if (!id) {
        const data = await request("/chat/sessions", {});
        id = data?.id;
        if (!id) throw new Error("Chưa thể tạo cuộc trò chuyện.");
        setSession(id);
      }
      const reply = await request(`/chat/sessions/${id}/messages`, { content });
      if (
        typeof reply?.aiMessage?.content !== "string" ||
        !reply.aiMessage.content.trim()
      )
        throw new Error("Chưa nhận được câu trả lời. Bạn có thể thử lại.");
      if (isUnavailableChat(reply.aiMessage.content)) {
        setMessages((previous) => [
          ...previous,
          reply.userMessage || { sender: "user", content },
        ]);
        setError("Trợ lý đang bận. Bạn có thể thử gửi lại sau.");
        sessions.reload();
        return;
      }
      setMessages((previous) => [
        ...previous,
        reply.userMessage || { sender: "user", content },
        reply.aiMessage,
      ]);
      setText("");
      sessions.reload();
    } catch (err) {
      setError(userError(err));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  return (
    <>
      <PageHeading eyebrow="Hỏi một chút, nấu dễ hơn" title="Trợ lý bếp chay">
        <div className="vp-chat-heading-actions">
          <button
            className="vp-icon vp-chat-history-toggle"
            aria-label="Trò chuyện gần đây"
            disabled={!!busy}
            onClick={() => setHistoryOpen(true)}
          >
            <History size={20} />
          </button>
          <Button
            secondary
            disabled={!!busy}
            aria-label="Cuộc trò chuyện mới"
            onClick={() => {
              setSession(null);
              setMessages([]);
              setText("");
              setError("");
              composer.current?.focus();
            }}
          >
            <Plus size={19} aria-hidden="true" />
            <span>Cuộc trò chuyện mới</span>
          </Button>
        </div>
      </PageHeading>
      <div className="vp-chat-layout" ref={workspace}>
        <aside className="vp-chat-history">
          <h2>Gần đây</h2>
          <ChatHistory
            sessions={sessions}
            session={session}
            busy={busy}
            select={select}
          />
        </aside>
        <section className="vp-chat">
          <div
            className="vp-messages"
            role="log"
            aria-label="Tin nhắn"
            tabIndex={0}
            aria-busy={busy === "history"}
          >
            {!messages.length && !busy && (
              <div className="vp-chat-welcome">
                <img
                  src="/images/brand/basil-sprout.webp"
                  alt=""
                  width="48"
                  height="48"
                />
                <h2>Bạn đang muốn nấu gì?</h2>
                <p>
                  Hỏi cách thay nguyên liệu, gợi ý món chay hoặc cách chuẩn bị
                  bữa ăn.
                </p>
                {[
                  "Gợi ý bữa tối chay với đậu hũ",
                  "Thay trứng khi làm bánh như thế nào?",
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setText(q);
                      composer.current?.focus();
                    }}
                  >
                    {q}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            )}
            {busy !== "history" &&
              messages.map((m, i) => (
                <article
                  key={m.id || i}
                  className={`vp-message ${m.sender === "user" ? "own" : ""}`}
                >
                  <strong>{m.sender === "user" ? "Bạn" : "Trợ lý"}</strong>
                  <div className="vp-prose">
                    {m.sender === "user" ? (
                      <p className="vp-chat-user-text">{m.content}</p>
                    ) : (
                      <Answer content={m.content} />
                    )}
                  </div>
                </article>
              ))}
            {busy === "send" && (
              <article
                className="vp-message own"
                aria-label="Tin nhắn đang gửi"
              >
                <strong>Bạn · đang gửi</strong>
                <div className="vp-prose">
                  <p className="vp-chat-user-text">{text.trim()}</p>
                </div>
              </article>
            )}
            {busy === "history" && (
              <p role="status">Đang tải cuộc trò chuyện…</p>
            )}
            <div ref={end} />
          </div>
          {busy === "send" && <AiActivity kind="chat" />}
          {error && <Notice error>{error}</Notice>}
          {!busy &&
            !error &&
            !text &&
            messages.at(-1)?.sender !== "user" &&
            messages.length > 0 && (
              <div
                className="vp-chat-followups"
                role="group"
                aria-label="Gợi ý hỏi tiếp"
              >
                {[
                  "Tóm tắt thành các bước ngắn",
                  "Có thể thay nguyên liệu nào?",
                ].map((question) => (
                  <button
                    key={question}
                    onClick={() => {
                      setText(question);
                      composer.current?.focus();
                    }}
                  >
                    {question}
                    <Plus size={13} />
                  </button>
                ))}
              </div>
            )}
          <form className="vp-chat-form" onSubmit={send}>
            <textarea
              ref={composer}
              aria-label="Tin nhắn"
              placeholder={
                messages.length
                  ? "Hỏi tiếp về món này…"
                  : "Bạn có nguyên liệu gì, muốn nấu món nào?"
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  (e.ctrlKey ||
                    e.metaKey ||
                    !window.matchMedia("(pointer: coarse)").matches)
                ) {
                  e.preventDefault();
                  send(e);
                }
              }}
              maxLength={2000}
              rows={1}
              required
              readOnly={busy === "send"}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button disabled={busy || !text.trim()} aria-label="Gửi tin nhắn">
              <Send size={19} />
            </Button>
          </form>
          <small className="vp-compose-hint">
            Enter để gửi · Shift + Enter xuống dòng · {text.length}/2000
          </small>
          <small>
            Trợ lý có thể nhầm. Kiểm tra thông tin về dị ứng và sức khỏe trước
            khi áp dụng.
          </small>
        </section>
      </div>
      {historyOpen && (
        <Dialog
          title="Trò chuyện gần đây"
          className="vp-sheet vp-chat-history-sheet"
          busy={busy}
          close={() => setHistoryOpen(false)}
        >
          <ChatHistory
            sessions={sessions}
            session={session}
            busy={busy}
            select={select}
          />
        </Dialog>
      )}
    </>
  );
}
