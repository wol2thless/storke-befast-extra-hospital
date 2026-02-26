import React, { useEffect } from "react";
import { useNutritionRecordStore } from "../store/nutritionRecordStore";
import { useNavigate } from "react-router";
import AssessmentAlert from "./AssessmentAlert";

const NUTRITION_STATUS = [
  {
    key: "normal_full",
    label: "รับประทานอาหารได้เหมาะสมกับโรค ทานได้ปกติ และครบ 5 หมู่",
  },
  {
    key: "normal_notfull",
    label: "รับประทานอาหารได้เหมาะสมกับโรค ทานได้ปกติ แต่ไม่ครบ 5 หมู่",
  },
  { key: "less", label: "รับประทานอาหารได้เหมาะสมกับโรค แต่ทานได้น้อย" },
  { key: "cannot", label: "ไม่สามารถรับประทานอาหารได้เหมาะสมกับโรค" },
  { key: "none", label: "ไม่ได้รับประทานอาหารเลย" },
];

function NutritionRecordLatest({ pid, isAdminView = false }) {
  const { fetchRecords, records } = useNutritionRecordStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (pid) fetchRecords(pid);
  }, [pid, fetchRecords]);
  const latest = records && records.length > 0 ? records[0] : null;



  if (!latest) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-primary">
            โภชนาการ
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          ไม่พบข้อมูลโภชนาการ
        </div>
      </div>
    );
  }

  const handleClick = () => {
    if (isAdminView) {
      // สำหรับ admin view ให้ไปที่ admin route
      navigate(`/admin/patient/${pid}/nutrition-records`);
    } else {
      navigate("/nutrition-records/detail");
    }
  };

  return (
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">
          โภชนาการ
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
          assessmentName="บันทึกโภชนาการ"
          compact
        />
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-orange-600">📅</span>
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
              <div className="text-xs text-gray-600 mb-1">สถานะการรับประทานอาหาร</div>
              <div className="text-sm font-bold text-orange-600">
                {NUTRITION_STATUS.find((s) => s.key === latest.status)?.label ||
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

export default NutritionRecordLatest;
