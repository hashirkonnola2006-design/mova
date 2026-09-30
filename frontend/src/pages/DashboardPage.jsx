import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanFace, Volume2, MessageCircle, AlertTriangle,
  BookOpen, Eye, Home as HomeIcon, Settings, Search
} from 'lucide-react';
import './DashboardPage.css';

const ALL_FEATURES = [
  {
    id: 'sign-to-text',
    category: 'Communication',
    tag: 'Live Camera',
    tagColor: '#0B4FE0',
    icon: ScanFace,
    title: 'Sign to Text',
    desc: 'Real-time sign detection',
    cta: 'Launch camera →',
    route: '/app/sign-to-text',
  },
  {
    id: 'text-to-speech',
    category: 'Communication',
    tag: 'Voice Synthesis',
    tagColor: '#7C3AED',
    icon: Volume2,
    title: 'Text to Speech',
    desc: 'Speech in many languages',
    cta: 'Open audio studio →',
    route: '/app/text-to-speech',
  },
  {
    id: 'conversation',
    category: 'Communication',
    tag: 'Two-way Split',
    tagColor: '#0891B2',
    icon: MessageCircle,
    title: 'Conversation',
    desc: 'Two-way conversation',
    cta: 'Start conversation →',
    route: '/app/conversation',
  },
  {
    id: 'emergency',
    category: 'Assistance',
    tag: 'Critical SOS',
    tagColor: '#DC2626',
    icon: AlertTriangle,
    title: 'Emergency',
    desc: 'Help when it matters',
    cta: 'View emergency cards →',
    route: '/app/emergency',
  },
  {
    id: 'learn-signs',
    category: 'Learning',
    tag: 'Interactive Academy',
    tagColor: '#059669',
    icon: BookOpen,
    title: 'Learn Signs',
    desc: 'Practice sign language',
    cta: 'Start learning →',
    route: '/app/learn-signs',
  },
  {
    id: 'accessibility',
    category: 'Assistance',
    tag: 'Universal Design',
    tagColor: '#D97706',
    icon: Eye,
    title: 'Accessibility',
    desc: 'Make MOVA work for you',
    cta: 'Accessibility settings →',
    route: '/app/accessibility',
  },
  {
    id: 'home-dashboard',
    category: 'Learning',
    tag: 'Daily Feed',
    tagColor: '#0B4FE0',
    icon: HomeIcon,
    title: 'Home Dashboard',
    desc: 'Welcome & daily feed',
    cta: 'Go to home →',
    route: '/dashboard',
  },
  {
    id: 'settings',
    category: 'Assistance',
    tag: 'Account',
    tagColor: '#64748B',
    icon: Settings,
    title: 'Profile & Settings',
    desc: 'Manage your account',
    cta: 'Manage profile →',
    route: '/app/settings',
  },
];

const CATEGORIES = ['All modules', 'Communication', 'Learning', 'Assistance'];

const STATS = [
  { value: '1M+', label: 'People\nEmpowered' },
  { value: '100%', label: 'Communication\nAccess' },
  { value: '92%', label: 'Malayalam\nAccuracy' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All modules');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ALL_FEATURES.filter(f => {
    const categoryMatch = activeCategory === 'All modules' || f.category === activeCategory;
    const searchMatch = !searchQuery ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  return (
    <div className="dash-root">
      {/* Hero Banner */}
      <div className="dash-hero">
        <div className="dash-hero-badge">MOVA ACCESSIBILITY SUITE</div>
        <h1 className="dash-hero-title">
          Sign language isn't a barrier.<br />
          <span className="dash-hero-title-blue">It's a bridge.</span>
        </h1>
        <p className="dash-hero-sub">
          Explore the tools that help you translate, communicate, learn, and access support.
        </p>
        <div className="dash-hero-actions">
          <button
            className="dash-btn-primary"
            onClick={() => setActiveCategory('All modules')}
          >
            Browse all features →
          </button>
          <button
            className="dash-btn-outline"
            onClick={() => navigate('/app/sign-to-text')}
          >
            Interactive tour
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="dash-filter-bar">
        <div className="dash-categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`dash-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="dash-search-wrap">
          <Search size={15} className="dash-search-icon" />
          <input
            className="dash-search"
            type="search"
            placeholder="Search features or shortcuts…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            aria-label="Search features"
          />
        </div>
      </div>

      {/* Feature Grid */}
      <div className="dash-grid">
        {filtered.map(f => {
          const Icon = f.icon;
          return (
            <div key={f.id} className="dash-card">
              <div className="dash-card-top">
                <div className="dash-card-icon-wrap">
                  <Icon size={22} style={{ color: f.tagColor }} />
                </div>
                <span className="dash-card-tag" style={{ color: f.tagColor }}>
                  {f.tag}
                </span>
              </div>

              <h3 className="dash-card-title">{f.title}</h3>
              <p className="dash-card-desc">{f.desc}</p>

              <button
                className="dash-card-cta"
                onClick={() => navigate(f.route)}
              >
                {f.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Impact Stats Banner */}
      <div className="dash-impact">
        <div className="dash-impact-left">
          <div className="dash-impact-eyebrow">OUR COLLECTIVE IMPACT</div>
          <h2 className="dash-impact-title">A more inclusive world is possible.</h2>
          <p className="dash-impact-sub">
            Over 1 million individuals in our community leverage MOVA to communicate, learn, and live without barriers.
          </p>
        </div>
        <div className="dash-impact-stats">
          {STATS.map(s => (
            <div key={s.value} className="dash-stat">
              <div className="dash-stat-value">{s.value}</div>
              <div className="dash-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
