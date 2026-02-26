import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import VideoStatTracker from "./VideoStatTracker";
import { useVideoStatsStore } from "../store/videoStatsStore";

const SECRET_KEY = "stroke-app-key";
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const videos = [
  {
    title: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    src: "https://www.youtube.com/embed/cD7HPKx6Agk",
  },
  {
    title: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    src: "https://www.youtube.com/embed/GPnej-kGLd4",
  },
];

function NutritionEducationVideos({ hideTitle }) {
  const [pid, setPid] = useState("");
  const getVideoStats = useVideoStatsStore((s) => s.getVideoStats);
  const stats = useVideoStatsStore((s) => s.stats);

  useEffect(() => {
    // ดึง pid จาก localStorage ทุกครั้งที่ component mount
    try {
      const encUser = localStorage.getItem("user");
      if (encUser) {
        const u = decrypt(encUser);
        let cidValue = u?.cid || u?.card_id || u?.pid || "";
        if (!cidValue) {
          cidValue =
            localStorage.getItem("cid") ||
            localStorage.getItem("card_id") ||
            localStorage.getItem("pid") ||
            "";
        }
        setPid(cidValue);
      } else {
        setPid("");
      }
    } catch {
      setPid("");
    }
  }, []);

  useEffect(() => {
    if (pid) {
      getVideoStats(null, pid).then((res) => {});
    }
  }, [getVideoStats, pid]);

  const handleViewLogged = () => {
    if (pid) {
      getVideoStats(null, pid);
    }
  };

  const getViewCount = (videoId) => {
    const found = stats.find((s) => s.video_id === String(videoId));
    if (!found) return 0;

    // แปลง view_count เป็นตัวเลข
    const viewCount = parseInt(found.view_count, 10);
    return isNaN(viewCount) ? 0 : viewCount;
  };

  // เปิดวีดีโอใน overlay พร้อมการนับจำนวนการดู
  const openVideo = (videoUrl, videoId) => {
    const overlay = document.createElement("div");
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50";
    overlay.onclick = () => document.body.removeChild(overlay);

    const videoContainer = document.createElement("div");
    videoContainer.className = "relative w-full max-w-4xl mx-4";
    videoContainer.onclick = (e) => e.stopPropagation();

    // แยก video ID จาก YouTube URL
    const youtubeVideoId = videoUrl.split("v=")[1]?.split("&")[0];
    const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`;

    videoContainer.innerHTML = `
      <button class="absolute top-4 right-4 text-white text-2xl z-10 hover:text-gray-300" onclick="this.closest('.fixed').remove()">×</button>
      <iframe 
        width="100%" 
        height="400" 
        src="${embedUrl}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;

    overlay.appendChild(videoContainer);
    document.body.appendChild(overlay);

    // บันทึกการดูวีดีโอ
    if (pid && videoId) {
      const logVideoView = useVideoStatsStore.getState().logVideoView;
      logVideoView(pid, videoId).then(() => {
        handleViewLogged();
      });
    }
  };

  return (
    <div className="mt-0">
      {!hideTitle && (
        <h2 className="text-lg font-bold mb-2 text-primary">
          วิดีโออาหารและโภชนาการสำหรับผู้ป่วย
        </h2>
      )}

      {/* คำแนะนำด้านบน */}
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-warning mb-2">🍎 คำแนะนำ</h3>
        <p className="text-sm text-base-content/80 leading-relaxed">
          คำแนะนำการรับประทานอาหารสำหรับผู้ป่วยโรคหลอดเลือดสมอง
          ช่วยฟื้นฟูสมองและสุขภาพให้ดียิ่งขึ้น
        </p>
      </div>

      <div className="space-y-3">
        {videos.map((v, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-base-content text-sm">
                  {v.title}
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-500 font-bold">
                  ดูแล้ว {getViewCount(i + 200)} ครั้ง
                </span>
                <button
                  onClick={() =>
                    openVideo(v.src.replace("/embed/", "/watch?v="), i + 200)
                  }
                  className="btn btn-warning btn-sm"
                >
                  ▶️ ดูวีดีโอ
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NutritionEducationVideos;
