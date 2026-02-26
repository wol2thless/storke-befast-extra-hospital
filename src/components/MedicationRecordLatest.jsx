import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import useMedicationRecordStore from "../store/medicationRecordStore";
import AssessmentAlert from "./AssessmentAlert";

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

function MedicationRecordLatest({ pid, isAdminView = false }) {
  const { fetchRecords, records } = useMedicationRecordStore();
  const [latest, setLatest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pid) return;
    fetchRecords(pid);
  }, [pid, fetchRecords]);

  useEffect(() => {
    setLatest(records && records.length > 0 ? records[0] : null);
  }, [records]);

  if (!latest) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-primary">
            การรับประทานยา
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          ยังไม่มีข้อมูลการรับประทานยา
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (isAdminView) {
      // สำหรับ admin view ให้ไปที่ admin route
      navigate(`/admin/patient/${pid}/medication-records`, { state: { record: latest } });
    } else {
      navigate("/medication-records/detail", { state: { record: latest } });
    }
  };

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
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">
          การรับประทานยา
        </h3>
        <button
          onClick={handleClick}
          className="btn btn-primary btn-sm"
        >
          ดูรายละเอียด
        </button>
      </div>

      {/* Assessment Alert */}
      <div className="mb-3">
        <AssessmentAlert
          lastDate={latest?.created_at}
          assessmentName="บันทึกการรับประทานยา"
          compact
        />
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-red-600">📅</span>
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
            {latest.created_at
              ? new Date(latest.created_at).toLocaleDateString("th-TH")
              : ""}
          </span>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-center mb-2">
            <span className="text-xs text-gray-600">ผลการบันทึกครั้งล่าสุด</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">สถานะการรับประทานยา</div>
              <div className="text-sm font-bold text-red-600">
                {MEDICATION_STATUS.find((s) => s.key === latest.status)?.label ||
                  latest.status}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">มื้อยา</div>
              <div className="text-xs text-gray-700">{getMealsDisplay(latest.meals)}</div>
            </div>
            {latest.note && (
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">หมายเหตุ</div>
                <div className="text-xs text-gray-700 line-clamp-2">{latest.note}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicationRecordLatest; 