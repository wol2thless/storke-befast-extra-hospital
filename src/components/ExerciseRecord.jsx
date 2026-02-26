import React, { useState, useEffect } from "react";
import { useExerciseRecordStore } from "../store/exerciseRecordStore";
import CryptoJS from "crypto-js";

const EXERCISE_STATUS = [
  {
    key: "daily",
    label: (
      <span>
        ทำทุกวัน{" "}
        <span className="text-sm text-red-500">(อย่างน้อย 30 นาที)</span>
      </span>
    ),
  },
  {
    key: "regular",
    label: (
      <span>
        ทำสม่ำเสมอ{" "}
        <span className="text-sm text-red-500">
          (30นาที/วัน และทำ 3 ครั้ง/สัปดาห์)
        </span>
      </span>
    ),
  },
  { key: "none", label: "ไม่ได้ทำ" },
];

function ExerciseRecord() {
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const { saveRecord, fetchRecords, records } = useExerciseRecordStore();

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

  const handleSubmit = async () => {
    if (!pid) {
      setResultMsg("ไม่พบรหัสผู้ใช้งาน");
      setResultError(true);
      return;
    }
    setLoading(true);
    setResultMsg("");
    setResultError(false);
    const res = await saveRecord({ pid, status: selected, note });
    setLoading(false);
    if (res.success) {
      setResultMsg("บันทึกข้อมูลสำเร็จ");
      setResultError(false);
      setSelected("");
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

  return (
    <div className="p-4 mb-6">
      <h2 className="text-lg font-bold text-primary mb-2">
        บันทึกการออกกำลังกาย การทำกายภาพต่อเนื่อง
      </h2>
      {/* แสดงเฉพาะประวัติล่าสุด */}
      {latest && (
        <div className="mt-6">
          <div className="font-bold text-primary mb-3">
            🏃‍♂️ ประวัติการบันทึกล่าสุด
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-green-600">📅</span>
              <span className="text-sm text-gray-700 font-semibold">
                วันที่บันทึกล่าสุด:{" "}
                {latest.created_at
                  ? new Date(latest.created_at).toLocaleString("th-TH")
                  : "-"}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <div className="text-center mb-2">
                <span className="text-xs text-gray-600">
                  ผลการบันทึกครั้งล่าสุด
                </span>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center">
                  <div className="text-xs text-gray-600 mb-1">
                    สถานะการออกกำลังกาย
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    {EXERCISE_STATUS.find((s) => s.key === latest.status)
                      ?.label || latest.status}
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
      <div className="flex flex-col gap-2 mt-6 mb-4">
        {EXERCISE_STATUS.map((ex) => (
          <label
            key={ex.key}
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
              selected === ex.key
                ? "border-primary bg-primary/10"
                : "border-base-200"
            }`}
          >
            <input
              type="radio"
              name="exercise-status"
              checked={selected === ex.key}
              onChange={() => handleStatusChange(ex.key)}
              className="radio radio-primary radio-sm"
              disabled={alreadySavedToday}
            />
            <span className="text-sm font-bold">{ex.label}</span>
          </label>
        ))}
      </div>
      <textarea
        className="textarea textarea-bordered w-full mb-3"
        rows={2}
        placeholder="รายละเอียดเพิ่มเติม (เช่น ระยะเวลา จำนวนครั้ง ฯลฯ)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        disabled={alreadySavedToday}
      />
      <button
        className="btn btn-success w-full"
        type="button"
        disabled={!selected || loading || alreadySavedToday}
        onClick={handleSubmit}
      >
        {alreadySavedToday
          ? "บันทึกได้วันละ 1 ครั้ง"
          : loading
          ? "กำลังบันทึก..."
          : "บันทึกกิจกรรม"}
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
export default ExerciseRecord;
