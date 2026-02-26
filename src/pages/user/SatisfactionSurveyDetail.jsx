import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import useSatisfactionSurveyStore from "../../store/satisfactionSurveyStore";
import CryptoJS from "crypto-js";
import { decodePidFromUrl } from "../../utils/urlUtils";

const SURVEY_QUESTIONS = [
  { key: "accessibility", label: "การเข้าถึงแอปพลิเคชันได้สะดวก" },
  { key: "knowledge_content", label: "แอปพลิเคชันมีเนื้อหาด้านความรู้เรื่องโรคหลอดเลือดสมองที่เหมาะสม ครอบคลุม" },
  { key: "health_behavior", label: "แอปพลิเคชันมีเนื้อหาด้านการปรับพฤติกรรมการดูแลสุขภาพที่เหมาะสม ครอบคลุม" },
  { key: "usage_time", label: "ระยะเวลาการใช้งานแอปพลิเคชันมีความเหมาะสม" },
  { key: "overall_satisfaction", label: "ความพึงพอใจภาพรวมของแอปพลิเคชัน" }
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

function SatisfactionSurveyDetail() {
  const navigate = useNavigate();
  const { nationalId } = useParams();
  const location = useLocation();
  const [pid, setPid] = useState("");
  const { fetchSurveys, surveys, loading } = useSatisfactionSurveyStore();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');

  // ดึง pid จาก localStorage (user) แบบเข้ารหัส
  const SECRET_KEY = "stroke-app-key";
  function decrypt(ciphertext) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let userPid = "";
    
    if (isAdminRoute && nationalId) {
      // ถ้าเป็น admin route
      userPid = decodePidFromUrl(nationalId);
      if (!userPid && /^\d{13}$/.test(nationalId)) {
        userPid = nationalId;
      }
    } else {
      // ถ้าเป็น user route
      try {
        const encryptedUser = localStorage.getItem("user");
        if (encryptedUser) {
          const u = decrypt(encryptedUser);
          userPid = u?.cid || u?.card_id || u?.pid || "";
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }
    
    setPid(userPid);
    if (userPid) {
      fetchSurveys(userPid);
    }
  }, [fetchSurveys, isAdminRoute, nationalId]);
  
  // ฟังก์ชันสำหรับปุ่มกลับ
  const handleBack = () => {
    if (isAdminRoute && nationalId) {
      navigate(`/admin/patient/${nationalId}`);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="text-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
          <div className="mt-4">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={handleBack} className="btn btn-ghost btn-sm">
          ← กลับ
        </button>
        <h1 className="text-xl font-bold text-primary">
          รายละเอียดแบบสำรวจความพึงพอใจ
        </h1>
      </div>

      {surveys.length === 0 ? (
        <div className="bg-base-100 rounded-lg shadow p-6 text-center">
          <div className="text-gray-500 mb-4">
            ยังไม่มีข้อมูลแบบสำรวจความพึงพอใจ
          </div>
          <Link to="/satisfaction-survey" className="btn btn-primary">
            เริ่มสำรวจ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {surveys.map((survey, index) => {
            const averageRating = getAverageRating(survey.ratings);
            const ratingDisplay = getRatingDisplay(survey.ratings);
            
            return (
              <div key={survey.id} className="bg-base-100 rounded-lg shadow p-4">
                {/* หัวข้อและผลการประเมิน */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      การสำรวจครั้งที่ {surveys.length - index}
                    </div>
                    <div className="text-sm text-gray-500">
                      {survey.created_at
                        ? new Date(survey.created_at).toLocaleString("th-TH")
                        : ""}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">
                      {averageRating}/5
                    </div>
                    <div className="text-xs text-gray-600">คะแนนเฉลี่ย</div>
                  </div>
                </div>

                {/* รายละเอียดคะแนน */}
                <div className="space-y-2 mb-3">
                  {ratingDisplay.map((item, idx) => (
                    <div key={idx} className="border-l-4 pl-3 py-1">
                      <div className="text-sm font-medium text-base-content">
                        {item.question}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${
                          item.score >= 4 ? 'text-green-600' : 
                          item.score >= 3 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {item.rating}
                        </span>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <div
                              key={star}
                              className={`w-2 h-2 rounded-full ${
                                star <= item.score ? 'bg-yellow-400' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ความคิดเห็นเพิ่มเติม */}
                {survey.additional_comment && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="text-sm font-semibold text-base-content mb-1">
                      💬 ความคิดเห็นเพิ่มเติม:
                    </div>
                    <div className="text-sm text-gray-700">
                      {survey.additional_comment}
                    </div>
                  </div>
                )}

                {/* ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ */}
                {survey.prevention_comment && (
                  <div className="bg-blue-50 rounded p-3 mb-3">
                    <div className="text-sm font-semibold text-base-content mb-1">
                      🛡️ ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ:
                    </div>
                    <div className="text-sm text-gray-700">
                      {survey.prevention_comment}
                    </div>
                  </div>
                )}

                {/* สถิติสรุป */}
                <div className="bg-green-50 rounded p-3">
                  <div className="text-sm font-semibold text-green-800 mb-2">
                    สรุปผลการสำรวจ:
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-green-600">
                      คะแนนสูง: {Math.max(...ratingDisplay.map(r => r.score))}/5
                    </div>
                    <div className="text-yellow-600">
                      คะแนนต่ำ: {Math.min(...ratingDisplay.map(r => r.score))}/5
                    </div>
                    <div className="text-blue-600">
                      จำนวนข้อ: {ratingDisplay.length}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ปุ่มสำรวจใหม่ */}
      <div className="mt-6">
        <Link to="/satisfaction-survey" className="btn btn-primary w-full">
          สำรวจความพึงพอใจใหม่
        </Link>
      </div>
    </div>
  );
}

export default SatisfactionSurveyDetail; 