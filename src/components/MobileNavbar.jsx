import { useNavigate, useLocation } from "react-router";
import {
  FaHome,
  FaHeartbeat,
  FaRegFileAlt,
  FaVideo,
  FaSmile,
  FaUser,
} from "react-icons/fa";

const navItems = [
  {
    to: "/",
    label: "หน้าหลัก",
    icon: <FaHome className="text-xl" />, // home
  },
  {
    to: "/health-behavior",
    label: "พฤติกรรมสุขภาพ",
    icon: <FaHeartbeat className="text-xl" />, // heartbeat
  },
  {
    to: "/health-record",
    label: "บันทึกสุขภาพ",
    icon: <FaRegFileAlt className="text-xl" />, // file
  },
  {
    to: "/video-library",
    label: "วิดีโอ",
    icon: <FaVideo className="text-xl" />, // video
  },
  {
    to: "/satisfaction-survey",
    label: "ประเมินความพึงพอใจ",
    icon: <FaSmile className="text-xl" />, // smile
  },
  {
    to: "/person-info",
    label: "ข้อมูลส่วนตัว",
    icon: <FaUser className="text-xl" />, // user
  },
];

import { useEffect, useState } from "react";
import api from "@utils/api";
import CryptoJS from "crypto-js";

const SECRET_KEY = "stroke-app-key";
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const MobileNavbar = ({ blockNav: blockNavProp }) => {
  const [blockNav, setBlockNav] = useState(blockNavProp);
  const [pid, setPid] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ดึง pid จาก localStorage (user)
  useEffect(() => {
    const encryptedUser = localStorage.getItem("user");
    if (encryptedUser) {
      const u = decrypt(encryptedUser);
      let cidValue = u?.cid || u?.card_id || u?.pid || "";
      if (!cidValue) {
        cidValue =
          localStorage.getItem("cid") ||
          localStorage.getItem("card_id") ||
          localStorage.getItem("pid") ||
          "";
      }
      setPid(cidValue);
    }
  }, []);

  // ฟังก์ชันเช็ค API ทุกครั้งที่กดปุ่ม
  const checkPersonInfo = async (to) => {
    if (!pid) {
      alert("ไม่พบรหัสผู้ใช้งาน");
      return;
    }
    try {
      const res = await api.get(
        `/personinfo_get.php?pid=${encodeURIComponent(pid)}`
      );
      const hasInfo =
        res.data &&
        res.data.success &&
        res.data.data &&
        res.data.data.occupation;
      setBlockNav(!hasInfo);
      if (!hasInfo && to !== "/person-info") {
        alert("กรุณาอัปเดตข้อมูลผู้ใช้งานให้ครบถ้วนก่อนใช้งานเมนูอื่น");
        return;
      }
      navigate(to);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อข้อมูลผู้ใช้งาน", err.message);
    }
  };

  return (
    <nav className="btm-nav fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-base-200 flex justify-between">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        return (
          <button
            key={item.to}
            className={`flex flex-col items-center justify-center py-2 px-1 min-w-0 flex-1 transition-colors duration-200
              ${isActive ? "text-primary font-bold" : ""}
              ${
                blockNav && item.to !== "/person-info"
                  ? "text-base-content opacity-60 cursor-not-allowed"
                  : ""
              }
            `}
            onClick={(e) => {
              e.preventDefault();
              checkPersonInfo(item.to);
            }}
            disabled={blockNav && item.to !== "/person-info"}
            tabIndex={blockNav && item.to !== "/person-info" ? -1 : 0}
            aria-disabled={blockNav && item.to !== "/person-info"}
          >
            <span className="w-6 h-6 flex items-center justify-center mb-1">
              {item.icon}
            </span>
            <span className="text-[9px] leading-tight text-center truncate max-w-full">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNavbar;
