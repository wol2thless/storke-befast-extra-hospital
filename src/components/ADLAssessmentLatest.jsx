import React, { useEffect, useState } from "react";
import { useADLAssessmentStore } from "../store/adlAssessmentStore";
import { useNavigate } from "react-router";
import AssessmentAlert from "./AssessmentAlert";

function ADLAssessmentLatest({ pid, isAdminView = false }) {
  const { fetchAssessments } = useADLAssessmentStore();
  const [latest, setLatest] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pid) return;
    fetchAssessments(pid).then((data) => {
      if (
        data.success &&
        data.assessments &&
        Object.keys(data.assessments).length > 0
      ) {
        const keys = Object.keys(data.assessments);
        const latestKey = keys.sort((a, b) => {
          const dateA = new Date(data.assessments[a].created_at).getTime();
          const dateB = new Date(data.assessments[b].created_at).getTime();
          return dateB - dateA;
        })[0];
        setLatest(data.assessments[latestKey]);
      } else {
        setLatest(null);
      }
    });
  }, [pid, fetchAssessments]);

  if (!latest) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-primary">
            การประเมิน ADL
          </h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          ยังไม่มีข้อมูลการประเมิน ADL
        </div>
      </div>
    );
  }
  const percent = latest.max_score
    ? (latest.total_score / latest.max_score) * 100
    : 0;
  let colorClass = "text-red-700 font-bold";
  if (percent >= 80) colorClass = "text-green-700 font-bold";
  else if (percent >= 60) colorClass = "text-yellow-700 font-bold";
  else if (percent >= 40) colorClass = "text-orange-700 font-bold";

  return (
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">
          การประเมิน ADL
        </h3>
        <button
          onClick={() => {
            if (isAdminView) {
              navigate(`/admin/patient/${pid}/adl-assessment`);
            } else {
              navigate("/adl-assessment-history");
            }
          }}
          className="btn btn-primary btn-sm"
        >
          ดูรายละเอียด
        </button>
      </div>

      {/* Assessment Alert */}
      <div className="mb-3">
        <AssessmentAlert
          lastDate={latest?.created_at}
          assessmentName="แบบประเมิน ADL"
          compact
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-blue-600">📅</span>
          <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
            {latest.created_at
              ? new Date(latest.created_at).toLocaleDateString("th-TH")
              : ""}
          </span>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <div className="text-center mb-2">
            <span className="text-xs text-gray-600">ผลการประเมินครั้งล่าสุด</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">คะแนน</div>
              <div className="text-lg font-bold text-blue-600">
                {latest.total_score ?? 0} / {latest.max_score ?? 20}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">ระดับการพึ่งพา</div>
              <div className={`text-lg font-bold ${colorClass}`}>
                {latest.dependency_level || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ADLAssessmentLatest;
