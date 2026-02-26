import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { FaArrowLeft, FaUser, FaPhone } from 'react-icons/fa';
import { useAdminStore } from '@store/adminStore';
import { maskNationalId, maskPhoneNumber } from '../../utils/pdpaUtils';
import { decodePidFromUrl, createSafeVideoStatsUrl } from '../../utils/urlUtils';

// Import existing components from Homepage
import BEFASTSummary from "../../components/BEFASTSummary";
import StrokeVideoStatsDetail from "../../components/StrokeVideoStatsDetail";
import ADLAssessmentLatest from "../../components/ADLAssessmentLatest";
import ExerciseRecordLatest from "../../components/ExerciseRecordLatest";
import NutritionRecordLatest from "../../components/NutritionRecordLatest";
import MedicationRecordLatest from "../../components/MedicationRecordLatest";
import HealthBehaviorLatest from "../../components/HealthBehaviorLatest";
import SatisfactionSurveyLatest from "../../components/SatisfactionSurveyLatest";
import NextAppointment from "../../components/NextAppointment";

const PatientDetail = () => {
  const { nationalId: encodedNationalId } = useParams();
  const navigate = useNavigate();
  const { selectedPatient, getAllPatients, patients } = useAdminStore();
  const [patientInfo, setPatientInfo] = useState(null);
  
  // ถอดรหัส PID จาก URL parameter หรือใช้ nationalId ตรงๆ ถ้าไม่ได้เข้ารหัส
  let nationalId = decodePidFromUrl(encodedNationalId);
  
  // ถ้าถอดรหัสไม่ได้ ให้ลองใช้ค่าจาก URL ตรงๆ (กรณีที่ไม่ได้เข้ารหัส)
  if (!nationalId && encodedNationalId) {
    // ตรวจสอบว่าเป็นเลขบัตรประชาชน 13 หลักหรือไม่
    if (/^\d{13}$/.test(encodedNationalId)) {
      nationalId = encodedNationalId;
    }
  }

  // ฟังก์ชันสำหรับโทรออก
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  useEffect(() => {
    // ถ้าไม่มี selectedPatient ให้ดึงข้อมูลผู้ป่วยทั้งหมดแล้วหาคนที่ต้องการ
    if (!selectedPatient && nationalId) {
      getAllPatients();
    }
  }, [nationalId, selectedPatient, getAllPatients]);

  useEffect(() => {
    // หาข้อมูลผู้ป่วยจาก patients list
    if (nationalId && patients.length > 0) {
      const patient = patients.find(p => p.national_id === nationalId);
      if (patient) {
        setPatientInfo(patient);
      }
    }
  }, [nationalId, patients]);

  // ตรวจสอบ PID ที่ถอดรหัสแล้ว
  if (!nationalId) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="text-center py-8">
          <h1 className="text-xl font-bold text-error mb-2">ข้อมูลไม่ถูกต้อง</h1>
          <p className="text-gray-600 mb-4">ไม่สามารถระบุผู้ป่วยได้</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/admin/dashboard')}
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // ใช้ข้อมูลจาก selectedPatient หรือ patientInfo
  const currentPatient = selectedPatient || patientInfo;

  if (!currentPatient) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header - Mobile */}
      <div className="mb-6">
        <button
          className="btn btn-ghost btn-sm mb-4 -ml-2"
          onClick={() => navigate('/admin/dashboard')}
        >
          <FaArrowLeft className="w-4 h-4" />
          กลับ
        </button>
        <h1 className="text-2xl font-bold text-base-content mb-2">
          ประวัติผู้ป่วย
        </h1>
        <p className="text-base-content/70 text-sm">
          ข้อมูลและกิจกรรมของผู้ป่วย
        </p>
      </div>

      {/* Patient Info Card - Mobile */}
      <div className="bg-primary rounded-lg p-4 text-primary-content mb-6">
        <div className="flex items-center mb-4">
          <div className="avatar placeholder mr-3">
            <div className="bg-primary-content text-primary rounded-full w-12 h-12">
              <FaUser className="w-6 h-6" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{currentPatient.full_name}</h2>
            <p className="text-sm opacity-90">
              {currentPatient.gender === 'M' || currentPatient.gender === 'ชาย' ? 'ชาย' : 'หญิง'}
            </p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex">
            <span className="opacity-90 w-20">บัตร:</span>
            <span className="font-mono">{maskNationalId(currentPatient.national_id)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex">
              <span className="opacity-90 w-20">โทร:</span>
              <span>{currentPatient.tel ? maskPhoneNumber(currentPatient.tel) : 'ไม่มีข้อมูล'}</span>
            </div>
            {currentPatient.tel && (
              <button
                className="btn btn-sm btn-circle bg-primary-content text-primary hover:bg-primary-content/90"
                onClick={() => handleCall(currentPatient.tel)}
                title="โทรออก"
              >
                <FaPhone className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex">
            <span className="opacity-90 w-20">ลงทะเบียน:</span>
            <span>{new Date(currentPatient.registered_date).toLocaleDateString('th-TH')}</span>
          </div>
        </div>
      </div>

      {/* Patient Activities - Mobile Layout */}
      <div className="space-y-4">
        {/* BEFAST Summary */}
        <BEFASTSummary pid={nationalId} isAdminView={true} />
        
        {/* Next Appointment */}
        <NextAppointment pid={nationalId} isAdminView={true} />
        
        {/* ADL Assessment Latest */}
        <ADLAssessmentLatest pid={nationalId} isAdminView={true} />

        {/* Video Stats */}
        <div className="bg-base-100 rounded-lg shadow p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-primary">
              สถิติผลลัพธ์การเรียนรู้
            </h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(createSafeVideoStatsUrl(nationalId))}
            >
              ดูรายละเอียด
            </button>
          </div>
          <StrokeVideoStatsDetail summaryOnly pid={nationalId} />
        </div>

        {/* Nutrition Record Latest */}
        <NutritionRecordLatest pid={nationalId} isAdminView={true} />
        
        {/* Exercise Record Latest */}
        <ExerciseRecordLatest pid={nationalId} isAdminView={true} />
        
        {/* Medication Record Latest */}
        <MedicationRecordLatest pid={nationalId} isAdminView={true} />
        
        {/* Health Behavior Latest */}
        <HealthBehaviorLatest pid={nationalId} isAdminView={true} />
        
        {/* Satisfaction Survey Latest */}
        <SatisfactionSurveyLatest pid={nationalId} isAdminView={true} />
      </div>
    </div>
  );
};

export default PatientDetail;