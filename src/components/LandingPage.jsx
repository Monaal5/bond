import React, { useState, useEffect, useRef } from 'react';

const HERO_SLIDES = [
  {
    tag: 'New Arrivals',
    title: 'Invest in India\'s Safest Assets',
    subtitle: 'Earn up to 9.5% p.a. with Government & Corporate Bonds — secured, regulated, and transparent.',
    badge: 'AAA Rated',
    yield: '9.5%',
    type: 'Government Bonds',
    bg: 'linear-gradient(135deg, #0b1f38 0%, #1a3a5c 100%)',
  },
  {
    tag: 'Top Picks',
    title: 'Corporate Bonds at Premium Yields',
    subtitle: 'Hand-picked high-yield corporate bonds from India\'s leading companies — HDFC, Tata, Bajaj Finance.',
    badge: 'AA+',
    yield: '8.75%',
    type: 'Corporate Bonds',
    bg: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
  },
  {
    tag: 'Tax Free',
    title: 'Municipal & PSU Bonds — Tax Efficient',
    subtitle: 'Build a tax-efficient portfolio with Municipal bonds backed by city corporations and PSU entities.',
    badge: 'A Rated',
    yield: '7.8%',
    type: 'Municipal Bonds',
    bg: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 100%)',
  },
];

const FEATURED_BONDS = [
  { name: 'Govt Securities 2031', type: 'Government Bond', rating: 'AAA', yield: '7.25%', maturity: 'Jun 2031', minInvest: '₹10,000', tag: 'Sovereign' },
  { name: 'HDFC Infrastructure Bond', type: 'Corporate Bond', rating: 'AA+', yield: '8.10%', maturity: 'Mar 2028', minInvest: '₹5,000', tag: 'Hot' },
  { name: 'Municipal Corp 2030', type: 'Municipal Bond', rating: 'A', yield: '6.75%', maturity: 'Dec 2030', minInvest: '₹1,000', tag: 'Tax Free' },
  { name: 'RBI Floating Rate Savings', type: 'Government Bond', rating: 'AAA', yield: '7.88%', maturity: 'Sep 2032', minInvest: '₹1,000', tag: 'Sovereign' },
  { name: 'Tata Capital NCD', type: 'Corporate Bond', rating: 'AA', yield: '9.15%', maturity: 'Jan 2027', minInvest: '₹5,000', tag: 'High Yield' },
  { name: 'NHAI Infra Bond', type: 'PSU Bond', rating: 'AAA', yield: '7.50%', maturity: 'Mar 2033', minInvest: '₹10,000', tag: 'PSU' },
];

const CATEGORIES = [
  { img: '/images/cat_govt.png', label: 'Government Bonds', count: '48 Bonds', color: '#0b1f38', bg: 'linear-gradient(135deg, #0b1f38, #1a3a5c)', yield: 'Up to 8.0%' },
  { img: '/images/cat_corp.png', label: 'Corporate Bonds', count: '127 Bonds', color: '#064e3b', bg: 'linear-gradient(135deg, #064e3b, #065f46)', yield: 'Up to 11%' },
  { img: '/images/cat_muni.png', label: 'Municipal Bonds', count: '34 Bonds', color: '#713f12', bg: 'linear-gradient(135deg, #713f12, #92400e)', yield: 'Up to 8.5%' },
  { img: '/images/cat_psu.png', label: 'PSU Bonds', count: '62 Bonds', color: '#3b0764', bg: 'linear-gradient(135deg, #3b0764, #6b21a8)', yield: 'Up to 8.2%' },
];

