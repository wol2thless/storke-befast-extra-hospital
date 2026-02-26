import React, { useState, useEffect } from "react";
import useSatisfactionSurveyStore from "../store/satisfactionSurveyStore";
import CryptoJS from "crypto-js";

const SURVEY_QUESTIONS = [
  {
    key: "accessibility",
    label: "การเข้าถึงแอปพลิเคชันได้สะดวก",
    description: "ความสะดวกในการเข้าใช้งานแอปพลิเคชัน"
  },
  {
    key: "knowledge_content",
    label: "แอปพลิเคชันมีเนื้อหาด้านความรู้เรื่องโรคหลอดเลือดสมองที่เหมาะสม ครอบคลุม",
    description: "เนื้อหาความรู้เกี่ยวกับโรคหลอดเลือดสมอง"
  },
  {
    key: "health_behavior",
    label: "แอปพลิเคชันมีเนื้อหาด้านการปรับพฤติกรรมการดูแลสุขภาพที่เหมาะสม ครอบคลุม",
    description: "เนื้อหาเกี่ยวกับการปรับพฤติกรรมสุขภาพ"
  },
  {
    key: "usage_time",
    label: "ระยะเวลาการใช้งานแอปพลิเคชันมีความเหมาะสม",
    description: "ความเหมาะสมของระยะเวลาในการใช้งาน"
  },
  {
    key: "overall_satisfaction",
    label: "ความพึงพอใจภาพรวมของแอปพลิเคชัน",
    description: "ความพึงพอใจโดยรวมต่อแอปพลิเคชัน"
  }
];

const RATING_OPTIONS = [
  { value: 5, label: "พึงพอใจมากที่สุด", color: "bg-green-500" },
  { value: 4, label: "พึงพอใจมาก", color: "bg-blue-500" },
  { value: 3, label: "พึงพอใจปานกลาง", color: "bg-yellow-500" },
  { value: 2, label: "พึงพอใจน้อย", color: "bg-orange-500" },
  { value: 1, label: "พึงพอใจน้อยที่สุด", color: "bg-red-500" }
];

