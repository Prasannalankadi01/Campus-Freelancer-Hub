// src/pages/About.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '💼', title: 'Post Jobs', desc: 'Clients can post freelance opportunities with detailed requirements.' },
    { icon: '👨‍🎓', title: 'Find Talent', desc: 'Access a pool of skilled students ready to work on projects.' },
    { icon: '💰', title: 'Secure Bidding', desc: 'Students bid competitively; clients choose the best fit.' },
    { icon: '✅', title: 'Easy Management', desc: 'Track bids, accept/reject, and manage all your jobs in one dashboard.' },
    { icon: '📊', title: 'Analytics', desc: 'View earnings, active bids, and job performance at a glance.' },
    { icon: '🔔', title: 'Real-time Notifications', desc: 'Get instant alerts when bids are placed or status changes.' }
  ];

  const stats = [
    { number: '500+', label: 'Active Students' },
    { number: '200+', label: 'Jobs Posted' },
    { number: '₹50L+', label: 'Total Earnings' },
    { number: '98%', label: 'Satisfaction Rate' }
  ];

  const faqs = [
    { q: 'Is Campus Hub free to use?', a: 'Yes, signing up and browsing jobs is completely free. Clients pay only when they hire, and students keep 100% of their earnings (no platform fees).' },
    { q: 'How do I get paid?', a: 'Payments are handled securely through our integrated payment gateway. Students can withdraw earnings to their bank accounts.' },
    { q: 'Can I post a job anonymously?', a: 'No, all clients must have verified accounts to ensure trust and safety.' },
    { q: 'What if a student doesn’t deliver?', a: 'We have an escrow system and dispute resolution process to protect both parties.' }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Campus Freelance Hub</h1>
          <p>Bridge the gap between campus talent and real‑world projects</p>
          <button className="cta-hero" onClick={() => navigate('/signup')}>
            Get Started →
          </button>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission">
        <div className="container">
          <h2>Our Mission</h2>
          <p>
            Empower students to earn while they learn and help businesses access fresh,
            affordable talent – all within a trusted campus ecosystem.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card">
                <h3>{stat.number}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Campus Hub?</h2>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <div key={idx} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up as a student or client in seconds.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Post or Browse Jobs</h3>
              <p>Clients post projects; students find opportunities.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Bid & Hire</h3>
              <p>Students bid; clients accept the best proposal.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Get Paid / Complete Work</h3>
              <p>Secure payments and successful project delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqs.map((faq, idx) => (
              <div key={idx} className="faq-card">
                <h3>❓ {faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta">
        <div className="container">
          <h2>Have Questions? Get in Touch</h2>
          <p>We’re here to help you succeed.</p>
          <button className="cta-contact" onClick={() => window.location.href = 'mailto:support@campushub.com'}>
            Contact Support →
          </button>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to start your journey?</h2>
          <p>Join thousands of students and clients already using Campus Hub.</p>
          <button className="cta-large" onClick={() => navigate('/signup')}>
            Create Account →
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;