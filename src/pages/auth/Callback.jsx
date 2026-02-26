import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import api from "@utils/api";
import CryptoJS from "crypto-js";

const SECRET_KEY = "stroke-app-key";

const encrypt = (data) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
// const decrypt = (ciphertext) => {
//   try {
//     const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
//     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//   } catch {
//     return null;
//   }
// };

const Callback = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const code = params.get("code");
  const redirect_uri = window.location.origin + "/stroke-befast/core";
  const [apiResult, setApiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchThaiD = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post(
          "/thaid-verify.php",
          {
            code,
            redirect_uri,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        // ถ้า success ให้เก็บ token และ user แบบเข้ารหัส พร้อมตั้ง timeout 1 วัน
        if (response.data.success && response.data.responseData) {
          const { id_token, decoded } = response.data.responseData;
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 1 วัน
          localStorage.setItem("id_token", encrypt(id_token));
          localStorage.setItem("user", encrypt(decoded));
          localStorage.setItem("expires_at", encrypt(expiresAt));

          // ตั้ง timeout logout อัตโนมัติ
          setTimeout(() => {
            localStorage.removeItem("id_token");
            localStorage.removeItem("user");
            localStorage.removeItem("expires_at");
            navigate("/login");
          }, 24 * 60 * 60 * 1000);

          setApiResult(response.data); // set ก่อน navigate
          setLoading(false);
          // เพิ่ม log
          navigate("/person-info");
          return; // ป้องกัน render ซ้อน
        } else {
          setApiResult(response.data);
          setLoading(false);
          // เพิ่ม log
        }
      } catch (err) {
        setError(err.message || "API error");
        setLoading(false);
        // เพิ่ม log
        console.error("[Callback] Exception:", err);
      }
    };
    if (code) {
      fetchThaiD();
    }
  }, [code, redirect_uri, navigate]);

  // ป้องกัน render สถานะผิดซ้อนกัน
  const showSuccess = !loading && !error && apiResult && apiResult.success;
  const showFail = !loading && !error && apiResult && !apiResult.success;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-xs bg-base-200 rounded-xl shadow p-6 flex flex-col items-center">
        <div className="mb-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="12" fill="#2563eb" fillOpacity="0.1" />
            <path
              d="M7 13l3 3 7-7"
              stroke="#2563eb"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {loading && (
          <div className="text-info text-lg font-semibold">
            กำลังตรวจสอบ ThaiD...
          </div>
        )}
        {error && (
          <>
            <div className="text-error text-lg font-semibold mb-2">
              เกิดข้อผิดพลาด
            </div>
            <div className="text-base-content/70">{error}</div>
          </>
        )}
        {showSuccess && (
          <>
            <div className="text-success text-lg font-semibold mb-2">
              เข้าสู่ระบบสำเร็จ
            </div>
            <div className="text-base-content/70">
              กำลังนำท่านไปยังหน้าข้อมูลผู้ใช้งาน...
            </div>
          </>
        )}
        {showFail && (
          <>
            <div className="text-error text-lg font-semibold mb-2">
              เข้าสู่ระบบไม่สำเร็จ
            </div>
            <div className="text-base-content/70">กรุณาลองใหม่อีกครั้ง</div>
          </>
        )}
      </div>
    </div>
  );
};
export default Callback;