function SatisfactionSurveyForm() {
  const [ratings, setRatings] = useState({});
  const [additionalComment, setAdditionalComment] = useState("");
  const [preventionComment, setPreventionComment] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const { saveSurvey, fetchSurveys, surveys } = useSatisfactionSurveyStore();

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
  let pid = "";
  try {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      const u = decrypt(encryptedUser);
      pid = u?.cid || u?.card_id || u?.pid || "";
    }
  } catch {}

  useEffect(() => {
    if (!pid) return;
    fetchSurveys(pid);
  }, [pid, fetchSurveys]);

  useEffect(() => {
    setHistory(surveys);
  }, [surveys]);

  const handleRatingChange = (questionKey, rating) => {
    setRatings(prev => ({
      ...prev,
      [questionKey]: rating
    }));
  };

  const handleSubmit = async () => {
    if (!pid) {
      setResultMsg("ไม่พบรหัสผู้ใช้งาน");
      setResultError(true);
      return;
    }
    
    // ตรวจสอบว่าตอบครบทุกข้อ
    const allAnswered = SURVEY_QUESTIONS.every(question => 
      ratings[question.key]
    );
    
    if (!allAnswered) {
      setResultMsg("กรุณาให้คะแนนครบทุกข้อ");
      setResultError(true);
      return;
    }

    setLoading(true);
    setResultMsg("");
    setResultError(false);
    
    const res = await saveSurvey({ 
      pid, 
      ratings: JSON.stringify(ratings),
      additional_comment: additionalComment,
      prevention_comment: preventionComment
    });
    setLoading(false);
    if (res.success) {
      setResultMsg("บันทึกแบบสำรวจสำเร็จ");
      setResultError(false);
      setRatings({});
      setAdditionalComment("");
      setPreventionComment("");
      fetchSurveys(pid); // refresh history
    } else {
      setResultMsg(res.message || "เกิดข้อผิดพลาด");
      setResultError(true);
    }
  };

  // หาวันที่ล่าสุด
  const latest = history.length > 0 ? history[0] : null;
  const today = new Date().toISOString().slice(0, 10);
  const alreadySubmittedToday =
    latest && latest.created_at && latest.created_at.slice(0, 10) === today;

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
        const option = RATING_OPTIONS.find(opt => opt.value === rating);
        if (option) {
          display.push({
            question: question.label,
            rating: option.label,
            score: rating
          });
        }
      });
      
      return display;
    } catch {
      return [];
    }
  };

  return (
    <div className="p-4 mb-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-primary mb-2">
          📊 แบบสำรวจความพึงพอใจ
        </h2>
        <p className="text-sm text-gray-600">
          การให้คะแนนการใช้โปรแกรมการป้องกันการกลับมาเป็นซ้ำในผู้ป่วยโรคหลอดเลือดสมองตีบผ่านแอปพลิเคชัน
        </p>
      </div>
      
      {/* แสดงเฉพาะประวัติล่าสุด */}
      {latest && (
        <div className="mt-4">
          <div className="font-bold text-primary mb-3 text-base">⭐ การสำรวจล่าสุด</div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-blue-600">📅</span>
              <span className="text-sm text-gray-700 font-semibold">
                วันที่สำรวจล่าสุด: {latest.created_at
                  ? new Date(latest.created_at).toLocaleDateString("th-TH")
                  : ""}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border mb-3">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-600">ผลการสำรวจครั้งล่าสุด</span>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {getAverageRating(latest.ratings)}/5
                </div>
                <div className="text-xs text-gray-600">คะแนนเฉลี่ย</div>
              </div>
            </div>
            <div className="space-y-2">
              {getRatingDisplay(latest.ratings).map((item, index) => (
                <div key={index} className="bg-white rounded p-2 shadow-sm">
                  <div className="text-xs font-medium text-gray-800 mb-1">
                    {item.question}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600 font-semibold text-xs">{item.rating}</span>
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
          </div>
        </div>
      )}

      {/* แบบสำรวจความพึงพอใจ */}
      <div className="mt-6">
        <div className="font-bold text-base-content mb-4 text-base text-center">
          แบบสำรวจความพึงพอใจ
        </div>
        <div className="space-y-4">
          {SURVEY_QUESTIONS.map((question, index) => (
            <div key={question.key} className="bg-white rounded-lg p-4 shadow border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base-content text-sm mb-1">
                    {question.label}
                  </div>
                  <div className="text-xs text-gray-600">
                    {question.description}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {RATING_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-2 rounded-lg text-white font-medium transition-all ${
                      ratings[question.key] === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-primary shadow-md`
                        : `${option.color} opacity-80 hover:opacity-100 shadow-sm`
                    }`}
                    onClick={() => handleRatingChange(question.key, option.value)}
                    disabled={alreadySubmittedToday}
                  >
                    <div className="text-lg font-bold mb-1">{option.value}</div>
                    <div className="text-xs leading-tight">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ความคิดเห็นเพิ่มเติม */}
      <div className="mt-6">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
          <div className="font-bold text-base-content mb-3 text-sm">
            💬 ความคิดเห็นเพิ่มเติม
          </div>
          <textarea
            className="textarea textarea-bordered w-full mb-2 resize-none"
            rows={3}
            placeholder="กรุณาแสดงความคิดเห็นเพิ่มเติมเกี่ยวกับแอปพลิเคชัน"
            value={additionalComment}
            onChange={(e) => setAdditionalComment(e.target.value)}
            disabled={alreadySubmittedToday}
          />
        </div>
      </div>

      {/* ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ */}
      <div className="mt-4">
        <div className="bg-white rounded-lg p-4 shadow border border-gray-100">
          <div className="font-bold text-base-content mb-3 text-sm">
            🛡️ ความคิดเห็นเกี่ยวกับการป้องกันการกลับมาเป็นซ้ำ
          </div>
          <div className="text-xs text-gray-600 mb-2">
            ท่านคิดว่าแอปพลิเคชันนี้สามารถช่วยป้องกันการกลับมาเป็นซ้ำในผู้ป่วยโรคหลอดเลือดสมองตีบได้ กรุณาระบุเหตุผล
          </div>
          <textarea
            className="textarea textarea-bordered w-full mb-2 resize-none"
            rows={4}
            placeholder="กรุณาระบุเหตุผลที่ท่านคิดว่าแอปพลิเคชันนี้สามารถช่วยป้องกันการกลับมาเป็นซ้ำได้"
            value={preventionComment}
            onChange={(e) => setPreventionComment(e.target.value)}
            disabled={alreadySubmittedToday}
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          className="btn btn-success w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all"
          type="button"
          disabled={Object.keys(ratings).length < SURVEY_QUESTIONS.length || loading || alreadySubmittedToday}
          onClick={handleSubmit}
        >
          {alreadySubmittedToday
            ? "📝 ส่งแบบสำรวจได้วันละ 1 ครั้ง"
            : loading
            ? "⏳ กำลังบันทึก..."
            : "📤 ส่งแบบสำรวจ"}
        </button>
        {resultMsg && (
          <div
            className={`text-center mt-3 p-3 rounded-lg font-semibold text-sm ${
              resultError 
                ? "text-error bg-red-50 border border-red-200" 
                : "text-success bg-green-50 border border-green-200"
            }`}
          >
            {resultMsg}
          </div>
        )}
      </div>
    </div>
  );
}

export default SatisfactionSurveyForm; 