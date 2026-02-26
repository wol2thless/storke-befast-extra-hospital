import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import CryptoJS from "crypto-js";
import { useVideoStatsStore } from "../../store/videoStatsStore";

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
      { id: 105, title: "การฝึกพูดสำหรับผู้ป่วยโรคหลอดเลือดสมอง", url: "https://www.youtube.com/watch?v=_fG04RU1kJg" },
      { id: 106, title: "10 ท่า ทรงตัวมั่นคง ยืนเดินปลอดภัย l งานกายภาพบำบัด โรงพยาบาลราชวิถี", url: "https://www.youtube.com/watch?v=PAG5s56afcU"}
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

function VideoLibraryDetail() {
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

  // หาวีดีโอที่ดูมากที่สุด 5 อันดับแรก
  const topViewedVideos = VIDEO_CATEGORIES.flatMap(category => category.videos)
    .map(video => ({ ...video, viewCount: getViewCount(video.id) }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  // หาหมวดหมู่ที่ดูมากที่สุด
  const categoryStats = VIDEO_CATEGORIES.map(category => ({
    ...category,
    totalViews: category.videos.reduce((sum, video) => sum + getViewCount(video.id), 0),
    totalVideos: category.videos.length
  })).sort((a, b) => b.totalViews - a.totalViews);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          📊 รายละเอียดคลังวีดีโอความรู้
        </h1>
        <p className="text-gray-600">
          สถิติการดูวีดีโอและการใช้งานคลังวีดีโอ
        </p>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{totalVideos}</div>
          <div className="text-sm text-gray-600">วีดีโอทั้งหมด</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{totalViews}</div>
          <div className="text-sm text-gray-600">ครั้งที่ดู</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{VIDEO_CATEGORIES.length}</div>
          <div className="text-sm text-gray-600">หมวดหมู่</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {totalViews > 0 ? Math.round((totalViews / totalVideos) * 10) / 10 : 0}
          </div>
          <div className="text-sm text-gray-600">เฉลี่ยต่อวีดีโอ</div>
        </div>
      </div>

      {/* วีดีโอที่ดูมากที่สุด */}
      {topViewedVideos.some(v => v.viewCount > 0) && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-primary mb-4">
            🏆 วีดีโอที่ดูมากที่สุด
          </h2>
          <div className="space-y-3">
            {topViewedVideos.map((video, index) => (
              <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-base-content">{video.title}</div>
                    <div className="text-sm text-gray-500">ID: {video.id}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{video.viewCount}</div>
                  <div className="text-xs text-gray-500">ครั้ง</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* สถิติตามหมวดหมู่ */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold text-primary mb-4">
          📊 สถิติตามหมวดหมู่
        </h2>
        <div className="space-y-4">
          {categoryStats.map((category, index) => (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-base-content">{category.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{category.totalViews}</div>
                  <div className="text-xs text-gray-500">ครั้ง</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 mb-3">{category.description}</div>
              
              {/* แสดงวีดีโอในหมวดหมู่ */}
              <div className="space-y-2">
                {category.videos.map((video) => (
                  <div key={video.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{video.title}</div>
                      <div className="text-xs text-gray-500">ID: {video.id}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      ดูแล้ว {getViewCount(video.id)} ครั้ง
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ปุ่มกลับ */}
      <div className="text-center">
        <Link to="/" className="btn btn-primary">
          ← กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}

export default VideoLibraryDetail; 