import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useExerciseRecordStore } from "../store/exerciseRecordStore";
import AssessmentAlert from "./AssessmentAlert";

const EXERCISE_STATUS = [
  { key: "daily", label: "ทำทุกวันอย่างน้อย 30นาที" },
  { key: "regular", label: "ทำสม่ำเสมอ 30นาที/วัน และทำ 3ครั้ง/สัปดาห์" },
  { key: "none", label: "ไม่ได้ทำ" },
];

function ExerciseRecordLatest({ pid, isAdminView = false }) {
  const { fetchRecords, records } = useExerciseRecordStore();
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
            การออกกำลังกาย
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          ยังไม่มีข้อมูลการบันทึกกิจกรรม
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (isAdminView) {
      // สำหรับ admin view ให้ไปที่ admin route
      navigate(`/admin/patient/${pid}/exercise-records`, { state: { record: latest } });
    } else {
      navigate("/exercise-records/detail", { state: { record: latest } });
    }
  };

  return (
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">
          การออกกำลังกาย
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
          assessmentName="บันทึกการออกกำลังกาย"
          compact
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-green-600">📅</span>
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
              <div className="text-xs text-gray-600 mb-1">สถานะการออกกำลังกาย</div>
              <div className="text-sm font-bold text-green-600">
                {EXERCISE_STATUS.find((s) => s.key === latest.status)?.label ||
                  latest.status}
              </div>
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

export default ExerciseRecordLatest;
