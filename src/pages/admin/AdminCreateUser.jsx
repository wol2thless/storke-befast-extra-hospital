import { useState } from "react";
import { useNavigate } from "react-router";
import { FaUserPlus, FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { MdSave } from "react-icons/md";
import { useAdminStore } from "@store/adminStore";

const AdminCreateUser = () => {
  const navigate = useNavigate();
  const { adminUser, createUser, loading } = useAdminStore();

  const [formData, setFormData] = useState({
    providerId: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "staff",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check if current user is admin
  if (adminUser?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin เท่านั้น)</span>
        </div>
        <button
          className="btn btn-outline mt-4"
          onClick={() => navigate("/admin")}
        >
          <FaArrowLeft /> กลับหน้าแรก
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear messages when user starts typing
    if (validationError) setValidationError("");
    if (successMessage) setSuccessMessage("");
  };

  const validateForm = () => {
    if (!formData.providerId.trim()) {
      setValidationError("กรุณากรอก เลขบัตรประจำตัวประชาชน");
      return false;
    }
    if (!formData.name.trim()) {
      setValidationError("กรุณากรอกชื่อ-นามสกุล");
      return false;
    }
    if (!formData.password.trim()) {
      setValidationError("กรุณากรอกรหัสผ่าน");
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("รหัสผ่านไม่ตรงกัน");
      return false;
    }
    if (!formData.role) {
      setValidationError("กรุณาเลือกสิทธิ์การใช้งาน");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await createUser({
      provider_id: formData.providerId,
      name: formData.name,
      password: formData.password,
      role: formData.role,
    });

    if (result.success) {
      setSuccessMessage(`สร้างผู้ใช้งาน "${formData.name}" สำเร็จ`);
      // Reset form
      setFormData({
        providerId: "",
        name: "",
        password: "",
        confirmPassword: "",
        role: "staff",
      });
      // Auto redirect after 2 seconds
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } else {
      setValidationError(result.error || "เกิดข้อผิดพลาดในการสร้างผู้ใช้งาน");
    }
  };

  const handleCancel = () => {
    navigate("/admin");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button className="btn btn-ghost btn-sm mr-4" onClick={handleCancel}>
            <FaArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-primary rounded-full">
              <FaUserPlus className="w-6 h-6 text-primary-content" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">สร้างผู้ใช้งานใหม่</h1>
              <p className="text-sm text-base-content/70">
                เพิ่ม Admin หรือ Staff เข้าสู่ระบบ
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Provider ID */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    เลขบัตรประจำตัวประชาชน <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleInputChange}
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="เช่น 1909xxxxxx1234"
                  maxLength={13}
                  disabled={loading}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    รหัสประจำตัวเจ้าหน้าที่ (ไม่สามารถซ้ำได้)
                  </span>
                </label>
              </div>

              {/* Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    ชื่อ-นามสกุล <span className="text-error">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input input-bordered w-full focus:input-primary"
                  placeholder="เช่น นายสมชาย ใจดี"
                  disabled={loading}
                />
              </div>

              {/* Role */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    สิทธิ์การใช้งาน <span className="text-error">*</span>
                  </span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="select select-bordered w-full focus:select-primary"
                  disabled={loading}
                >
                  <option value="staff">Staff (เจ้าหน้าที่)</option>
                  <option value="supervisor">Supervisor (หัวหน้างาน)</option>
                  <option value="admin">Admin (ผู้ดูแลระบบ)</option>
                </select>
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Admin สามารถสร้างผู้ใช้งานใหม่ได้
                  </span>
                </label>
              </div>

              {/* Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    รหัสผ่าน <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input input-bordered w-full pr-12 focus:input-primary"
                    placeholder="ขั้นต่ำ 6 ตัวอักษร"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    ยืนยันรหัสผ่าน <span className="text-error">*</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input input-bordered w-full pr-12 focus:input-primary"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash size={20} />
                    ) : (
                      <FaEye size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {validationError && (
                <div className="alert alert-error">
                  <span className="text-sm">{validationError}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="alert alert-success">
                  <span className="text-sm">{successMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`btn btn-primary flex-1 ${
                    loading ? "loading" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <>
                      <MdSave className="h-5 w-5" />
                      สร้างผู้ใช้งาน
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="alert alert-info mt-6">
          <div>
            <div className="font-bold">หมายเหตุ:</div>
            <ul className="list-disc list-inside text-sm mt-2 space-y-1">
              <li>
                เฉพาะผู้ใช้ที่มีสิทธิ์ Admin
                เท่านั้นที่สามารถสร้างผู้ใช้งานใหม่ได้
              </li>
              <li>Provider ID จะถูกใช้สำหรับเข้าสู่ระบบ และต้องไม่ซ้ำกัน</li>
              <li>รหัสผ่านจะถูกเข้ารหัสอย่างปลอดภัยก่อนบันทึกในฐานข้อมูล</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;
