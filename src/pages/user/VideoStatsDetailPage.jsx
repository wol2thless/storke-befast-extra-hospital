import AllVideoStatsDetail from "../../components/AllVideoStatsDetail";
import CryptoJS from "crypto-js";
import { useNavigate, useParams, useLocation } from "react-router";
import { decodePidFromUrl } from "../../utils/urlUtils";

const SECRET_KEY = "stroke-app-key";
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

import { useEffect, useState } from "react";

const VideoStatsDetailPage = () => {
  const { nationalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pid, setPid] = useState("");
  
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

  useEffect(() => {
    let userPid = "";
    
    if (isAdminRoute && nationalId) {
      // ถ้าเป็น admin route
      userPid = decodePidFromUrl(nationalId);
      if (!userPid && /^\d{13}$/.test(nationalId)) {
        userPid = nationalId;
      }
    } else {
      // ถ้าเป็น user route
      try {
        const encUser = localStorage.getItem("user");
        if (encUser) {
          const u = decrypt(encUser);
          userPid = u?.cid || u?.card_id || u?.pid || "";
          if (!userPid) {
            userPid =
              localStorage.getItem("cid") ||
              localStorage.getItem("card_id") ||
              localStorage.getItem("pid") ||
              "";
          }
        }
      } catch {
        // ไม่ทำอะไร
      }
    }
    
    setPid(userPid);
  }, [isAdminRoute, nationalId]);

  return (
    <div className="max-w-md mx-auto p-4">
      <button
        className="btn btn-ghost btn-sm mb-2"
        type="button"
        onClick={handleBack}
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
      <AllVideoStatsDetail pid={pid} />
    </div>
  );
};

export default VideoStatsDetailPage;
