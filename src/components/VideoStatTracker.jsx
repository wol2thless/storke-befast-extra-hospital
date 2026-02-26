import { useRef, useState, cloneElement } from "react";
import { useVideoStatsStore } from "../store/videoStatsStore";

// ใช้แบบ <VideoStatTracker pid={...} videoId={...}> <iframe ... /> </VideoStatTracker>
function VideoStatTracker({ pid, videoId, onView, onViewLogged, children }) {
  const loggedRef = useRef(false);
  const logVideoView = useVideoStatsStore((s) => s.logVideoView);
  const [showVideo, setShowVideo] = useState(false);

  // overlay ปุ่มเล่นวิดีโอ
  const handlePlay = async () => {
    if (loggedRef.current) return;
    await logVideoView(pid, videoId);
    loggedRef.current = true;
    setShowVideo(true);
    if (typeof onViewLogged === "function") {
      onViewLogged();
    }
  };

  // เมื่อ iframe blur (user หยุดเล่น/เปลี่ยน focus) ให้ปุ่มกลับมา
  const handleBlur = () => {
    setShowVideo(false);
    loggedRef.current = false;
  };

  let childWithEvent = null;
  if (children && children.type === "video") {
    childWithEvent = cloneElement(children, {
      onPlay: handlePlay,
      style: {
        ...(children.props.style || {}),
        display: showVideo ? undefined : "none",
      },
    });
  } else if (children && children.type === "iframe") {
    // สำหรับ iframe (YouTube) ซ่อน/แสดงด้วย showVideo, ผูก onBlur, เปลี่ยน src เป็น autoplay=1&mute=1
    const style = { ...children.props.style };
    delete style.position;
    let src = children.props.src;
    if (showVideo) {
      // เพิ่ม autoplay=1&mute=1 (รองรับกรณีมี query อยู่แล้ว)
      if (src.includes("?")) {
        src = src + "&autoplay=1&mute=1";
      } else {
        src = src + "?autoplay=1&mute=1";
      }
    }
    childWithEvent = cloneElement(children, {
      src,
      style: {
        ...style,
        outline: "none",
        zIndex: 1,
        display: showVideo ? undefined : "none",
      },
      tabIndex: 0,
      onBlur: handleBlur,
      allow: (children.props.allow || "") + ",autoplay",
    });
  } else {
    childWithEvent = children;
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {!showVideo && (
        <button
          type="button"
          onClick={handlePlay}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.2)",
            color: "#fff",
            fontSize: 22,
            fontWeight: 600,
            border: 0,
            borderRadius: 12,
            zIndex: 10,
            cursor: "pointer",
          }}
        >
          ▶ เล่นวิดีโอ
        </button>
      )}
      {childWithEvent}
    </div>
  );
}

export default VideoStatTracker;
