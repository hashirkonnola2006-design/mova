import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Public pages
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';

// Authenticated shell + pages
import AppShell from './pages/AppShell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import SignToTextPage from './pages/SignToTextPage.jsx';
import TextToSpeechPage from './pages/TextToSpeechPage.jsx';
import EmergencyPage from './pages/EmergencyPage.jsx';
import ConversationPage from './pages/ConversationPage.jsx';
import LearnSignsPage from './pages/LearnSignsPage.jsx';
import AccessibilityPage from './pages/AccessibilityPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

// Legacy / collector (still accessible)
import CollectorPage from './components/CollectorPage.jsx';

/** Guards authenticated routes — redirects to /login if not signed in */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/** Prevents logged-in users from revisiting the auth page */
function RequireGuest({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route
        path="/login"
        element={
          <RequireGuest>
            <AuthPage />
          </RequireGuest>
        }
      />

      {/* ── Authenticated shell (all /dashboard + /app/* routes) ── */}
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route path="/dashboard"          element={<DashboardPage />} />
        <Route path="/app/sign-to-text"   element={<SignToTextPage />} />
        <Route path="/app/text-to-speech" element={<TextToSpeechPage />} />
        <Route path="/app/conversation"   element={<ConversationPage />} />
        <Route path="/app/emergency"      element={<EmergencyPage />} />
        <Route path="/app/learn-signs"    element={<LearnSignsPage />} />
        <Route path="/app/accessibility"  element={<AccessibilityPage />} />
        <Route path="/app/settings"       element={<SettingsPage />} />
      </Route>

      {/* ── Legacy routes (public) ──────────────────────── */}
      {/* /app still works as the old translator for backwards compat */}
      <Route path="/app" element={<Navigate to="/app/sign-to-text" replace />} />
      <Route path="/translate" element={<Navigate to="/app/sign-to-text" replace />} />
      <Route
        path="/collect"
        element={
          <CollectorPage onBackToTranslator={() => window.history.pushState(null, '', '/app/sign-to-text')} />
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
