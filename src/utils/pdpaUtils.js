// PDPA - Personal Data Protection Act Utilities
// ฟังก์ชันสำหรับปิดบังข้อมูลส่วนบุคคลเพื่อการปฏิบัติตาม PDPA

/**
 * ปิดบังเลขบัตรประชาชนให้เหลือเฉพาะ 4 หลักแรกและ 1 หลักสุดท้าย
 * @param {string} nationalId - เลขบัตรประชาชน 13 หลัก
 * @returns {string} - เลขบัตรที่ปิดบังแล้ว เช่น 1234-XXXXX-XXX-1
 */
export const maskNationalId = (nationalId) => {
  if (!nationalId || typeof nationalId !== 'string') {
    return '***-***-***-*';
  }
  
  // ลบ - ออกและเอาเฉพาะตัวเลข
  const cleanId = nationalId.replace(/[^0-9]/g, '');
  
  if (cleanId.length !== 13) {
    return '***-***-***-*';
  }
  
  // แสดงเฉพาะ 4 หลักแรกและ 1 หลักสุดท้าย
  const first4 = cleanId.substring(0, 4);
  const last1 = cleanId.substring(12, 13);
  
  return `${first4}-XXXXX-XXX-${last1}`;
};

/**
 * ปิดบังเบอร์โทรศัพท์ให้เหลือเฉพาะ 3 หลักแรกและ 2 หลักสุดท้าย
 * @param {string} phoneNumber - เบอร์โทรศัพท์
 * @returns {string} - เบอร์โทรที่ปิดบังแล้ว เช่น 081-XXX-XX12
 */
export const maskPhoneNumber = (phoneNumber) => {
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return 'XXX-XXX-XXXX';
  }
  
  // ลบอักขระที่ไม่ใช่ตัวเลขออก
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  
  if (cleanPhone.length < 5) {
    return 'XXX-XXX-XXXX';
  }
  
  if (cleanPhone.length === 10) {
    // เบอร์มือถือ 10 หลัก
    const first3 = cleanPhone.substring(0, 3);
    const last2 = cleanPhone.substring(8, 10);
    return `${first3}-XXX-XX${last2}`;
  } else if (cleanPhone.length === 9) {
    // เบอร์บ้าน 9 หลัก
    const first2 = cleanPhone.substring(0, 2);
    const last2 = cleanPhone.substring(7, 9);
    return `${first2}-XXX-XX${last2}`;
  }
  
  // สำหรับเบอร์อื่นๆ
  const first3 = cleanPhone.substring(0, 3);
  const last2 = cleanPhone.substring(-2);
  return `${first3}-XXX-XX${last2}`;
};

/**
 * ตรวจสอบว่าควรแสดงข้อมูลแบบปิดบังหรือไม่
 * @param {boolean} isOwner - ผู้ใช้เป็นเจ้าของข้อมูลหรือไม่
 * @param {string} userRole - บทบาทของผู้ใช้ (admin, user, etc.)
 * @returns {boolean} - ควรปิดบังหรือไม่
 */
export const shouldMaskPersonalData = (isOwner = false, userRole = 'user') => {
  // Admin หรือเจ้าของข้อมูลสามารถเห็นข้อมูลเต็มได้
  return !(userRole === 'admin' || isOwner);
};