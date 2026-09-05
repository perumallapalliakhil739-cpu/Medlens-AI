import React from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  History,
  GitCompare,
  Sparkles,
  ShieldAlert,
  Settings,
  AlertCircle,
  HelpCircle,
  Database
} from 'lucide-react';

export type NavigationTab = 
  | 'dashboard'
  | 'patients'
  | 'reports'
  | 'timeline'
  | 'comparisons'
  | 'insights'
  | 'audit'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  pendingReviewCount: number;
  unresolvedConflictCount: number;
  isOpen: boolean;
  onResetDemoData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingReviewCount,
  unresolvedConflictCount,
  isOpen,
  onResetDemoData,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: number; badgeType?: 'danger' | 'info' }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: 'patients',
      label: 'Patients',
      icon: <Users size={18} />,
    },
    {
      id: 'reports',
      label: 'Reports & Source',
      icon: <FileText size={18} />,
      badge: pendingReviewCount > 0 ? pendingReviewCount : undefined,
      badgeType: 'danger',
    },
    {
      id: 'timeline',
      label: 'Medical Timeline',
      icon: <History size={18} />,
    },
    {
      id: 'comparisons',
      label: 'Report Comparisons',
      icon: <GitCompare size={18} />,
    },
    {
      id: 'insights',
      label: 'AI Insights & Flags',
      icon: <Sparkles size={18} />,
      badge: unresolvedConflictCount > 0 ? unresolvedConflictCount : undefined,
      badgeType: 'danger',
    },
    {
      id: 'audit',
      label: 'Audit History',
      icon: <ShieldAlert size={18} />,
    },
    {
      id: 'settings',
      label: 'Settings & Privacy',
      icon: <Settings size={18} />,
    },
  ];

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`} aria-label="Main Navigation">
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge !== undefined && (
              <span className={`nav-badge ${item.badgeType || 'info'}`} title={`${item.badge} item(s) need attention`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="sidebar-footer">
        <div style={{ backgroundColor: 'var(--slate-100)', borderRadius: 'var(--radius-md)', padding: '0.65rem 0.75rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-800)' }}>
            <Database size={13} style={{ color: 'var(--primary-600)' }} />
            <span>Demonstration Sandbox</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.2rem', lineHeight: '1.3' }}>
            Data stored locally in browser session. Non-diagnostic mode active.
          </div>
          <button
            onClick={onResetDemoData}
            style={{
              marginTop: '0.45rem',
              fontSize: '0.7rem',
              color: 'var(--primary-700)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Reset to Standard Demo Records
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: 'var(--slate-500)' }}>
          <HelpCircle size={13} />
          <span>MedLens Version 1.0 MVP</span>
        </div>
      </div>
    </aside>
  );
};