const STATS = [
  { value: '₹2,400Cr+', label: 'Assets Under Management' },
  { value: '50,000+', label: 'Happy Investors' },
  { value: '300+', label: 'Curated Bonds' },
  { value: '99.8%', label: 'On-Time Payouts' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up Free', desc: 'Create your account in 2 minutes. Complete KYC digitally — no paperwork.', icon: '✍️' },
  { step: '02', title: 'Browse Bonds', desc: 'Explore 300+ bonds filtered by yield, rating, maturity, and type.', icon: '🔍' },
  { step: '03', title: 'Invest & Earn', desc: 'Invest starting ₹1,000. Receive regular payout directly to your bank.', icon: '💰' },
];

const RIBBON_COMPANIES = [
  'HDFC Bank', 'SBI', 'ICICI Bank', 'Tata Capital', 'L&T Finance',
  'Bajaj Finance', 'NHAI', 'HUDCO', 'REC Ltd', 'PFC', 'LIC Housing', 'Axis Bank'
];

const TESTIMONIALS = [
  { name: 'Arjun Sharma', role: 'Retail Investor', text: 'BondVault helped me move from FDs to bonds earning 2% more annually. Crystal clear interface.', avatar: 'AS' },
  { name: 'Priya Mehta', role: 'HNI Client', text: 'My portfolio manager tracks everything here. The transparency and yield data are top-class.', avatar: 'PM' },
  { name: 'Rajesh Kumar', role: 'Retired Professional', text: 'Finally a platform that makes bonds accessible. Government-grade safety with premium returns.', avatar: 'RK' },
];

export default function LandingPage({ onSignUp, onLogin }) {
  const [heroSlide, setHeroSlide] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const carouselRef = useRef(null);
  const bondScrollRef = useRef(null);

  // Hero auto-rotate
  useEffect(() => {
    const t = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Testimonial auto-rotate
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  // Scroll detection for navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const slide = HERO_SLIDES[heroSlide];

  return (
    <div className="landing-root">
      {/* ── NAVBAR ── */}
      <nav className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <div className="lp-logo">
            <span className="lp-logo-icon">⬡</span>
            <span className="lp-logo-text">BondVault</span>
          </div>
          <div className="lp-nav-links">
            <a href="#bonds" className="lp-nav-link">Explore Bonds</a>
            <a href="#how" className="lp-nav-link">How It Works</a>
            <a href="#categories" className="lp-nav-link">Categories</a>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={onLogin}>Log In</button>
            <button className="lp-btn-cta" onClick={onSignUp}>
              Sign Up Free <span>→</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="lp-hero">
        {/* Gradient border top */}
        <div className="lp-hero-border-top" />

        <div className="lp-hero-inner">
          {/* Left content */}
          <div className="lp-hero-content">
            <div className="lp-hero-tag">
              <span className="lp-dot" />
              {slide.tag}
            </div>
            <h1 className="lp-hero-title">{slide.title}</h1>
            <p className="lp-hero-subtitle">{slide.subtitle}</p>
            <div className="lp-hero-actions">
              <button className="lp-btn-hero-primary" onClick={onSignUp}>
                Start Investing →
              </button>
              <button className="lp-btn-hero-ghost" onClick={onLogin}>
                View Bonds
              </button>
            </div>
            {/* Slide indicators */}
            <div className="lp-slide-dots">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  className={`lp-dot-btn ${i === heroSlide ? 'active' : ''}`}
                  onClick={() => setHeroSlide(i)}
                />
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="lp-hero-image-wrap" style={{ flexShrink: 0, position: 'relative', width: '500px', display: 'flex', justifyContent: 'center' }}>
            <img src="/images/investor_hero.png" alt="Investor" className="lp-hero-image" style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain', animation: 'float 6s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ── MOVING RIBBON ── */}
      <div className="lp-ribbon">
        <div className="lp-ribbon-content">
          {[...RIBBON_COMPANIES, ...RIBBON_COMPANIES].map((company, i) => (
            <div className="lp-ribbon-item" key={i}>
              <span className="lp-ribbon-dot" />
              {company}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <section className="lp-stats-bar">
        {STATS.map((s, i) => (
          <div className="lp-stat" key={i}>
            <div className="lp-stat-value">{s.value}</div>
            <div className="lp-stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* ── FEATURED BONDS CAROUSEL ── */}
      <section className="lp-section" id="bonds">
        <div className="lp-section-header">
          <div>
            <div className="lp-section-tag">New Arrivals</div>
            <h2 className="lp-section-title">Featured Bonds</h2>
            <p className="lp-section-subtitle">Hand-curated bonds across ratings and maturities</p>
          </div>
          <button className="lp-btn-outline" onClick={onSignUp}>View All Bonds →</button>
        </div>

        <div className="lp-bonds-scroll" ref={bondScrollRef}>
          {FEATURED_BONDS.map((bond, i) => (
            <div className="lp-bond-card" key={i}>
              <div className="lp-bond-card-inner">
                <div className="lp-bc-top">
                  <span className={`lp-bc-tag lp-bc-tag-${bond.tag.toLowerCase().replace(' ', '-')}`}>{bond.tag}</span>
                  <span className="lp-bc-rating">{bond.rating}</span>
                </div>
                <div className="lp-bc-name">{bond.name}</div>
                <div className="lp-bc-type">{bond.type}</div>
                <div className="lp-bc-stats">
                  <div className="lp-bc-stat">
                    <div className="lp-bc-stat-val" style={{ color: '#10b981' }}>{bond.yield}</div>
                    <div className="lp-bc-stat-label">Yield p.a.</div>
                  </div>
                  <div className="lp-bc-stat">
                    <div className="lp-bc-stat-val">{bond.maturity}</div>
                    <div className="lp-bc-stat-label">Maturity</div>
                  </div>
                  <div className="lp-bc-stat">
                    <div className="lp-bc-stat-val">{bond.minInvest}</div>
                    <div className="lp-bc-stat-label">Min. Invest</div>
                  </div>
                </div>
                <button className="lp-bc-btn" onClick={onSignUp}>Invest Now</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="lp-section lp-section-dark" id="categories">
        <div className="lp-section-inner">
          <div className="lp-section-tag lp-tag-light">Explore</div>
          <h2 className="lp-section-title lp-title-light">Bond Categories</h2>
          <p className="lp-section-subtitle lp-sub-light">Choose from Government, Corporate, Municipal, and PSU bonds</p>
          <div className="lp-categories-grid">
            {CATEGORIES.map((cat, i) => (
              <div className="lp-cat-card" key={i} onClick={onSignUp}>
                <img src={cat.img} alt={cat.label} className="lp-cat-img" />
                <div className="lp-cat-content">
                  <div className="lp-cat-label">{cat.label}</div>
                  <div className="lp-cat-count">{cat.count}</div>
                  <div className="lp-cat-yield">{cat.yield}</div>
                  <div className="lp-cat-arrow">→</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-section" id="how">
        <div className="lp-section-inner" style={{ textAlign: 'center' }}>
          <div className="lp-section-tag">Simple Process</div>
          <h2 className="lp-section-title">How It Works</h2>
          <p className="lp-section-subtitle">Start investing in bonds in 3 easy steps</p>
          <div className="lp-hiw-grid">
            {HOW_IT_WORKS.map((step, i) => (
              <div className="lp-hiw-card" key={i}>
                <div className="lp-hiw-step">{step.step}</div>
                <div className="lp-hiw-icon">{step.icon}</div>
                <div className="lp-hiw-title">{step.title}</div>
                <div className="lp-hiw-desc">{step.desc}</div>
                {i < HOW_IT_WORKS.length - 1 && <div className="lp-hiw-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECURITY & TRUST SECTION ── */}
      <section className="lp-section lp-section-dark">
        <div className="lp-section-inner" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <img src="/images/mobile_mockup.png" alt="BondVault Security" style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '24px', filter: 'drop-shadow(0 20px 50px rgba(16, 185, 129, 0.2))' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="lp-section-tag lp-tag-light">Institutional Grade</div>
            <h2 className="lp-section-title lp-title-light">Bank-Grade Security for Your Wealth</h2>
            <p className="lp-section-subtitle lp-sub-light" style={{ marginBottom: '24px' }}>
              Your investments are protected by the same security standards used by world-class financial institutions. We prioritize safety and transparency above all else.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', color: '#94a3b8' }}>
              <li style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px', borderRadius: '50%', fontSize: '14px' }}>✓</div>
                <span>End-to-end 256-bit encryption for all data</span>
              </li>
              <li style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px', borderRadius: '50%', fontSize: '14px' }}>✓</div>
                <span>SEBI regulated and fully compliant platform</span>
              </li>
              <li style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px', borderRadius: '50%', fontSize: '14px' }}>✓</div>
                <span>Secure custody of assets in your demat account</span>
              </li>
            </ul>
            <button className="lp-btn-cta" onClick={onSignUp}>Explore Security Features</button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="lp-section lp-testimonials-section">
        <div className="lp-section-inner" style={{ textAlign: 'center' }}>
          <div className="lp-section-tag">Trusted By Investors</div>
          <h2 className="lp-section-title">What Our Clients Say</h2>
          <div className="lp-testimonial-wrap">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`lp-testimonial-card ${i === testimonialIdx ? 'active' : ''}`}
              >
                <div className="lp-test-quote">❝</div>
                <p className="lp-test-text">{t.text}</p>
                <div className="lp-test-author">
                  <div className="lp-test-avatar">{t.avatar}</div>
                  <div>
                    <div className="lp-test-name">{t.name}</div>
                    <div className="lp-test-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="lp-test-dots">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`lp-dot-btn ${i === testimonialIdx ? 'active' : ''}`}
                  onClick={() => setTestimonialIdx(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="lp-cta-banner">
        <div className="lp-cta-inner">
          <h2 className="lp-cta-title">Start Earning Better Returns Today</h2>
          <p className="lp-cta-subtitle">Join 50,000+ investors who trust BondVault for their fixed-income investments</p>
          <button className="lp-btn-cta lp-cta-btn-large" onClick={onSignUp}>
            Create Free Account →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-brand">
            <div className="lp-logo" style={{ marginBottom: 12 }}>
              <span className="lp-logo-icon">⬡</span>
              <span className="lp-logo-text">BondVault</span>
            </div>
            <p className="lp-footer-tagline">India's most trusted bond investment platform. SEBI regulated. Investor-first.</p>
          </div>
          <div className="lp-footer-links">
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Products</div>
              <a href="#" className="lp-footer-link">Government Bonds</a>
              <a href="#" className="lp-footer-link">Corporate Bonds</a>
              <a href="#" className="lp-footer-link">Municipal Bonds</a>
              <a href="#" className="lp-footer-link">PSU Bonds</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Company</div>
              <a href="#" className="lp-footer-link">About Us</a>
              <a href="#" className="lp-footer-link">Careers</a>
              <a href="#" className="lp-footer-link">Press</a>
              <a href="#" className="lp-footer-link">Contact</a>
            </div>
            <div className="lp-footer-col">
              <div className="lp-footer-col-title">Legal</div>
              <a href="#" className="lp-footer-link">Privacy Policy</a>
              <a href="#" className="lp-footer-link">Terms of Use</a>
              <a href="#" className="lp-footer-link">Disclosures</a>
              <a href="#" className="lp-footer-link">SEBI Registration</a>
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span>© 2025 BondVault. All rights reserved.</span>
          <span>SEBI Registered Investment Advisor | Investments subject to market risk</span>
        </div>
      </footer>
    </div>
  );
}
