import React, { useState, useMemo, useEffect } from 'react';
import { Sparkles, Hand, Search, Filter } from 'lucide-react';
import labelsMap from '../labels_ml.json';

export default function SimulatePanel({ onInjectSign, onInjectIdle, activeSimulatingSign }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [activeModelLabels, setActiveModelLabels] = useState(null);
  const [filterToTrainedOnly, setFilterToTrainedOnly] = useState(false);

  // Fetch active model labels from backend
  useEffect(() => {
    fetch('http://localhost:8000/labels')
      .then(res => res.json())
      .then(data => {
        if (data && data.labels && data.labels.length > 0) {
          setActiveModelLabels(data.labels);
          // If fewer than 50 classes (e.g. demo subset), default to trained classes filter
          if (data.labels.length < 50) {
            setFilterToTrainedOnly(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Categories list
  const categories = useMemo(() => {
    const cats = new Set();
    Object.values(labelsMap).forEach(item => {
      if (item.parent_label && item.parent_label !== 'System') {
        cats.add(item.parent_label);
      }
    });
    return ['ALL', ...Array.from(cats).sort()];
  }, []);

  // Filtered signs list (excluding 'idle' which has its own special button)
  const filteredSigns = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return Object.entries(labelsMap)
      .filter(([slug, item]) => {
        if (slug === 'idle') return false;

        // Active model filter
        if (filterToTrainedOnly && activeModelLabels && !activeModelLabels.includes(slug)) {
          return false;
        }

        // Category filter
        if (selectedCategory !== 'ALL' && item.parent_label !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (query) {
          const matchSlug = slug.toLowerCase().includes(query);
          const matchEng = (item.english || '').toLowerCase().includes(query);
          const matchMl = (item.malayalam || '').includes(query);
          const matchParent = (item.parent_label || '').toLowerCase().includes(query);
          return matchSlug || matchEng || matchMl || matchParent;
        }
        return true;
      });
  }, [searchQuery, selectedCategory, filterToTrainedOnly, activeModelLabels]);

  return (
    <div className="glass-card" style={{ marginTop: '1.5rem', padding: '1.25rem' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles className="text-amber-400" size={18} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>
            INCLUDE-50 Sign Simulator (50 Signs Fallback)
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontWeight: 600 }}>
            Showing {filteredSigns.length} / 50
          </span>
        </div>

        {/* Idle Button */}
        <button
          className="btn btn-secondary"
          onClick={onInjectIdle}
          title="Inject Idle state (Rest hands down to satisfy gap)"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', borderColor: '#f59e0b', color: '#fcd34d' }}
        >
          <Hand size={15} />
          <span>Idle / Rest Hands (കൈ താഴ്ത്തുക)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sign by English, slug, or Malayalam..."
            style={{
              width: '100%',
              padding: '0.5rem 0.8rem 0.5rem 2.2rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Category dropdown */}
        <div style={{ minWidth: '180px', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={15} style={{ color: '#64748b' }} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.8rem',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'All Categories (50)' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Grid */}
      <div className="simulate-grid" style={{ maxHeight: '420px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.5rem' }}>
        {filteredSigns.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            No signs found matching '{searchQuery}' in '{selectedCategory}'.
          </div>
        ) : (
          filteredSigns.map(([slug, item]) => {
            const isActivelySimulating = activeSimulatingSign === slug;
            const mlText = item.malayalam || slug;
            const engText = item.english || slug;

            return (
              <button
                key={slug}
                className="simulate-btn"
                onClick={() => onInjectSign(slug)}
                title={`${slug} (${item.parent_label})`}
                style={
                  isActivelySimulating
                    ? { borderColor: '#38bdf8', background: 'rgba(56, 189, 248, 0.25)', transform: 'scale(1.03)' }
                    : {}
                }
              >
                <span className="simulate-btn-ml" style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>
                  {mlText}
                </span>
                <span className="simulate-btn-en" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {slug}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.15rem' }}>
                  {item.parent_label}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
