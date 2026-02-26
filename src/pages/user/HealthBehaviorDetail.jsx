import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import useHealthBehaviorStore from "../../store/healthBehaviorStore";
import CryptoJS from "crypto-js";
import { decodePidFromUrl } from "../../utils/urlUtils";



const HEALTH_RECOMMENDATIONS = [
  { key: "medication", label: "ห้ามหยุดยากินเองและควรรีบพบแพทย์ทันทีถ้ามีอาการผิดปกติ" },
  { key: "control_risk", label: "ควบคุมระดับความดันโลหิตสูง ไขมันและน้ำตาลให้อยู่ในเกณฑ์ปกติ" },
  { key: "diet_control", label: "ควบคุมอาหารให้สมดุล หลีกเลี่ยงอาหารรสเค็ม หวาน มัน" },
  { key: "exercise", label: "ออกกำลังกายสม่ำเสมอ อย่างน้อย 30 นาที/วัน 3 ครั้ง/สัปดาห์ และควบคุมน้ำหนักให้เหมาะสม" },
  { key: "avoid_smoking_alcohol", label: "งดสูบบุหรี่หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์" },
  { key: "warning_symptoms", label: "ถ้ามีอาการเตือนที่แสดงว่าเลือดไปเลี้ยงสมองไม่พอชั่วคราว ควรรีบมาพบแพทย์ถึงแม้อาการเหล่านั้นหายไปเองเป็นปกติ" }
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

// แสดงพฤติกรรมในรูปแบบที่อ่านง่าย
const getBehaviorsDisplay = (behaviorsStr) => {
  if (!behaviorsStr) return [];
  try {
    const behaviors = JSON.parse(behaviorsStr);
    const display = [];
    
    HEALTH_RECOMMENDATIONS.forEach(behavior => {
      const value = behaviors[behavior.key];
      let status = "";
      
      if (behavior.key === "warning_symptoms") {
        status = value === "no_symptoms" ? "ไม่มีอาการ" : "มีอาการ";
      } else {
        status = value === "follow" ? "ปฏิบัติตาม" : "ไม่ปฏิบัติตาม";
      }
      
      display.push({
        label: behavior.label,
        status: status,
        isGood: (behavior.key === "warning_symptoms" && value === "no_symptoms") || 
                (behavior.key !== "warning_symptoms" && value === "follow")
      });
    });
    
    return display;
  } catch {
    return [];
  }
};

function HealthBehaviorDetail() {
  const navigate = useNavigate();
  const { nationalId } = useParams();
  const location = useLocation();
  const [pid, setPid] = useState("");
  const { fetchRecords, records, loading } = useHealthBehaviorStore();
  
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
      fetchRecords(userPid);
    }
  }, [fetchRecords, isAdminRoute, nationalId]);
  
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
       <button className="btn btn-sm btn-outline" onClick={() => {
          if (isAdminRoute && nationalId) {
            navigate(`/admin/patient/${nationalId}`);
          } else {
            navigate(-1);
          }
        }}>
          กลับ
        </button>
        <h1 className="text-xl font-bold text-primary">
          รายละเอียดพฤติกรรมสุขภาพ
        </h1>
      </div>

      {records.length === 0 ? (
        <div className="bg-base-100 rounded-lg shadow p-6 text-center">
          <div className="text-gray-500 mb-4">
            ยังไม่มีข้อมูลการประเมินพฤติกรรมสุขภาพ
          </div>
          <Link to="/health-behavior" className="btn btn-primary">
            เริ่มประเมิน
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record, index) => {
            const evaluation = evaluateHealthBehavior(JSON.parse(record.behaviors));
            const behaviorsDisplay = getBehaviorsDisplay(record.behaviors);
            
            return (
              <div key={record.id} className="bg-base-100 rounded-lg shadow p-4">
                {/* หัวข้อและผลการประเมิน */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="text-sm text-gray-500">
                      การประเมินครั้งที่ {records.length - index}
                    </div>
                    <div className="text-sm text-gray-500">
                      {record.created_at
                        ? new Date(record.created_at).toLocaleString("th-TH")
                        : ""}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${evaluation.bgColor} ${evaluation.color}`}>
                    {evaluation.level}
                  </div>
                </div>

                {/* รายละเอียดพฤติกรรม */}
                <div className="space-y-2 mb-3">
                  {behaviorsDisplay.map((behavior, idx) => (
                    <div key={idx} className="border-l-4 pl-3 py-1">
                      <div className="text-sm font-medium text-base-content">
                        {behavior.label}
                      </div>
                      <div className={`text-sm font-semibold ${
                        behavior.isGood ? "text-green-600" : "text-red-600"
                      }`}>
                        {behavior.status}
                      </div>
                    </div>
                  ))}
                </div>

                {/* หมายเหตุ */}
                {record.note && (
                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <div className="text-sm font-semibold text-base-content mb-1">
                      หมายเหตุ:
                    </div>
                    <div className="text-sm text-gray-700">
                      {record.note}
                    </div>
                  </div>
                )}

                {/* สถิติสรุป */}
                <div className="bg-blue-50 rounded p-3">
                  <div className="text-sm font-semibold text-blue-800 mb-2">
                    สรุปผลการประเมิน:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-green-600">
                      ปฏิบัติตาม: {behaviorsDisplay.filter(b => b.isGood).length} ข้อ
                    </div>
                    <div className="text-red-600">
                      ไม่ปฏิบัติตาม: {behaviorsDisplay.filter(b => !b.isGood).length} ข้อ
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ปุ่มประเมินใหม่ */}
      <div className="mt-6">
        <Link to="/health-behavior" className="btn btn-primary w-full">
          ประเมินพฤติกรรมสุขภาพใหม่
        </Link>
      </div>
    </div>
  );
}

export default HealthBehaviorDetail; 