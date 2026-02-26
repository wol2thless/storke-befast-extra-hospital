import React, { useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useNutritionRecordStore } from "@/store/nutritionRecordStore";
import { decodePidFromUrl } from "../../utils/urlUtils";
const NUTRITION_STATUS = [
  {
    key: "normal_full",
    label: "รับประทานอาหารได้เหมาะสมกับโรค ทานได้ปกติ และครบ 5 หมู่",
  },
  {
    key: "normal_notfull",
    label: "รับประทานอาหารได้เหมาะสมกับโรค ทานได้ปกติ แต่ไม่ครบ 5 หมู่",
  },
  { key: "less", label: "รับประทานอาหารได้เหมาะสมกับโรค แต่ทานได้น้อย" },
  { key: "cannot", label: "ไม่สามารถรับประทานอาหารได้เหมาะสมกับโรค" },
  { key: "none", label: "ไม่ได้รับประทานอาหารเลย" },
];

function NutritionRecordDetail() {
  const navigate = useNavigate();
  const { nationalId } = useParams();
  const location = useLocation();
  const { fetchRecords, records } = useNutritionRecordStore();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');

  useEffect(() => {
    let pid = "";
    
    if (isAdminRoute && nationalId) {
      // ถ้าเป็น admin route ให้ถอดรหัส nationalId จาก URL
      pid = decodePidFromUrl(nationalId);
      if (!pid && /^\d{13}$/.test(nationalId)) {
        pid = nationalId; // fallback ถ้าไม่ได้เข้ารหัส
      }
    } else {
      // ถ้าเป็น user route ให้ดึงจาก localStorage
      try {
        const encryptedUser = localStorage.getItem("user");
        if (encryptedUser) {
          const SECRET_KEY = "stroke-app-key";
          const bytes = window.CryptoJS.AES.decrypt(encryptedUser, SECRET_KEY);
          const u = JSON.parse(bytes.toString(window.CryptoJS.enc.Utf8));
          pid = u?.cid || u?.card_id || u?.pid || "";
        }
      } catch {}
    }
    
    if (pid) fetchRecords(pid);
  }, [fetchRecords, isAdminRoute, nationalId]);
  
  // ฟังก์ชันสำหรับปุ่มกลับ
  const handleBack = () => {
    if (isAdminRoute && nationalId) {
      navigate(`/admin/patient/${nationalId}`);
    } else {
      navigate(-1);
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        ไม่พบข้อมูลโภชนาการ
        <button
          className="btn btn-sm btn-outline ml-4"
          onClick={handleBack}
        >
          กลับ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-100 rounded-box shadow">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-primary mb-4">รายการโภชนาการทั้งหมด</h2>
        <button className="btn btn-sm btn-outline" onClick={handleBack}>
          กลับ
        </button>
      </div>
      <table className="table table-xs w-full">
        <thead>
          <tr>
            <th>วันที่</th>
            <th>สถานะ</th>
            <th>รายละเอียด</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => (
            <tr key={rec.id}>
              <td>
                {rec.created_at
                  ? new Date(rec.created_at).toLocaleString("th-TH")
                  : "-"}
              </td>
              <td>
                {NUTRITION_STATUS.find((s) => s.key === rec.status)?.label ||
                  rec.status}
              </td>
              <td>{rec.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default NutritionRecordDetail;
