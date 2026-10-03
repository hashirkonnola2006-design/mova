import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Unified StartButton component.
 * Navigates to /app/sign-to-text if logged in, otherwise to /login.
 * Default label is "Start translating", customizable via children or label prop.
 */
export default function StartButton({
  className = '',
  variant = 'primary',
  showArrow = true,
  children,
  label
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleClick = () => {
    if (isAuthenticated) {
      navigate('/app/sign-to-text');
    } else {
      navigate('/login');
    }
  };

  const text = children || label || 'Start translating';

  return (
    <button
      type="button"
      className={`lp-btn-primary ${variant === 'banner' ? 'lp-btn-banner' : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={typeof text === 'string' ? text : 'Start translating'}
    >
      {text}
      {showArrow && <ArrowRight size={18} className="lp-arrow-icon" />}
    </button>
  );
}
