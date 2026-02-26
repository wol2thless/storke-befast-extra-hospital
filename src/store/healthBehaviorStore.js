import { create } from "zustand";
import api from "@utils/api";

const useHealthBehaviorStore = create((set) => ({
  records: [],
  loading: false,
  error: null,

  fetchRecords: async (pid) => {
    if (!pid) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/health_behavior_get.php?pid=${pid}`);
      if (res.data.success) {
        set({ records: res.data.records || [], loading: false });
      } else {
        set({ error: res.data.message || "เกิดข้อผิดพลาด", loading: false });
      }
    } catch (error) {
      set({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อ", loading: false });
    }
  },

  saveRecord: async (recordData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/health_behavior_create.php", recordData);
      set({ loading: false });
      return res.data;
    } catch (error) {
      set({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อ", loading: false });
      return { success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useHealthBehaviorStore;
