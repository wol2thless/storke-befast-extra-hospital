import { create } from 'zustand';
import api from '@utils/api';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'stroke-admin-key';

const encrypt = (data) => CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

export const useAdminStore = create((set, get) => ({
  // Admin Authentication State
  isAuthenticated: false,
  adminUser: null,
  loading: false,
  error: null,

  // Patient Data State
  patients: [],
  selectedPatient: null,
  patientActivities: [],
  patientStats: null,

  // Dashboard Statistics State
  dashboardStats: null,

  // Admin Authentication Methods
  adminLogin: async (providerId, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/admin_login.php`, {
        provider_id: providerId,
        password: password
      });

      if (response.data.success) {
        const { admin_data } = response.data;
        const expiresAt = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
        
        // Store admin session
        localStorage.setItem('admin_token', encrypt(response.data.token));
        localStorage.setItem('admin_user', encrypt(admin_data));
        localStorage.setItem('admin_expires_at', encrypt(expiresAt));
        
        set({ 
          isAuthenticated: true, 
          adminUser: admin_data,
          loading: false 
        });
        
        return { success: true };
      } else {
        set({ loading: false, error: response.data.message || 'Login failed' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  adminLogout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_expires_at');
    set({ 
      isAuthenticated: false, 
      adminUser: null, 
      patients: [],
      selectedPatient: null,
      patientActivities: [],
      patientStats: null
    });
  },

  checkAdminAuth: () => {
    const encryptedToken = localStorage.getItem('admin_token');
    const encryptedUser = localStorage.getItem('admin_user');
    const encryptedExpires = localStorage.getItem('admin_expires_at');
    
    if (encryptedToken && encryptedUser && encryptedExpires) {
      const expiresAt = decrypt(encryptedExpires);
      const adminUser = decrypt(encryptedUser);
      
      if (expiresAt && Date.now() < expiresAt && adminUser) {
        set({ isAuthenticated: true, adminUser });
        return true;
      }
    }
    
    // Clear invalid session
    get().adminLogout();
    return false;
  },

  // Patient Management Methods
  getAllPatients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/admin_patients_list.php`);

      if (response.data.success) {
        set({ 
          patients: response.data.patients || [],
          loading: false 
        });
      } else {
        set({ loading: false, error: response.data.message || 'Failed to fetch patients' });
      }
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Network error' });
    }
  },

  getPatientActivities: async (nationalId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/admin_patient_activities.php?national_id=${nationalId}`);

      if (response.data.success) {
        set({ 
          patientActivities: response.data.activities || [],
          patientStats: response.data.stats || null,
          loading: false 
        });
      } else {
        set({ loading: false, error: response.data.message || 'Failed to fetch patient activities' });
      }
    } catch (error) {
      set({ loading: false, error: error.response?.data?.message || 'Network error' });
    }
  },

  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  clearError: () => {
    set({ error: null });
  },

  // Dashboard Statistics Methods
  getDashboardStats: async (selectedMonth = null) => {
    set({ loading: true, error: null });
    try {
      const url = selectedMonth
        ? `/admin_dashboard_stats.php?month=${selectedMonth}`
        : `/admin_dashboard_stats.php`;

      const response = await api.get(url);



      if (response.data.success) {
        set({
          dashboardStats: response.data.data,
          loading: false
        });
        return { success: true, data: response.data.data };
      } else {
        set({ loading: false, error: response.data.message || 'Failed to fetch dashboard stats' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // User Management Methods
  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const encryptedToken = localStorage.getItem('admin_token');
      const token = decrypt(encryptedToken);

      if (!token) {
        set({ loading: false, error: 'ไม่พบ token การเข้าสู่ระบบ' });
        return { success: false, error: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      const response = await api.post(`/admin_create_user.php`, {
        ...userData,
        admin_token: token
      });

      if (response.data.success) {
        set({ loading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ loading: false, error: response.data.message || 'Failed to create user' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Check if current user has admin role
  isAdmin: () => {
    const { adminUser } = get();
    return adminUser?.role === 'admin';
  },

  // Get all admin users
  getAllUsers: async () => {
    set({ loading: true, error: null });
    try {
      const encryptedToken = localStorage.getItem('admin_token');
      const token = decrypt(encryptedToken);

      if (!token) {
        set({ loading: false, error: 'ไม่พบ token การเข้าสู่ระบบ' });
        return { success: false, error: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      const response = await api.post(`/admin_users_list.php`, {
        admin_token: token
      });

      if (response.data.success) {
        set({ loading: false });
        return { success: true, data: response.data.data };
      } else {
        set({ loading: false, error: response.data.message || 'Failed to fetch users' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Update admin user
  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const encryptedToken = localStorage.getItem('admin_token');
      const token = decrypt(encryptedToken);

      if (!token) {
        set({ loading: false, error: 'ไม่พบ token การเข้าสู่ระบบ' });
        return { success: false, error: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      const response = await api.post(`/admin_user_update.php`, {
        user_id: userId,
        ...userData,
        admin_token: token
      });

      if (response.data.success) {
        set({ loading: false });
        return { success: true, data: response.data.data, message: response.data.message };
      } else {
        set({ loading: false, error: response.data.message || 'Failed to update user' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Soft delete admin user
  deleteUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const encryptedToken = localStorage.getItem('admin_token');
      const token = decrypt(encryptedToken);

      if (!token) {
        set({ loading: false, error: 'ไม่พบ token การเข้าสู่ระบบ' });
        return { success: false, error: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      const response = await api.post(`/admin_user_delete.php`, {
        user_id: userId,
        admin_token: token
      });

      if (response.data.success) {
        set({ loading: false });
        return { success: true, message: response.data.message };
      } else {
        set({ loading: false, error: response.data.message || 'Failed to delete user' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Restore soft deleted user
  restoreUser: async (userId) => {
    set({ loading: true, error: null });
    try {
      const encryptedToken = localStorage.getItem('admin_token');
      const token = decrypt(encryptedToken);

      if (!token) {
        set({ loading: false, error: 'ไม่พบ token การเข้าสู่ระบบ' });
        return { success: false, error: 'ไม่พบ token การเข้าสู่ระบบ' };
      }

      const response = await api.post(`/admin_user_restore.php`, {
        user_id: userId,
        admin_token: token
      });

      if (response.data.success) {
        set({ loading: false });
        return { success: true, message: response.data.message };
      } else {
        set({ loading: false, error: response.data.message || 'Failed to restore user' });
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
}));