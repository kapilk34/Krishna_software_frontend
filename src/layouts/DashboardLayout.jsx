import { Outlet } from "react-router-dom";
import NavBar from "../Components/NavBar";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4FA]">
      <NavBar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
