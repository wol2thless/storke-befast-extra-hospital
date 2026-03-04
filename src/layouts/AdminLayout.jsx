import { Outlet, useNavigate, useLocation } from "react-router";
import { useState } from "react";
import {
  FaUserShield,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChartBar,
  FaHome,
  FaUserPlus,
  FaUserCog,
  FaBook,
} from "react-icons/fa";
import { useAdminStore } from "@store/adminStore";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUser, adminLogout } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  const menuItems = [
    {
      icon: <FaChartBar className="w-5 h-5" />,
      label: "ภาพรวม",
      path: "/admin/overview",
      active:
        location.pathname === "/admin" ||
        location.pathname === "/admin/overview",
    },
    {
      icon: <FaUsers className="w-5 h-5" />,
      label: "ข้อมูลผู้ป่วย",
      path: "/admin/dashboard",
      active: location.pathname === "/admin/dashboard",
    },
    {
      icon: <FaUserCog className="w-5 h-5" />,
      label: "จัดการผู้ใช้งาน",
      path: "/admin/users",
      active: location.pathname === "/admin/users",
      adminOnly: true,
    },
    // {
    //   icon: <FaUserPlus className="w-5 h-5" />,
    //   label: "สร้างผู้ใช้งาน",
    //   path: "/admin/create-user",
    //   active: location.pathname === '/admin/create-user',
    //   adminOnly: true
    // }
  ];

  return (
    <div className="min-h-screen bg-base-200">
      {/* Top Navigation */}
      <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
        <div className="navbar-start">
          <button
            className="btn btn-square btn-ghost lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <FaTimes className="w-6 h-6" />
            ) : (
              <FaBars className="w-6 h-6" />
            )}
          </button>

          <div className="flex items-center space-x-3 ml-4 lg:ml-0">
            <FaUserShield className="w-8 h-8 text-warning" />
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-sm text-base-content/70 hidden md:block">
                Stroke-BEFAST Management System
              </p>
            </div>
          </div>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1">
            {menuItems.map((item, index) => {
              // Hide admin-only items if user is not admin
              if (item.adminOnly && adminUser?.role !== "admin") {
                return null;
              }
              return (
                <li key={index}>
                  <button
                    className={`flex items-center space-x-2 ${
                      item.active ? "active" : ""
                    }`}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="navbar-end">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost flex items-center space-x-2"
            >
              <div className="avatar placeholder">
                <div className="bg-warning text-warning-content rounded-full w-8 h-8">
                  <span className="text-xs font-bold">
                    {adminUser?.name?.charAt(0) || "A"}
                  </span>
                </div>
              </div>
              <span className="hidden md:inline">{adminUser?.name}</span>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <div className="flex flex-col items-start p-2">
                  <span className="font-medium">{adminUser?.name}</span>
                  <span className="text-sm text-base-content/60">
                    {adminUser?.role}
                  </span>
                  <span className="text-xs text-base-content/50">
                    {adminUser?.provider_id}
                  </span>
                </div>
              </li>
              <div className="divider my-1"></div>
              {import.meta.env.VITE_MANUAL_URL && (
                <li>
                  <a
                    href={import.meta.env.VITE_MANUAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <FaBook className="w-4 h-4" />
                    คู่มือผู้ใช้งาน
                  </a>
                </li>
              )}
              {import.meta.env.VITE_ADMIN_MANUAL_URL && (
                <li>
                  <a
                    href={import.meta.env.VITE_ADMIN_MANUAL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <FaBook className="w-4 h-4" />
                    คู่มือ Admin
                  </a>
                </li>
              )}
              <div className="divider my-1"></div>
              <li>
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center"
                >
                  <FaHome className="w-4 h-4" />
                  กลับสู่หน้าผู้ใช้
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-error"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full w-64 bg-base-100 shadow-lg transform transition-transform duration-300 z-40 lg:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <ul className="menu">
            {menuItems.map((item, index) => {
              // Hide admin-only items if user is not admin
              if (item.adminOnly && adminUser?.role !== "admin") {
                return null;
              }
              return (
                <li key={index}>
                  <button
                    className={`flex items-center space-x-3 ${
                      item.active ? "active" : ""
                    }`}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p>
            © 2024 Stroke-BEFAST Admin System.
            <span className="ml-2 text-base-content/60">
              Powered by Hat Yai Hospital
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;
