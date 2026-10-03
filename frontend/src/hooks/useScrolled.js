import { useState, useEffect } from 'react';

/**
 * Custom hook that tracks whether window.scrollY exceeds a given threshold.
 * Runs an initial check on mount to handle pages loaded mid-scroll.
 * 
 * @param {number} threshold - Scroll threshold in pixels (default: 10)
 * @returns {boolean} Whether window.scrollY > threshold
 */
export function useScrolled(threshold = 10) {
  const [isScrolled, setIsScrolled] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY > threshold;
    }
    return false;
  });

  useEffect(() => {
    // Initial check on mount
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold;
      setIsScrolled(prev => (prev !== scrolled ? scrolled : prev));
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return isScrolled;
}

export default useScrolled;
