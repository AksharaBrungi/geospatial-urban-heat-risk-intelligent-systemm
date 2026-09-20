import React from 'react';
import {
  LayoutDashboard,
  Map,
  Building2,
  Sliders,
  Users,
  GitCompare,
  TrendingUp,
  ShieldAlert,
  BellRing,
  FileText,
  BookOpen,
  Flame,
  X,
  Sparkles
} from 'lucide-react';
import { NavTab, Language } from '../types';

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  alertsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  language,
  alertsCount,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map' as NavTab, label: 'Interactive Map', icon: Map },
    { id: 'profile' as NavTab, label: 'Ward Profile', icon: Building2 },
    { id: 'scenarios' as NavTab, label: 'Scenario Analysis', icon: Sliders },
    { id: 'social_vuln' as NavTab, label: 'Social Vulnerability', icon: Users },
    { id: 'comparison' as NavTab, label: 'Ward Comparison', icon: GitCompare },
    { id: 'trends' as NavTab, label: 'Trends & Analytics', icon: TrendingUp },
    { id: 'recommendations' as NavTab, label: 'Recommendations', icon: ShieldAlert },
    {
      id: 'alerts' as NavTab,
      label: 'Alerts & Notifications',
      icon: BellRing,
      badge: alertsCount > 0 ? alertsCount : undefined
    },
    { id: 'reports' as NavTab, label: 'Reports', icon: FileText },
    { id: 'methodology' as NavTab, label: 'About', icon: BookOpen }
  ];

  const handleSelect = (tab: NavTab) => {
    onTabChange(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b1329] text-slate-300 w-64 select-none">
      {/* Brand Header inside Sidebar */}
      <div className="p-4 pb-3 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-amber-400">Urban Heat Risk</div>
            <div className="text-sm font-extrabold text-white tracking-tight">Intelligent System</div>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1 text-slate-400 hover:text-white rounded-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Navigation
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Tagline & City Silhouette */}
      <div className="p-4 border-t border-slate-800/80 bg-[#080e1e]">
        <div className="text-[11px] text-slate-300 font-medium leading-relaxed mb-3">
          Data-driven heat risk assessment for resilient cities
        </div>
        <div className="text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
          <span>v2.4 Geospatial DSS</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 w-64 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
