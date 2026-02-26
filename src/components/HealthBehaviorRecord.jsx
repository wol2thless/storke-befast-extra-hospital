import React, { useState, useEffect } from "react";
import useHealthBehaviorStore from "../store/healthBehaviorStore";
import CryptoJS from "crypto-js";

const HEALTH_RECOMMENDATIONS = [
  {
    key: "medication",
    label: (
      <span>
        1. รับประทานยา{" "}
        <span className="text-red-500 text-lg font-bold">ต่อเนื่อง</span>
        สม่ำเสมอ และ
        <span className="text-red-500 text-lg font-bold">รีบพบแพทย์ทันที</span>
        ถ้ามีอาการ
        <span className="text-red-500 text-lg font-bold">ผิดปกติ</span>
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
  {
    key: "control_risk",
    label: (
      <span>
        2. ควบคุม<span className="text-red-500 text-lg font-bold">ระดับความดันโลหิต ระดับไขมันและระดับน้ำตาล</span>ให้อยู่ใน<span className="text-red-500 text-lg font-bold">เกณฑ์ปกติ</span>
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
  {
    key: "diet_control",
    label: (
      <span>
        3. รับประทานอาหารให้เหมาะสมกับโรค และหลีกเลี่ยงอาหาร{" "}
        <span className="text-red-500 text-lg font-bold">รส เค็ม หวาน มัน</span>
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
  {
    key: "exercise",
    label: (
      <span>
        4. <span className="text-red-500 text-lg font-bold">ออกกำลังกายสม่ำเสมอ</span> อย่างน้อย <span className="text-red-500 text-lg font-bold">30 นาที/วัน 3 ครั้ง/สัปดาห์</span> และ<span className="text-red-500 text-lg font-bold">ควบคุมน้ำหนัก</span>ให้เหมาะสม
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
  {
    key: "avoid_smoking_alcohol",
    label: (
      <span>
        5. <span className="text-red-500 text-lg font-bold">งดสูบบุหรี่</span>หลีกเลี่ยง<span className="text-red-500 text-lg font-bold">เครื่องดื่มแอลกอฮอล์</span>
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
  {
    key: "warning_symptoms",
    label: (
      <span>
        6. ถ้ามี<span className="text-red-500 text-lg font-bold">อาการเตือน</span>ที่แสดงว่า<span className="text-red-500 text-lg font-bold">เลือดไปเลี้ยงสมองไม่พอ</span>ชั่วคราว ควร<span className="text-red-500 text-lg font-bold">รีบมาพบแพทย์</span>ถึงแม้อาการเหล่านั้น<span className="text-red-500 text-lg font-bold">หายไปเองเป็นปกติ</span>
      </span>
    ),
    options: [
      { value: "has_symptoms", label: "มีอาการ" },
      { value: "no_symptoms", label: "ไม่มีอาการ" },
    ],
  },
  {
    key: "sleep_enough",
    label: (
      <span>
        7. <span className="text-red-500 text-lg font-bold">พักผ่อนให้เพียงพอ</span> <span className="text-red-500 text-lg font-bold">6-8 ชั่วโมง/วัน</span>
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
  {
    key: "manage_stress",
    label: (
      <span>
        8. สามารถ<span className="text-red-500 text-lg font-bold">จัดการความเครียด</span>ได้อย่างเหมาะสม
      </span>
    ),
    options: [
      { value: "follow", label: "ปฏิบัติตาม" },
      { value: "not_follow", label: "ไม่ปฏิบัติตาม" },
    ],
  },
];

// ฟังก์ชันประเมินผล
const evaluateHealthBehavior = (behaviors) => {
  if (!behaviors)
    return {
      level: "ต้องปรับปรุง",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };

  let followCount = 0;
  let totalRecommendations = HEALTH_RECOMMENDATIONS.length;

  HEALTH_RECOMMENDATIONS.forEach((rec) => {
    const value = behaviors[rec.key];
    if (rec.key === "warning_symptoms") {
      // สำหรับอาการเตือน ถ้าไม่มีอาการ = ดี
      if (value === "no_symptoms") followCount++;
    } else {
      // สำหรับคำแนะนำอื่นๆ ถ้าปฏิบัติตาม = ดี
      if (value === "follow") followCount++;
    }
  });

  const percentage = (followCount / totalRecommendations) * 100;

  if (percentage >= 90) {
    return {
      level: "ดีเยี่ยม",
      color: "text-green-600",
      bgColor: "bg-green-100",
    };
  } else if (percentage >= 75) {
    return { level: "ดี", color: "text-blue-600", bgColor: "bg-blue-100" };
  } else if (percentage >= 50) {
    return {
      level: "พอใช้",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    };
  } else {
    return {
      level: "ต้องปรับปรุง",
      color: "text-red-600",
      bgColor: "bg-red-100",
    };
  }
};

function HealthBehaviorRecord() {
  const [selectedBehaviors, setSelectedBehaviors] = useState({});
  const [note, setNote] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const { saveRecord, fetchRecords, records } = useHealthBehaviorStore();

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
    fetchRecords(pid);
  }, [pid, fetchRecords]);

  useEffect(() => {
    setHistory(records);
  }, [records]);

  const handleBehaviorChange = (behaviorKey, value) => {
    setSelectedBehaviors((prev) => ({
      ...prev,
      [behaviorKey]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!pid) {
      setResultMsg("ไม่พบรหัสผู้ใช้งาน");
      setResultError(true);
      return;
    }

    // ตรวจสอบว่าตอบครบทุกพฤติกรรม
    const allAnswered = HEALTH_RECOMMENDATIONS.every(
      (behavior) => selectedBehaviors[behavior.key]
    );

    if (!allAnswered) {
      setResultMsg("กรุณาตอบครบทุกข้อ");
      setResultError(true);
      return;
    }

    setLoading(true);
    setResultMsg("");
    setResultError(false);

    const res = await saveRecord({
      pid,
      behaviors: JSON.stringify(selectedBehaviors),
      note,
    });
    setLoading(false);
    if (res.success) {
      setResultMsg("บันทึกข้อมูลสำเร็จ");
      setResultError(false);
      setSelectedBehaviors({});
      setNote("");
      fetchRecords(pid); // refresh history
    } else {
      setResultMsg(res.message || "เกิดข้อผิดพลาด");
      setResultError(true);
    }
  };

  // หาวันที่ล่าสุด
  const latest = history.length > 0 ? history[0] : null;
  const today = new Date().toISOString().slice(0, 10);
  const alreadySavedToday =
    latest && latest.created_at && latest.created_at.slice(0, 10) === today;

  // แสดงพฤติกรรมในประวัติ
  const getBehaviorsDisplay = (behaviorsStr) => {
    if (!behaviorsStr) return "-";
    try {
      const behaviors = JSON.parse(behaviorsStr);
      const display = [];

      HEALTH_RECOMMENDATIONS.forEach((behavior) => {
        const value = behaviors[behavior.key];
        const option = behavior.options.find((opt) => opt.value === value);
        if (option) {
          display.push(`${behavior.label}: ${option.label}`);
        }
      });

      return display.join("; ");
    } catch {
      return "-";
    }
  };

  // ประเมินผลปัจจุบัน
  const currentEvaluation = evaluateHealthBehavior(selectedBehaviors);

  return (
    <div className="p-4 mb-6">
      <h2 className="text-lg font-bold text-primary mb-2">
        ประเมินพฤติกรรมสุขภาพ
      </h2>

      {/* แสดงเฉพาะประวัติล่าสุด */}
      {latest && (
        <div className="mt-6">
          <div className="font-bold text-primary mb-3">
            💪 ประวัติการประเมินล่าสุด
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-purple-600">📅</span>
              <span className="text-sm text-gray-700 font-semibold">
                วันที่ประเมินล่าสุด:{" "}
                {latest.created_at
                  ? new Date(latest.created_at).toLocaleString("th-TH")
                  : "-"}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-600">
                  ผลการประเมินครั้งล่าสุด
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    ระดับพฤติกรรมสุขภาพ
                  </div>
                  <div className="text-lg font-bold text-purple-600">
                    {(() => {
                      try {
                        const behaviors = JSON.parse(latest.behaviors);
                        const evaluation = evaluateHealthBehavior(behaviors);
                        return (
                          <span className={`font-semibold ${evaluation.color}`}>
                            {evaluation.level}
                          </span>
                        );
                      } catch {
                        return "-";
                      }
                    })()}
                  </div>
                </div>
                {latest.note && (
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">หมายเหตุ</div>
                    <div className="text-sm text-gray-700">{latest.note}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* แบบประเมินพฤติกรรมสุขภาพ */}
      <div className="mt-6">
        <div className="font-bold text-base-content mb-4">
          แบบประเมินพฤติกรรมสุขภาพ
        </div>
        <div className="flex flex-col gap-6">
          {HEALTH_RECOMMENDATIONS.map((behavior) => (
            <div
              key={behavior.key}
              className="border border-base-200 rounded-lg p-4"
            >
              <div className="font-semibold text-base-content mb-3 text-sm">
                {behavior.label}
              </div>
              <div className="flex flex-col gap-2">
                {behavior.options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                      selectedBehaviors[behavior.key] === option.value
                        ? "border-primary bg-primary/10"
                        : "border-base-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`behavior-${behavior.key}`}
                      checked={selectedBehaviors[behavior.key] === option.value}
                      onChange={() =>
                        handleBehaviorChange(behavior.key, option.value)
                      }
                      className="radio radio-primary radio-sm"
                      disabled={alreadySavedToday}
                    />
                    <span className="text-sm text-base-content">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ผลการประเมินปัจจุบัน */}
      {Object.keys(selectedBehaviors).length ===
        HEALTH_RECOMMENDATIONS.length && (
        <div className={`mt-4 p-4 rounded-lg ${currentEvaluation.bgColor}`}>
          <div className="font-bold text-base-content mb-2">
            ผลการประเมินพฤติกรรมสุขภาพ
          </div>
          <div className={`text-lg font-bold ${currentEvaluation.color}`}>
            {currentEvaluation.level}
          </div>
        </div>
      )}

      <textarea
        className="textarea textarea-bordered w-full mb-3 mt-4"
        rows={2}
        placeholder="เหตุผลที่ไม่สามารถปฏิบัติตามคำแนะนำได้"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={alreadySavedToday}
      />
      <button
        className="btn btn-success w-full"
        type="button"
        disabled={
          Object.keys(selectedBehaviors).length <
            HEALTH_RECOMMENDATIONS.length ||
          loading ||
          alreadySavedToday
        }
        onClick={handleSubmit}
      >
        {alreadySavedToday
          ? "บันทึกได้วันละ 1 ครั้ง"
          : loading
          ? "กำลังบันทึก..."
          : "บันทึกการประเมิน"}
      </button>
      {resultMsg && (
        <div
          className={`text-center mt-2 ${
            resultError ? "text-error" : "text-success"
          }`}
        >
          {resultMsg}
        </div>
      )}
    </div>
  );
}

export default HealthBehaviorRecord;
