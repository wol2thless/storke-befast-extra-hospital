import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useExerciseRecordStore } from "../../store/exerciseRecordStore";
import { decodePidFromUrl } from "../../utils/urlUtils";

const EXERCISE_STATUS = [
  { key: "daily", label: "ทำทุกวันอย่างน้อย 30นาที" },
  { key: "regular", label: "ทำสม่ำเสมอ 30นาที/วัน และทำ 3ครั้ง/สัปดาห์" },
  { key: "none", label: "ไม่ได้ทำ" },
];

function ExerciseRecordDetail() {
  const navigate = useNavigate();
  const { nationalId } = useParams();
  const location = useLocation();
  const { records, fetchRecords } = useExerciseRecordStore();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');
  
  // หา PID ที่ถูกต้อง
  let pid = null;
  if (isAdminRoute && nationalId) {
    // ถ้าเป็น admin route ให้ถอดรหัส nationalId จาก URL
    pid = decodePidFromUrl(nationalId);
    if (!pid && /^\d{13}$/.test(nationalId)) {
      pid = nationalId; // fallback ถ้าไม่ได้เข้ารหัส
    }
  }
  
  // ดึงข้อมูลถ้าเป็น admin route และมี PID
  useEffect(() => {
    if (isAdminRoute && pid) {
      fetchRecords(pid);
    }
  }, [isAdminRoute, pid, fetchRecords]);
  
  // ฟังก์ชันสำหรับปุ่มกลับ
  const handleBack = () => {
    if (isAdminRoute && pid) {
      navigate(`/admin/patient/${nationalId}`);
    } else {
      navigate(-1);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        ไม่พบข้อมูลกิจกรรม
        <button
          className="btn btn-sm btn-outline ml-4"
          onClick={handleBack}
        >
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-box shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-primary">รายการกิจกรรมทั้งหมด</h2>
        <button className="btn btn-sm btn-outline flex items-center gap-1" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>
      </div>
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td>
                {rec.created_at
                  ? new Date(rec.created_at).toLocaleString("th-TH")
                  : "-"}
              </td>
              <td>
                {EXERCISE_STATUS.find((s) => s.key === rec.status)?.label ||
                  rec.status}
              </td>
              <td>{rec.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExerciseRecordDetail;
