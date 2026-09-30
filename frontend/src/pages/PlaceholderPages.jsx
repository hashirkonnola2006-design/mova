import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction } from 'lucide-react';

function PlaceholderPage({ title, desc, icon: Icon = Construction, color = '#0B4FE0' }) {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingTop: '3rem', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, background: `${color}15`,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem',
      }}>
        <Icon size={32} color={color} />
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0A0F2C', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
        {title}
      </h1>
      <p style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.6, marginBottom: '2rem' }}>
        {desc}
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '0.65rem 1.25rem',
        fontSize: '0.85rem', fontWeight: 600, color: '#94A3B8',
      }}>
        🚧 Coming soon
      </div>
      <div style={{ marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            background: '#0B4FE0', color: '#fff', border: 'none', borderRadius: 8,
            padding: '0.7rem 1.4rem', fontSize: '0.9rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

import { MessageCircle } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { Eye } from 'lucide-react';
import { Settings } from 'lucide-react';

export function ConversationPage() {
  return (
    <PlaceholderPage
      title="Conversation"
      desc="Two-way conversation mode lets you and another person communicate seamlessly using sign language and text. This feature is being finalized and will launch soon."
      icon={MessageCircle}
      color="#0891B2"
    />
  );
}

export function LearnSignsPage() {
  return (
    <PlaceholderPage
      title="Learn Signs"
      desc="Practice Indian Sign Language with interactive lessons and quizzes. The Interactive Academy is coming soon with video demonstrations and guided exercises."
      icon={BookOpen}
      color="#059669"
    />
  );
}

export function AccessibilityPage() {
  return (
    <PlaceholderPage
      title="Accessibility Settings"
      desc="Customize MOVA for your needs — high contrast, large text, reduced motion, and keyboard navigation preferences. Settings panel coming soon."
      icon={Eye}
      color="#D97706"
    />
  );
}

export function SettingsPage() {
  return (
    <PlaceholderPage
      title="Profile & Settings"
      desc="Manage your account details, notification preferences, and connected devices. Full profile management is coming in the next release."
      icon={Settings}
      color="#64748B"
    />
  );
}
