import React from "react";
import { useADLAssessmentStore } from "../../store/adlAssessmentStore";
import { useNavigate, useParams, useLocation } from "react-router";
import { decodePidFromUrl } from "../../utils/urlUtils";

function ADLAssessmentHistory() {
  const { nationalId } = useParams();
  const location = useLocation();
  const { assessments } = useADLAssessmentStore();
  const navigate = useNavigate();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');
  
  // ฟังก์ชันสำหรับปุ่มกลับ
  const handleBack = () => {
    if (isAdminRoute && nationalId) {
      navigate(`/admin/patient/${nationalId}`);
    } else {
      navigate(-1);
    }
  };

  // assessments ใน store เป็น object ต้องแปลงเป็น array และเรียงวันที่ใหม่ล่าสุดก่อน
  const assessmentArr = React.useMemo(() => {
    if (!assessments || Object.keys(assessments).length === 0) return [];
    return Object.values(assessments).sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [assessments]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-primary">ประวัติผลการประเมิน ADL</h2>
        <button className="btn btn-sm btn-outline flex items-center gap-1" onClick={handleBack}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          กลับ
        </button>
      </div>
      {assessmentArr.length === 0 ? (
        <div className="text-gray-500">ไม่พบข้อมูลการประเมิน</div>
      ) : (
        <table className="table table-xs w-full mb-2">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>คะแนน</th>
              <th>ระดับการพึ่งพา</th>
            </tr>
          </thead>
          <tbody>
            {assessmentArr.map((a, idx) => {
              const percent = a.max_score
                ? (a.total_score / a.max_score) * 100
                : 0;
              let colorClass = "text-red-700 font-bold";
              if (percent >= 80) colorClass = "text-green-700 font-bold";
              else if (percent >= 60) colorClass = "text-yellow-700 font-bold";
              else if (percent >= 40) colorClass = "text-orange-700 font-bold";
              return (
                <tr key={a.created_at + idx}>
                  <td>
                    {a.created_at
                      ? new Date(a.created_at).toLocaleString("th-TH")
                      : "-"}
                  </td>
                  <td>
                    {a.total_score ?? 0} / {a.max_score ?? 20}
                  </td>
                  <td>
                    <span className={colorClass}>
                      {a.dependency_level || "-"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ADLAssessmentHistory;
