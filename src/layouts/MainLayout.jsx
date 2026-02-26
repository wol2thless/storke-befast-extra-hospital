import { Outlet } from "react-router";
import HeaderBar from "../components/HeaderBar";
import MobileNavbar from "../components/MobileNavbar";
import { usePersonInfoStore } from "../store/personInfoStore";

const MainLayout = () => {
  // ดึง blockNav จาก zustand store (หรือ context)
  const blockNav = usePersonInfoStore((state) => state.blockNav) || false;
  return (
    <div className="min-h-screen flex flex-col bg-base-200 pb-16">
      <HeaderBar />
      <main className="flex-1 w-full max-w-md mx-auto px-2 pt-2">
        <Outlet />
      </main>
      <MobileNavbar blockNav={blockNav} />
    </div>
  );
};
export default MainLayout;
