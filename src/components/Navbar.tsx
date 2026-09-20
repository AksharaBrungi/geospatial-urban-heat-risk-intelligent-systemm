import React from 'react';
import {
  LayoutDashboard,
  MapPin,
  FileSpreadsheet,
  Sliders,
  Users,
  GitCompare,
  TrendingUp,
  ShieldAlert,
  BellRing,
  BookOpen
} from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../services/i18n';

export type NavTab =
  | 'overview'
  | 'map'
  | 'profile'
  | 'scenarios'
  | 'social'
  | 'comparison'
  | 'trends'
  | 'recommendations'
  | 'alerts'
  | 'methodology';

interface NavbarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  language: Language;
  alertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  alertsCount
}) => {
  const t = getTranslation(language);

  const tabs = [
    { id: 'overview' as NavTab, label: t.navOverview, icon: LayoutDashboard },
    { id: 'map' as NavTab, label: t.navHeatMap, icon: MapPin },
    { id: 'profile' as NavTab, label: t.navWardProfile, icon: FileSpreadsheet },
    { id: 'scenarios' as NavTab, label: t.navScenarios, icon: Sliders },
    { id: 'social' as NavTab, label: t.navSocialVuln, icon: Users },
    { id: 'comparison' as NavTab, label: t.navComparison, icon: GitCompare },
    { id: 'trends' as NavTab, label: t.navTrends, icon: TrendingUp },
    { id: 'recommendations' as NavTab, label: t.navRecommendations, icon: ShieldAlert },
    { id: 'alerts' as NavTab, label: t.navAlerts, icon: BellRing, badge: alertsCount },
    { id: 'methodology' as NavTab, label: t.navMethodology, icon: BookOpen }
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-[108px] z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-rose-900 text-rose-100' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
