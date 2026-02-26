import { useParams, useNavigate } from 'react-router';
import AllVideoStatsDetail from "../../components/AllVideoStatsDetail";
import { decodePidFromUrl, createSafePatientUrl } from '../../utils/urlUtils';

const PatientVideoStats = () => {
  const { nationalId: encodedNationalId } = useParams();
  const navigate = useNavigate();
  
  // ถอดรหัส PID จาก URL parameter
  const nationalId = decodePidFromUrl(encodedNationalId);

  // ตรวจสอบ PID ที่ถอดรหัสแล้ว
  if (!nationalId) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-xl font-bold text-error mb-2">ข้อมูลไม่ถูกต้อง</h1>
          <p className="text-gray-600 mb-4">ไม่สามารถระบุผู้ป่วยได้</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/dashboard')}
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        className="btn btn-ghost btn-sm mb-2"
        type="button"
        onClick={() => navigate(createSafePatientUrl(nationalId))}
        aria-label="ย้อนกลับ"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        กลับ
      </button>
      <div className="mb-4 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M12 20.5C6.201 20.5 1 15.299 1 9.5S6.201-1.5 12-1.5 23 4.701 23 10.5 17.799 20.5 12 20.5z"
          />
        </svg>
        <h1 className="text-primary font-bold text-xl">
          รายละเอียดการดูวิดีโอ
        </h1>
      </div>
      <AllVideoStatsDetail pid={nationalId} />
    </div>
  );
};

export default PatientVideoStats;