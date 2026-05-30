import React, { useState, useEffect } from "react";
import { 
  Store, 
  Layers, 
  UploadCloud, 
  Search, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  HelpCircle,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { User, DBStatus } from "./types";
import LoginView from "./components/LoginView";
import DashboardView from "./components/DashboardView";
import UploadView from "./components/UploadView";
import SearchView from "./components/SearchView";
import DBStatusBadge from "./components/DBStatusBadge";

export default function App() {
  // Session details stored in localStorage
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("mt_auth_token"));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("mt_auth_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Database Connection Indicator
  const [dbStatus, setDbStatus] = useState<DBStatus | null>(null);

  // Active View track ( "dashboard" | "upload" | "search" )
  const [activeView, setActiveView] = useState<"dashboard" | "upload" | "search">("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch db configuration on startup
  useEffect(() => {
    async function checkDbStatus() {
      try {
        const response = await fetch("/api/db-status");
        if (response.ok) {
          const stats = await response.json();
          setDbStatus(stats);
        }
      } catch (e) {
        console.warn("DB checker exception. Check server process.", e);
      }
    }
    checkDbStatus();
  }, [activeView]); // Re-fetch on view updates to keep counts refreshed

  const handleLoginSuccess = (userToken: string, loggedUser: User) => {
    localStorage.setItem("mt_auth_token", userToken);
    localStorage.setItem("mt_auth_user", JSON.stringify(loggedUser));
    setToken(userToken);
    setCurrentUser(loggedUser);
    setActiveView("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("mt_auth_token");
    localStorage.removeItem("mt_auth_user");
    setToken(null);
    setCurrentUser(null);
    setMobileMenuOpen(false);
  };

  // If session token is missing, direct to single-screen Administrative Login page
  if (!token || !currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Active View Render Selector
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView 
            token={token} 
            dbStatus={dbStatus}
            onNavigate={(view) => {
              setActiveView(view);
              setMobileMenuOpen(false);
            }} 
          />
        );
      case "upload":
        return (
          <UploadView 
            token={token} 
            onNavigate={(view) => {
              setActiveView(view);
              setMobileMenuOpen(false);
            }} 
          />
        );
      case "search":
        return (
          <SearchView 
            token={token}
            onNavigate={(view) => {
              setActiveView(view);
              setMobileMenuOpen(false);
            }} 
          />
        );
      default:
        return <DashboardView token={token} dbStatus={dbStatus} onNavigate={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row text-slate-950 font-sans antialiased text-left selection:bg-blue-250">
      
      {/* 1. DESKTOP PERSISTENT NAVIGATION SIDEBAR */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-900 text-slate-100 p-6 border-r border-slate-800 shrink-0 select-none">
        
        {/* Core Sidebar Header Brand */}
        <div className="flex items-center gap-2.5 mb-10 pb-6 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white uppercase">Maharashtra</h1>
            <p className="text-[10.5px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">Traders System</p>
          </div>
        </div>

        {/* Sidebar Nav Buttons Grid */}
        <nav className="space-y-1.5 flex-1 text-left">
          <button
            onClick={() => setActiveView("dashboard")}
            className={`w-full px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition flex items-center gap-3.5 cursor-pointer ${
              activeView === "dashboard"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard Panel</span>
          </button>

          <button
            id="nav-search-btn"
            onClick={() => setActiveView("search")}
            className={`w-full px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition flex items-center gap-3.5 cursor-pointer ${
              activeView === "search"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Search className="w-4 h-4 shrink-0" />
            <span>Search Inventory</span>
          </button>

          <button
            id="nav-upload-btn"
            onClick={() => setActiveView("upload")}
            className={`w-full px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition flex items-center gap-3.5 cursor-pointer ${
              activeView === "upload"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <UploadCloud className="w-4 h-4 shrink-0" />
            <span>Upload Catalog</span>
          </button>
        </nav>

        {/* User administrative profile details block */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800/50">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/20 flex items-center justify-center shrink-0">
              <UserIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11.5px] font-bold text-slate-200 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-rose-950/35 hover:text-rose-400 text-slate-400 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-750 hover:border-rose-900/45 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* 2. MOBILE HEADER & NAVIGATION DRAWER SCREEN OVERLAYS */}
      <header className="md:hidden bg-slate-900 text-slate-100 px-5 py-4 flex items-center justify-between border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-extrabold tracking-tight uppercase">Maharashtra Traders</span>
        </div>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 px-2.5 text-slate-300 bg-slate-850 hover:text-white border border-slate-800 rounded-lg shrink-0 transition"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-l-0 top-[53px] w-full bg-slate-900 text-white z-40 border-b border-slate-800 p-5 space-y-6 animate-slide-down">
          <nav className="space-y-1">
            <button
              onClick={() => { setActiveView("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 ${
                activeView === "dashboard" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Panel</span>
            </button>
            <button
              onClick={() => { setActiveView("search"); setMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 ${
                activeView === "search" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Inventory</span>
            </button>
            <button
              onClick={() => { setActiveView("upload"); setMobileMenuOpen(false); }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-left flex items-center gap-3 ${
                activeView === "upload" ? "bg-blue-600 text-white" : "text-slate-400"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Catalog</span>
            </button>
          </nav>
          
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <div className="text-left text-xs text-slate-300 font-semibold">{currentUser.name}</div>
            </div>
            
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-slate-800 text-rose-450 hover:bg-rose-950/20 text-xs font-bold rounded-lg flex items-center gap-1 border border-slate-750 transition"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN CONTENTS WRAPPER LAYOUT */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Main top sticky utility navbar */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-gray-100 bg-white shadow-sm shadow-gray-50/20 select-none">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              ADMIN CONTROL
            </span>
          </div>
          
          {/* DB Mode badge indicators */}
          <DBStatusBadge status={dbStatus} />
        </header>

        {/* Dynamic Inner Viewport Canvas */}
        <div className="flex-grow p-5 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </div>

        {/* Footer info panels */}
        <footer className="py-4 border-t border-gray-50 bg-white text-center text-[11px] text-gray-400 font-medium select-none flex items-center justify-between px-8">
          <div>© {new Date().getFullYear()} Maharashtra Traders. All rights reserved.</div>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span>System:</span>
            <span className="text-slate-600 font-semibold">v1.2.0-Prod</span>
          </div>
        </footer>
      </main>

    </div>
  );
}

