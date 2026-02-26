import React, { useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUserMd, FaExclamationTriangle } from 'react-icons/fa';
import { useNavigate } from 'react-router';
import useAppointmentStore from '../store/appointmentStore';

const NextAppointment = ({ pid, showAll = false, isAdminView = false }) => {
  const navigate = useNavigate();
  const { 
    appointments, 
    loading, 
    error, 
    fetchAppointments, 
    getNextAppointment,
    clearError 
  } = useAppointmentStore();

  useEffect(() => {
    if (pid) {
      fetchAppointments(pid);
    }
  }, [pid, fetchAppointments]);

  // Format date to Thai format
  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return 'วันที่ไม่ถูกต้อง';
    }
    
    try {
      // Convert from DD/MM/YYYY to YYYY-MM-DD
      const [day, month, year] = dateString.split('/');
      
      if (!day || !month || !year) {
        return dateString;
      }
      
      const date = new Date(year, month - 1, day);
      
      // ตรวจสอบว่า date ถูกต้อง
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString || 'วันที่ไม่ถูกต้อง';
    }
  };

  // Check if appointment is urgent (within 7 days)
  const isUrgent = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return false;
    }
    
    try {
      const [day, month, year] = dateString.split('/');
      
      if (!day || !month || !year) {
        return false;
      }
      
      const appointmentDate = new Date(year, month - 1, day);
      
      if (isNaN(appointmentDate.getTime())) {
        return false;
      }
      
      const now = new Date();
      const diffTime = appointmentDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7 && diffDays >= 0;
    } catch (error) {
      console.error('Error checking urgent date:', dateString, error);
      return false;
    }
  };

  // Get days until appointment
  const getDaysUntil = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return '';
    }
    
    try {
      const [day, month, year] = dateString.split('/');
      
      if (!day || !month || !year) {
        return '';
      }
      
      const appointmentDate = new Date(year, month - 1, day);
      
      if (isNaN(appointmentDate.getTime())) {
        return '';
      }
      
      const now = new Date();
      const diffTime = appointmentDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'วันนี้';
      if (diffDays === 1) return 'พรุ่งนี้';
      if (diffDays < 0) return 'ผ่านมาแล้ว';
      return `อีก ${diffDays} วัน`;
    } catch (error) {
      console.error('Error calculating days until:', dateString, error);
      return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <FaCalendarAlt className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">การนัดครั้งถัดไป</h3>
        </div>
        <div className="flex justify-center items-center py-4">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <FaCalendarAlt className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">การนัดครั้งถัดไป</h3>
        </div>
        <div className="text-center py-4">
          <FaExclamationTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
          <p className="text-sm text-gray-600">{error}</p>
          <button 
            className="btn btn-sm btn-primary mt-2"
            onClick={() => {
              clearError();
              if (pid) fetchAppointments(pid);
            }}
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  const nextAppointment = getNextAppointment();
  const appointmentsToShow = showAll ? appointments : (nextAppointment ? [nextAppointment] : []);

  if (appointmentsToShow.length === 0) {
    return (
      <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <FaCalendarAlt className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">การนัดครั้งถัดไป</h3>
        </div>
        <div className="text-center py-4">
          <FaCalendarAlt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          {error ? (
            <div className="text-sm text-red-600 mb-2">
              เกิดข้อผิดพลาด: {error}
            </div>
          ) : (
            <p className="text-sm text-gray-600">ไม่มีการนัดหมายในขณะนี้</p>
          )}
          {error && (
            <button
              className="btn btn-sm btn-outline btn-error"
              onClick={() => {
                clearError();
                if (pid) fetchAppointments(pid);
              }}
            >
              ลองใหม่
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-primary">
            {showAll ? 'การนัดหมายทั้งหมด' : 'การนัดครั้งถัดไป'}
          </h3>
        </div>
        {!showAll && !isAdminView && appointments.length > 0 && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (isAdminView) {
                navigate(`/admin/patient/${pid}/appointment-history`);
              } else {
                navigate('/appointment-history');
              }
            }}
          >
            ดูทั้งหมด
          </button>
        )}
      </div>

      <div className="space-y-3">
        {appointmentsToShow.map((appointment, index) => {
          // ตรวจสอบข้อมูลพื้นฐาน
          if (!appointment || !appointment.APP_DATE) {
            return (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">ข้อมูลการนัดไม่ครบถ้วน</p>
              </div>
            );
          }
          
          const urgent = isUrgent(appointment.APP_DATE);
          const daysUntil = getDaysUntil(appointment.APP_DATE);
          
          return (
            <div 
              key={index}
              className={`rounded-lg p-4 border-2 ${
                urgent 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {/* HN และชื่อ */}
              <div className="flex items-center gap-2 mb-3">
                <FaUserMd className={`w-4 h-4 ${urgent ? 'text-orange-600' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    HN: {appointment.hn || 'ไม่ระบุ'}
                  </span>
                  <div className="text-xs text-gray-600 mt-1">
                    {appointment.fullname || 'ไม่ระบุชื่อ'}
                  </div>
                </div>
                {urgent && (
                  <div className="badge badge-warning badge-sm">
                    ใกล้ถึงกำหนด
                  </div>
                )}
              </div>

              {/* วันที่นัด */}
              <div className="flex items-center gap-2 mb-2">
                <FaCalendarAlt className={`w-4 h-4 ${urgent ? 'text-orange-600' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <div className={`font-bold ${urgent ? 'text-orange-700' : 'text-blue-700'}`}>
                    {formatDate(appointment.APP_DATE)}
                  </div>
                  <div className="text-xs text-gray-600">
                    {daysUntil}
                  </div>
                </div>
              </div>

              {/* เวลานัด */}
              <div className="flex items-center gap-2">
                <FaClock className={`w-4 h-4 ${urgent ? 'text-orange-600' : 'text-blue-600'}`} />
                <span className={`font-semibold ${urgent ? 'text-orange-700' : 'text-blue-700'}`}>
                  เวลา {appointment.APP_TIME || 'ไม่ระบุ'} น.
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!showAll && appointments.length > 1 && (
        <div className="text-center mt-3">
          <div className="text-xs text-gray-600">
            มีการนัดหมายทั้งหมด {appointments.length} ครั้ง
          </div>
        </div>
      )}
    </div>
  );
};

export default NextAppointment;