// src/components/SymptomSelector.jsx
import React, { useState, useEffect } from "react";
import { useBefastStore } from "../store/befastStore";
import CryptoJS from "crypto-js";

const SYMPTOMS = [
  {
    key: "B",
    label: "Balance",
    desc: (
      <span className="text-red-500 text-xl font-bold">
        เวียนศีรษะ ทรงตัวไม่ได้ เดินเซ{" "}
      </span>
    ),
  },
  {
    key: "E",
    label: "Eyes",
    desc: (
      <span className="text-red-500 text-xl font-bold">
        ตามัวมองไม่เห็น เห็นภาพซ้อน ตามืดบอดข้างเดียวหรือ2ข้างทันที
      </span>
    ),
  },
  {
    key: "F",
    label: "Face",
    desc: (
      <span className="text-red-500 text-xl font-bold">
        ปากเบี้ยว หน้าเบี้ยว ด้านใดด้านหนึ่ง น้ำลายไหล มุมปากตก กลืนลำบาก
      </span>
    ),
    // desc: (
  },
  {
    key: "A",
    label: "Arm",
    desc: (
      <span className="text-red-500 text-xl font-bold">
        แขนขาอ่อนแรง ชา หรืออ่อนแรงทันทีทันใด ด้านใดด้านหนึ่ง
      </span>
    ),
  },
  {
    key: "S",
    label: "Speech",
    desc: (
      <span className="text-red-500 text-xl font-bold">
        พูดลำบาก พูดไม่ชัด นึกคำพูดไม่ออก เสียงเปลี่ยน พูดไม่รู้เรื่อง
        พูดไม่ออกทันทีทันใด
      </span>
    ),
  },
  {
    key: "T",
    label: "Time",
    desc: (
      <span className="text-red-500 text-xl font-bold">
        รีบไปโรงพยาบาลให้เร็วที่สุด ภายใน4.5ชั่วโมงเริ่มตั้งแต่มีอาการ
      </span>
    ),
  },
];

