import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  School, 
  AlertCircle, 
  Sparkles, 
  Calculator,
  Clock,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  TrendingUp,
  Sliders,
  Award
} from "lucide-react";
import { Subject } from "../types";

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  subjects: Subject[];
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  activeTimerSection: string | null;
  activeTimerMinutes: number;
  timerRunning: boolean;
  onOpenSettings: () => void;
  userProfile: {
    name: string;
    email: string;
    pfpUrl: string;
    accent: "orange" | "emerald" | "indigo" | "rose";
  };
}

export default function Sidebar({
  activePage,
  setActivePage,
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  activeTimerSection,
  activeTimerMinutes,
  timerRunning,
  onOpenSettings,
  userProfile
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Keep dropdown open if we are currently visiting one of the hidden sub-pages
  const secondaryPages = [
    "deadline_radar",
    "universities",
    "mistakes",
    "reports",
    "ai_reports"
  ];

  useEffect(() => {
    if (secondaryPages.includes(activePage)) {
      setIsDropdownOpen(true);
    }
  }, [activePage]);

  // Core Pages (Visible directly in Sidebar)
  const coreNavItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "achievement_vault", label: "Achievement Vault", icon: Award },
    { id: "subject_performance", label: "Performance Tracker", icon: TrendingUp },
    { id: "ia_ee_cas", label: "IA, EE & CAS", icon: GraduationCap },
    { id: "ipmat", label: "IPMAT Prep", icon: Calculator },
  ];

  // Secondary Pages (Contained inside the System Utilities Dropdown)
  const dropdownNavItems = [
    { id: "deadline_radar", label: "Deadline Radar", icon: Clock },
    { id: "universities", label: "Target Universities", icon: School },
    { id: "mistakes", label: "Mistake Database", icon: AlertCircle },
    { id: "ai_reports", label: "AI Weekly Reports", icon: Sparkles },
  ];

  const handleSubjectClick = (subId: string) => {
    setSelectedSubjectId(subId);
    setActivePage("subject_detail");
  };

  const getAccentColor = () => {
    switch (userProfile.accent) {
      case "emerald": return "text-emerald-400 bg-emerald-500";
      case "indigo": return "text-indigo-400 bg-indigo-500";
      case "rose": return "text-rose-400 bg-rose-500";
      default: return "text-orange-400 bg-orange-500";
    }
  };

  const getAccentBorderClass = () => {
    switch (userProfile.accent) {
      case "emerald": return "border-emerald-500/25";
      case "indigo": return "border-indigo-500/25";
      case "rose": return "border-rose-500/25";
      default: return "border-orange-500/25";
    }
  };

  const getAccentTextClass = () => {
    switch (userProfile.accent) {
      case "emerald": return "text-emerald-400";
      case "indigo": return "text-indigo-400";
      case "rose": return "text-rose-400";
      default: return "text-orange-400";
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        id="sidebar-toggle-btn"
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 text-zinc-100 rounded-lg shadow-md border border-zinc-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} id="sidebar-toggle-x" /> : <Menu size={20} id="sidebar-toggle-menu" />}
      </button>

      {/* Sidebar container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 z-40 h-screen bg-[#111114] border-r border-zinc-800 text-zinc-100 transition-all duration-300 flex flex-col justify-between
          ${isOpen ? "w-64" : "w-0 md:w-20 overflow-hidden md:overflow-visible"}
          ${!isOpen ? "-translate-x-full md:translate-x-0" : "translate-x-0"}
        `}
      >
        {/* Top brand header - leads back to dashboard when clicked */}
        <div 
          className="p-6 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/20 transition-all" 
          id="sidebar-brand-container"
          onClick={() => {
            setSelectedSubjectId(null);
            setActivePage("dashboard");
            if (window.innerWidth < 768) setIsOpen(false);
          }}
          title="Return to Dashboard"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black border border-zinc-850/80 transition-all shadow-inner" id="sidebar-logo">
              <svg viewBox="0 0 100 100" className="w-5 h-5 text-white animate-pulse" fill="currentColor" referrerPolicy="no-referrer">
                <path d="M50,18 C50,18 64,55 80,82 C80,82 66,75 50,40 C34,75 20,82 20,82 C36,55 50,18 50,18 Z" />
              </svg>
            </div>
            {isOpen && (
              <div>
                <h1 className="font-display font-bold text-lg tracking-tight text-zinc-100" id="sidebar-title">
                  Atlas
                </h1>
                <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest" id="sidebar-subtitle">
                  Built Different
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5" id="sidebar-nav-container">
          {/* Main Navigation */}
          <div className="space-y-1">
            {isOpen && (
              <p className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                Core Systems
              </p>
            )}
            
            {/* Core Visible Items */}
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id || (item.id === "dashboard" && activePage === "home");
              return (
                <button
                   key={item.id}
                   id={`sidebar-link-${item.id}`}
                   onClick={() => {
                     setActivePage(item.id);
                     setSelectedSubjectId(null);
                     if (window.innerWidth < 768) setIsOpen(false);
                   }}
                   className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left text-sm font-medium
                     ${isActive 
                       ? `bg-zinc-800/50 font-semibold ${getAccentTextClass()}` 
                       : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100"
                     }
                   `}
                >
                  <Icon size={18} className={isActive ? getAccentTextClass() : "text-zinc-500"} />
                  {isOpen && <span>{item.label}</span>}
                </button>
              );
            })}

            {/* Collapsible Dropdown for secondary pages */}
            <div className="pt-1.5">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left text-sm font-medium text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100 ${
                  secondaryPages.includes(activePage) ? "text-zinc-200 bg-zinc-900/20" : ""
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Sliders size={18} className="text-zinc-500" />
                  {isOpen && <span>System Utilities</span>}
                </div>
                {isOpen && (
                  isDropdownOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />
                )}
              </button>

              {/* Sub-menu containing other pages */}
              {isDropdownOpen && isOpen && (
                <div className="mt-1 pl-4 space-y-0.5 border-l border-zinc-800 ml-5 animate-fade-in">
                  {dropdownNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id || 
                      (item.id === "ai_reports" && activePage === "reports");
                    return (
                      <button
                        key={item.id}
                        id={`sidebar-link-${item.id}`}
                        onClick={() => {
                          setActivePage(item.id);
                          setSelectedSubjectId(null);
                          if (window.innerWidth < 768) setIsOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg transition text-left text-xs font-medium
                          ${isActive 
                            ? `bg-zinc-800/50 font-semibold ${getAccentTextClass()}` 
                            : "text-zinc-400 hover:text-zinc-100"
                          }
                        `}
                      >
                        <Icon size={14} className={isActive ? getAccentTextClass() : "text-zinc-500"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* IB Subjects section */}
          <div className="space-y-1" id="sidebar-subjects-container">
            <div className="flex items-center justify-between px-3 mb-2">
              {isOpen && (
                <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  IB Subjects
                </p>
              )}
              <BookOpen size={12} className="text-zinc-500" />
            </div>
            <div className="space-y-0.5">
              {subjects.map((sub) => {
                const isSelected = activePage === "subject_detail" && selectedSubjectId === sub.id;
                const shortLabel = sub.id
                  .replace("_HL", " HL")
                  .replace("_SL", " SL")
                  .replace("MATH_AI", "MATH");
                return (
                  <button
                    key={sub.id}
                    id={`sidebar-subject-${sub.id}`}
                    onClick={() => {
                      handleSubjectClick(sub.id);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 text-left text-xs font-medium
                      ${isSelected 
                        ? `bg-zinc-800/50 ${getAccentTextClass()}` 
                        : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-100"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        sub.id.includes("HL") ? "bg-indigo-500" : "bg-teal-500"
                      }`} />
                      <span>{isOpen ? sub.name : shortLabel}</span>
                    </div>
                    {isOpen && <ChevronRight size={12} className="text-zinc-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Timer Indicator in Sidebar bottom */}
        {activeTimerSection && (
          <div className="m-4 p-3 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl space-y-2" id="sidebar-timer-badge">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Clock size={12} className={timerRunning ? "animate-spin text-orange-400" : "text-zinc-500"} />
                <span className="text-[10px] uppercase tracking-wider font-mono text-zinc-400">
                  {timerRunning ? "Studying" : "Paused"}
                </span>
              </div>
              <span className={`text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded ${getAccentTextClass()}`}>
                {activeTimerSection.replace("_HL", "").replace("_SL", "")}
              </span>
            </div>
            {isOpen && (
              <p className="text-xs text-zinc-500 truncate">
                Focused session active
              </p>
            )}
          </div>
        )}

        {/* Bottom User Profile - opens settings modal when clicked */}
        {isOpen && (
          <div 
            className="p-4 border-t border-zinc-800 bg-[#0c0c0f] cursor-pointer hover:bg-zinc-900/50 transition-all" 
            id="sidebar-user-footer"
            onClick={onOpenSettings}
            title="Open OS Settings"
          >
            <div className="flex items-center space-x-3">
              {userProfile.pfpUrl ? (
                <img 
                  src={userProfile.pfpUrl} 
                  alt={userProfile.name} 
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                />
              ) : (
                <div className={`w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center font-display font-bold text-xs border ${getAccentBorderClass()} ${getAccentTextClass()}`} id="sidebar-avatar">
                  {userProfile.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "OS"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-bold text-zinc-100 leading-tight truncate">{userProfile.name}</h3>
                <p className="text-[10px] text-zinc-400 truncate font-mono">{userProfile.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
