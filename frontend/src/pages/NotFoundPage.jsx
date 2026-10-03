import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, HelpCircle, Mail, Search } from 'lucide-react';
import MovaLogo from '../components/MovaLogo.jsx';
import Footer from '../components/Footer.jsx';

export default function NotFoundPage() {
  React.useEffect(() => {
    document.title = '404 – Page Not Found – MOVA';
  }, []);

  const navigate = useNavigate();

  return (
    <div className="nf-root">
      {/* Minimal Header */}
      <header className="nf-header">
        <Link to="/" aria-label="MOVA home">
          <MovaLogo height={28} showWordmark={true} />
        </Link>
      </header>

      {/* Main Hero Card */}
      <main className="nf-main" id="main-content">
        <div className="nf-container">
          <div className="nf-badge">404 Error</div>
          <h1 className="nf-title">Page not found</h1>
          <p className="nf-body">
            Sorry, we couldn't find the page or route you were looking for. The link might be outdated or typed incorrectly.
          </p>

          <div className="nf-actions">
            <button
              type="button"
              className="nf-btn-primary"
              onClick={() => navigate('/')}
            >
              <Home size={18} />
              <span>Back to Home</span>
            </button>
            <button
              type="button"
              className="nf-btn-secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={18} />
              <span>Go Back</span>
            </button>
          </div>

          <div className="nf-helpful-links">
            <span>Helpful destinations:</span>
            <div className="nf-links-row">
              <Link to="/supported-signs"><Search size={14} /> Supported Signs</Link>
              <Link to="/help"><HelpCircle size={14} /> Help Center</Link>
              <Link to="/contact"><Mail size={14} /> Contact Team</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Site Footer */}
      <Footer />

      <style>{`
        .nf-root {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          background: #FFFFFF;
          color: #0F172A;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .nf-header {
          padding: 1.25rem 2rem;
          border-bottom: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          background: #FFFFFF;
        }

        .nf-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 1.5rem;
          background: radial-gradient(circle at 50% 20%, #EFF6FF 0%, #FAFCFF 60%, #FFFFFF 100%);
        }

        .nf-container {
          max-width: 540px;
          text-align: center;
        }

        .nf-badge {
          display: inline-block;
          font-size: 0.85rem;
          font-weight: 700;
          color: #1558E8;
          background: #DBEAFE;
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          margin-bottom: 1.25rem;
          letter-spacing: 0.05em;
        }

        .nf-title {
          font-size: clamp(2.2rem, 5vw, 3rem);
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 1rem;
          letter-spacing: -0.035em;
          line-height: 1.15;
        }

        .nf-body {
          font-size: 1.05rem;
          color: #64748B;
          line-height: 1.6;
          margin: 0 0 2rem;
        }

        .nf-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #1558E8;
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(21, 88, 232, 0.25);
          transition: all 0.2s ease;
        }

        .nf-btn-primary:hover {
          background: #1048C6;
          transform: translateY(-1px);
        }

        .nf-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #FFFFFF;
          color: #334155;
          border: 1.5px solid #CBD5E1;
          border-radius: 12px;
          padding: 0.75rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nf-btn-secondary:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }

        .nf-helpful-links {
          border-top: 1px solid #E2E8F0;
          padding-top: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-size: 0.88rem;
          color: #94A3B8;
        }

        .nf-links-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .nf-links-row a {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          color: #1558E8;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.15s;
        }

        .nf-links-row a:hover {
          color: #1048C6;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
