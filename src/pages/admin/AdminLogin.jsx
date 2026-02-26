import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FaUserShield, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdLogin } from 'react-icons/md';
import { useAdminStore } from '@store/adminStore';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin, loading, error, clearError } = useAdminStore();
  
  const [formData, setFormData] = useState({
    providerId: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (validationError) setValidationError('');
    if (error) clearError();
  };

  const validateForm = () => {
    if (!formData.providerId.trim()) {
      setValidationError('กรุณากรอก Provider ID');
      return false;
    }
    if (!formData.password.trim()) {
      setValidationError('กรุณากรอกรหัสผ่าน');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const result = await adminLogin(formData.providerId, formData.password);
    
    if (result.success) {
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-base-200">
      <div className="w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <span className="w-16 h-16 mb-4 flex items-center justify-center bg-warning rounded-full shadow">
            <FaUserShield className="w-10 h-10 text-warning-content" />
          </span>
          <h1 className="text-2xl font-bold mb-2 text-center">Admin Dashboard</h1>
          <h2 className="text-base font-medium text-center text-base-content/80">
            ระบบจัดการข้อมูลสำหรับผู้ดูแลระบบ
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Provider ID Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Provider ID</span>
            </label>
            <input
              type="text"
              name="providerId"
              value={formData.providerId}
              onChange={handleInputChange}
              className="input input-bordered w-full focus:input-primary"
              placeholder="กรุณากรอก Provider ID"
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">รหัสผ่าน</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input input-bordered w-full pr-12 focus:input-primary"
                placeholder="กรุณากรอกรหัสผ่าน"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-base-content/60 hover:text-base-content"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Error Messages */}
          {(validationError || error) && (
            <div className="alert alert-error">
              <span className="text-sm">{validationError || error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn btn-primary w-full text-lg ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <MdLogin className="h-6 w-6" />
                เข้าสู่ระบบ
              </>
            )}
          </button>
        </form>

        {/* Back to User Login */}
        <div className="divider my-6">หรือ</div>
        <button
          className="btn btn-outline btn-sm w-full"
          onClick={() => navigate('/login')}
          disabled={loading}
        >
          กลับไปหน้าเข้าสู่ระบบผู้ใช้งาน
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;