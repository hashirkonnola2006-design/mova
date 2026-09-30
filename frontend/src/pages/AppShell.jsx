import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Home, Scan, Volume2, MessageCircle, Shield,
  BookOpen, Accessibility, Settings, ChevronLeft, ChevronRight,
  Globe, ChevronDown, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './AppShell.css';

const NAV_ITEMS = [
  { to: '/dashboard',          icon: Home,          label: 'Home' },
  { to: '/app/sign-to-text',   icon: Scan,          label: 'Sign to Text' },
  { to: '/app/text-to-speech', icon: Volume2,        label: 'Text to Speech' },
  { to: '/app/conversation',   icon: MessageCircle,  label: 'Conversation' },
  { to: '/app/emergency',      icon: Shield,         label: 'Emergency' },
  { to: '/app/learn-signs',    icon: BookOpen,       label: 'Learn Signs' },
  { to: '/app/accessibility',  icon: Accessibility,  label: 'Accessibility' },
  { to: '/app/settings',       icon: Settings,       label: 'Settings' },
];

export default function AppShell() {
  const { session, logOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English (US)');

  const userInitial = session?.avatar || session?.name?.charAt(0).toUpperCase() || 'H';

  return (
    <div className={`shell-root ${collapsed ? 'shell-collapsed' : ''}`}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="shell-sidebar">
        {/* Brand */}
        <div className="shell-brand">
          <div className="shell-brand-left" onClick={() => navigate('/dashboard')}>
            <img src="/mova-icon.png" alt="MOVA" className="shell-brand-icon" />
            {!collapsed && <span className="shell-brand-name">MOVA</span>}
          </div>
          <button
            className="shell-collapse-btn"
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="shell-nav" aria-label="App navigation">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `shell-nav-item ${isActive ? 'shell-nav-item--active' : ''}`
              }
              end={item.to === '/dashboard'}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={19} className="shell-nav-icon" />
              {!collapsed && <span className="shell-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shell-sidebar-footer">
          {!collapsed ? (
            <div className="shell-sidebar-info">
              <div className="shell-footer-title">MOVA Accessibility</div>
              <div className="shell-footer-desc">Bridging communication for a more inclusive world.</div>
            </div>
          ) : (
            <div className="shell-footer-dot" title="MOVA Accessibility" />
          )}
        </div>
      </aside>

      {/* ── Content Area ─────────────────────────────────── */}
      <div className="shell-content">
        {/* Top Bar */}
        <header className="shell-topbar">
          <div className="shell-topbar-left" />
          <div className="shell-topbar-right">
            {/* Language Selector */}
            <div className="shell-lang-pill">
              <Globe size={16} className="shell-globe-icon" />
              <span className="shell-lang-text">{selectedLang}</span>
              <ChevronDown size={14} className="shell-chevron-icon" />
            </div>

            {/* Subtle Divider */}
            <span className="shell-topbar-divider" />

            {/* User Avatar */}
            <button
              className="shell-avatar"
              aria-label="User profile"
              onClick={() => navigate('/app/settings')}
              title={session?.name || 'User Profile'}
            >
              {userInitial}
            </button>
          </div>
        </header>

        {/* Page content rendered by nested routes */}
        <main className="shell-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
