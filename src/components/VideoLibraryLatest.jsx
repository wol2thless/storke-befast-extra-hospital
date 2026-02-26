import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import CryptoJS from "crypto-js";
import { useVideoStatsStore } from "../store/videoStatsStore";

// ข้อมูลวีดีโอทั้งหมดแบ่งตามหมวดหมู่ (เฉพาะที่มีอยู่จริงในระบบ)
const VIDEO_CATEGORIES = [
  {
    id: "stroke_education",
    title: "📚 วีดีโอความรู้โรคหลอดเลือดสมอง",
    description: "ความรู้เกี่ยวกับโรคหลอดเลือดสมอง การป้องกัน และการดูแล",
    videos: [
      { id: 1, title: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)", url: "https://www.youtube.com/watch?v=sbwXklQK3v8" },
      { id: 2, title: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ", url: "https://www.youtube.com/watch?v=AJ503g2k9Zc" }
    ]
  },
  {
    id: "exercise_education",
    title: "🏃‍♂️ วีดีโอการออกกำลังกาย",
    description: "การออกกำลังกายและการทำกายภาพบำบัดสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    videos: [
      { id: 100, title: "กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]", url: "https://www.youtube.com/watch?v=ls0ZUehgiMA" },
      { id: 101, title: "การออกกำลังกายด้วยตัวเองในผู้ปวยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี", url: "https://www.youtube.com/watch?v=eEmeOHis4bE" },
      { id: 102, title: "การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี", url: "https://www.youtube.com/watch?v=LU1XdGeOwIA" },
      { id: 103, title: "การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี", url: "https://www.youtube.com/watch?v=6zgNn1alhIM" },
      { id: 104, title: "การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน", url: "https://www.youtube.com/watch?v=5Fv59zZ9h0w" },
      { id: 105, title: "การออกกำลังกายด้วยตัวเองในผู้ป่วยโรคหลอดเลือดสมอง", url: "https://www.youtube.com/watch?v=5Fv59zZ9h0w" }
    ]
  },
  {
    id: "nutrition_education",
    title: "🍎 วีดีโอโภชนาการ",
    description: "การรับประทานอาหารและการโภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    videos: [
      { id: 200, title: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง", url: "https://www.youtube.com/watch?v=cD7HPKx6Agk" },
      { id: 201, title: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง", url: "https://www.youtube.com/watch?v=GPnej-kGLd4" }
    ]
  },
  {
    id: "medication_education",
    title: "💊 วีดีโอความรู้เรื่องยา",
    description: "ความรู้เกี่ยวกับยาที่ใช้ในการรักษาโรคหลอดเลือดสมอง",
    videos: [
      { id: 300, title: "ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง", url: "https://www.youtube.com/watch?v=CJKZwk4ayZQ" }
    ]
  },
  {
    id: "motivation_education",
    title: "💪 วีดีโอเสริมพลังใจ",
    description: "วีดีโอให้กำลังใจและเสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
    videos: [
      { id: 400, title: "เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง", url: "https://www.youtube.com/watch?v=9zpZX0Msraw" },
      { id: 401, title: "กำลังใจและแรงบันดาลใจ", url: "https://www.youtube.com/watch?v=CO7A7SfW838" },
      { id: 402, title: "พลังใจในการฟื้นฟู", url: "https://www.youtube.com/watch?v=IezdiAqkdCo" }
    ]
  }
];

function VideoLibraryLatest() {
  const [pid, setPid] = useState("");
  
  const getVideoStats = useVideoStatsStore((s) => s.getVideoStats);
  const stats = useVideoStatsStore((s) => s.stats);

  // ดึง pid จาก localStorage (user) แบบเข้ารหัส
  const SECRET_KEY = "stroke-app-key";
  function decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  }

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
      getVideoStats(null, pid).then((res) => {

      });
    }
  }, [getVideoStats, pid]);

  const getViewCount = (videoId) => {
    const found = stats.find((s) => s.video_id === String(videoId));
    if (!found) return 0;
    
    // แปลง view_count เป็นตัวเลข
    const viewCount = parseInt(found.view_count, 10);
    return isNaN(viewCount) ? 0 : viewCount;
  };

  // คำนวณสถิติรวม
  const totalVideos = VIDEO_CATEGORIES.reduce((sum, category) => sum + category.videos.length, 0);
  const totalViews = VIDEO_CATEGORIES.reduce((sum, category) => 
    sum + category.videos.reduce((catSum, video) => catSum + getViewCount(video.id), 0), 0
  );

  // หาวีดีโอที่ดูมากที่สุด
  const mostViewedVideo = VIDEO_CATEGORIES.flatMap(category => category.videos)
    .map(video => ({ ...video, viewCount: getViewCount(video.id) }))
    .sort((a, b) => b.viewCount - a.viewCount)[0];

  // หาหมวดหมู่ที่ดูมากที่สุด
  const mostViewedCategory = VIDEO_CATEGORIES.map(category => ({
    ...category,
    totalViews: category.videos.reduce((sum, video) => sum + getViewCount(video.id), 0)
  })).sort((a, b) => b.totalViews - a.totalViews)[0];

  return (
    <div className="bg-white rounded-lg shadow p-4 border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-primary">
          📚 คลังวีดีโอความรู้
        </h2>
        <div className="flex gap-2">
          <Link to="/video-library-detail" className="btn btn-outline btn-secondary btn-sm">
            สถิติ
          </Link>
          <Link to="/video-library" className="btn btn-outline btn-primary btn-sm">
            ดูทั้งหมด
          </Link>
        </div>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalVideos}</div>
          <div className="text-sm text-gray-600">วีดีโอทั้งหมด</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{totalViews}</div>
          <div className="text-sm text-gray-600">ครั้งที่ดู</div>
        </div>
      </div>

      {/* หมวดหมู่ที่ดูมากที่สุด */}
      {mostViewedCategory && mostViewedCategory.totalViews > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <div className="text-sm font-semibold text-yellow-800 mb-1">
            🏆 หมวดหมู่ที่ดูมากที่สุด
          </div>
          <div className="text-sm text-gray-700">
            {mostViewedCategory.title} ({mostViewedCategory.totalViews} ครั้ง)
          </div>
        </div>
      )}

      {/* วีดีโอที่ดูมากที่สุด */}
      {mostViewedVideo && mostViewedVideo.viewCount > 0 && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <div className="text-sm font-semibold text-purple-800 mb-1">
            ⭐ วีดีโอที่ดูมากที่สุด
          </div>
          <div className="text-sm text-gray-700 truncate">
            {mostViewedVideo.title} ({mostViewedVideo.viewCount} ครั้ง)
          </div>
        </div>
      )}

      {/* สรุปหมวดหมู่ */}
      <div className="space-y-2">
        {VIDEO_CATEGORIES.map((category) => {
          const categoryViews = category.videos.reduce((sum, video) => sum + getViewCount(video.id), 0);
          return (
            <div key={category.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{category.title}</span>
                <span className="text-xs text-gray-500">
                  ({category.videos.length} เรื่อง)
                </span>
              </div>
              <div className="text-sm text-gray-600">
                ดูแล้ว {categoryViews} ครั้ง
              </div>
            </div>
          );
        })}
      </div>

      {/* ข้อความเมื่อยังไม่มีการดูวีดีโอ */}
      {totalViews === 0 && (
        <div className="text-center py-4 text-gray-500">
          <div className="text-sm mb-2">ยังไม่มีการดูวีดีโอ</div>
          <Link to="/video-library" className="btn btn-primary btn-sm">
            เริ่มดูวีดีโอ
          </Link>
        </div>
      )}
    </div>
  );
}

export default VideoLibraryLatest; 