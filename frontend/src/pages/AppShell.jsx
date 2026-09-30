import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Home, ScanFace, Volume2, MessageCircle, AlertTriangle,
  BookOpen, Eye, Settings, LogOut, ChevronLeft, ChevronRight,
  Globe
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import './AppShell.css';

const NAV_ITEMS = [
  { to: '/dashboard',          icon: Home,          label: 'Home' },
  { to: '/app/sign-to-text',   icon: ScanFace,      label: 'Sign to Text' },
  { to: '/app/text-to-speech', icon: Volume2,        label: 'Text to Speech' },
  { to: '/app/conversation',   icon: MessageCircle,  label: 'Conversation' },
  { to: '/app/emergency',      icon: AlertTriangle,  label: 'Emergency' },
  { to: '/app/learn-signs',    icon: BookOpen,       label: 'Learn Signs' },
  { to: '/app/accessibility',  icon: Eye,            label: 'Accessibility' },
  { to: '/app/settings',       icon: Settings,       label: 'Settings' },
];

const LANGUAGES = ['English (US) / മലയാളം', 'English (UK)', 'Malayalam'];

export default function AppShell() {
  const { session, logOut } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [lang, setLang] = useState('English (US) / മലയാളം');

  const handleLogOut = () => {
    logOut();
    navigate('/');
  };

  return (
    <div className={`shell-root ${collapsed ? 'shell-collapsed' : ''}`}>
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="shell-sidebar">
        {/* Brand */}
        <div className="shell-brand">
          <img src="/mova-icon.png" alt="MOVA" className="shell-brand-icon" />
          {!collapsed && <span className="shell-brand-name">MOVA</span>}
          <button
            className="shell-collapse-btn"
            onClick={() => setCollapsed(v => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Section Label */}
        {!collapsed && (
          <div className="shell-section-label">MODULES &amp; NAVIGATION</div>
        )}

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
              <item.icon size={18} className="shell-nav-icon" />
              {!collapsed && <span className="shell-nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="shell-sidebar-footer">
          {!collapsed && (
            <div className="shell-sidebar-tagline">
              MOVA Accessibility
              <div className="shell-sidebar-tagline-sub">Built to make communication more accessible.</div>
            </div>
          )}
          <button
            className="shell-logout-btn"
            onClick={handleLogOut}
            title="Log out"
          >
            <LogOut size={16} />
            {!collapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* ── Content Area ─────────────────────────────────── */}
      <div className="shell-content">
        {/* Top Bar */}
        <header className="shell-topbar">
          <div className="shell-topbar-left" aria-label="Breadcrumb" />
          <div className="shell-topbar-right">
            {/* Language Selector */}
            <div className="shell-lang-select">
              <Globe size={15} />
              <select
                className="shell-lang-dropdown"
                value={lang}
                onChange={e => setLang(e.target.value)}
                aria-label="Language"
              >
                {LANGUAGES.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            {/* User Avatar */}
            <button
              className="shell-avatar"
              aria-label="User profile"
              onClick={() => navigate('/app/settings')}
              title={session?.name || 'Profile'}
            >
              {session?.avatar || '?'}
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
