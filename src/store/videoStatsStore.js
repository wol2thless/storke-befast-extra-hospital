import { create } from "zustand";
import api from "@utils/api";

export const useVideoStatsStore = create((set) => ({
  stats: [],
  loading: false,
  error: null,
  getVideoStats: async (videoId = null, pid = null) => {
    set({ loading: true, error: null });
    try {
      let url = `/video_view_stats.php`;
      const params = [];

      if (videoId) {
        params.push(`video_id=${videoId}`);
      }

      if (pid) {
        params.push(`pid=${pid}`);
      }

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await api.get(url);
      if (res.data.success) {
        set({ stats: res.data.data, loading: false });
        return { success: true, data: res.data.data };
      } else {
        set({ error: res.data.message, loading: false });
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      set({ error: err?.message || "API error", loading: false });
      return { success: false, message: err?.message || "API error" };
    }
  },
  logVideoView: async (pid, videoId) => {
    try {
      const res = await api.post(`/video_view_log.php`, {
        pid,
        video_id: videoId,
      });
      return res.data;
    } catch (err) {
      return { success: false, message: err?.message || "API error" };
    }
  },
  getVideoViewLog: async (pid) => {
    try {
      const res = await api.post(`/video_view_log.php`, { pid });
      if (res.data && res.data.success) {
        return { success: true, data: res.data.data };
      } else {
        return { success: false, message: res.data.message };
      }
    } catch (err) {
      return { success: false, message: err?.message || "API error" };
    }
  },
}));
