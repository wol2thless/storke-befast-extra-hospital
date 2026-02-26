import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { FaArrowLeft, FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa';
import CryptoJS from 'crypto-js';
import useAppointmentStore from '../../store/appointmentStore';
import { decodePidFromUrl } from '../../utils/urlUtils';

const AppointmentHistory = () => {
  const { nationalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    appointments, 
    loading, 
    error, 
    fetchAppointments, 
    clearError 
  } = useAppointmentStore();
  
  // ตรวจสอบว่าเป็น admin route หรือไม่
  const isAdminRoute = location.pathname.includes('/admin/');

  // ดึง pid จากหลายแหล่ง
  const pid = useMemo(() => {
    if (isAdminRoute && nationalId) {
      // ถ้าเป็น admin route ให้ถอดรหัส nationalId จาก URL
      const decoded = decodePidFromUrl(nationalId);
      if (decoded) return decoded;
      if (/^\d{13}$/.test(nationalId)) return nationalId; // fallback
    }
    
    // ถ้าเป็น user route ให้ดึงจาก localStorage
    try {
      const encryptedUser = localStorage.getItem("user");
      if (encryptedUser) {
        const SECRET_KEY = "stroke-app-key";
        const bytes = CryptoJS.AES.decrypt(encryptedUser, SECRET_KEY);
        const u = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return u?.cid || u?.card_id || u?.pid || "";
      }
    } catch (err) {
      console.error("Error decrypting user data:", err);
    }
    return "";
  }, [isAdminRoute, nationalId]);
  
  // ฟังก์ชันสำหรับปุ่มกลับ
  const handleBack = () => {
    if (isAdminRoute && nationalId) {
      navigate(`/admin/patient/${nationalId}`);
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    if (pid) {
      fetchAppointments(pid);
    }
  }, [pid, fetchAppointments]);

  // Format date to Thai format
  const formatDate = (dateString) => {
    try {
      // Convert from DD/MM/YYYY to YYYY-MM-DD
      const [day, month, year] = dateString.split('/');
      const date = new Date(year, month - 1, day);
      
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch {
      return dateString;
    }
  };

  // Check if appointment is in the past, today, or future
  const getAppointmentStatus = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'unknown';
    }
    
    try {
      const [day, month, year] = dateString.split('/');
      
      if (!day || !month || !year) {
        return 'unknown';
      }
      
      const appointmentDate = new Date(year, month - 1, day);
      
      if (isNaN(appointmentDate.getTime())) {
        return 'unknown';
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      appointmentDate.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) return 'past';
      if (appointmentDate.getTime() === today.getTime()) return 'today';
      return 'future';
    } catch (error) {
      console.error('Error getting appointment status:', dateString, error);
      return 'unknown';
    }
  };

  // Get days until appointment
  const getDaysUntil = (dateString) => {
    try {
      const [day, month, year] = dateString.split('/');
      const appointmentDate = new Date(year, month - 1, day);
      const now = new Date();
      const diffTime = appointmentDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'วันนี้';
      if (diffDays === 1) return 'พรุ่งนี้';
      if (diffDays < 0) return `ผ่านมาแล้ว ${Math.abs(diffDays)} วัน`;
      return `อีก ${diffDays} วัน`;
    } catch {
      return '';
    }
  };

  // Separate appointments by status
  const upcomingAppointments = appointments.filter(app => {
    if (!app?.APP_DATE) return false;
    const status = getAppointmentStatus(app.APP_DATE);
    return status === 'future' || status === 'today';
  });
  
  const pastAppointments = appointments.filter(app => {
    if (!app?.APP_DATE) return false;
    return getAppointmentStatus(app.APP_DATE) === 'past';
  });

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-4">
        <button
          className="btn btn-ghost btn-sm mb-4"
          onClick={handleBack}
        >
          <FaArrowLeft className="w-4 h-4 mr-1" />
          กลับ
        </button>
        <h1 className="text-2xl font-bold text-primary mb-4">ประวัติการนัด</h1>
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {/* Header */}
      <button
        className="btn btn-ghost btn-sm mb-4"
        onClick={handleBack}
      >
        <FaArrowLeft className="w-4 h-4 mr-1" />
        กลับ
      </button>
      
      <div className="mb-6 flex items-center gap-2">
        <FaCalendarAlt className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">ประวัติการนัด</h1>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
          <button 
            className="btn btn-sm btn-ghost"
            onClick={() => {
              clearError();
              if (pid) fetchAppointments(pid);
            }}
          >
            ลองอีกครั้ง
          </button>
        </div>
      )}

      {appointments.length === 0 && !loading ? (
        <div className="text-center py-8">
          <FaCalendarAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">ไม่มีการนัดหมาย</h3>
          <p className="text-gray-500">ยังไม่มีประวัติการนัดหมายในขณะนี้</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4" />
                การนัดที่กำลังจะมาถึง ({upcomingAppointments.length})
              </h2>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment, index) => {
                  const status = getAppointmentStatus(appointment.APP_DATE);
                  const daysUntil = getDaysUntil(appointment.APP_DATE);
                  const isToday = status === 'today';
                  
                  return (
                    <div 
                      key={index}
                      className={`rounded-lg p-4 border-2 ${
                        isToday 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-green-50 border-green-200'
                      }`}
                    >
                      {/* HN และชื่อ */}
                      <div className="flex items-center gap-2 mb-3">
                        <FaUserMd className={`w-4 h-4 ${isToday ? 'text-red-600' : 'text-green-600'}`} />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            HN: {appointment.hn}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            {appointment.fullname}
                          </div>
                        </div>
                        {isToday ? (
                          <div className="badge badge-error badge-sm">วันนี้</div>
                        ) : (
                          <div className="badge badge-success badge-sm">
                            {daysUntil}
                          </div>
                        )}
                      </div>

                      {/* วันที่นัด */}
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className={`w-4 h-4 ${isToday ? 'text-red-600' : 'text-green-600'}`} />
                        <div className="flex-1">
                          <div className={`font-bold ${isToday ? 'text-red-700' : 'text-green-700'}`}>
                            {formatDate(appointment.APP_DATE)}
                          </div>
                        </div>
                      </div>

                      {/* เวลานัด */}
                      <div className="flex items-center gap-2">
                        <FaClock className={`w-4 h-4 ${isToday ? 'text-red-600' : 'text-green-600'}`} />
                        <span className={`font-semibold ${isToday ? 'text-red-700' : 'text-green-700'}`}>
                          เวลา {appointment.APP_TIME} น.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-600 mb-3 flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4" />
                การนัดที่ผ่านมาแล้ว ({pastAppointments.length})
              </h2>
              <div className="space-y-3">
                {pastAppointments.map((appointment, index) => {
                  const daysUntil = getDaysUntil(appointment.APP_DATE);
                  
                  return (
                    <div 
                      key={index}
                      className="rounded-lg p-4 border-2 bg-gray-50 border-gray-200 opacity-75"
                    >
                      {/* HN และชื่อ */}
                      <div className="flex items-center gap-2 mb-3">
                        <FaUserMd className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            HN: {appointment.hn}
                          </span>
                          <div className="text-xs text-gray-600 mt-1">
                            {appointment.fullname}
                          </div>
                        </div>
                        <div className="badge badge-outline badge-sm">
                          {daysUntil}
                        </div>
                      </div>

                      {/* วันที่นัด */}
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="w-4 h-4 text-gray-600" />
                        <div className="flex-1">
                          <div className="font-bold text-gray-700">
                            {formatDate(appointment.APP_DATE)}
                          </div>
                        </div>
                      </div>

                      {/* เวลานัด */}
                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-700">
                          เวลา {appointment.APP_TIME} น.
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;