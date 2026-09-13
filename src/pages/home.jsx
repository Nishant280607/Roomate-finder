import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section" id="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge animate-fade-up">
              <span className="badge-sparkle">✦</span>
              <span>Next-Gen Roommate Matching</span>
            </div>

            <h1 className="hero-title animate-fade-up">
              Find the right roommate.
              <br />
              <span className="title-gradient">Find a place that feels like home.</span>
            </h1>

            <p className="hero-subtitle animate-fade-up">
              Discover people who match your lifestyle, budget, and preferences through smart compatibility scoring and verified profiles.
            </p>

            <div className="hero-actions animate-fade-up">
              <Link to="/register" className="btn-primary-hero">
                Find My Roommate <span className="arrow-icon">→</span>
              </Link>
              <a href="#how-it-works" className="btn-secondary-hero">
                How It Works
              </a>
            </div>

            {/* Social Proof */}
            <div className="hero-social-proof animate-fade-up">
              <div className="social-avatars">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                  alt="Member"
                />
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                  alt="Member"
                />
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                  alt="Member"
                />
                <img
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80"
                  alt="Member"
                />
                <span className="avatar-more">+10k</span>
              </div>
              <div className="social-proof-meta">
                <div className="proof-stars">★★★★★</div>
                <p>
                  <strong>10,000+ people</strong> finding better roommates
                </p>
              </div>
            </div>
          </div>

          {/* Floating Visual Hero */}
          <div className="hero-visual-wrapper">
            <div className="visual-backdrop-glow"></div>

            {/* Floating Card 1: Sarah */}
            <div className="floating-card card-primary animate-float">
              <div className="floating-card-header">
                <span className="match-pill">94% Match</span>
                <span className="heart-icon active">♥</span>
              </div>
              <div className="floating-card-body">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
                  alt="Sarah Johnson"
                  className="floating-user-img"
                />
                <div className="floating-user-info">
                  <h3>Sarah Johnson, 22</h3>
                  <p className="user-location">📍 New York, NY</p>
                  <p className="user-role">UI/UX Designer</p>
                  <div className="floating-tags">
                    <span>Yoga</span>
                    <span>Coffee</span>
                    <span>Design</span>
                  </div>
                </div>
              </div>
              <div className="floating-card-footer">
                <span className="live-status">
                  <span className="status-dot"></span> Active now
                </span>
                <Link to="/discover" className="floating-card-link">
                  View Profile →
                </Link>
              </div>
            </div>

            {/* Floating Card 2: David */}
            <div className="floating-card card-secondary animate-float-delayed">
              <div className="floating-card-header">
                <span className="match-pill pill-secondary">91% Match</span>
                <span className="heart-icon">♡</span>
              </div>
              <div className="floating-card-body">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                  alt="David Wilson"
                  className="floating-user-img"
                />
                <div className="floating-user-info">
                  <h3>David Wilson, 24</h3>
                  <p className="user-location">📍 Brooklyn, NY</p>
                  <p className="user-role">Software Developer</p>
                  <div className="floating-tags">
                    <span>Coding</span>
                    <span>Gaming</span>
                    <span>Music</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick compatibility badge pill */}
            <div className="floating-badge-pill">
              <div className="pulse-indicator"></div>
              <span>Shared values & lifestyle match</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">SIMPLE & TRANSPARENT</span>
            <h2>How RoomieFinder Works</h2>
            <p>From profile setup to moving in, find your ideal living situation in four simple steps.</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">👤</div>
              <h3>Create your profile</h3>
              <p>Sign up in seconds, add your basic details, housing budget, and preferred move-in window.</p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">✨</div>
              <h3>Tell us your lifestyle</h3>
              <p>Share your sleep schedule, cleanliness preferences, social habits, and favorite interests.</p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">🎯</div>
              <h3>Discover compatible roommates</h3>
              <p>Browse matched roommates ranked by algorithm-driven compatibility percentage scores.</p>
            </div>

            <div className="step-card">
              <div className="step-number">04</div>
              <div className="step-icon">🔑</div>
              <h3>Connect and move in</h3>
              <p>Safely chat, exchange apartment ideas, schedule visits, and move in with total peace of mind.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-eyebrow">KEY CAPABILITIES</span>
            <h2>Built for modern shared living</h2>
            <p>Everything you need to find a roommate who matches your lifestyle and rhythm.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">🧠</div>
              <h3>Smart Matching</h3>
              <p>Algorithms analyze schedule, cleanliness, and lifestyle preferences to calculate true compatibility.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">⚖️</div>
              <h3>Lifestyle Compatibility</h3>
              <p>Early bird vs night owl? Quiet study vs social weekends? See key lifestyle matches at a glance.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">🛡️</div>
              <h3>Verified Profiles</h3>
              <p>Authentic accounts with verified identity details and social checks for complete safety.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">💬</div>
              <h3>Safe Messaging</h3>
              <p>End-to-end communication without having to give out personal phone numbers upfront.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">⭐</div>
              <h3>Save Favorites</h3>
              <p>Bookmark promising roommates into your shortlist to compare details and reach out anytime.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">📍</div>
              <h3>Location-based Discovery</h3>
              <p>Filter by neighborhood, borough, transit proximity, and specific moving destinations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <div className="cta-glow"></div>
          <span className="cta-badge">JOIN THOUSANDS OF ROOMMATES</span>
          <h2>Your perfect roommate might be one match away.</h2>
          <p>Create your profile in minutes and start discovering people who make living together feel effortless.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-cta-primary">
              Start Finding →
            </Link>
            <Link to="/discover" className="btn-cta-secondary">
              Browse Roommates
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand-column">
            <div className="footer-brand">
              <div className="brand-logo-mark">R</div>
              <span className="brand-name">
                Roomie<span className="brand-accent">Finder</span>
              </span>
            </div>
            <p className="footer-tagline">
              Connecting people who share lifestyles, values, and great living spaces.
            </p>
            <p className="footer-copyright">
              © {new Date().getFullYear()} RoomieFinder. All rights reserved.
            </p>
          </div>

          <div className="footer-links-column">
            <h4>Product</h4>
            <ul>
              <li><Link to="/discover">Discover</Link></li>
              <li><Link to="/matches">Matches</Link></li>
              <li><Link to="/messages">Messages</Link></li>
              <li><Link to="/saved">Saved Roommates</Link></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#hero">About Us</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="mailto:support@roomiefinder.com">Contact Support</a></li>
            </ul>
          </div>

          <div className="footer-links-column">
            <h4>Legal</h4>
            <ul>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#trust">Trust & Safety</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;