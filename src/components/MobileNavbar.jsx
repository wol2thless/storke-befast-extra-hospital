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
import { decrypt } from "@utils/crypto";

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
        `/personinfo_get.php?pid=${encodeURIComponent(pid)}`,
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
    <nav className="dock dock-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.to;
        const isBlocked = blockNav && item.to !== "/person-info";
        return (
          <button
            key={item.to}
            className={`${isActive ? "dock-active" : ""} ${isBlocked ? "opacity-60 cursor-not-allowed" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              checkPersonInfo(item.to);
            }}
            disabled={isBlocked}
            tabIndex={isBlocked ? -1 : 0}
            aria-disabled={isBlocked}
          >
            {item.icon}
            <span className="dock-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileNavbar;
