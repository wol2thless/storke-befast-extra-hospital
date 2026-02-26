import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import useSatisfactionSurveyStore from "../store/satisfactionSurveyStore";
import AssessmentAlert from "./AssessmentAlert";

const SURVEY_QUESTIONS = [
  { key: "accessibility", label: "การเข้าถึงแอปพลิเคชัน" },
  { key: "knowledge_content", label: "เนื้อหาความรู้โรคหลอดเลือดสมอง" },
  { key: "health_behavior", label: "เนื้อหาการปรับพฤติกรรมสุขภาพ" },
  { key: "usage_time", label: "ระยะเวลาการใช้งาน" },
  { key: "overall_satisfaction", label: "ความพึงพอใจภาพรวม" }
];

// คำนวณคะแนนเฉลี่ย
const getAverageRating = (ratingsStr) => {
  if (!ratingsStr) return 0;
  try {
    const ratings = JSON.parse(ratingsStr);
    const values = Object.values(ratings).filter(v => v > 0);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  } catch {
    return 0;
  }
};

// แสดงคะแนนในรูปแบบที่อ่านง่าย
const getRatingDisplay = (ratingsStr) => {
  if (!ratingsStr) return [];
  try {
    const ratings = JSON.parse(ratingsStr);
    const display = [];
    
    SURVEY_QUESTIONS.forEach(question => {
      const rating = ratings[question.key];
      let label = "";
      if (rating === 5) label = "พึงพอใจมากที่สุด";
      else if (rating === 4) label = "พึงพอใจมาก";
      else if (rating === 3) label = "พึงพอใจปานกลาง";
      else if (rating === 2) label = "พึงพอใจน้อย";
      else if (rating === 1) label = "พึงพอใจน้อยที่สุด";
      
      if (label) {
        display.push({
          question: question.label,
          rating: label,
          score: rating
        });
      }
    });
    
    return display;
  } catch {
    return [];
  }
};

function SatisfactionSurveyLatest({ pid, isAdminView = false }) {
  const { fetchSurveys, surveys } = useSatisfactionSurveyStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (pid) {
      fetchSurveys(pid);
    }
  }, [fetchSurveys, pid]);

  const latest = surveys.length > 0 ? surveys[0] : null;

  if (!latest) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-primary">
            แบบสำรวจความพึงพอใจ
          </h3>
          <Link
            to="/satisfaction-survey"
            className="btn btn-primary btn-sm"
          >
            สำรวจ
          </Link>
        </div>
        <div className="text-center py-4 text-gray-500">
          ยังไม่มีข้อมูลแบบสำรวจความพึงพอใจ
        </div>
      </div>
    );
  }

  const averageRating = getAverageRating(latest.ratings);
  const ratingDisplay = getRatingDisplay(latest.ratings);

  // หาคะแนนสูงสุดและต่ำสุด
  const scores = ratingDisplay.map(item => item.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);

  return (
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-primary">
          แบบสำรวจความพึงพอใจ
        </h3>
{isAdminView ? (
          <button
            onClick={() => navigate(`/admin/patient/${pid}/satisfaction-survey`)}
            className="btn btn-primary btn-sm"
          >
            ดูรายละเอียด
          </button>
        ) : (
          <Link
            to="/satisfaction-survey-detail"
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
          assessmentName="แบบสำรวจความพึงพอใจ"
          compact
        />
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 mb-3 border border-green-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
            {latest.created_at
              ? new Date(latest.created_at).toLocaleDateString("th-TH")
              : ""}
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {averageRating}/5
            </div>
            <div className="text-xs text-gray-600">คะแนนเฉลี่ย</div>
          </div>
        </div>
      </div>

      {/* แสดงคะแนนสูงสุดและต่ำสุด */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-green-50 rounded p-2 text-center">
          <div className="text-xs text-gray-600">คะแนนสูงสุด</div>
          <div className="text-sm font-bold text-green-600">{maxScore}/5</div>
        </div>
        <div className="bg-orange-50 rounded p-2 text-center">
          <div className="text-xs text-gray-600">คะแนนต่ำสุด</div>
          <div className="text-sm font-bold text-orange-600">{minScore}/5</div>
        </div>
      </div>

      {/* แสดงคะแนนแต่ละข้อ */}
      <div className="space-y-2 mb-3">
        {ratingDisplay.slice(0, 3).map((item, index) => (
          <div key={index} className="bg-white rounded p-2 border">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-gray-800 truncate">
                {item.question}
              </span>
              <span className={`text-xs font-semibold ${
                item.score >= 4 ? 'text-green-600' : 
                item.score >= 3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {item.rating}
              </span>
            </div>
          </div>
        ))}
        {ratingDisplay.length > 3 && (
          <div className="text-center">
            <span className="badge badge-outline badge-sm">
              +{ratingDisplay.length - 3} อื่นๆ
            </span>
          </div>
        )}
      </div>

      {latest.additional_comment && (
        <div className="text-xs text-gray-600 mb-2">
          <div className="font-semibold mb-1">ความคิดเห็น:</div>
          <div className="line-clamp-2">{latest.additional_comment}</div>
        </div>
      )}


    </div>
  );
}

export default SatisfactionSurveyLatest; 