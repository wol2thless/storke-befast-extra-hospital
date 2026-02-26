import { Navigate, Outlet, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useAdminStore } from "@store/adminStore";

const RequireAdminAuth = () => {
  const location = useLocation();
  const isAuthenticated = useAdminStore((state) => state.isAuthenticated);
  const checkAdminAuth = useAdminStore((state) => state.checkAdminAuth);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication from localStorage on component mount
    checkAdminAuth();
    setIsChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="text-base-content/70">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAdminAuth;