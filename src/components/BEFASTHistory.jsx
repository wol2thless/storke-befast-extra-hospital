import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { useBefastStore } from "../store/befastStore";
import CryptoJS from "crypto-js";
import { decodePidFromUrl } from "../utils/urlUtils";

const SECRET_KEY = "stroke-app-key";
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const SYMPTOM_LABELS = {
  B: "Balance (ทรงตัวไม่ได้)",
  E: "Eyes (ตามัว/มองไม่เห็น)",
  F: "Face (ปาก/หน้าเบี้ยว)",
  A: "Arm (แขน/ขาอ่อนแรง)",
  S: "Speech (พูดไม่ชัด)",
  T: "Time (รีบไป รพ.)",
  NONE: "อาการทั่วไปปกติ",
};

function BEFASTHistory({ pid: propPid }) {
  const { nationalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');
  
  // รับ pid จากหลายแหล่ง: prop, URL parameter (admin), location.state, localStorage
  let pid = propPid || (location.state && location.state.pid);
  
  // ถ้าเป็น admin route และมี nationalId ใน URL
  if (isAdminRoute && nationalId && !pid) {
    pid = decodePidFromUrl(nationalId);
    if (!pid && /^\d{13}$/.test(nationalId)) {
      pid = nationalId; // fallback ถ้าไม่ได้เข้ารหัส
    }
  }
  if (!pid) {
    try {
      const encUser = localStorage.getItem("user");
      if (encUser) {
        const u = decrypt(encUser);
        let cidValue = u?.cid || u?.card_id || u?.pid || "";
        if (!cidValue) {
          cidValue =
            localStorage.getItem("cid") ||
            localStorage.getItem("card_id") ||
            localStorage.getItem("pid") ||
            "";
        }
        pid = cidValue;
      }
    } catch {}
  }
  const getBefasts = useBefastStore((s) => s.getBefasts);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      if (!pid) {
        setRecords([]);
        setLoading(false);
        return;
      }
      const res = await getBefasts(pid);
      if (res.success && Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
      }
      setLoading(false);
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid]);

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-box shadow">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary mb-4">
          ประวัติการประเมินอาการ (BEFAST)
        </h2>
        <button className="btn btn-sm btn-outline" onClick={() => {
          if (isAdminRoute && nationalId) {
            navigate(`/admin/patient/${nationalId}`);
          } else {
            navigate(-1);
          }
        }}>
          กลับ
        </button>
      </div>
      {loading ? (
        <div className="text-center text-info">กำลังโหลดข้อมูล...</div>
      ) : records.length === 0 ? (
        <div className="text-center text-base-content/60">ยังไม่มีข้อมูล</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-center">วันที่</th>
                <th className="text-center">อาการ</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => {
                const symptomsArr = rec.symptoms.split(",");
                const hasDanger = symptomsArr.some((k) => k !== "NONE");
                const rowClass = hasDanger
                  ? "bg-warning/80 text-warning-content animate-pulse"
                  : "";
                return (
                  <tr key={rec.id} className={rowClass}>
                    <td className="text-center whitespace-nowrap">
                      {formatDate(rec.record_date || rec.created_at)}
                    </td>
                    <td>
                      <ul className="list-disc ml-4">
                        {hasDanger && (
                          <li className="mb-1 text-2xl">
                            😱{" "}
                            <span className="align-middle text-base">
                              พบอาการผิดปกติ
                            </span>
                          </li>
                        )}
                        {symptomsArr.map((k) =>
                          k !== "NONE" ? (
                            <li key={k}>{SYMPTOM_LABELS[k] || k}</li>
                          ) : null
                        )}
                        {!hasDanger && <li>{SYMPTOM_LABELS["NONE"]}</li>}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BEFASTHistory;
