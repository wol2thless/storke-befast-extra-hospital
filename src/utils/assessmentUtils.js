/**
 * Utility functions for assessment tracking and reminders
 */

/**
 * คำนวณจำนวนวันที่ผ่านไปตั้งแต่วันที่ระบุ
 * @param {string} dateString - วันที่ในรูปแบบ ISO string
 * @returns {number} - จำนวนวันที่ผ่านไป
 */
export const calculateDaysSince = (dateString) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('Error calculating days:', error);
    return null;
  }
};

/**
 * แปลงวันที่เป็นข้อความแสดงผลแบบไทย
 * @param {string} dateString - วันที่ในรูปแบบ ISO string
 * @returns {string} - วันที่แบบไทย
 */
export const formatThaiDate = (dateString) => {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return '-';
  }
};

/**
 * กำหนดระดับความเร่งด่วนตามจำนวนวัน (มาตรฐานเดียวกันทั้งหมด)
 * @param {number} days - จำนวนวันที่ผ่านไป
 * @returns {object} - { level: 'info'|'warning'|'critical', color, message }
 *
 * เกณฑ์การแจ้งเตือน:
 * - 0-3 วัน: สีเขียว - ยังอยู่ในเกณฑ์ปกติ
 * - มากกว่า 3 วัน: สีเหลือง - ควรทำเร็วๆ นี้
 * - มากกว่า 7 วัน หรือ ยังไม่เคยทำ: สีแดง - จำเป็นต้องทำด่วน
 */
export const getUrgencyLevel = (days) => {
  // ยังไม่เคยทำเลย = สีแดง (เหมือนกับมากกว่า 7 วัน)
  if (days === null || days === undefined) {
    return {
      level: 'critical',
      color: 'error',
      badgeColor: 'badge-error',
      alertColor: 'alert-error',
      message: 'ยังไม่เคยทำแบบประเมิน - จำเป็นต้องทำด่วน!'
    };
  }

  // 0-3 วัน = สีเขียว (ปกติ)
  if (days <= 3) {
    return {
      level: 'info',
      color: 'success',
      badgeColor: 'badge-success',
      alertColor: 'alert-success',
      message: days === 0
        ? 'ทำแบบประเมินวันนี้แล้ว'
        : `ทำล่าสุดเมื่อ ${days} วันที่แล้ว`
    };
  }

  // มากกว่า 3 วัน แต่ไม่เกิน 7 วัน = สีเหลือง (ควรทำ)
  if (days <= 7) {
    return {
      level: 'warning',
      color: 'warning',
      badgeColor: 'badge-warning',
      alertColor: 'alert-warning',
      message: `ไม่ได้ทำมา ${days} วันแล้ว - ควรทำเร็วๆ นี้`
    };
  }

  // มากกว่า 7 วัน = สีแดง (ด่วน)
  return {
    level: 'critical',
    color: 'error',
    badgeColor: 'badge-error',
    alertColor: 'alert-error',
    message: `ไม่ได้ทำมา ${days} วันแล้ว - จำเป็นต้องทำด่วน!`
  };
};

/**
 * แบบประเมินทั้งหมดในระบบ
 */
export const ASSESSMENT_TYPES = {
  ADL: {
    id: 'adl',
    name: 'แบบประเมิน ADL',
    description: 'ประเมินความสามารถในการทำกิจวัตรประจำวัน',
    tableName: 'stk_adl_assessments',
    dateField: 'created_at',
    warningDays: 30,
    criticalDays: 60,
    route: '/adl-assessment-history'
  },
  BEFAST: {
    id: 'befast',
    name: 'แบบประเมิน BEFAST',
    description: 'ประเมินอาการโรคหลอดเลือดสมอง',
    tableName: 'stk_health_record_befast',
    dateField: 'created_at',
    warningDays: 30,
    criticalDays: 60,
    route: '/befast-history'
  },
  SATISFACTION: {
    id: 'satisfaction',
    name: 'แบบสำรวจความพึงพอใจ',
    description: 'ประเมินความพึงพอใจในการดูแลรักษา',
    tableName: 'stk_satisfaction_survey',
    dateField: 'created_at',
    warningDays: 90,
    criticalDays: 180,
    route: '/satisfaction-survey-detail'
  },
  HEALTH_BEHAVIOR: {
    id: 'health_behavior',
    name: 'พฤติกรรมสุขภาพ',
    description: 'บันทึกพฤติกรรมการดูแลสุขภาพ',
    tableName: 'stk_health_behavior',
    dateField: 'created_at',
    warningDays: 7,
    criticalDays: 14,
    route: '/health-behavior-detail'
  },
  EXERCISE: {
    id: 'exercise',
    name: 'บันทึกการออกกำลังกาย',
    description: 'บันทึกการออกกำลังกาย',
    tableName: 'stk_exercise_records',
    dateField: 'created_at',
    warningDays: 3,
    criticalDays: 7,
    route: '/exercise-records/detail'
  },
  MEDICATION: {
    id: 'medication',
    name: 'บันทึกการรับประทานยา',
    description: 'บันทึกการรับประทานยา',
    tableName: 'stk_medication_records',
    dateField: 'created_at',
    warningDays: 1,
    criticalDays: 3,
    route: '/medication-records/detail'
  },
  NUTRITION: {
    id: 'nutrition',
    name: 'บันทึกโภชนาการ',
    description: 'บันทึกการรับประทานอาหาร',
    tableName: 'stk_nutrition_records',
    dateField: 'created_at',
    warningDays: 7,
    criticalDays: 14,
    route: '/nutrition-records/detail'
  }
};

/**
 * สร้างข้อความสรุปสถานะแบบประเมิน
 * @param {object} assessmentStatus - สถานะแบบประเมินทั้งหมด
 * @returns {object} - { total, upToDate, warning, critical }
 */
export const getSummaryStatus = (assessmentStatus) => {
  const summary = {
    total: 0,
    upToDate: 0,
    warning: 0,
    critical: 0
  };

  Object.values(assessmentStatus || {}).forEach(status => {
    summary.total++;
    if (status.urgency.level === 'info') summary.upToDate++;
    if (status.urgency.level === 'warning') summary.warning++;
    if (status.urgency.level === 'critical') summary.critical++;
  });

  return summary;
};
