import React from "react";
import DashboardContent from "./DashboardContent"; // phần bạn đã viết
import { Home, BarChart2, Settings, Mail, MapPin } from "lucide-react";

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar bên trái */}
      <aside className="w-20 md:w-60 bg-blue-900 text-white flex flex-col items-center py-4">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 md:w-20 md:h-20 bg-white rounded-full mb-2"></div>
          <div className="text-xs md:text-sm hidden md:block">NAME<br />SURNAME</div>
        </div>
        <nav className="flex flex-col items-center space-y-6 mt-10 text-xl">
          <Home className="hover:text-blue-300 cursor-pointer" />
          <BarChart2 className="hover:text-blue-300 cursor-pointer" />
          <Settings className="hover:text-blue-300 cursor-pointer" />
          <Mail className="hover:text-blue-300 cursor-pointer" />
          <MapPin className="hover:text-blue-300 cursor-pointer" />
        </nav>
      </aside>

      {/* Nội dung dashboard bên phải */}
      <main className="flex-1 bg-gray-50 p-4">
        <DashboardContent />
      </main>
    </div>
  );
};

export default DashboardLayout;
