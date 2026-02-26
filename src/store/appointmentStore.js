import { create } from 'zustand';
import axios from 'axios';

const useAppointmentStore = create((set, get) => ({
  // State
  appointments: [],
  loading: false,
  error: null,
  
  // Actions
  fetchAppointments: async (pid) => {
    if (!pid) {
      set({ error: 'ไม่พบเลขบัตรประชาชน' });
      return;
    }

    set({ loading: true, error: null });
    
    try {
      // Use different endpoint based on environment
      const apiUrl = import.meta.env.DEV
        ? '/api/appointment/get_pmk_utable.php'  // Development: use Vite proxy
        : `${import.meta.env.VITE_API_BASE_URL}/appointment_proxy.php`;  // Production: use full URL proxy

      const response = await axios.post(
        apiUrl,
        { pid: pid },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      
      if (response.data && Array.isArray(response.data)) {
        
        // Sort appointments by date (earliest first)
        const sortedAppointments = response.data.sort((a, b) => {
          const dateA = new Date(a.APP_DATE.split('/').reverse().join('-'));
          const dateB = new Date(b.APP_DATE.split('/').reverse().join('-'));
          return dateA - dateB;
        });
        
        
        set({ 
          appointments: sortedAppointments, 
          loading: false, 
          error: null 
        });
      } else {
        set({ 
          appointments: [], 
          loading: false, 
          error: response.data ? 'ไม่พบข้อมูลการนัด' : null 
        });
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('API URL used:', import.meta.env.DEV
        ? '/api/appointment/get_pmk_utable.php'
        : `${import.meta.env.VITE_API_BASE_URL}/appointment_proxy.php`);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      set({ 
        appointments: [], 
        loading: false, 
        error: `ไม่สามารถดึงข้อมูลการนัดได้: ${error.message}` 
      });
    }
  },

  // Get next upcoming appointment
  getNextAppointment: () => {
    const { appointments } = get();
    const now = new Date();
    
    const upcomingAppointments = appointments.filter(appointment => {
      // ตรวจสอบว่า APP_DATE มีข้อมูลและเป็น string
      if (!appointment?.APP_DATE || typeof appointment.APP_DATE !== 'string') {
        return false;
      }
      
      try {
        const appointmentDate = new Date(appointment.APP_DATE.split('/').reverse().join('-'));
        return appointmentDate >= now;
      } catch (error) {
        console.error('Error parsing appointment date:', appointment.APP_DATE, error);
        return false;
      }
    });
    
    return upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
  },

  // Clear appointments
  clearAppointments: () => set({ appointments: [], error: null }),
  
  // Set error
  setError: (error) => set({ error }),
  
  // Clear error
  clearError: () => set({ error: null }),
}));

export default useAppointmentStore;