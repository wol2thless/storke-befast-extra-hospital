import { useState, useEffect } from "react";
import { useADLAssessmentStore } from "../store/adlAssessmentStore";
import CryptoJS from "crypto-js";

const SECRET_KEY = "stroke-app-key";
function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}


const QUESTIONS = [
  {
    key: "eat",
    label: "รับประทานอาหารเมื่อเตรียมไว้ให้เรียบร้อยต่อหน้า (Eating)",
  },
  {
    key: "hygiene",
    label: "การล้างหน้า หวีผม แปรงฟัน โกนหนวด (Personal Hygiene)",
  },
  {
    key: "dress",
    label: "ลุกนั่งจากที่นอน เตียงไปยังเก้าอี้ (Transferring)",
  },
  {
    key: "toilet",
    label: "การใช้ห้องน้ำ (Toileting)",
  },
  {
    key: "walk",
    label: "การเคลื่อนที่ภายในห้องหรือบ้าน (Walking)",
  },
  {
    key: "dressing",
    label: "การสวมใส่เสื้อผ้า (Dressing)",
  },
  {
    key: "stairs",
    label: "การขึ้นลงบันได 1ชั้น (Stair Climbing)",
  },
  {
    key: "bath",
    label: "การอาบน้ำ (Bathing)",
  },
  {
    key: "bowel_control",
    label: "คการกลั้นการถ่ายอุจจาระใน1สัปดาห์ที่ผ่านมา (Bowel Control)",
  },
  {
    key: "bladder_control",
    label: "การกลั้นปัสสาวะในระยะ1สัปดาห์ที่ผ่านมา (Bladder Control)",
  },
];

const CHOICES = [
  { value: 2, label: "ทำได้เอง" },
  { value: 1, label: "ต้องการความช่วยเหลือบางส่วน" },
  { value: 0, label: "ต้องการความช่วยเหลือทั้งหมด" },
];

