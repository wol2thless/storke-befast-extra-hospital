import { useMemo, useState } from "react";
import CryptoJS from "crypto-js";
import BEFASTSummary from "../../components/BEFASTSummary";
import StrokeVideoStatsDetail from "../../components/StrokeVideoStatsDetail";
import { useNavigate } from "react-router";
import ADLAssessmentLatest from "../../components/ADLAssessmentLatest";
import ExerciseRecordLatest from "../../components/ExerciseRecordLatest";
import NutritionRecordLatest from "../../components/NutritionRecordLatest";
import MedicationRecordLatest from "../../components/MedicationRecordLatest";
import HealthBehaviorLatest from "../../components/HealthBehaviorLatest";
import SatisfactionSurveyLatest from "../../components/SatisfactionSurveyLatest";
import NextAppointment from "../../components/NextAppointment";

const HomePage = () => {
  // ดึง pid จาก localStorage (user)
  const pid = useMemo(() => {
    try {
      const encryptedUser = localStorage.getItem("user");
      if (encryptedUser) {
        const SECRET_KEY = "stroke-app-key";
        const bytes = CryptoJS.AES.decrypt(encryptedUser, SECRET_KEY);
        const u = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return u?.cid || u?.card_id || u?.pid || "";
      }
    } catch (err) {
      console.error("Error decrypting user data:", err);
    }
    return "";
  }, []);

  // สำหรับ refresh BEFASTSummary หลังบันทึก
  const [refreshKey, setRefreshKey] = useState(0);

  // ...ไม่ต้อง fetch ADL ใน HomePage แล้ว...



  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">

      <BEFASTSummary pid={pid} refreshKey={refreshKey} />
      {/* Next Appointment */}
      <NextAppointment pid={pid} />
      {/* ADL Assessment Latest Result */}
      <ADLAssessmentLatest pid={pid} />

      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-primary">
            สถิติผลลัพธ์การเรียนรู้
          </h3>
          <button
            onClick={() => navigate("/video-stats-detail")}
            className="btn btn-primary btn-sm"
          >
            ดูรายละเอียด
          </button>
        </div>
        <StrokeVideoStatsDetail summaryOnly pid={pid} />
      </div>
      {/* Nutrition Record Latest Result */}
      <NutritionRecordLatest pid={pid} />
      {/* Exercise Record Latest Result */}
      <ExerciseRecordLatest pid={pid} />
      {/* Medication Record Latest Result */}
      <MedicationRecordLatest pid={pid} />
      {/* Health Behavior Latest Result */}
      <HealthBehaviorLatest pid={pid} />
      {/* Satisfaction Survey Latest Result */}
      <SatisfactionSurveyLatest pid={pid} />
    </div>
  );
};

export default HomePage;
