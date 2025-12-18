import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-page">
      {/* Header Section */}
      <div className="privacy-header">
        <div className="privacy-container">
          <div className="header-content">
            <h1 className="page-title">Privacy Policy</h1>
            <p className="page-subtitle">
              Your privacy is our priority as we craft your perfect journey
            </p>
            <div className="last-updated">
              Last updated: January 2025
            </div>
          </div>
          <div className="header-illustration">
            <div className="floating-icon shield">🛡️</div>
            <div className="floating-icon lock">🔒</div>
            <div className="floating-icon heart">💙</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="privacy-content">
        <div className="privacy-container">
          
          {/* Welcome Section */}
          <section className="privacy-section welcome-section">
            <h2>Your Trust, Our Commitment</h2>
            <p>
              At WanderAI, we believe that amazing journeys start with trust. This privacy policy 
              explains how we collect, use, and protect your information while our AI creates 
              personalized travel experiences just for you. Your privacy is not just a policy 
              - it's a promise.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="privacy-section">
            <h2>🎯 Information We Collect</h2>
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">📝</div>
                <h3>Travel Preferences</h3>
                <p>Your interests, budget, destination preferences, and travel style to create personalized AI recommendations.</p>
              </div>
              <div className="info-item">
                <div className="info-icon">📧</div>
                <h3>Contact Information</h3>
                <p>Email address for newsletters, updates, and important service communications.</p>
              </div>
              <div className="info-item">
                <div className="info-icon">📊</div>
                <h3>Usage Analytics</h3>
                <p>How you interact with our AI to improve our recommendations and user experience.</p>
              </div>
              <div className="info-item">
                <div className="info-icon">🍪</div>
                <h3>Technical Data</h3>
                <p>Cookies and device information to ensure our AI service works smoothly for you.</p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="privacy-section">
            <h2>🤖 How Our AI Uses Your Information</h2>
            <div className="usage-list">
              <div className="usage-item">
                <span className="icon">✨</span>
                <div>
                  <h3>Personalized Itineraries</h3>
                  <p>Our AI analyzes your preferences to create unique travel plans tailored specifically to your interests and budget.</p>
                </div>
              </div>
              <div className="usage-item">
                <span className="icon">🎯</span>
                <div>
                  <h3>Smart Recommendations</h3>
                  <p>Machine learning algorithms use your data to suggest destinations, activities, and experiences you'll love.</p>
                </div>
              </div>
              <div className="usage-item">
                <span className="icon">📈</span>
                <div>
                  <h3>Service Improvement</h3>
                  <p>We use aggregated, anonymized data to enhance our AI's accuracy and develop new features.</p>
                </div>
              </div>
              <div className="usage-item">
                <span className="icon">📬</span>
                <div>
                  <h3>Communication</h3>
                  <p>Send you travel insights, AI updates, and important service notifications (you can unsubscribe anytime).</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="privacy-section highlight-section">
            <h2>🔐 How We Protect Your Data</h2>
            <p>
              Your data security is paramount. We use industry-standard encryption, secure servers, 
              and regular security audits to protect your information. Our AI systems are designed 
              with privacy by design principles, ensuring your personal data is processed securely 
              and responsibly.
            </p>
            <div className="security-features">
              <div className="security-item">
                <span className="security-icon">🔒</span>
                <span>End-to-end Encryption</span>
              </div>
              <div className="security-item">
                <span className="security-icon">🛡️</span>
                <span>Secure Data Centers</span>
              </div>
              <div className="security-item">
                <span className="security-icon">🔍</span>
                <span>Regular Security Audits</span>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="privacy-section">
            <h2>🤝 Data Sharing</h2>
            <div className="sharing-policy">
              <div className="policy-item positive">
                <h3>✅ What We DON'T Do</h3>
                <ul>
                  <li>We never sell your personal data to third parties</li>
                  <li>We don't share your travel preferences with advertisers</li>
                  <li>Your AI-generated itineraries remain private to you</li>
                  <li>We don't use your data for purposes unrelated to travel planning</li>
                </ul>
              </div>
              <div className="policy-item neutral">
                <h3>ℹ️ Limited Sharing Scenarios</h3>
                <ul>
                  <li>With your explicit consent for specific features</li>
                  <li>Anonymized, aggregated data for AI improvement research</li>
                  <li>When required by law or to protect user safety</li>
                  <li>With trusted service providers who help us operate our AI platform</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="privacy-section">
            <h2>🎛️ Your Privacy Rights</h2>
            <div className="rights-grid">
              <div className="right-item">
                <h3>🔍 Access</h3>
                <p>View all the data we have about you and your travel preferences.</p>
              </div>
              <div className="right-item">
                <h3>✏️ Update</h3>
                <p>Modify your information and preferences anytime to get better AI recommendations.</p>
              </div>
              <div className="right-item">
                <h3>🗑️ Delete</h3>
                <p>Request deletion of your account and associated data (with some legal exceptions).</p>
              </div>
              <div className="right-item">
                <h3>📦 Export</h3>
                <p>Download your data in a portable format to take your travel history with you.</p>
              </div>
              <div className="right-item">
                <h3>⏸️ Limit Processing</h3>
                <p>Request restrictions on how we process your data while maintaining basic services.</p>
              </div>
              <div className="right-item">
                <h3>📧 Unsubscribe</h3>
                <p>Opt out of marketing communications while keeping your travel planning active.</p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="privacy-section">
            <h2>🍪 Cookies & AI Personalization</h2>
            <p>
              We use cookies to enhance your experience and help our AI provide better recommendations. 
              Essential cookies keep our service working, while optional cookies help us understand 
              how to improve our AI algorithms for you.
            </p>
            <div className="cookie-types">
              <div className="cookie-type">
                <h4>Essential Cookies</h4>
                <p>Required for basic functionality and security</p>
              </div>
              <div className="cookie-type">
                <h4>AI Improvement Cookies</h4>
                <p>Help us understand usage patterns to enhance our algorithms</p>
              </div>
              <div className="cookie-type">
                <h4>Personalization Cookies</h4>
                <p>Remember your preferences for a tailored experience</p>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section className="privacy-section">
            <h2>🔄 Policy Updates</h2>
            <p>
              As our AI technology evolves and improves, we may update this privacy policy. 
              We'll notify you of significant changes and always maintain our commitment to 
              protecting your privacy. Your continued use indicates acceptance of any updates.
            </p>
          </section>

          {/* Contact */}
          <section className="privacy-section contact-section">
            <h2>💬 Questions About Your Privacy?</h2>
            <p>
              We're here to help! If you have any questions about how we handle your data 
              or want to exercise your privacy rights, don't hesitate to reach out. 
              Your trust enables us to create amazing AI-powered travel experiences.
            </p>
            <div className="contact-highlight">
              <span className="icon">🌟</span>
              <span>Privacy-first AI travel planning</span>
            </div>
          </section>

        </div>
      </div>

      {/* Back Button */}
      <div className="back-section">
        <div className="privacy-container">
          <button 
            className="back-btn"
            onClick={() => window.history.back()}
          >
            ← Back to WanderAI
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;