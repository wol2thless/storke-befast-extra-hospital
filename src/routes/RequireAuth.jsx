import { Navigate, Outlet, useLocation } from "react-router";
import CryptoJS from "crypto-js";

const SECRET_KEY = "stroke-app-key";
const decrypt = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch {
    return null;
  }
};

const RequireAuth = () => {
  const location = useLocation();
  const encryptedUser = localStorage.getItem("user");
  const encryptedToken = localStorage.getItem("id_token");
  const encryptedExpires = localStorage.getItem("expires_at");
  let isValid = false;
  if (encryptedUser && encryptedToken && encryptedExpires) {
    const expiresAt = decrypt(encryptedExpires);
    if (expiresAt && Date.now() < expiresAt) {
      isValid = true;
    }
  }
  if (!isValid) {
    localStorage.removeItem("id_token");
    localStorage.removeItem("user");
    localStorage.removeItem("expires_at");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
};

export default RequireAuth;