function SymptomSelector({ onAfterSave }) {
  const [selected, setSelected] = useState([]);
  const [noSymptom, setNoSymptom] = useState(false);
  const [alreadySavedToday, setAlreadySavedToday] = useState(false);
  const [lastRecordDate, setLastRecordDate] = useState("");
  const [lastSymptoms, setLastSymptoms] = useState("");
  const canSubmit = (noSymptom || selected.length > 0) && !alreadySavedToday;
  const saveBefast = useBefastStore((s) => s.saveBefast);
  const getBefasts = useBefastStore((s) => s.getBefasts);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);

  // ดึง pid จาก localStorage (user) แบบเข้ารหัส (เหมือน PersonInfoPage)
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
  } catch {
    // Ignore decryption errors - pid will remain empty string
  }

  // ตรวจสอบว่ามีการบันทึกวันนี้แล้วหรือยัง
  useEffect(() => {
    async function checkToday() {
      if (!pid) return;
      const res = await getBefasts(pid);
      if (res.success && Array.isArray(res.data)) {
        // หาวันที่ล่าสุด
        let lastDate = "";
        let lastSymptomsData = "";
        if (res.data.length > 0) {
          // sort by date desc
          const sorted = [...res.data].sort((a, b) =>
            (b.record_date || b.created_at || "").localeCompare(
              a.record_date || a.created_at || ""
            )
          );
          lastDate = sorted[0].record_date || sorted[0].created_at || "";
          lastSymptomsData = sorted[0].symptoms || "";
        }
        setLastRecordDate(lastDate);
        setLastSymptoms(lastSymptomsData);
        // เช็คว่าวันล่าสุดเป็นวันนี้ไหม
        const today = new Date().toISOString().slice(0, 10);
        setAlreadySavedToday(lastDate.slice(0, 10) === today);
      }
    }
    checkToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  const handleSymptomChange = (key) => {
    if (selected.includes(key)) {
      setSelected(selected.filter((k) => k !== key));
    } else {
      setSelected([...selected, key]);
      // ถ้าเลือกอาการอื่น ให้ uncheck อาการทั่วไปปกติ
      if (noSymptom) setNoSymptom(false);
    }
  };
  const handleNoSymptom = () => {
    setNoSymptom((prev) => !prev);
    if (!noSymptom) setSelected([]); // ถ้าเลือก ให้ล้าง selected
    // ถ้า uncheck ไม่ต้องทำอะไร selected
  };

  const handleSubmit = async () => {
    if (!pid) {
      setResultMsg("ไม่พบรหัสผู้ใช้งาน");
      setResultError(true);
      return;
    }
    setLoading(true);
    setResultMsg("");
    setResultError(false);
    const res = await saveBefast({
      pid,
      symptoms: noSymptom ? "NONE" : selected.join(","),
      note: "",
    });
    setLoading(false);
    if (res.success) {
      setResultMsg("บันทึกข้อมูลสำเร็จ");
      setResultError(false);
      setSelected([]);
      setNoSymptom(false);
      setAlreadySavedToday(true);
      if (onAfterSave) onAfterSave();

      // ดึงข้อมูลล่าสุดมาแสดงทันที
      const res2 = await getBefasts(pid);
      if (res2.success && Array.isArray(res2.data) && res2.data.length > 0) {
        const sorted = [...res2.data].sort((a, b) =>
          (b.record_date || b.created_at || "").localeCompare(
            a.record_date || a.created_at || ""
          )
        );
        setLastRecordDate(sorted[0].record_date || sorted[0].created_at || "");
        setLastSymptoms(sorted[0].symptoms || "");
      }
    } else {
      setResultMsg(res.message || "เกิดข้อผิดพลาด");
      setResultError(true);
    }
  };

  // ฟังก์ชันแปลงวันที่ให้อ่านง่าย
  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // ฟังก์ชันแปลงอาการให้อ่านง่าย
  function formatSymptoms(symptomsStr) {
    if (!symptomsStr || symptomsStr === "NONE") return "ไม่มีอาการ";

    const symptomMap = {
      B: "Balance (ทรงตัวไม่ได้)",
      E: "Eyes (ตามัว)",
      F: "Face (หน้าเบี้ยว)",
      A: "Arm (แขนขาอ่อนแรง)",
      S: "Speech (พูดลำบาก)",
      T: "Time (รีบไปโรงพยาบาล)",
    };

    return symptomsStr
      .split(",")
      .map((s) => symptomMap[s] || s)
      .join(", ");
  }

  return (
    <div>
      {lastRecordDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-amber-600">📅</span>
            <span className="text-sm text-gray-700 font-semibold">
              {alreadySavedToday ? (
                <span>
                  วันนี้คุณบันทึกข้อมูลแล้ว ({formatDate(lastRecordDate)})
                </span>
              ) : (
                <span>บันทึกล่าสุด: {formatDate(lastRecordDate)}</span>
              )}
            </span>
          </div>
          {lastSymptoms && (
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-600">
                  ผลการประเมินครั้งล่าสุด
                </span>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-600 mb-1">อาการที่พบ</div>
                <div className="text-sm text-gray-700">
                  {formatSymptoms(lastSymptoms)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div className="w-full max-w-md mx-auto mb-2">
        <div className=" bg-base-200 text-amber-500 rounded px-3 py-2 text-center">
          เลือกอาการที่พบ (เลือกได้มากกว่า 1 อาการ)
        </div>
      </div>
      <div className="flex flex-col gap-3 mb-4">
        {SYMPTOMS.map((s) => (
          <div key={s.key} className="w-full max-w-md mx-auto">
            <div className="bg-base-100 rounded-t-lg px-3 py-2 font-bold border-b border-base-200 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center mr-2 text-lg font-bold">
                {s.key}
              </span>
              <span className="text-base">{s.label}</span>
            </div>
            <label
              className={`flex items-start gap-2 p-3 rounded-b-lg shadow bg-base-100 border border-base-200 border-t-0 cursor-pointer ${
                selected.includes(s.key) ? "ring-2 ring-primary" : ""
              }`}
            >
              <input
                type="checkbox"
                className="checkbox checkbox-primary mt-1"
                checked={selected.includes(s.key)}
                onChange={() => handleSymptomChange(s.key)}
                disabled={noSymptom}
              />
              <div>
                <div className="text-sm text-base-content/80 mt-0.5">
                  {s.desc}
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          className="checkbox checkbox-success"
          checked={noSymptom}
          onChange={handleNoSymptom}
          id="no-symptom"
        />
        <label htmlFor="no-symptom" className="font-semibold text-success">
          อาการทั่วไปปกติ
          <br />
          <span className="text-xs text-base-content/60">
            ไม่พบอาการสัญญาณเตือนของโรคหลอดเลือดสมองตีบ
          </span>
        </label>
      </div>
      <div className="flex flex-col items-center justify-center">
        <button
          className="btn btn-primary"
          type="button"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? "กำลังบันทึก..." : "บันทึกอาการ"}
        </button>
        {alreadySavedToday && (
          <div className="text-warning text-center mt-2">
            วันนี้คุณบันทึกข้อมูลแล้ว (วันละ 1 ครั้ง)
          </div>
        )}
      </div>
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

export default SymptomSelector;
