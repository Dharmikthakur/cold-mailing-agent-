import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Sparkles, 
  Kanban, 
  MessageSquareCode,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isDarkMode, onToggleTheme }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Company Finder', icon: Briefcase },
    { id: 'tailor', label: 'Resume Analyzer', icon: FileText },
    { id: 'cover-letter', label: 'Email Generator', icon: Sparkles },
    { id: 'tracker', label: 'Tracker Board', icon: Kanban },
    { id: 'interview', label: 'Mock Interview', icon: MessageSquareCode },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-xl p-6 flex flex-col h-screen shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
          <UserCheck className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className={`font-bold text-lg leading-none bg-clip-text text-transparent bg-gradient-to-r ${
            isDarkMode 
              ? "from-white via-slate-100 to-slate-300" 
              : "from-slate-900 via-slate-800 to-slate-700"
          }`}>
            JobPilot AI
          </h1>
          <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
            Career Copilot
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 group ${
                isActive 
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/25 shadow-inner' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
              }`}
            >
              <Icon className={`h-4 w-4 transition-transform duration-250 group-hover:scale-110 ${
                isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
              }`} />
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle Button */}
      <div className="mb-4 px-2">
        <button
          onClick={onToggleTheme}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition-all text-slate-400 hover:text-slate-200"
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Light Theme</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-blue-400" />
                <span>Dark Theme</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {isDarkMode ? 'Dark' : 'Light'}
          </span>
        </button>
      </div>

      {/* Profile/Footer Info */}
      <div className="border-t border-slate-800/80 pt-4 px-2">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-700/30 flex items-center justify-center text-xs font-semibold text-slate-300">
            DT
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">Dharmik Thakur</div>
            <div className="text-[10px] text-slate-500">dharmikthakur1978@gmail.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
