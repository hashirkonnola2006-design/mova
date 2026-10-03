import React, { useState, useMemo } from 'react';
import { Volume2, Search, Sparkles, CheckCircle2, AlertCircle, PlusCircle } from 'lucide-react';
import PageLayout from '../components/PageLayout.jsx';
import InquiryForm from '../components/InquiryForm.jsx';
import { SIGNS, ACTIVE_SIGN_KEYS } from '../data/signs.js';

function speakSign(malayalam, english) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  const mlVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('ml'));
  const utterance = new SpeechSynthesisUtterance(mlVoice ? malayalam : english);
  utterance.lang = mlVoice ? 'ml-IN' : 'en-US';
  if (mlVoice) utterance.voice = mlVoice;
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export default function SupportedSignsPage() {
  React.useEffect(() => {
    document.title = 'Supported Signs – MOVA';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = `Browse all ${SIGNS.length} signs in the MOVA vocabulary with Malayalam text and audio.`;
  }, []);

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [playingKey, setPlayingKey] = useState(null);

  // Active inquiry modals / inline states
  const [reportingSign, setReportingSign] = useState(null);
  const [suggestingSign, setSuggestingSign] = useState(false);

  const categories = useMemo(() => {
    return ['All', ...new Set(SIGNS.map(s => s.category))].sort((a, b) => a === 'All' ? -1 : a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return SIGNS.filter(s => {
      const matchesSearch = !q ||
        s.english.toLowerCase().includes(q) ||
        s.malayalam.includes(q) ||
        s.category.toLowerCase().includes(q);
      const matchesCategory = activeCategory === 'All' || s.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const activeSet = new Set(ACTIVE_SIGN_KEYS);

  const handleSpeak = (sign) => {
    setPlayingKey(sign.key);
    speakSign(sign.malayalam, sign.english);
    setTimeout(() => setPlayingKey(null), 1000);
  };

  return (
    <PageLayout
      title="Supported Signs"
      description={`Explore our comprehensive vocabulary of ${SIGNS.length} signs across ${categories.length - 1} everyday categories with Malayalam pronunciation.`}
    >
      {/* Accuracy Status Banner */}
      <div className="pl-info-banner">
        <Sparkles className="pl-info-banner-icon" />
        <div>
          <p>
            <strong>Real-time Detection Active:</strong> The current model actively recognizes signs marked with{' '}
            <span className="ss-tag-active">Active</span> in real-time camera mode. The remaining vocabulary is supported in Practice and Dictionary view, with progressive model expansion underway.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="ss-controls">
        <div className="ss-search-wrap">
          <Search className="ss-search-icon" size={20} />
          <input
            type="search"
            className="ss-search-input"
            placeholder="Search signs in English or Malayalam..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search signs"
          />
          {search && (
            <button className="ss-clear-search" onClick={() => setSearch('')}>
              ✕
            </button>
          )}
        </div>

        <div className="ss-filter-bar">
          <div className="ss-categories-scroll" role="group" aria-label="Filter by category">
            {categories.map(cat => (
              <button
                key={cat}
                className={`ss-cat-chip ${activeCategory === cat ? 'ss-cat-chip--active' : ''}`}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="ss-count-badge">
            {filtered.length} {filtered.length === 1 ? 'sign' : 'signs'}
          </div>
        </div>
      </div>

      {/* Grid of Signs */}
      {filtered.length === 0 ? (
        <div className="ss-empty-state">
          <div className="ss-empty-icon">🔍</div>
          <h3>No matching signs found</h3>
          <p>We couldn't find any signs matching "{search}". Try searching for another keyword or reset the filter.</p>
          <button
            className="ss-reset-btn"
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <ul className="ss-cards-grid" aria-label="Sign vocabulary cards">
          {filtered.map(sign => {
            const isActive = activeSet.has(sign.key);
            const isPlaying = playingKey === sign.key;
            const isReporting = reportingSign?.key === sign.key;

            return (
              <li key={sign.key} className={`ss-item-card ${isActive ? 'ss-item-card--active' : ''}`}>
                <div className="ss-card-top">
                  <span className="ss-category-label">{sign.category}</span>
                  {isActive && (
                    <span className="ss-live-badge" title="Trained for real-time camera detection">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  )}
                </div>

                <div className="ss-card-body">
                  <div className="ss-malayalam-word" lang="ml">
                    {sign.malayalam}
                  </div>
                  <div className="ss-english-word">
                    {sign.english}
                  </div>
                </div>

                <div className="ss-card-footer">
                  <button
                    type="button"
                    className={`ss-audio-btn ${isPlaying ? 'ss-audio-btn--playing' : ''}`}
                    onClick={() => handleSpeak(sign)}
                    aria-label={`Pronounce ${sign.english} in Malayalam`}
                  >
                    <Volume2 size={16} />
                    <span>Pronounce</span>
                  </button>

                  <button
                    type="button"
                    className="ss-report-btn"
                    onClick={() => setReportingSign(isReporting ? null : sign)}
                    title={`Report wrong sign for ${sign.english}`}
                    aria-label={`Report wrong sign for ${sign.english}`}
                  >
                    <AlertCircle size={14} />
                    <span>Report</span>
                  </button>
                </div>

                {/* Inline compact report form */}
                {isReporting && (
                  <div className="ss-card-report-box">
                    <div className="ss-card-report-header">
                      <span>Report "{sign.english} ({sign.malayalam})"</span>
                      <button
                        type="button"
                        className="ss-card-report-close"
                        onClick={() => setReportingSign(null)}
                      >
                        ✕
                      </button>
                    </div>
                    <InquiryForm
                      source={`/supported-signs#${sign.key}`}
                      type="Wrong translation"
                      initialMessage={`Sign ID: ${sign.key}\nWord: ${sign.english} (${sign.malayalam})\nCategory: ${sign.category}\nIssue: `}
                      compact={true}
                      onCancel={() => setReportingSign(null)}
                      onSent={() => setReportingSign(null)}
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Suggest a Sign Section at bottom */}
      <div className="ss-suggest-wrap">
        <div className="ss-suggest-card">
          <div className="ss-suggest-info">
            <PlusCircle size={28} className="ss-suggest-icon" />
            <div>
              <h3>Know a sign that should be in MOVA?</h3>
              <p>We continually expand our vocabulary with input from the Deaf and hard-of-hearing community.</p>
            </div>
          </div>
          {!suggestingSign ? (
            <button
              type="button"
              className="ss-suggest-btn"
              onClick={() => setSuggestingSign(true)}
            >
              Suggest a sign
            </button>
          ) : (
            <div className="ss-suggest-form-box">
              <div className="ss-suggest-form-header">
                <h4>Suggest a new sign or vocabulary addition</h4>
              </div>
              <InquiryForm
                source="/supported-signs#suggest"
                type="I can help with signs"
                initialMessage="I'd like to suggest adding this sign / word:\nMalayalam:\nEnglish:\nDescription / Context: "
                compact={true}
                onCancel={() => setSuggestingSign(false)}
                onSent={() => setSuggestingSign(false)}
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ss-tag-active {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #166534;
          background: #DCFCE7;
          padding: 0.1rem 0.5rem;
          border-radius: 9999px;
          margin: 0 0.2rem;
        }

        /* Controls */
        .ss-controls {
          margin-bottom: 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ss-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .ss-search-icon {
          position: absolute;
          left: 1.25rem;
          color: #94A3B8;
          pointer-events: none;
        }

        .ss-search-input {
          width: 100%;
          height: 54px;
          padding: 0 3rem 0 3.25rem;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 14px;
          font-size: 1.02rem;
          color: #0F172A;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.03);
          transition: all 0.2s ease;
          outline: none;
        }

        .ss-search-input:focus {
          border-color: #1558E8;
          box-shadow: 0 0 0 4px rgba(21, 88, 232, 0.12);
        }

        .ss-clear-search {
          position: absolute;
          right: 1.25rem;
          background: #F1F5F9;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          cursor: pointer;
          font-size: 0.75rem;
          transition: all 0.15s;
        }

        .ss-clear-search:hover {
          background: #E2E8F0;
          color: #0F172A;
        }

        .ss-filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .ss-categories-scroll {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .ss-cat-chip {
          padding: 0.45rem 1rem;
          border-radius: 9999px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          font-size: 0.88rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: inherit;
        }

        .ss-cat-chip:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
          color: #0F172A;
        }

        .ss-cat-chip--active {
          background: #1558E8 !important;
          border-color: #1558E8 !important;
          color: #FFFFFF !important;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(21, 88, 232, 0.25);
        }

        .ss-count-badge {
          font-size: 0.88rem;
          font-weight: 600;
          color: #64748B;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
        }

        /* Card Grid */
        .ss-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 1.25rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .ss-item-card {
          background: #FFFFFF;
          border: 1.5px solid #EDF2F7;
          border-radius: 18px;
          padding: 1.25rem 1.15rem 1.1rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.03);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease;
          position: relative;
        }

        .ss-item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 22px rgba(21, 88, 232, 0.08);
          border-color: #BFDBFE;
        }

        .ss-item-card--active {
          background: linear-gradient(180deg, #FFFFFF 0%, #FAFCFF 100%);
        }

        .ss-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .ss-category-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .ss-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.72rem;
          font-weight: 700;
          color: #15803D;
          background: #DCFCE7;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
        }

        .ss-card-body {
          text-align: center;
          margin: 0.5rem 0 1.1rem;
        }

        .ss-malayalam-word {
          font-family: 'Noto Sans Malayalam', sans-serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: #0F172A;
          line-height: 1.25;
          margin-bottom: 0.25rem;
        }

        .ss-english-word {
          font-size: 0.95rem;
          font-weight: 500;
          color: #64748B;
        }

        .ss-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ss-audio-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.5rem 0.6rem;
          border-radius: 9px;
          border: 1px solid #E2E8F0;
          background: #F8FAFC;
          color: #1E293B;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ss-audio-btn:hover {
          background: #EFF6FF;
          border-color: #BFDBFE;
          color: #1558E8;
        }

        .ss-audio-btn--playing {
          background: #1558E8 !important;
          color: #FFFFFF !important;
          border-color: #1558E8 !important;
        }

        .ss-report-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          padding: 0.5rem 0.6rem;
          border-radius: 9px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          color: #64748B;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }

        .ss-report-btn:hover {
          background: #FEF2F2;
          border-color: #FECACA;
          color: #DC2626;
        }

        .ss-card-report-box {
          margin-top: 0.85rem;
          border-top: 1px solid #E8EDF5;
          padding-top: 0.75rem;
          text-align: left;
        }

        .ss-card-report-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0B1020;
          margin-bottom: 0.4rem;
        }

        .ss-card-report-close {
          background: none;
          border: none;
          color: #64748B;
          cursor: pointer;
          font-size: 0.85rem;
        }

        /* Suggest a sign section */
        .ss-suggest-wrap {
          margin-top: 3.5rem;
        }

        .ss-suggest-card {
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 20px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .ss-suggest-info {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .ss-suggest-icon {
          color: #1558E8;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ss-suggest-info h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 0.35rem;
        }

        .ss-suggest-info p {
          font-size: 0.95rem;
          color: #64748B;
          margin: 0;
          line-height: 1.55;
        }

        .ss-suggest-btn {
          align-self: flex-start;
          background: #1558E8;
          color: #FFFFFF;
          border: none;
          padding: 0.75rem 1.6rem;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
          font-family: inherit;
        }

        .ss-suggest-btn:hover {
          background: #1048C6;
        }

        .ss-suggest-form-box {
          background: #FFFFFF;
          border: 1px solid #E8EDF5;
          border-radius: 14px;
          padding: 1.5rem;
        }

        .ss-suggest-form-header h4 {
          font-size: 1.05rem;
          font-weight: 700;
          color: #0B1020;
          margin: 0 0 0.75rem;
        }

        /* Empty State */
        .ss-empty-state {
          text-align: center;
          padding: 4.5rem 1.5rem;
          background: #F8FAFC;
          border: 1.5px dashed #CBD5E1;
          border-radius: 20px;
          margin: 1rem 0;
        }

        .ss-empty-icon {
          font-size: 2.75rem;
          margin-bottom: 1rem;
        }

        .ss-empty-state h3 {
          font-size: 1.3rem;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 0.5rem;
        }

        .ss-empty-state p {
          color: #64748B;
          max-width: 420px;
          margin: 0 auto 1.5rem;
          font-size: 0.95rem;
        }

        .ss-reset-btn {
          background: #1558E8;
          color: #fff;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ss-reset-btn:hover {
          background: #1048C6;
        }

        @media (max-width: 640px) {
          .ss-cards-grid {
            grid-template-columns: 1fr;
          }
          .ss-suggest-info {
            flex-direction: column;
            gap: 0.75rem;
          }
        }
      `}</style>
    </PageLayout>
  );
}
