import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LandingPage = () => {
  const { session } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '16px', background: 'linear-gradient(135deg, var(--text-1) 0%, var(--accent-b) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Research at the Speed of Thought
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
        Deep Dive uses a team of specialized AI agents working in parallel to research, synthesize, and critique complex topics.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '80px' }}>
        {!session ? (
          <>
            <Link to="/sign-up" className="run-btn" style={{ textDecoration: 'none' }}>Get Started</Link>
            <Link to="/sign-in" className="nav-pill nav-pill-btn" style={{ textDecoration: 'none', padding: '10px 28px', fontSize: '0.9rem' }}>Sign In</Link>
          </>
        ) : (
          <Link to="/app" className="run-btn" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
        )}
      </div>

      <div className="orb-arena" style={{ margin: '0 auto', maxWidth: '600px' }}>
        <div className="orb" style={{ opacity: 0.6, filter: 'blur(60px)' }}></div>
      </div>

      <div style={{ marginTop: '80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', textAlign: 'left' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--accent-b)', marginBottom: '8px' }}>1. Plan</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>The Planner agent breaks your topic into focused sub-questions.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--accent-b)', marginBottom: '8px' }}>2. Research</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>Multiple Researcher agents search the web in parallel.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--accent-b)', marginBottom: '8px' }}>3. Synthesize</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>The Synthesizer compiles all findings into a cohesive draft.</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--accent-b)', marginBottom: '8px' }}>4. Critique</h3>
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>The Critic reviews the draft and demands revisions if needed.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
