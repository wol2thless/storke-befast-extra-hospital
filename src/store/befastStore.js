import api from "@utils/api";
import { create } from "zustand";

export const useBefastStore = create((set) => ({
  befastRecords: [],
  saveBefast: async (data) => {
    try {
      const res = await api.post(
        "/befast_create.php",
        data
      );
      if (res.data.success && res.data.data) {
        set((state) => ({ befastRecords: [res.data.data, ...state.befastRecords] }));
      }
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },
  // Optional: fetch all records for a pid
  getBefasts: async (pid) => {
    try {
      const res = await api.get(
        `/befast_get.php?pid=${encodeURIComponent(pid)}`
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        set({ befastRecords: res.data.data });
      }
      return res.data;
    } catch (err) {
      return {
        success: false,
        message: err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },
}));
