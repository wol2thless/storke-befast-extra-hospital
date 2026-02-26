import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useHealthBehaviorStore from "../store/healthBehaviorStore";
import AssessmentAlert from "./AssessmentAlert";

const HEALTH_RECOMMENDATIONS = [
  { key: "medication", label: "ห้ามหยุดยากินเอง" },
  { key: "control_risk", label: "ควบคุมระดับความดันโลหิต" },
  { key: "diet_control", label: "ควบคุมอาหารให้สมดุล" },
  { key: "exercise", label: "ออกกำลังกายสม่ำเสมอ" },
  { key: "avoid_smoking_alcohol", label: "งดสูบบุหรี่หลีกเลี่ยงแอลกอฮอล์" },
  { key: "warning_symptoms", label: "อาการเตือนเลือดไปเลี้ยงสมอง" }
];

// ฟังก์ชันประเมินผล
const evaluateHealthBehavior = (behaviors) => {
  if (!behaviors) return { level: "ต้องปรับปรุง", color: "text-red-600", bgColor: "bg-red-100" };
  
  let followCount = 0;
  let totalRecommendations = HEALTH_RECOMMENDATIONS.length;
  
  HEALTH_RECOMMENDATIONS.forEach(rec => {
    const value = behaviors[rec.key];
    if (rec.key === "warning_symptoms") {
      if (value === "no_symptoms") followCount++;
    } else {
      if (value === "follow") followCount++;
    }
  });
  
  const percentage = (followCount / totalRecommendations) * 100;
  
  if (percentage >= 90) {
    return { level: "ดีเยี่ยม", color: "text-green-600", bgColor: "bg-green-100" };
  } else if (percentage >= 75) {
    return { level: "ดี", color: "text-blue-600", bgColor: "bg-blue-100" };
  } else if (percentage >= 50) {
    return { level: "พอใช้", color: "text-yellow-600", bgColor: "bg-yellow-100" };
  } else {
    return { level: "ต้องปรับปรุง", color: "text-red-600", bgColor: "bg-red-100" };
  }
};

function HealthBehaviorLatest({ pid, isAdminView = false }) {
  const { fetchRecords, records } = useHealthBehaviorStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (pid) {
      fetchRecords(pid);
    }
  }, [fetchRecords, pid]);

  const latest = records.length > 0 ? records[0] : null;

  if (!latest) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-primary">
            พฤติกรรมสุขภาพ
          </h3>
          <Link
            to="/health-behavior"
            className="btn btn-primary btn-sm"
          >
            ประเมิน
          </Link>
        </div>
        <div className="text-center py-4 text-gray-500">
          ยังไม่มีข้อมูลการประเมินพฤติกรรมสุขภาพ
        </div>
      </div>
    );
  }

  // แสดงพฤติกรรมที่ปฏิบัติตาม
  const getFollowedBehaviors = (behaviorsStr) => {
    if (!behaviorsStr) return [];
    try {
      const behaviors = JSON.parse(behaviorsStr);
      const followed = [];
      
      HEALTH_RECOMMENDATIONS.forEach(rec => {
        const value = behaviors[rec.key];
        if (rec.key === "warning_symptoms") {
          if (value === "no_symptoms") {
            followed.push(rec.label);
          }
        } else {
          if (value === "follow") {
            followed.push(rec.label);
          }
        }
      });
      
      return followed;
    } catch {
      return [];
    }
  };

  const evaluation = evaluateHealthBehavior(JSON.parse(latest.behaviors));
  const followedBehaviors = getFollowedBehaviors(latest.behaviors);

  return (
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">
          พฤติกรรมสุขภาพ
        </h3>
{isAdminView ? (
          <button
            onClick={() => navigate(`/admin/patient/${pid}/health-behavior`)}
            className="btn btn-primary btn-sm"
          >
            ดูรายละเอียด
          </button>
        ) : (
          <Link
            to="/health-behavior-detail"
            className="btn btn-primary btn-sm"
          >
            ดูรายละเอียด
          </Link>
        )}
      </div>

      {/* Assessment Alert */}
      <div className="mb-3">
        <AssessmentAlert
          lastDate={latest?.created_at}
          assessmentName="บันทึกพฤติกรรมสุขภาพ"
          compact
        />
      </div>

      <div className={`p-3 rounded-lg ${evaluation.bgColor} mb-3`}>
        <div className="text-sm text-base-content mb-1">ผลการประเมินล่าสุด</div>
        <div className={`text-lg font-bold ${evaluation.color}`}>
          {evaluation.level}
        </div>
        <div className="text-xs text-base-content mt-1">
          {latest.created_at
            ? new Date(latest.created_at).toLocaleDateString("th-TH")
            : ""}
        </div>
      </div>

      {followedBehaviors.length > 0 && (
        <div className="mb-3">
          <div className="text-sm font-semibold text-base-content mb-2">
            พฤติกรรมที่ปฏิบัติตาม:
          </div>
          <div className="flex flex-wrap gap-1">
            {followedBehaviors.slice(0, 3).map((behavior, index) => (
              <span
                key={index}
                className="badge badge-success badge-sm"
              >
                {behavior}
              </span>
            ))}
            {followedBehaviors.length > 3 && (
              <span className="badge badge-outline badge-sm">
                +{followedBehaviors.length - 3} อื่นๆ
              </span>
            )}
          </div>
        </div>
      )}

      {latest.note && (
        <div className="text-sm text-base-content">
          <div className="font-semibold mb-1">หมายเหตุ:</div>
          <div className="text-gray-600">{latest.note}</div>
        </div>
      )}


    </div>
  );
}

export default HealthBehaviorLatest; 