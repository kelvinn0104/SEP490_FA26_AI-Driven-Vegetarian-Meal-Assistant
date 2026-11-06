import { useEffect, useRef, useState } from "react";
import { CalendarDays, MessageCircle, ScanLine, Shuffle } from "lucide-react";

const activities = {
  generate: [
    CalendarDays,
    "Đang tạo thực đơn",
    "Chờ máy chủ trả về thực đơn theo yêu cầu của bạn.",
  ],
  swap: [
    Shuffle,
    "Đang tìm món thay thế",
    "Món hiện tại vẫn giữ nguyên trong lúc chờ.",
  ],
  scan: [
    ScanLine,
    "Đang nhận diện nguyên liệu",
    "Kết quả sẽ hiện để bạn kiểm tra trước khi xác nhận.",
  ],
  chat: [
    MessageCircle,
    "Đang chờ trợ lý phản hồi",
    "Câu trả lời sẽ hiện trong cuộc trò chuyện.",
  ],
};

export function AiActivity({ kind }) {
  const [slow, setSlow] = useState(false);
  const status = useRef(null);
  useEffect(() => {
    if (kind === "generate" && matchMedia("(max-width: 800px)").matches) {
      status.current?.scrollIntoView({ block: "nearest" });
    }
    const timer = setTimeout(() => setSlow(true), 12000);
    return () => clearTimeout(timer);
  }, [kind]);
  const [Icon, title, detail] = activities[kind];
  return (
    <div
      ref={status}
      className="vp-ai-activity"
      data-activity={kind}
      role="status"
      aria-atomic="true"
    >
      <span className="vp-ai-art" aria-hidden="true">
        <img
          src="/images/brand/basil-sprout.webp"
          alt=""
          width="64"
          height="64"
        />
        <Icon size={16} />
      </span>
      <div className="vp-ai-copy">
        <strong>{title}</strong>
        <p>
          {slow
            ? "Máy chủ đang mất nhiều thời gian hơn thường lệ. Yêu cầu vẫn đang xử lý."
            : detail}
        </p>
      </div>
      <span className="vp-ai-pulse" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}
