import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  Home, Scan, Volume2, MessageCircle, Shield,
  BookOpen, Accessibility, Settings,
  Globe, ChevronDown, LogOut, MessageSquarePlus, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
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

  // Avatar dropdown & feedback dialog state
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const menuRef = useRef(null);
  const avatarBtnRef = useRef(null);
  const dialogRef = useRef(null);

  const userInitial = session?.avatar || session?.name?.charAt(0).toUpperCase() || 'H';
  const userName = session?.name || 'User';

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Focus trap & Escape key handler for Feedback Dialog
  useEffect(() => {
    if (!feedbackOpen) return;

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        setFeedbackOpen(false);
        if (avatarBtnRef.current) avatarBtnRef.current.focus();
        return;
      }

      if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    // Initial focus into dialog
    const timer = setTimeout(() => {
      if (dialogRef.current) {
        const firstInput = dialogRef.current.querySelector('textarea, select, button');
        if (firstInput) firstInput.focus();
      }
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [feedbackOpen]);

  const handleOpenFeedback = () => {
    setMenuOpen(false);
    setFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackOpen(false);
    if (avatarBtnRef.current) avatarBtnRef.current.focus();
  };

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

            {/* User Avatar & Menu */}
            <div className="shell-avatar-wrap" ref={menuRef}>
              <button
                ref={avatarBtnRef}
                className="shell-avatar"
                aria-label="User profile and feedback menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(!menuOpen)}
                title={session?.name || 'User Menu'}
              >
                {userInitial}
              </button>

              {menuOpen && (
                <div className="shell-avatar-menu" role="menu">
                  <div className="shell-menu-header">
                    <span className="shell-menu-name">{userName}</span>
                    <span className="shell-menu-email">{session?.email || 'Logged in'}</span>
                  </div>
                  <button
                    className="shell-menu-item"
                    role="menuitem"
                    onClick={handleOpenFeedback}
                  >
                    <MessageSquarePlus size={16} />
                    <span>Send feedback</span>
                  </button>
                  <button
                    className="shell-menu-item"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); navigate('/app/settings'); }}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <div className="shell-menu-sep" />
                  <button
                    className="shell-menu-item shell-menu-item--logout"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); logOut(); }}
                  >
                    <LogOut size={16} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content rendered by nested routes */}
        <main className="shell-page">
          <Outlet />
        </main>
      </div>

      {/* Accessible Feedback Modal Dialog */}
      {feedbackOpen && (
        <div className="shell-modal-backdrop" role="presentation">
          <div
            className="shell-modal-dialog"
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
          >
            <div className="shell-modal-header">
              <h3 id="feedback-dialog-title">Send Feedback to Team</h3>
              <button
                type="button"
                className="shell-modal-close"
                onClick={handleCloseFeedback}
                aria-label="Close feedback dialog"
              >
                <X size={18} />
              </button>
            </div>
            <div className="shell-modal-body">
              <InquiryForm
                source={window.location.pathname}
                type="Suggestion"
                compact={false}
                allowTechDetails={true}
                onCancel={handleCloseFeedback}
                onSent={() => {
                  setTimeout(() => handleCloseFeedback(), 1500);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
