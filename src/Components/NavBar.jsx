import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Archive,
  BookOpen,
  FileText,
  Film,
  Images,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ScanLine,
  FolderOpen,
} from "lucide-react";

const navigationItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Upload Documents", icon: ReceiptText, path: "/dashboard/upload_doc" },
  { label: "Books & Journals", icon: BookOpen, path: "/dashboard/books-journals" },
  { label: "PDF & Office Files", icon: FileText, path: "/dashboard/pdf-office-files" },
  { label: "Images & Photographs", icon: Images, path: "/dashboard/images-photographs" },
  { label: "Audio & Video", icon: Film, path: "/dashboard/audio-video" },
  { label: "Archives & Manuscripts", icon: Archive, path: "/dashboard/archives-manuscripts" },
  { label: "Scanned Documents", icon: ScanLine, path: "/dashboard/scanned-documents" },
  { label: "Document Store", icon: FolderOpen, path: "/dashboard/settings" },
];

const NavBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderNavItem = ({ label, icon: Icon, path }) => {
    const isActive = location.pathname === path;
    return (
      <button
        key={label}
        type="button"
        title={collapsed ? label : undefined}
        aria-current={isActive ? "page" : undefined}
        onClick={() => navigate(path)}
        className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium transition-all ${
          collapsed ? "justify-center px-0" : ""
        } ${
          isActive
            ? "bg-[#1A468B] text-white shadow-sm shadow-[#1A468B]/30"
            : "text-slate-600 hover:bg-[#02154C]/8 hover:text-[#02154C]"
        }`}
      >
        <Icon size={18} strokeWidth={1.8} className="shrink-0" />
        {!collapsed && <span>{label}</span>}
      </button>
    );
  };

  return (
    <aside
      className={`flex h-screen flex-col bg-white border-r border-slate-200 px-3 py-5 transition-[width] duration-300 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
      aria-label="Main navigation"
    >
      {/* Logo + Brand */}
      <div className={`mb-6 flex h-12 items-center ${collapsed ? "justify-center" : "gap-3 px-1"}`}>
        <img
          src="https://z2jsknicy5.ufs.sh/f/HcyboFZa5mETW7ygJex3K01ERYkZiQOyH5lnc4NJtLmhIqVg"
          alt="KDMS Logo"
          className="size-9 shrink-0 rounded-lg object-contain"
        />
        {!collapsed && (
          <div>
            <p className="text-400 font-semibold text-[#02154C] leading-tight">Krishna Digimatrix Solution</p>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className={`mb-5 flex size-7 items-center justify-center self-end rounded-lg border border-slate-200 text-slate-400 transition hover:border-[#1A468B]/40 hover:text-[#1A468B] ${
          collapsed ? "self-center" : ""
        }`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
      </button>

      {/* Nav items */}
      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
        {navigationItems.map(renderNavItem)}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          type="button"
          title={collapsed ? "Log out" : undefined}
          onClick={handleLogout}
          className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-500 transition-all hover:bg-red-50 hover:text-red-600 ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <LogOut size={18} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default NavBar;
