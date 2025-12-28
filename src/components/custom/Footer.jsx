import React, { useState } from 'react';
import './Footer.css'; 
const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-content">
            
            {/* Subscribe Section */}
            <div className="subscribe-section">
              <h3 className="section-title">Subscribe</h3>
              <p className="section-description">
                Get the latest travel insights & AI updates<br>
                </br>
                Made In India 🇮🇳
              </p>
              <form className="subscribe-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="email-input"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitted}
                  className={`subscribe-btn ${isSubmitted ? 'subscribed' : ''}`}
                >
                  {isSubmitted ? '✓ Subscribed!' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Help Section*/}
            <div className="help-section">
              <h3 className="section-title">Help</h3>
              <div className="help-links">
                <a href="/terms" className="help-link">Terms</a>
                <a href="/privacy" className="help-link">Privacy</a>
              </div>
            </div>
            
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="footer-bg">
          {/* Car Animation */}
          <div className="car-animation" />
          {/* Bicycle Animation */}
          <div className="bicycle-animation" />
        </div>
      </div>
      

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="copyright-section">
              <p className="copyright-text">
                © 2025 Wander AI - Where your tech dreams came true ✨
              </p>
            </div>
            <div className="developer-section">
              <p className="developer-text">
                Made with <span className="heart">❤️</span> by{' '}
                <span className="developer-name">_havlock_hari_!!</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;