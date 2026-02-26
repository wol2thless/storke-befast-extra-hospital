import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useBefastStore } from "../store/befastStore";
import AssessmentAlert from "./AssessmentAlert";

const SYMPTOM_LABELS = {
  B: "Balance (ทรงตัวไม่ได้)",
  E: "Eyes (ตามัว/มองไม่เห็น)",
  F: "Face (ปาก/หน้าเบี้ยว)",
  A: "Arm (แขน/ขาอ่อนแรง)",
  S: "Speech (พูดไม่ชัด)",
  T: "Time (รีบไป รพ.)",
  NONE: "อาการทั่วไปปกติ",
};

function BEFASTSummary({ pid, refreshKey, isAdminView = false }) {
  const navigate = useNavigate();
  const getBefasts = useBefastStore((s) => s.getBefasts);
  const [lastRecord, setLastRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLastRecord() {
      setLoading(true);
      if (!pid) {
        setLastRecord(null);
        setLoading(false);
        return;
      }
      const res = await getBefasts(pid);
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        // sort by date desc
        const sorted = [...res.data].sort((a, b) =>
          (b.record_date || b.created_at || "").localeCompare(
            a.record_date || a.created_at || ""
          )
        );
        setLastRecord(sorted[0]);
      } else {
        setLastRecord(null);
      }
      setLoading(false);
    }
    fetchLastRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, refreshKey]);

  function formatDate(dateStr) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString("th-TH");
  }

  return (
    <>
      {loading ? (
        <div className="text-center text-info">กำลังโหลดข้อมูล...</div>
      ) : lastRecord ? (
        <>
          {(() => {
            const symptomsArr = lastRecord.symptoms.split(",");
            return (
              <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-primary">
                    อาการโรคหลอดเลือดสมอง (BEFAST)
                  </h3>
                  <button
                    onClick={() => {
                      if (isAdminView) {
                        navigate(`/admin/patient/${pid}/befast-history`, { state: { pid } });
                      } else {
                        navigate("/befast-history", { state: { pid } });
                      }
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    ดูรายละเอียด
                  </button>
                </div>

                {/* Assessment Alert */}
                <div className="mb-3">
                  <AssessmentAlert
                    lastDate={lastRecord?.created_at || lastRecord?.record_date}
                    assessmentName="แบบประเมิน BEFAST"
                    compact
                  />
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-600">📅</span>
                    <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded-full">
                      {formatDate(lastRecord.record_date || lastRecord.created_at)}
                    </span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="text-center mb-2">
                      <span className="text-xs text-gray-600">ผลการประเมินครั้งล่าสุด</span>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">อาการที่พบ</div>
                      <div className="text-sm text-gray-700">
                        {symptomsArr.map((k) => (
                          <span key={k} className="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs mr-1 mb-1">
                            {SYMPTOM_LABELS[k] || k}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      ) : (
        <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-primary">
              อาการโรคหลอดเลือดสมอง (BEFAST)
            </h3>
          </div>
          <div className="text-center py-4 text-gray-500">
            ยังไม่มีข้อมูลอาการที่บันทึก
          </div>
        </div>
      )}
    </>
  );
}

export default BEFASTSummary;
