import { Component } from "react";
export class PortalBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <div
          role="alert"
          style={{
            maxWidth: 600,
            padding: 40,
            margin: "60px auto",
            fontFamily: "sans-serif",
          }}
        >
          <h1>Chưa thể hiển thị trang</h1>
          <p>
            Vui lòng tải lại để tiếp tục. Dữ liệu đã lưu trên máy chủ không bị
            ảnh hưởng.
          </p>
          <button onClick={() => window.location.reload()}>
            Tải lại trang
          </button>
        </div>
      );
    return this.props.children;
  }
}
