import { useState, useEffect, useRef } from "react";
import { Leaf, ArrowRight, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useResource, Button, Notice, PageHeading } from "./ui";
import { listOf, userError, isUnavailableChat } from "./data";
import { request } from "./api";
export function Chat() {
  const sessions = useResource(
    (signal) => request("/chat/sessions", undefined, undefined, signal),
    [],
  );
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef();
  const lock = useRef(false);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, busy]);
  const select = async (id) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
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
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || lock.current) return;
    lock.current = true;
    setBusy(true);
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
      if (!reply?.aiMessage)
        throw new Error("Chưa nhận được câu trả lời. Bạn có thể thử lại.");
      if (isUnavailableChat(reply.aiMessage.content)) {
        setMessages((previous) => [
          ...previous,
          reply.userMessage || { sender: "user", content },
        ]);
        setText("");
        setError("Trợ lý đang bận. Bạn có thể quay lại sau.");
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
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading eyebrow="Hỏi một chút, nấu dễ hơn" title="Trợ lý bếp chay">
        <Button
          secondary
          disabled={busy}
          onClick={() => {
            setSession(null);
            setMessages([]);
            setError("");
          }}
        >
          Cuộc trò chuyện mới
        </Button>
      </PageHeading>
      <div className="vp-chat-layout">
        <aside className="vp-chat-history">
          <h2>Gần đây</h2>
          {sessions.loading ? (
            <p>Đang tải…</p>
          ) : sessions.error ? (
            <p>{userError(sessions.error)}</p>
          ) : listOf(sessions.data).length ? (
            listOf(sessions.data).map((s) => (
              <button
                key={s.id}
                disabled={busy}
                aria-pressed={session === s.id}
                onClick={() => select(s.id)}
              >
                {s.lastMessage?.slice(0, 65) || "Cuộc trò chuyện"}
                <small>
                  {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                </small>
              </button>
            ))
          ) : (
            <p>Chưa có cuộc trò chuyện.</p>
          )}
        </aside>
        <section className="vp-chat">
          <div className="vp-messages" role="log" aria-label="Tin nhắn">
            {!messages.length && (
              <div className="vp-chat-welcome">
                <Leaf size={36} />
                <h2>Bạn đang muốn nấu gì?</h2>
                <p>
                  Hỏi cách thay nguyên liệu, gợi ý món chay hoặc cách chuẩn bị
                  bữa ăn.
                </p>
                {[
                  "Gợi ý bữa tối chay với đậu hũ",
                  "Thay trứng khi làm bánh như thế nào?",
                ].map((q) => (
                  <button key={q} onClick={() => setText(q)}>
                    {q}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            )}
            {messages.map((m, i) => (
              <article
                key={m.id || i}
                className={`vp-message ${m.sender === "user" ? "own" : ""}`}
              >
                <strong>{m.sender === "user" ? "Bạn" : "Trợ lý"}</strong>
                <div className="vp-prose">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </article>
            ))}
            {busy && <p role="status">Đang xử lý…</p>}
            <div ref={end} />
          </div>
          {error && <Notice error>{error}</Notice>}
          <form className="vp-chat-form" onSubmit={send}>
            <textarea
              aria-label="Tin nhắn"
              placeholder="Hỏi trợ lý bếp chay…"
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  send(e);
                }
              }}
              maxLength={2000}
              rows={2}
              required
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
    </>
  );
}