function ADLAssessment({ hideTitle }) {
  const [answers, setAnswers] = useState({});
  const [assessments, setAssessments] = useState({}); // เปลี่ยนเป็น object
  const [patientId, setPatientId] = useState("");
  const { fetchAssessments, saveAssessment } = useADLAssessmentStore();

  useEffect(() => {
    // ดึง patientId จาก localStorage ทุกครั้งที่ component mount
    try {
      const encryptedUser = localStorage.getItem("user");
      if (encryptedUser) {
        const u = decrypt(encryptedUser);
        const pid = u?.cid || u?.card_id || u?.pid || "";
        setPatientId(pid);
      }
    } catch (error) {
      setPatientId("");
    }
  }, []);

  useEffect(() => {
    if (patientId) {
      fetchAssessments(patientId).then((data) => {
        if (data.success) {
          setAssessments(data.assessments || {}); // ป้องกัน null/undefined
        } else {
          alert(data.message || "Failed to fetch assessments");
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAssessments, patientId]);

  const handleChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!patientId) {
      alert("Patient ID is missing. Please provide a valid patient ID.");
      return;
    }

    // ตรวจสอบว่าตอบครบทุกข้อ
    const allAnswered = QUESTIONS.every(
      (q) =>
        answers[q.key] !== undefined &&
        answers[q.key] !== null &&
        answers[q.key] !== ""
    );
    if (!allAnswered) {
      alert("กรุณาตอบทุกข้อก่อนบันทึกข้อมูล");
      return;
    }

    // ตรวจสอบว่ามีการบันทึกวันนี้แล้วหรือไม่
    if (latest && latest.created_at) {
      const latestDate = new Date(latest.created_at);
      const now = new Date();
      if (
        latestDate.getFullYear() === now.getFullYear() &&
        latestDate.getMonth() === now.getMonth() &&
        latestDate.getDate() === now.getDate()
      ) {
        alert("วันนี้มีการบันทึกข้อมูลแล้ว ไม่สามารถบันทึกซ้ำได้");
        return;
      }
    }

    const data = {
      patient_id: patientId,
      answers,
    };
    const result = await saveAssessment(data);
    if (result.success) {
      alert("บันทึกข้อมูลสำเร็จ");
      // ดึงข้อมูลล่าสุดจาก backend ทันที
      if (patientId) {
        const data = await fetchAssessments(patientId);
        if (data.success) {
          setAssessments(data.assessments || {});
        }
      }
    } else {
      alert(result.message);
    }
  };

  const total = QUESTIONS.reduce(
    (sum, q) => sum + (Number(answers[q.key]) || 0),
    0
  );
  const maxScore = QUESTIONS.length * 2;

  // Calculate percent and interpretation
  const percent = maxScore === 0 ? 0 : (total / maxScore) * 100;
  let interpretation = "";
  let level = "";
  let colorClass = "";

  if (percent >= 80) {
    interpretation = "สามารถช่วยเหลือตนเองได้ (Independent)";
    level = "ช่วยเหลือตนเองได้ (Independent)";
    colorClass = "text-green-700 bg-green-100 border-green-300";
  } else if (percent >= 60) {
    interpretation = "พึ่งพาบางส่วน (Partially Dependent)";
    level = "พึ่งพาบางส่วน (Partially Dependent)";
    colorClass = "text-yellow-700 bg-yellow-100 border-yellow-300";
  } else if (percent >= 40) {
    interpretation = "พึ่งพามาก (Severely Dependent)";
    level = "พึ่งพามาก (Severely Dependent)";
    colorClass = "text-orange-700 bg-orange-100 border-orange-300";
  } else {
    interpretation = "ภาวะพึ่งพาโดยสมบูรณ์ (Total Dependent)";
    level = "พึ่งพาโดยสมบูรณ์ (Total Dependent)";
    colorClass = "text-red-700 bg-red-100 border-red-300";
  }

  // ดึง assessment ล่าสุด
  const latestKey =
    assessments && Object.keys(assessments).length > 0
      ? Object.keys(assessments).sort((a, b) => {
          const dateA = new Date(assessments[a].created_at).getTime();
          const dateB = new Date(assessments[b].created_at).getTime();
          return dateB - dateA;
        })[0]
      : null;
  const latest = latestKey ? assessments[latestKey] : null;

  return (
    <div>
      {!hideTitle && (
        <h2 className="text-lg font-bold text-primary mb-2">
          การประเมินภาวะสุขภาพ - กิจวัตรประจำวัน (ADL)
        </h2>
      )}
      <div className="mt-4">
        <h3 className="text-md font-bold text-primary">📊 ผลการประเมินล่าสุด</h3>
        {latest ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600">📅</span>
              <span className="text-sm text-gray-700 font-semibold">
                วันที่ประเมินล่าสุด: {latest.created_at
                  ? new Date(latest.created_at).toLocaleString("th-TH")
                  : "-"}
              </span>
            </div>
            {(() => {
              // คำนวณสีตามระดับล่าสุด
              let latestColorClass = "text-gray-700";
              const percentLatest = latest.max_score
                ? (latest.total_score / latest.max_score) * 100
                : 0;
              if (percentLatest >= 80) {
                latestColorClass = "text-green-700";
              } else if (percentLatest >= 60) {
                latestColorClass = "text-yellow-700";
              } else if (percentLatest >= 40) {
                latestColorClass = "text-orange-700";
              } else {
                latestColorClass = "text-red-700";
              }
              return (
                <div className="bg-white rounded-lg p-3 border">
                  <div className="text-center mb-2">
                    <span className="text-xs text-gray-600">ผลการประเมินครั้งล่าสุด</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">คะแนน</div>
                      <div className="text-lg font-bold text-blue-600">
                        {latest.total_score ?? 0} / {latest.max_score ?? QUESTIONS.length * 2}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">ระดับการพึ่งพา</div>
                      <div className={`text-lg font-bold ${latestColorClass}`}>
                        {latest.dependency_level || "-"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-gray-500">ยังไม่มีข้อมูลการประเมิน</div>
        )}
      </div>
      <table className="table table-xs w-full mb-2">
        <thead>
          <tr>
            <th className="w-1/3">กิจกรรม</th>
            <th className="w-1/2">เลือก</th>
          </tr>
        </thead>
        <tbody>
          {QUESTIONS.map((q, idx) => (
            <tr
              key={q.key}
              className={
                (idx % 2 === 0 ? "bg-base-100" : "bg-base-200") +
                " border-b border-base-300"
              }
            >
              <td className="py-2 align-top">{q.label}</td>
              <td className="py-2">
                <div className="flex flex-col gap-1">
                  {CHOICES.map((c) => (
                    <label
                      key={c.value}
                      className="inline-flex items-center gap-1"
                    >
                      <input
                        type="radio"
                        name={q.key}
                        value={c.value}
                        checked={String(answers[q.key]) === String(c.value)}
                        onChange={() => handleChange(q.key, c.value)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="table table-xs w-full mb-2">
        <thead>
          <tr>
            <th className="w-1/2 text-center">คะแนน</th>
            <th className="w-1/2 text-center">ระดับการพึ่งพา</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="py-2 text-center">
              {total} / {maxScore} ({percent.toFixed(1)}%)
            </td>
            <td className="py-2 text-center">
              <span
                className={colorClass.match(/text-\w+-700/)?.[0] + " font-bold"}
              >
                {level}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="flex flex-col items-center justify-center">
        {(() => {
          // ตรวจสอบว่าตอบครบทุกข้อ
          const allAnswered = QUESTIONS.every(
            (q) =>
              answers[q.key] !== undefined &&
              answers[q.key] !== null &&
              answers[q.key] !== ""
          );
          // ตรวจสอบว่ามีการบันทึกวันนี้แล้วหรือไม่
          let alreadySavedToday = false;
          if (latest && latest.created_at) {
            const latestDate = new Date(latest.created_at);
            const now = new Date();
            if (
              latestDate.getFullYear() === now.getFullYear() &&
              latestDate.getMonth() === now.getMonth() &&
              latestDate.getDate() === now.getDate()
            ) {
              alreadySavedToday = true;
            }
          }
          return (
            <button
              className="ju btn btn-primary mt-4"
              onClick={handleSave}
              disabled={!allAnswered || alreadySavedToday}
            >
              บันทึกข้อมูล
            </button>
          );
        })()}
      </div>
    </div>
  );
}

export default ADLAssessment;
