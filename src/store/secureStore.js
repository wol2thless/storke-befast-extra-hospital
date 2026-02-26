import { create } from 'zustand';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'stroke-app-key'; // ควรเก็บ key นี้ไว้อย่างปลอดภัย

function encrypt(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
}

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
