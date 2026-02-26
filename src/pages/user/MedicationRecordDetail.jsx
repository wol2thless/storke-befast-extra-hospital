import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import useMedicationRecordStore from "../../store/medicationRecordStore";
import { decodePidFromUrl } from "../../utils/urlUtils";

const MEDICATION_STATUS = [
  { key: "taken", label: "รับประทานยาตามที่แพทย์สั่งครบถ้วน" },
  { key: "partial", label: "รับประทานยาบางส่วน" },
  { key: "missed", label: "ลืมรับประทานยา" },
  { key: "stopped", label: "หยุดรับประทานยา" },
];

const MEAL_TIMES = [
  { key: "before_meal", label: "ก่อนอาหาร" },
  { key: "after_meal", label: "หลังอาหาร" },
  { key: "before_bed", label: "ก่อนนอน" },
];

const MEALS = [
  { key: "breakfast", label: "เช้า" },
  { key: "lunch", label: "เที่ยง" },
  { key: "dinner", label: "เย็น" },
];

function MedicationRecordDetail() {
  const navigate = useNavigate();
  const { nationalId } = useParams();
  const location = useLocation();
  const { records, fetchRecords } = useMedicationRecordStore();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');
  
  // หา PID ที่ถูกต้อง
  let pid = null;
  if (isAdminRoute && nationalId) {
    pid = decodePidFromUrl(nationalId);
    if (!pid && /^\d{13}$/.test(nationalId)) {
      pid = nationalId;
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
    if (isAdminRoute && nationalId) {
      navigate(`/admin/patient/${nationalId}`);
    } else {
      navigate(-1);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        ไม่พบข้อมูลการรับประทานยา
        <button
          className="btn btn-sm btn-outline ml-4"
          onClick={handleBack}
        >
          กลับ
        </button>
      </div>
    );
  }

  // แสดงมื้อยาที่เลือกในประวัติ
  const getMealsDisplay = (mealsStr) => {
    if (!mealsStr) return "-";
    try {
      const meals = JSON.parse(mealsStr);
      const display = [];
      
      Object.entries(meals).forEach(([mealTime, mealList]) => {
        const mealTimeLabel = MEAL_TIMES.find(m => m.key === mealTime)?.label;
        if (mealTime === 'before_bed') {
          display.push(mealTimeLabel);
        } else {
          const mealLabels = mealList.map(meal => 
            MEALS.find(m => m.key === meal)?.label
          ).join(', ');
          display.push(`${mealTimeLabel}: ${mealLabels}`);
        }
      });
      
      return display.join('; ');
    } catch {
      return "-";
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-box shadow">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary mb-4">รายการการรับประทานยาทั้งหมด</h2>
        <button className="btn btn-sm btn-outline" onClick={handleBack}>
          กลับ
        </button>
      </div>
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>มื้อยา</th>
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
                {MEDICATION_STATUS.find((s) => s.key === rec.status)?.label ||
                  rec.status}
              </td>
              <td>{getMealsDisplay(rec.meals)}</td>
              <td>{rec.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MedicationRecordDetail; 