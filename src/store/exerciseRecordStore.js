import api from "@utils/api";
import { create } from "zustand";

export const useExerciseRecordStore = create((set) => ({
  records: [],
  setRecords: (data) => set({ records: Array.isArray(data) ? data : [] }),

  fetchRecords: async (pid) => {
    try {
      const res = await api.get(
        `/exercise_record_get.php?pid=${encodeURIComponent(pid)}`
      );
      if (res.data.success) {
        set({ records: res.data.records });
        return { success: true, records: res.data.records };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },

  saveRecord: async (data) => {
    try {
      const res = await api.post(
        "/exercise_record_create.php",
        data
      );
      return { success: res.data.success, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },
}));
