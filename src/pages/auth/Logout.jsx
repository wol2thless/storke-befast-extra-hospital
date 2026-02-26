import { useEffect } from "react";
import { useNavigate } from "react-router";

const Logout = () => {
  const navigate = useNavigate();
  useEffect(() => {
    localStorage.removeItem("id_token");
    localStorage.removeItem("user");
    localStorage.removeItem("expires_at");
    navigate("/login", { replace: true });
  }, [navigate]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-info text-lg font-semibold">กำลังออกจากระบบ...</div>
    </div>
  );
};

export default Logout;
