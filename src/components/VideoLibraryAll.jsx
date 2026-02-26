import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import CryptoJS from "crypto-js";
import VideoStatTracker from "./VideoStatTracker";
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

function VideoLibraryAll() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  // กรองวีดีโอตามคำค้นหา
  const filteredCategories = VIDEO_CATEGORIES.map(category => ({
    ...category,
    videos: category.videos.filter(video =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.videos.length > 0);

  // เปิดวีดีโอใน overlay พร้อมการนับจำนวนการดู
  const openVideo = (videoUrl, videoId) => {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
    overlay.onclick = () => document.body.removeChild(overlay);
    
    const videoContainer = document.createElement('div');
    videoContainer.className = 'relative w-full max-w-4xl mx-4';
    videoContainer.onclick = (e) => e.stopPropagation();
    
    // แยก video ID จาก YouTube URL
    const youtubeVideoId = videoUrl.split('v=')[1]?.split('&')[0];
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
    <div className="p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">
          📚 คลังวีดีโอความรู้
        </h1>
        <p className="text-gray-600">
          วีดีโอความรู้เกี่ยวกับโรคหลอดเลือดสมองและการดูแลสุขภาพ
        </p>
      </div>

      {/* ช่องค้นหา */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหาวีดีโอ..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-3 text-gray-400">🔍</span>
        </div>
      </div>

      {/* แสดงหมวดหมู่ที่เลือก */}
      {selectedCategory && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className="btn btn-ghost btn-sm"
            >
              ← กลับไปหน้าหมวดหมู่
            </button>
            <h2 className="text-xl font-bold text-primary">
              {selectedCategory.title}
            </h2>
          </div>
          <p className="text-gray-600 mb-4">{selectedCategory.description}</p>
          
          <div className="grid gap-4">
            {selectedCategory.videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base-content mb-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ID: {video.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      ดูแล้ว {getViewCount(video.id)} ครั้ง
                    </span>
                    <button
                      onClick={() => openVideo(video.url, video.id)}
                      className="btn btn-primary btn-sm"
                    >
                      ▶️ ดูวีดีโอ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* แสดงหมวดหมู่ทั้งหมด */}
      {!selectedCategory && (
        <div className="grid gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-lg border">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-primary mb-2">
                      {category.title}
                    </h2>
                    <p className="text-gray-600 mb-3">
                      {category.description}
                    </p>
                    <div className="text-sm text-gray-500">
                      จำนวนวีดีโอ: {category.videos.length} เรื่อง
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className="btn btn-outline btn-primary btn-sm"
                  >
                    ดูทั้งหมด
                  </button>
                </div>
                
                {/* แสดงวีดีโอตัวอย่าง 3 เรื่องแรก */}
                <div className="space-y-3">
                  {category.videos.slice(0, 3).map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-base-content">
                          {video.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          ID: {video.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">
                          {getViewCount(video.id)} ครั้ง
                        </span>
                        <button
                          onClick={() => openVideo(video.url, video.id)}
                          className="btn btn-ghost btn-xs"
                        >
                          ▶️
                        </button>
                      </div>
                    </div>
                  ))}
                  {category.videos.length > 3 && (
                    <div className="text-center pt-2">
                      <span className="text-sm text-gray-500">
                        และอีก {category.videos.length - 3} เรื่อง
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* แสดงผลการค้นหา */}
      {searchTerm && filteredCategories.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            ไม่พบวีดีโอที่ตรงกับคำค้นหา "{searchTerm}"
          </div>
          <button
            onClick={() => setSearchTerm("")}
            className="btn btn-primary btn-sm"
          >
            ล้างการค้นหา
          </button>
        </div>
      )}
    </div>
  );
}

export default VideoLibraryAll; 