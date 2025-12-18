import React from 'react';
import './TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="terms-page">
      {/* Header Section */}
      <div className="terms-header">
        <div className="terms-container">
          <div className="header-content">
            <h1 className="page-title">Terms of Service</h1>
            <p className="page-subtitle">
              Your journey with WanderAI starts with understanding our terms
            </p>
            <div className="last-updated">
              Last updated: January 2025
            </div>
          </div>
          <div className="header-illustration">
            <div className="floating-icon plane">✈️</div>
            <div className="floating-icon globe">🌍</div>
            <div className="floating-icon compass">🧭</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="terms-content">
        <div className="terms-container">
          
          {/* Welcome Section */}
          <section className="terms-section welcome-section">
            <h2>Welcome to WanderAI</h2>
            <p>
              Welcome to WanderAI, where dreams meet technology to craft your perfect journey! 
              By using our AI-powered travel planning service, you agree to these terms of service. 
              We're excited to help you explore the world with personalized itineraries tailored 
              to your interests and budget.
            </p>
          </section>

          {/* Service Description */}
          <section className="terms-section">
            <h2>🤖 Our AI Travel Services</h2>
            <div className="service-grid">
              <div className="service-item">
                <h3>Personalized Itineraries</h3>
                <p>Our AI creates custom travel plans based on your preferences, budget, and interests.</p>
              </div>
              <div className="service-item">
                <h3>Smart Recommendations</h3>
                <p>Get intelligent suggestions for destinations, activities, and experiences.</p>
              </div>
              <div className="service-item">
                <h3>Travel Insights</h3>
                <p>Access curated travel information and tips powered by artificial intelligence.</p>
              </div>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="terms-section">
            <h2>🎯 Your Responsibilities</h2>
            <div className="responsibility-list">
              <div className="responsibility-item">
                <span className="icon">✓</span>
                <div>
                  <h3>Accurate Information</h3>
                  <p>Provide accurate preferences and requirements for the best AI recommendations.</p>
                </div>
              </div>
              <div className="responsibility-item">
                <span className="icon">✓</span>
                <div>
                  <h3>Respectful Usage</h3>
                  <p>Use our service respectfully and in accordance with applicable laws.</p>
                </div>
              </div>
              <div className="responsibility-item">
                <span className="icon">✓</span>
                <div>
                  <h3>Independent Verification</h3>
                  <p>Verify travel information and make your own informed decisions about bookings.</p>
                </div>
              </div>
            </div>
          </section>

          {/* AI Limitations */}
          <section className="terms-section highlight-section">
            <h2>🔮 AI Technology Disclaimer</h2>
            <p>
              Our AI technology provides recommendations based on available data and algorithms. 
              While we strive for accuracy, AI-generated content should be verified independently. 
              Travel conditions, prices, and availability can change rapidly and may not reflect 
              real-time information.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="terms-section">
            <h2>💡 Intellectual Property</h2>
            <p>
              WanderAI and its AI-generated content, algorithms, and platform design are our 
              intellectual property. You may use our service for personal travel planning but 
              may not reproduce, distribute, or create derivative works without permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="terms-section">
            <h2>⚖️ Limitation of Liability</h2>
            <p>
              WanderAI is a planning tool and does not handle bookings or reservations. We are 
              not responsible for travel arrangements, changes in plans, or experiences during 
              your travels. Our liability is limited to the extent permitted by law.
            </p>
          </section>

          {/* Updates */}
          <section className="terms-section">
            <h2>🔄 Updates to Terms</h2>
            <p>
              We may update these terms to reflect changes in our AI services or legal requirements. 
              Continued use of WanderAI constitutes acceptance of updated terms. We'll notify users 
              of significant changes through our platform.
            </p>
          </section>

          {/* Contact */}
          <section className="terms-section contact-section">
            <h2>📞 Questions?</h2>
            <p>
              Have questions about these terms or our AI travel services? We'd love to help you 
              on your journey! Contact us and let's make your travel dreams come true.
            </p>
            <div className="contact-highlight">
              <span className="icon">✨</span>
              <span>Where your tech dreams came true</span>
            </div>
          </section>

        </div>
      </div>

      {/* Back Button */}
      <div className="back-section">
        <div className="terms-container">
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

export default TermsOfService;