import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Home, Scan, Volume2, MessageCircle, Shield,
  BookOpen, Accessibility, Settings,
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
  const [selectedLang, setSelectedLang] = useState('English (US)');

  const userInitial = session?.avatar || session?.name?.charAt(0).toUpperCase() || 'H';
  const userName = session?.name || 'User';

  return (
    <div className="shell-root">
      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="shell-sidebar" aria-label="Sidebar navigation">
        {/* Brand */}
        <div className="shell-brand" onClick={() => navigate('/dashboard')}>
          <div className="shell-brand-icon-wrap">
            <img src="/mova-icon.png" alt="MOVA" className="shell-brand-icon" />
          </div>
          <span className="shell-brand-name">MOVA</span>
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
            >
              <span className="shell-nav-icon-wrap">
                <item.icon size={18} className="shell-nav-icon" />
              </span>
              <span className="shell-nav-label">{item.label}</span>
              <span className="shell-nav-tooltip">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer — user card */}
        <div className="shell-sidebar-footer">
          <div className="shell-user-card">
            <div className="shell-user-avatar">{userInitial}</div>
            <div className="shell-user-info">
              <div className="shell-user-name">{userName}</div>
              <div className="shell-user-role">Member</div>
            </div>
            <button
              className="shell-logout-btn"
              onClick={logOut}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
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
              <Globe size={15} className="shell-globe-icon" />
              <span className="shell-lang-text">{selectedLang}</span>
              <ChevronDown size={13} className="shell-chevron-icon" />
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
