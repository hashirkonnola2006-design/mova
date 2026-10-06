import React from 'react';
import { FeaturesSectionWithHoverEffects } from '@/components/ui/feature-section-with-hover-effects';
import './Features.css';

const Features = React.forwardRef(function Features({ inView = false }, ref) {
  return (
    <section
      ref={ref}
      id="features"
      className="lp-section lp-section--pale"
      aria-labelledby="features-heading"
    >
      <div className={`lp-section-inner ${inView ? 'lp-fade-up' : ''}`}>
        <div className="lp-pill">FEATURES & ROADMAP</div>
        <h2 id="features-heading" className="lp-headline">
          Everything you need to be understood.
        </h2>
        <p className="lp-features-sub">
          Explore our existing live translation features alongside upcoming innovations on our product roadmap.
        </p>

        <div className="lp-features-hover-wrap">
          <FeaturesSectionWithHoverEffects />
        </div>
      </div>
    </section>
  );
});

export default Features;
