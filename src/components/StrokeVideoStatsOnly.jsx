import { useEffect } from "react";
import CryptoJS from "crypto-js";
import { useVideoStatsStore } from "../store/videoStatsStore";

// ดึง pid จาก localStorage (แบบเดียวกับ PersonInfoPage)
const SECRET_KEY = "stroke-app-key";
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

let pid = null;
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
    pid = cidValue;
  }
} catch {}

const videos = [
  {
    title: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)",
  },
  {
    title: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ",
  },
];

function StrokeVideoStatsOnly() {
  const getVideoStats = useVideoStatsStore((s) => s.getVideoStats);
  const stats = useVideoStatsStore((s) => s.stats);

  useEffect(() => {
    if (pid) {
      getVideoStats(null, pid);
    }
  }, [getVideoStats]);

  const getViewCount = (videoId) => {
    const found = stats.find((s) => s.video_id === String(videoId));
    if (!found) return 0;
    
    // แปลง view_count เป็นตัวเลข
    const viewCount = parseInt(found.view_count, 10);
    return isNaN(viewCount) ? 0 : viewCount;
  };

  return (
    <div className="mt-4">
      <h3 className="text-base font-semibold mb-2 text-primary">
        สถิติการดูวิดีโอความรู้
      </h3>
      <ul className="space-y-1">
        {videos.map((v, i) => (
          <li
            key={i}
            className="flex flex-row flex-wrap items-center justify-between gap-2 px-2 py-1 bg-base-100 rounded"
          >
            <span className="font-medium whitespace-pre-line">{v.title}</span>
            <span className="text-xs text-gray-500 font-normal shrink-0">
              (ดูไปแล้ว {getViewCount(i + 1)} ครั้ง)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StrokeVideoStatsOnly;
