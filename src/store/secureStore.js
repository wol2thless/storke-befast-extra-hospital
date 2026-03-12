import { create } from 'zustand';
import { encrypt, decrypt } from '@utils/crypto';

export const useSecureStore = create((set) => ({
  secureSet: (key, value) => {
    const encrypted = encrypt(value);
    localStorage.setItem(key, encrypted);
    set({ [key]: value });
  },
  secureGet: (key) => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    const value = decrypt(encrypted);
    set({ [key]: value });
    return value;
  },
  // ตัวอย่าง state อื่น ๆ สามารถเพิ่มได้
}));
