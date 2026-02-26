import React from "react";
import { useEffect, useState } from "react";
import { useVideoStatsStore } from "../store/videoStatsStore";

const strokeVideos = [
  {
    video_id: 1,
    title: "1. สัญญาณเตือนอาการโรคหลอดเลือดสมอง (BEFAST)",
  },
  {
    video_id: 2,
    title: "2. การป้องกันโรคหลอดเลือดสมองกลับมาเป็นซ้ำ",
  },
];

const exerciseVideos = [
  {
    video_id: 100,
    title: "กายภาพบำบัด สำหรับผู้ป่วยโรคหลอดเลือดสมอง : [ชุดความรู้ STROKE-05]",
  },
  {
    video_id: 101,
    title:
      "การออกกำลังกายด้วยตัวเองในผู้ปวยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  },
  {
    video_id: 102,
    title:
      "การจัดท่านอนหงายและการพลิกตะแคงตัวในผู้ป่วยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  },
  {
    video_id: 103,
    title:
      "การเคลื่อนไหวข้อต่อโดยญาติ/ผู้ดูแลในผู้ป่วยโรคหลอดเลือดสมอง l งานกายภาพบำบัด โรงพยาบาลราชวิถี",
  },
  {
    video_id: 104,
    title: "การออกกำลังกาย สำหรับผู้ป่วยโรคหลอดเลือดสมองที่บ้าน",
  },
  {
    video_id: 105,
    title: "การฝึกพูดสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  },
];

const nutritionVideos = [
  {
    video_id: 200,
    title: "โภชนาการสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  },
  {
    video_id: 201,
    title: "อาหารที่ควรหลีกเลี่ยงสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  },
];

const medicationVideos = [
  {
    video_id: 300,
    title: "ความรู้เรื่องยาสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  },
];

const motivationVideos = [
  {
    video_id: 400,
    title: "เสริมพลังใจสำหรับผู้ป่วยโรคหลอดเลือดสมอง",
  },
  {
    video_id: 401,
    title: "กำลังใจและแรงบันดาลใจ",
  },
  {
    video_id: 402,
    title: "พลังใจในการฟื้นฟู",
  },
];

function AllVideoStatsDetail({ pid }) {
  const [log, setLog] = useState([]);
  const getVideoViewLog = useVideoStatsStore((s) => s.getVideoViewLog);

  useEffect(() => {
    if (pid) {
      getVideoViewLog(pid).then((res) => {
        if (res && res.success) {
          setLog(res.data || []);
        } else {
          setLog([]);
        }
      });
    }
  }, [getVideoViewLog, pid]);

  const getViewCount = (videoId) => {
    return validLog.filter(
      (row) => String(row.video_id) === String(videoId)
    ).length;
  };

  // คำนวณสถิติรวม
  const allVideos = [
    ...strokeVideos,
    ...exerciseVideos,
    ...nutritionVideos,
    ...medicationVideos,
    ...motivationVideos
  ];
  
  // สร้าง list ของ video_id ที่มีจริงในระบบ
  const validVideoIds = new Set();
  allVideos.forEach(video => validVideoIds.add(String(video.video_id)));
  
  // กรองเฉพาะ video_id ที่มีจริงในระบบ
  const validLog = log.filter(item => 
    item && 
    item.video_id && 
    validVideoIds.has(String(item.video_id))
  );
  
  const totalViews = validLog.length;
  
  const totalVideos = allVideos.length;

  return (
    <div>
      {/* สถิติรวม */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-bold text-primary mb-2">
          📊 สถิติรวมการดูวีดีโอ
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalVideos}</div>
            <div className="text-sm text-gray-600">วีดีโอทั้งหมด</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{totalViews}</div>
            <div className="text-sm text-gray-600">ครั้งที่ดู</div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-primary mb-2">
        📚 วิดีโอความรู้เกี่ยวกับโรคหลอดเลือดสมอง
      </h2>
      <table className="table table-xs w-full mb-6">
        <thead>
          <tr>
            <th>ชื่อวิดีโอ</th>
            <th>จำนวนครั้งที่ดู</th>
          </tr>
        </thead>
        <tbody>
          {strokeVideos.map((v) => (
            <tr key={v.video_id}>
              <td>{v.title}</td>
              <td>{getViewCount(v.video_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2 className="text-lg font-bold text-primary mb-2">
        🏃‍♂️ วิดีโอออกกำลังกาย/กายภาพบำบัด
      </h2>
      <table className="table table-xs w-full mb-6">
        <thead>
          <tr>
            <th>ชื่อวิดีโอ</th>
            <th>จำนวนครั้งที่ดู</th>
          </tr>
        </thead>
        <tbody>
          {exerciseVideos.map((v) => (
            <tr key={v.video_id}>
              <td>{v.title}</td>
              <td>{getViewCount(v.video_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2 className="text-lg font-bold text-primary mb-2">
        🍎 วิดีโออาหารและโภชนาการ
      </h2>
      <table className="table table-xs w-full mb-6">
        <thead>
          <tr>
            <th>ชื่อวิดีโอ</th>
            <th>จำนวนครั้งที่ดู</th>
          </tr>
        </thead>
        <tbody>
          {nutritionVideos.map((v) => (
            <tr key={v.video_id}>
              <td>{v.title}</td>
              <td>{getViewCount(v.video_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-bold text-primary mb-2">
        💊 วิดีโอความรู้เรื่องยา
      </h2>
      <table className="table table-xs w-full mb-6">
        <thead>
          <tr>
            <th>ชื่อวิดีโอ</th>
            <th>จำนวนครั้งที่ดู</th>
          </tr>
        </thead>
        <tbody>
          {medicationVideos.map((v) => (
            <tr key={v.video_id}>
              <td>{v.title}</td>
              <td>{getViewCount(v.video_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-lg font-bold text-primary mb-2">
        💪 วิดีโอเสริมพลังใจ
      </h2>
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>ชื่อวิดีโอ</th>
            <th>จำนวนครั้งที่ดู</th>
          </tr>
        </thead>
        <tbody>
          {motivationVideos.map((v) => (
            <tr key={v.video_id}>
              <td>{v.title}</td>
              <td>{getViewCount(v.video_id)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllVideoStatsDetail;
