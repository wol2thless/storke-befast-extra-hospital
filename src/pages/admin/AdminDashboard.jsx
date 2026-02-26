import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FaUsers, FaSearch, FaEye, FaCalendarAlt, FaPhone } from 'react-icons/fa';
import { useAdminStore } from '@store/adminStore';
import { maskNationalId, maskPhoneNumber } from '../../utils/pdpaUtils';
import { createSafePatientUrl } from '../../utils/urlUtils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { 
    patients, 
    getAllPatients, 
    setSelectedPatient, 
    loading, 
    error, 
    adminUser 
  } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('last_activity_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activityFilter, setActivityFilter] = useState('all');

  useEffect(() => {
    getAllPatients();
  }, [getAllPatients]);

  // Filter and sort patients
  const filteredAndSortedPatients = patients
    .filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        patient.full_name.toLowerCase().includes(searchLower) ||
        patient.national_id.includes(searchTerm) ||
        patient.tel.includes(searchTerm);
      
      if (activityFilter === 'all') return matchesSearch;
      if (activityFilter === 'active') return matchesSearch && patient.total_activities > 0;
      if (activityFilter === 'inactive') return matchesSearch && patient.total_activities === 0;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'last_activity_date') {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    navigate(createSafePatientUrl(patient.national_id));
  };

  // ฟังก์ชันสำหรับโทรออก
  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'ไม่มีข้อมูล';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  if (loading && patients.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* Header - Mobile First */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-base-content mb-2">
          ข้อมูลผู้ป่วย
        </h1>
        <p className="text-base-content/70 text-sm mb-3">
          จัดการและติดตามข้อมูลผู้ป่วย
        </p>
        {adminUser && (
          <p className="text-xs text-base-content/60 mb-4">
            {adminUser.name} ({adminUser.role})
          </p>
        )}
        
        {/* Patient Count Card */}
        <div className="bg-primary rounded-lg p-4 text-primary-content mb-4">
          <div className="flex items-center">
            <FaUsers className="w-6 h-6 mr-3" />
            <div>
              <div className="text-sm opacity-90">ผู้ป่วยทั้งหมด</div>
              <div className="text-2xl font-bold">{patients.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error mb-6">
          <span>{error}</span>
        </div>
      )}

      {/* Search - Mobile Optimized */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="ค้นหา ชื่อ, เลขบัตร, เบอร์โทร"
            className="input input-bordered w-full pl-10 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" />
        </div>
      </div>

      {/* Filters - Mobile Compact */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <select 
          className="select select-bordered select-sm"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="registered_date">วันที่ลงทะเบียน</option>
          <option value="full_name">ชื่อ</option>
        </select>
        
        <select 
          className="select select-bordered select-sm"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">ใหม่ไปเก่า</option>
          <option value="asc">เก่าไปใหม่</option>
        </select>
      </div>

      {/* Patients List - Mobile Card Layout */}
      <div className="space-y-3">
        {loading && filteredAndSortedPatients.length === 0 ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        ) : filteredAndSortedPatients.length === 0 ? (
          <div className="text-center py-8 text-base-content/60">
            ไม่พบข้อมูลผู้ป่วย
          </div>
        ) : (
          filteredAndSortedPatients.map((patient) => (
            <div 
              key={patient.national_id} 
              className="bg-base-100 rounded-lg shadow p-4 border border-base-300"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-base text-base-content">
                    {patient.full_name}
                  </h3>
                  <p className="text-sm text-base-content/60">
                    {patient.gender === 'M' || patient.gender === 'ชาย' ? 'ชาย' : 'หญิง'}
                  </p>
                </div>
                <div className="flex gap-2">
                  {patient.tel && (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleCall(patient.tel)}
                      title="โทรออก"
                    >
                      <FaPhone className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleViewPatient(patient)}
                  >
                    <FaEye className="w-4 h-4" />
                    ดู
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-base-content/60 w-16">บัตร:</span>
                  <span className="font-mono text-base-content">{maskNationalId(patient.national_id)}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-base-content/60 w-16">โทร:</span>
                  <span className="text-base-content">{patient.tel ? maskPhoneNumber(patient.tel) : 'ไม่มีข้อมูล'}</span>
                </div>
                
                <div className="flex items-center">
                  <span className="text-base-content/60 w-16">ลงทะเบียน:</span>
                  <span className="text-base-content text-xs">
                    {formatDate(patient.registered_date)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;