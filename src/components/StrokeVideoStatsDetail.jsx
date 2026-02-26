import { useEffect, useState } from "react";
import { useVideoStatsStore } from "../store/videoStatsStore";

// ข้อมูลวีดีโอทั้งหมดแบ่งตามหมวดหมู่ (เฉพาะที่มีอยู่จริงในระบบ)
const VIDEO_CATEGORIES = [
  {
    id: "stroke_education",
    title: "📚 วีดีโอความรู้โรคหลอดเลือดสมอง",
    videos: [
      { id: 1, title: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)" },
      { id: 2, title: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ" }
    ]
  },
  {
    id: "exercise_education",
    title: "🏃‍♂️ วีดีโอการออกกำลังกาย",
    videos: [
      { id: 100, title: "กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]" },
      { id: 101, title: "การออกกำลังกายด้วยตัวเองในผู้ปวยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
      { id: 102, title: "การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
      { id: 103, title: "การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี" },
      { id: 104, title: "การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน" },
      { id: 105, title: "การออกกำลังกายด้วยตัวเองในผู้ป่วยโรคหลอดเลือดสมอง" }
    ]
  },
  {
    id: "nutrition_education",
    title: "🍎 วีดีโอโภชนาการ",
    videos: [
      { id: 200, title: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
      { id: 201, title: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง" }
    ]
  },
  {
    id: "medication_education",
    title: "💊 วีดีโอความรู้เรื่องยา",
    videos: [
      { id: 300, title: "ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง" }
    ]
  },
  {
    id: "motivation_education",
    title: "💪 วีดีโอเสริมพลังใจ",
    videos: [
      { id: 400, title: "เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง" },
      { id: 401, title: "กำลังใจและแรงบันดาลใจ" },
      { id: 402, title: "พลังใจในการฟื้นฟู" }
    ]
  }
];


function StrokeVideoStatsDetail({ summaryOnly = false, pid: propPid }) {
  const [log, setLog] = useState([]);
  const [apiError, setApiError] = useState("");

  const pid = propPid;
  const getVideoViewLog = useVideoStatsStore((s) => s.getVideoViewLog);
  useEffect(() => {
    if (!pid) {
      setLog([]);
      setApiError("");
      return;
    }
    setApiError("");
    getVideoViewLog(pid)
      .then((res) => {
        if (res && res.success) {
          setLog(res.data || []);
        } else {
          setLog([]);
          setApiError(res?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      });
  }, [getVideoViewLog, summaryOnly, pid]);

  // รวมจำนวนครั้งที่ดูแต่ละวิดีโอ (จากทุกหมวดหมู่)
  const getAllVideos = () => {
    const allVideos = [];
    VIDEO_CATEGORIES.forEach(category => {
      category.videos.forEach(video => {
        allVideos.push({
          id: video.id,
          title: video.title,
          category: category.title
        });
      });
    });
    return allVideos;
  };
  
  const allVideos = getAllVideos();
  
  // สร้าง list ของ video_id ที่มีจริงในระบบ
  const validVideoIds = new Set();
  allVideos.forEach(video => validVideoIds.add(String(video.id)));
  
  // กรองเฉพาะ video_id ที่มีจริงในระบบ
  const validLog = log.filter(item => 
    item && 
    item.video_id && 
    validVideoIds.has(String(item.video_id))
  );
  
  // คำนวณสถิติการดูวีดีโอทั้งหมด
  const totalVideoViews = validLog.length;
  
  // คำนวณจำนวนครั้งที่ดูแต่ละวิดีโอ
  const videoCounts = allVideos.map((video) => {
    const count = validLog.filter(
      (row) => String(row.video_id) === String(video.id)
    ).length;
    return { ...video, count };
  });
  



  return (
    <div>
      {!pid && (
        <div className="text-error text-sm mb-2">ไม่พบข้อมูลผู้ใช้ (pid)</div>
      )}
      {apiError && <div className="text-error text-sm mb-2">{apiError}</div>}
      <div className="flex flex-col gap-1 mb-2">
        {summaryOnly ? (
          <div>
            <span className="font-semibold text-primary">
              ดูวิดีโอแล้ว {totalVideoViews} ครั้ง
            </span>
            {log[0]?.view_time && (
              <span className="ml-2 text-xs text-gray-500">
                ล่าสุดเมื่อ {log[0].view_time.replace(/\s.*/, "")}
              </span>
            )}
          </div>
        ) : null}
      </div>
      {!summaryOnly && (
        <div className="overflow-x-auto">
          <table className="table table-xs table-zebra w-full">
            <thead>
              <tr>
                <th>วิดีโอ</th>
                <th className="text-right">จำนวนครั้งที่ดู</th>
              </tr>
            </thead>
            <tbody>
              {videoCounts.map((v, idx) => (
                <tr key={idx}>
                  <td>{v.title}</td>
                  <td className="text-right">{v.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StrokeVideoStatsDetail;
