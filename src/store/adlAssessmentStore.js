import api from "@utils/api";
import { create } from "zustand";

export const useADLAssessmentStore = create((set) => ({
  assessments: [],
  setAssessments: (data) => set({ assessments: Array.isArray(data) ? data : Object.values(data) }),

  fetchAssessments: async (patientId) => {
    try {
      const res = await api.get(
        `/adl_assessment_get.php?patient_id=${encodeURIComponent(patientId)}`
      );

      if (res.data.success) {
        // res.data.assessments อาจเป็น object ต้องแปลงเป็น array
        const arr = Array.isArray(res.data.assessments)
          ? res.data.assessments
          : Object.values(res.data.assessments);
        set({ assessments: arr });
        return { success: true, assessments: arr };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      console.error("API Error:", err);
      return {
        success: false,
        message:
          err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },

  saveAssessment: async (data) => {
    try {

      const res = await api.post(
        "/adl_assessment_create.php",
        data
      );
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },
}));
