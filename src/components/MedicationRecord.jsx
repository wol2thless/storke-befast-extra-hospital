import React, { useState, useEffect } from "react";
import useMedicationRecordStore from "../store/medicationRecordStore";
import CryptoJS from "crypto-js";

const MEDICATION_STATUS = [
  { key: "taken", label: "รับประทานยาตามที่แพทย์สั่งครบถ้วน" },
  { key: "partial", label: "รับประทานยาบางส่วน" },
  { key: "missed", label: "ลืมรับประทานยา" },
  { key: "stopped", label: "หยุดรับประทานยา" },
];

const MEAL_TIMES = [
  { key: "before_meal", label: "ก่อนอาหาร" },
  { key: "after_meal", label: "หลังอาหาร" },
  { key: "before_bed", label: "ก่อนนอน" },
];

const MEALS = [
  { key: "breakfast", label: "เช้า" },
  { key: "lunch", label: "เที่ยง" },
  { key: "dinner", label: "เย็น" },
];

function MedicationRecord() {
  const [selected, setSelected] = useState("");
  const [selectedMealTimes, setSelectedMealTimes] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({});
  const [note, setNote] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const { saveRecord, fetchRecords, records } = useMedicationRecordStore();

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

  const handleStatusChange = (key) => {
    setSelected(key);
  };

  const handleMealTimeChange = (mealTimeKey) => {
    setSelectedMealTimes(prev => {
      if (prev.includes(mealTimeKey)) {
        // ถ้าเลิกเลือกช่วงเวลา ให้ลบมื้ออาหารที่เกี่ยวข้องออกด้วย
        const newSelectedMeals = { ...selectedMeals };
        delete newSelectedMeals[mealTimeKey];
        setSelectedMeals(newSelectedMeals);
        return prev.filter(time => time !== mealTimeKey);
      } else {
        // ถ้าเลือก "ก่อนนอน" ให้เพิ่มเข้าไปใน selectedMeals ด้วย
        if (mealTimeKey === 'before_bed') {
          setSelectedMeals(prev => ({
            ...prev,
            [mealTimeKey]: []
          }));
        }
        return [...prev, mealTimeKey];
      }
    });
  };

  const handleMealChange = (mealTimeKey, mealKey) => {
    setSelectedMeals(prev => {
      const currentMeals = prev[mealTimeKey] || [];
      const newMeals = currentMeals.includes(mealKey)
        ? currentMeals.filter(m => m !== mealKey)
        : [...currentMeals, mealKey];
      
      return {
        ...prev,
        [mealTimeKey]: newMeals
      };
    });
  };

  const handleSubmit = async () => {
    if (!pid) {
      setResultMsg("ไม่พบรหัสผู้ใช้งาน");
      setResultError(true);
      return;
    }
    if (selectedMealTimes.length === 0) {
      setResultMsg("กรุณาเลือกช่วงเวลาการรับประทานยาอย่างน้อย 1 ช่วง");
      setResultError(true);
      return;
    }
    
    // ตรวจสอบว่าทุกช่วงเวลาที่เลือกมีมื้ออาหารอย่างน้อย 1 มื้อ (ยกเว้นก่อนนอน)
    const hasValidMeals = selectedMealTimes.every(mealTime => {
      if (mealTime === 'before_bed') {
        // ก่อนนอนไม่ต้องมีมื้ออาหาร
        return true;
      }
      return selectedMeals[mealTime] && selectedMeals[mealTime].length > 0;
    });
    
    if (!hasValidMeals) {
      setResultMsg("กรุณาเลือกมื้ออาหารสำหรับช่วงเวลาที่เลือก (ยกเว้นก่อนนอน)");
      setResultError(true);
      return;
    }


    setLoading(true);
    setResultMsg("");
    setResultError(false);
    
    // สร้างข้อมูลมื้อยาในรูปแบบ JSON string
    const mealData = JSON.stringify(selectedMeals);
    
    const res = await saveRecord({ 
      pid, 
      status: selected, 
      meal_times: selectedMealTimes.join(','),
      meals: mealData,
      note 
    });
    setLoading(false);
    if (res.success) {
      setResultMsg("บันทึกข้อมูลสำเร็จ");
      setResultError(false);
      setSelected("");
      setSelectedMealTimes([]);
      setSelectedMeals({});
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

  // แสดงมื้อยาที่เลือกในประวัติ
  const getMealsDisplay = (mealsStr) => {
    if (!mealsStr) return "-";
    try {
      const meals = JSON.parse(mealsStr);
      const display = [];
      
      Object.entries(meals).forEach(([mealTime, mealList]) => {
        const mealTimeLabel = MEAL_TIMES.find(m => m.key === mealTime)?.label;
        if (mealTime === 'before_bed') {
          display.push(mealTimeLabel);
        } else {
          const mealLabels = mealList.map(meal => 
            MEALS.find(m => m.key === meal)?.label
          ).join(', ');
          display.push(`${mealTimeLabel}: ${mealLabels}`);
        }
      });
      
      return display.join('; ');
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-4 mb-6">
      <h2 className="text-lg font-bold text-primary mb-2">
        บันทึกการรับประทานยาอย่างต่อเนื่อง
      </h2>
      {/* แสดงเฉพาะประวัติล่าสุด */}
      {latest && (
        <div className="mt-6">
          <div className="font-bold text-primary mb-3">💊 ประวัติการบันทึกล่าสุด</div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-red-600">📅</span>
              <span className="text-sm text-gray-700 font-semibold">
                วันที่บันทึกล่าสุด: {latest.created_at
                  ? new Date(latest.created_at).toLocaleString("th-TH")
                  : "-"}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-600">ผลการบันทึกครั้งล่าสุด</span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">สถานะการรับประทานยา</div>
                  <div className="text-lg font-bold text-red-600">
                    {MEDICATION_STATUS.find((s) => s.key === latest.status)
                      ?.label || latest.status}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">มื้อยา</div>
                  <div className="text-sm text-gray-700">{getMealsDisplay(latest.meals)}</div>
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
      
      {/* เลือกสถานะการรับประทานยา */}
      <div className="mt-6">
        <div className="font-bold text-base-content mb-2">
          สถานะการรับประทานยา
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {MEDICATION_STATUS.map((med) => (
            <label
              key={med.key}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
                selected === med.key
                  ? "border-primary bg-primary/10"
                  : "border-base-200"
              }`}
            >
              <input
                type="radio"
                name="medication-status"
                checked={selected === med.key}
                onChange={() => handleStatusChange(med.key)}
                className="radio radio-primary radio-sm"
                disabled={alreadySavedToday}
              />
              <span className="text-sm text-base-content">{med.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* เลือกช่วงเวลาการรับประทานยาและมื้ออาหาร */}
      <div className="mt-4">
        <div className="font-bold text-base-content mb-2">
          ช่วงเวลาการรับประทานยาและมื้ออาหาร
        </div>
        <div className="flex flex-col gap-4 mb-4">
          {MEAL_TIMES.map((mealTime) => (
            <div key={mealTime.key} className="border border-base-200 rounded-lg p-3">
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedMealTimes.includes(mealTime.key)}
                  onChange={() => handleMealTimeChange(mealTime.key)}
                  className="checkbox checkbox-primary checkbox-sm"
                  disabled={alreadySavedToday}
                />
                <span className="font-semibold text-base-content">{mealTime.label}</span>
              </label>
              
              {selectedMealTimes.includes(mealTime.key) && mealTime.key !== 'before_bed' && (
                <div className="ml-6">
                  <div className="text-sm text-base-content/70 mb-2">เลือกมื้ออาหาร:</div>
                  <div className="flex flex-col gap-2">
                    {MEALS.map((meal) => (
                      <label
                        key={meal.key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMeals[mealTime.key]?.includes(meal.key) || false}
                          onChange={() => handleMealChange(mealTime.key, meal.key)}
                          className="checkbox checkbox-secondary checkbox-xs"
                          disabled={alreadySavedToday}
                        />
                        <span className="text-sm text-base-content">{meal.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <textarea
        className="textarea textarea-bordered w-full mb-3"
        rows={2}
        placeholder="รายละเอียดเพิ่มเติม (เช่น ชื่อยา จำนวนครั้ง ฯลฯ)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={alreadySavedToday}
      />
      <button
        className="btn btn-success w-full"
        type="button"
        disabled={!selected || selectedMealTimes.length === 0 || loading || alreadySavedToday}
        onClick={handleSubmit}
      >
        {alreadySavedToday
          ? "บันทึกได้วันละ 1 ครั้ง"
          : loading
          ? "กำลังบันทึก..."
          : "บันทึกการรับประทานยา"}
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

export default MedicationRecord; 