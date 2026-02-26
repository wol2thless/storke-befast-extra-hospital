import api from "@utils/api";
import { create } from "zustand";

export const usePersonInfoStore = create((set) => ({
  personInfo: null,
  setPersonInfo: (info) => set({ personInfo: info }),
  savePersonInfo: async (info) => {
    try {
      const res = await api.post(
        "/personinfo_create.php",
        info
      );
      set({ personInfo: info });
      return { success: true, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },

  getPersonInfo: async (pid) => {
    try {
      const res = await api.get(
        `/personinfo_get.php?pid=${encodeURIComponent(pid)}`
      );
      if (res.data.success && res.data.data) {
        set({ personInfo: res.data.data });
        return { success: true, data: res.data.data };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      return {
        success: false,
        message:
          err?.response?.data?.message || err.message || "เกิดข้อผิดพลาด",
      };
    }
  },
}));
