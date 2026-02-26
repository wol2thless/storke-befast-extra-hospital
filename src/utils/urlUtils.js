import CryptoJS from 'crypto-js';

const URL_SECRET_KEY = "stroke-url-safety-key-2024";

/**
 * เข้ารหัส PID สำหรับใช้ใน URL
 * @param {string} pid - เลขบัตรประชาชน 13 หลัก
 * @returns {string} - รหัสที่เข้ารหัสแล้วสำหรับ URL
 */
export const encodePidForUrl = (pid) => {
  if (!pid) return '';
  
  try {
    // เข้ารหัสด้วย AES
    const encrypted = CryptoJS.AES.encrypt(pid, URL_SECRET_KEY).toString();
    
    // แปลงให้เป็น URL-safe โดยแทนที่อักขระที่ไม่ปลอดภัย
    const urlSafe = encrypted
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    return urlSafe;
  } catch (error) {
    console.error('Error encoding PID for URL:', error);
    return '';
  }
};

/**
 * ถอดรหัส PID จาก URL parameter
 * @param {string} encodedPid - รหัสที่เข้ารหัสแล้วจาก URL
 * @returns {string} - เลขบัตรประชาชนที่ถอดรหัสแล้ว
 */
export const decodePidFromUrl = (encodedPid) => {
  if (!encodedPid) return '';
  
  try {
    // แปลงกลับจาก URL-safe format
    let base64 = encodedPid
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // เติม padding ถ้าจำเป็น
    while (base64.length % 4) {
      base64 += '=';
    }
    
    // ถอดรหัส
    const decrypted = CryptoJS.AES.decrypt(base64, URL_SECRET_KEY);
    const pid = decrypted.toString(CryptoJS.enc.Utf8);
    
    // ตรวจสอบว่าเป็นเลขบัตรประชาชน 13 หลักหรือไม่
    if (pid && /^\d{13}$/.test(pid)) {
      return pid;
    }
    
    return '';
  } catch (error) {
    console.error('Error decoding PID from URL:', error);
    return '';
  }
};

/**
 * สร้าง URL ที่ปลอดภัยสำหรับหน้า patient detail
 * @param {string} pid - เลขบัตรประชาชน
 * @returns {string} - URL ที่เข้ารหัสแล้ว
 */
export const createSafePatientUrl = (pid) => {
  const encodedPid = encodePidForUrl(pid);
  return `/admin/patient/${encodedPid}`;
};

/**
 * สร้าง URL ที่ปลอดภัยสำหรับหน้า video stats
 * @param {string} pid - เลขบัตรประชาชน
 * @returns {string} - URL ที่เข้ารหัสแล้ว
 */
export const createSafeVideoStatsUrl = (pid) => {
  const encodedPid = encodePidForUrl(pid);
  return `/admin/patient/${encodedPid}/video-stats`;
};