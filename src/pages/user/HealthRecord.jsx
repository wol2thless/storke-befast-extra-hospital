import SymptomSelector from "../../components/SymptomSelector";
import { useState, useEffect } from "react";
import ADLAssessment from "../../components/ADLAssessment";
import StrokeEducationVideos from "../../components/StrokeEducationVideos";
import ExerciseRecord from "../../components/ExerciseRecord";
import ExerciseEducationVideos from "../../components/ExerciseEducationVideos";
import NutritionRecord from "../../components/NutritionRecord";
import NutritionEducationVideos from "../../components/NutritionEducationVideos";
import MedicationRecord from "../../components/MedicationRecord";
import MedicationEducationVideos from "../../components/MedicationEducationVideos";

const HealthRecord = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="max-w-md mx-auto p-4">
      {/* SymptomSelector Card */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-amber-600 text-xl">🚨</span>
          <h2 className="text-lg font-bold text-primary">
            อาการของโรคหลอดเลือดสมองตีบ (BEFAST)
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <SymptomSelector onAfterSave={() => setRefreshKey(prev => prev + 1)} />
        </div>
      </div>

      {/* StrokeEducationVideos Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-600 text-xl">🧠</span>
          <h2 className="text-lg font-bold text-primary">
            วิดีโอความรู้เกี่ยวกับโรคหลอดเลือดสมอง
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <StrokeEducationVideos hideTitle />
        </div>
      </div>

      {/* ADLAssessment Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-blue-600 text-xl">📊</span>
          <h2 className="text-lg font-bold text-primary">
            การประเมินภาวะสุขภาพ - กิจวัตรประจำวัน (ADL)
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <ADLAssessment hideTitle />
        </div>
      </div>

      {/* ExerciseRecord Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-600 text-xl">🏃‍♂️</span>
          <h2 className="text-lg font-bold text-primary">
            บันทึกการออกกำลังกาย การทำกายภาพต่อเนื่อง
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <ExerciseRecord />
        </div>
      </div>

      {/* ExerciseEducationVideos Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-green-600 text-xl">💪</span>
          <h2 className="text-lg font-bold text-primary">
            วิดีโอการออกกำลังกายและกายภาพบำบัด
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <ExerciseEducationVideos hideTitle />
        </div>
      </div>

      {/* NutritionRecord Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-orange-600 text-xl">🍽️</span>
          <h2 className="text-lg font-bold text-primary">
            บันทึกการรับประทานอาหารและโภชนาการ
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <NutritionRecord />
        </div>
      </div>

      {/* NutritionEducationVideos Card */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-orange-600 text-xl">🥗</span>
          <h2 className="text-lg font-bold text-primary">
            วิดีโอความรู้ด้านโภชนาการ
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <NutritionEducationVideos hideTitle />
        </div>
      </div>

      {/* MedicationRecord Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-600 text-xl">💊</span>
          <h2 className="text-lg font-bold text-primary">
            บันทึกการรับประทานยาอย่างต่อเนื่อง
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <MedicationRecord />
        </div>
      </div>

      {/* MedicationEducationVideos Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-red-600 text-xl">💊</span>
          <h2 className="text-lg font-bold text-primary">
            วิดีโอความรู้เรื่องยา
          </h2>
        </div>
        <div className="bg-white rounded-lg p-3 border">
          <MedicationEducationVideos hideTitle />
        </div>
      </div>
    </div>
  );
};

export default HealthRecord;
