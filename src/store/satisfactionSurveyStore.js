import { create } from "zustand";
import api from "@utils/api";

const useSatisfactionSurveyStore = create((set) => ({
  surveys: [],
  loading: false,
  error: null,

  fetchSurveys: async (pid) => {
    if (!pid) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/satisfaction_survey_get.php?pid=${pid}`);
      if (res.data.success) {
        set({ surveys: res.data.surveys || [], loading: false });
      } else {
        set({ error: res.data.message || "เกิดข้อผิดพลาด", loading: false });
      }
    } catch (error) {
      set({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อ", loading: false });
    }
  },

  saveSurvey: async (surveyData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/satisfaction_survey_create.php", surveyData);
      set({ loading: false });
      return res.data;
    } catch (error) {
      set({ error: "เกิดข้อผิดพลาดในการเชื่อมต่อ", loading: false });
      return { success: false, message: "เกิดข้อผิดพลาดในการเชื่อมต่อ" };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useSatisfactionSurveyStore;
