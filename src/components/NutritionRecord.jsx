import React, { useState, useEffect } from "react";
import { useNutritionRecordStore } from "../store/nutritionRecordStore";
import CryptoJS from "crypto-js";

const NUTRITION_STATUS = [
  {
    key: "normal_full",
    label: (
      <span>
        รับประทานอาหารได้
        <span className="text-red-500 text-lg font-bold">เหมาะสมกับโรค</span>{" "}
        ทานได้<span className="text-red-500 text-lg font-bold">ปกติ</span> และ
        <span className="text-red-500 text-lg font-bold">ครบ 5 หมู่</span>
      </span>
    ),
  },
  {
    key: "normal_notfull",
    label: (
      <span>
        รับประทานอาหารได้
        <span className="text-red-500 text-lg font-bold">เหมาะสมกับโรค</span>{" "}
        ทานได้<span className="text-red-500 text-lg font-bold">ปกติ</span> แต่
        <span className="text-red-500 text-lg font-bold">ไม่ครบ 5 หมู่</span>
      </span>
    ),
  },
  {
    key: "less",
    label: (
      <span>
        รับประทานอาหารได้
        <span className="text-red-500 text-lg font-bold">เหมาะสมกับโรค</span>{" "}
        แต่<span className="text-red-500 text-lg font-bold">ทานได้น้อย</span>
      </span>
    ),
  },
  {
    key: "cannot",
    label: (
      <span className="text-red-500 text-lg font-bold">
        ไม่สามารถรับประทานอาหารได้
      </span>
    ),
  },
];

function NutritionRecord() {
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [resultMsg, setResultMsg] = useState("");
  const [resultError, setResultError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { saveRecord, fetchRecords, records } = useNutritionRecordStore();

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

  // หาวันที่ล่าสุด
  const latest = records && records.length > 0 ? records[0] : null;
  const today = new Date().toISOString().slice(0, 10);
  const alreadySavedToday =
    latest && latest.created_at && latest.created_at.slice(0, 10) === today;

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

  return (
    <div className="p-4 mb-6">
      <h2 className="text-lg font-bold text-primary mb-2">
        บันทึกการรับประทานอาหารและโภชนาการ
      </h2>
      {/* แสดงเฉพาะประวัติล่าสุด */}
      {latest && (
        <div className="mt-6">
          <div className="font-bold text-primary mb-3">
            🍽️ ประวัติการบันทึกล่าสุด
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-600">📅</span>
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
                    สถานะการรับประทานอาหาร
                  </div>
                  <div className="text-lg font-bold text-orange-600">
                    {NUTRITION_STATUS.find((s) => s.key === latest.status)
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
        {NUTRITION_STATUS.map((item) => (
          <label
            key={item.key}
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-all ${
              selected === item.key
                ? "border-primary bg-primary/10"
                : "border-base-200"
            }`}
          >
            <input
              type="radio"
              name="nutrition-status"
              checked={selected === item.key}
              onChange={() => handleStatusChange(item.key)}
              className="radio radio-primary radio-sm"
              disabled={alreadySavedToday}
            />
            <span className="text-sm text-base-content">{item.label}</span>
          </label>
        ))}
      </div>
      <textarea
        className="textarea textarea-bordered w-full mb-3"
        rows={2}
        placeholder="รายละเอียดเพิ่มเติม (เช่น เมนูอาหาร ข้อสังเกต ฯลฯ)"
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
          : "บันทึกข้อมูล"}
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

export default NutritionRecord;
