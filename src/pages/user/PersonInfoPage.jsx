import { useEffect, useState } from "react";
import { usePersonInfoStore } from "../../store/personInfoStore";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router";
import CryptoJS from "crypto-js";
import { maskPhoneNumber } from "../../utils/pdpaUtils";

const SECRET_KEY = "stroke-app-key";

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const encrypt = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch {
    return "";
  }
};

const PersonInfoPage = () => {
  const personStore = usePersonInfoStore();
  const [user, setUser] = useState(null);
  const [cid, setCid] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [otherOccupation, setOtherOccupation] = useState("");
  const [education, setEducation] = useState("");
  const [showFullCid, setShowFullCid] = useState(false);
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [phone, setPhone] = useState("");


  // ตรวจสอบข้อมูลสำคัญ ถ้ายังไม่เคยกรอก ให้บังคับแก้ไข
  useEffect(() => {
    if (user && !editMode) {
      const needUpdate =
        !user.occupation ||
        user.occupation === "" ||
        !user.education ||
        user.education === "" ||
        !user.phone ||
        user.phone === "";
      if (needUpdate) {
        setOccupation(user.occupation || "");
        setEducation(user.education || "");
        setPhone(user.phone || "");
        setOtherOccupation(
          user.occupation === "อื่น ๆ" &&
            typeof user.otherOccupation === "string"
            ? user.otherOccupation.trim()
            : ""
        );
        setEditMode(true);
        setTimeout(() => {
          alert(
            "กรุณาอัปเดตข้อมูล อาชีพ เบอร์ติดต่อ และระดับการศึกษาให้ครบถ้วนก่อนใช้งาน"
          );
        }, 300);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchAndMergePersonInfo = async (u, cidValue) => {
      try {
        const result = await personStore.getPersonInfo(cidValue);
        if (result.success && result.data) {
          // merge เฉพาะ field ที่ต้องการ
          const merged = {
            ...u,
            occupation: result.data.occupation || u.occupation || "",
            otherOccupation:
              result.data.otherOccupation || u.otherOccupation || "",
            education: result.data.education || u.education || "",
            phone: result.data.phone || u.phone || "",
          };
          setUser(merged);
          setOccupation(merged.occupation || "");
          setOtherOccupation(merged.otherOccupation || "");
          setEducation(merged.education || "");
          setPhone(merged.phone || "");
          localStorage.setItem("user", encrypt(merged));
        } else {
          setUser(u);
          setOccupation(u?.occupation || "");
          setOtherOccupation(u?.otherOccupation || "");
          setEducation(u?.education || "");
          setPhone(u?.phone || "");
        }
      } catch {
        setUser(u);
        setOccupation(u?.occupation || "");
        setOtherOccupation(u?.otherOccupation || "");
        setEducation(u?.education || "");
        setPhone(u?.phone || "");
      }
    };
    const encryptedUser = localStorage.getItem("user");
    const encryptedToken = localStorage.getItem("id_token");
    const encryptedExpires = localStorage.getItem("expires_at");
    let expired = true;
    if (encryptedUser && encryptedToken && encryptedExpires) {
      const expiresAt = decrypt(encryptedExpires);
      if (expiresAt && Date.now() < expiresAt) {
        const u = decrypt(encryptedUser);

        // ดึง cid จาก user หรือ localStorage (รองรับ pid ด้วย)
        let cidValue = u?.cid || u?.card_id || u?.pid || "";
        if (!cidValue) {
          cidValue =
            localStorage.getItem("cid") ||
            localStorage.getItem("card_id") ||
            localStorage.getItem("pid") ||
            "";
        }
        setCid(cidValue);
        expired = false;
        fetchAndMergePersonInfo(u, cidValue);
      }
    }
    if (expired) {
      // clear session just in case
      localStorage.removeItem("id_token");
      localStorage.removeItem("user");
      localStorage.removeItem("expires_at");
      navigate("/login", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // ลบซ้ำ personStore (เหลือแค่บรรทัดบนสุด)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-error">ไม่พบข้อมูลผู้ใช้งาน กรุณา login ใหม่</div>
      </div>
    );
  }

  // ฟังก์ชันคำนวณอายุจากวันเกิด (yyyy-mm-dd)
  const getAge = (birthdate) => {
    if (!birthdate) return "-";
    const d = new Date(birthdate);
    if (isNaN(d)) return "-";
    const diff = Date.now() - d.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age;
  };

  const occupationOptions = [
    "รับราชการ",
    "พนักงานบริษัท",
    "ค้าขาย",
    "เกษตรกร",
    "นักเรียน/นักศึกษา",
    "ว่างงาน",
    "อื่น ๆ",
  ];
  const educationOptions = [
    "ไม่ได้ศึกษา",
    "ประถมศึกษา",
    "มัธยมศึกษา",
    "ปวช./ปวส.",
    "ปริญญาตรี",
    "สูงกว่าปริญญาตรี",
  ];

  const handleSave = async () => {
    let occ = occupation;
    let otherOcc = otherOccupation;
    if (occupation === "อื่น ๆ") {
      occ = "อื่น ๆ";
      otherOcc = otherOccupation.trim();
    } else {
      otherOcc = "";
    }
    const newUser = { ...user, occupation: occ, education, phone };
    if (occ === "อื่น ๆ") {
      newUser.otherOccupation = otherOcc;
    } else {
      delete newUser.otherOccupation;
    }
    setUser(newUser);
    localStorage.setItem("user", encrypt(newUser));
    setEditMode(false);
    setOtherOccupation("");
    // เรียก API บันทึก personinfo
    const apiData = {
      pid: cid,
      name_th: newUser.name_th || newUser.name || "",
      name_en: newUser.name_en || "",
      gender: newUser.gender || "",
      birthdate: newUser.birthdate || "",
      occupation: newUser.occupation || "",
      otherOccupation: newUser.otherOccupation || "",
      education: newUser.education || "",
      phone: newUser.phone || "",
      address:
        typeof newUser.address === "object" && newUser.address?.formatted
          ? newUser.address.formatted
          : newUser.address || "",
    };
    try {
      const result = await personStore.savePersonInfo(apiData);
      if (!result.success) {
        alert("บันทึกข้อมูล API ไม่สำเร็จ: " + result.message);
      } else {
        alert("บันทึกข้อมูลสำเร็จ");
      }
    } catch (err) {
      console.error("[ERROR] savePersonInfo exception", err);
      alert("เกิดข้อผิดพลาดขณะบันทึกข้อมูล: " + (err?.message || err));
    }
  };

  // จัดรูปแบบเลขบัตรประชาชน (อ่านง่าย + masking)
  const formatCid = (cid, mask = true) => {
    if (!cid || cid.length !== 13) return cid || "-";
    if (mask) {
      // 1 2345 XXXXX 12 3
      return `${cid[0]} ${cid.slice(1, 5)} XXXXX ${cid.slice(10, 12)} ${
        cid[12]
      }`;
    }
    // 1 2345 67890 12 3
    return `${cid[0]} ${cid.slice(1, 5)} ${cid.slice(5, 10)} ${cid.slice(
      10,
      12
    )} ${cid[12]}`;
  };

  return (
    <div className="max-w-md w-full mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-primary mb-3">
          👤 ข้อมูลผู้ใช้งาน
        </h1>
        <p className="text-gray-600">
          ข้อมูลส่วนตัวและข้อมูลการติดต่อ
        </p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-primary p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold mb-2">
                {user.name_th || user.name || "ไม่ระบุชื่อ"}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/80 text-sm">
                  เลขบัตรประชาชน: {formatCid(cid, !showFullCid)}
                </span>
                {cid && (
                  <button
                    className="btn btn-xs btn-ghost flex-shrink-0"
                    type="button"
                    onClick={() => setShowFullCid((v) => !v)}
                    aria-label={showFullCid ? "ซ่อนเลขเต็ม" : "แสดงเลขเต็ม"}
                  >
                    {showFullCid ? (
                      <FaEyeSlash className="text-sm" />
                    ) : (
                      <FaEye className="text-sm" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* อายุ */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">🎂</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">อายุ</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {getAge(user.birthdate)} ปี
                    </div>
                  </div>
                </div>
              </div>

              {/* เพศ */}
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <span className="text-pink-600 text-lg">
                      {(() => {
                        const g = user.gender;
                        if (!g) return "❓";
                        const s = String(g).toLowerCase();
                        if (s === "male" || s === "m" || s === "ชาย") return "👨";
                        if (s === "female" || s === "f" || s === "หญิง") return "👩";
                        return "❓";
                      })()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700">เพศ</div>
                    <div className="text-xl font-bold text-gray-900">
                      {(() => {
                        const g = user.gender;
                        if (!g) return "ไม่ระบุ";
                        const s = String(g).toLowerCase();
                        if (s === "male" || s === "m" || s === "ชาย") return "ชาย";
                        if (s === "female" || s === "f" || s === "หญิง") return "หญิง";
                        return "ไม่ระบุ";
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* อาชีพ */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">💼</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 mb-2">อาชีพ</div>
                    {editMode ? (
                      <div className="space-y-2">
                        <select
                          className="select select-bordered w-full"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                        >
                          <option value="">เลือกอาชีพ</option>
                          {occupationOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        {occupation === "อื่น ๆ" && (
                          <input
                            className="input input-bordered w-full"
                            type="text"
                            placeholder="โปรดระบุอาชีพ"
                            value={otherOccupation}
                            onChange={(e) => setOtherOccupation(e.target.value)}
                            maxLength={50}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-xl font-bold text-gray-900">
                        {user.occupation === "อื่น ๆ" ? (
                          <div>
                            <div>อื่น ๆ</div>
                            {user.otherOccupation && user.otherOccupation.trim() !== "" && (
                              <div className="text-sm text-gray-600 mt-1">
                                {user.otherOccupation}
                              </div>
                            )}
                          </div>
                        ) : (
                          user.occupation || <span className="text-gray-400">ไม่ระบุ</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* เบอร์ติดต่อ */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 text-lg">📞</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700 mb-2">เบอร์ติดต่อ</div>
                    {editMode ? (
                      <input
                        className="input input-bordered w-full"
                        type="tel"
                        placeholder="กรอกเบอร์โทร"
                        value={phone}
                        onChange={(e) =>
                          setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 20))
                        }
                        maxLength={20}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="text-xl font-bold text-gray-900">
                          {user.phone ? (showFullPhone ? user.phone : maskPhoneNumber(user.phone)) : <span className="text-gray-400">ไม่ระบุ</span>}
                        </div>
                        {user.phone && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setShowFullPhone(!showFullPhone)}
                            aria-label={showFullPhone ? "ซ่อนเบอร์โทร" : "แสดงเบอร์โทร"}
                          >
                            {showFullPhone ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ระดับการศึกษา - Full Width */}
          <div className="mt-6 bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 text-lg">🎓</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-700 mb-2">ระดับการศึกษา</div>
                {editMode ? (
                  <select
                    className="select select-bordered w-full"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                  >
                    <option value="">เลือกระดับการศึกษา</option>
                    {educationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xl font-bold text-gray-900 break-words">
                    {user.education || <span className="text-gray-400">ไม่ระบุ</span>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-3">
            {!editMode ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setOccupation(user.occupation || "");
                  setEducation(user.education || "");
                  setPhone(user.phone || "");
                  setOtherOccupation(
                    user.occupation === "อื่น ๆ" && typeof user.otherOccupation === "string"
                      ? user.otherOccupation.trim()
                      : ""
                  );
                  setEditMode(true);
                }}
              >
                ✏️ แก้ไขข้อมูล
              </button>
            ) : (
              <>
                <button className="btn btn-success" onClick={handleSave}>
                  💾 บันทึก
                </button>
                <button className="btn btn-ghost" onClick={() => setEditMode(false)}>
                  ❌ ยกเลิก
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="mt-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
        <div className="text-center">
          <div className="text-3xl mb-3">🚨</div>
          <h3 className="text-xl font-bold text-red-700 mb-3">
            เบอร์โทรศัพท์ติดต่อหากพบอาการผิดปกติ
          </h3>
          <div className="flex flex-col items-center gap-3">
            <div className="text-lg font-semibold text-red-600">สายด่วนฉุกเฉิน</div>
            <a
              href="tel:1669"
              className="btn btn-error btn-lg text-xl font-bold px-8 py-4"
              style={{ letterSpacing: 2 }}
            >
              1669
            </a>
            <div className="text-sm text-gray-600">
              กดเพื่อโทรออก (เฉพาะมือถือ)
            </div>
          </div>
        </div>
      </div>

      {/* Line OA Contact */}
      {import.meta.env.VITE_LINE_OA_URL && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="text-center">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="text-xl font-bold text-green-700 mb-3">
              ติดต่อผ่าน Line Official Account
            </h3>
            <p className="text-gray-700 mb-4">
              เพิ่มเพื่อนใน Line เพื่อรับคำแนะนำและติดตามผลการรักษา
            </p>
            <button
              className="btn btn-success btn-lg text-lg font-bold px-8 py-4"
              onClick={() => window.open(import.meta.env.VITE_LINE_OA_URL, "_blank")}
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              เพิ่มเพื่อนใน Line
            </button>
          </div>
        </div>
      )}


    </div>
  );
};
export default PersonInfoPage;
