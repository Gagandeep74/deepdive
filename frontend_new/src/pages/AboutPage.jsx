import React from 'react';

const AboutPage = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '2.5rem', marginBottom: '24px' }}>About Deep Dive</h1>
      
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-1)', marginBottom: '16px', fontSize: '1.1rem' }}>
          Deep Dive was built for the AMD AI Hackathon to demonstrate the power of multi-agent AI research pipelines.
        </p>
        <p style={{ color: 'var(--text-2)' }}>
          Instead of relying on a single LLM prompt, Deep Dive orchestrates a team of specialized AI agents (Planner, Researchers, Synthesizer, Critic) that work in parallel to produce comprehensive, deeply researched reports with citations.
        </p>
      </div>

      <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', marginBottom: '24px', color: 'var(--accent-b)' }}>The Team</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass-border)', margin: '0 auto 16px' }}></div>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', marginBottom: '4px' }}>Team Member 1</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Full Stack Engineer</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--glass-border)', margin: '0 auto 16px' }}></div>
          <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', marginBottom: '4px' }}>Team Member 2</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>AI Researcher</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
