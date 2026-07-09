import React from 'react';

const AboutPage = () => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '2.5rem', marginBottom: '24px' }}>About Deep Dive</h1>
      
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
        <p style={{ color: 'var(--text-1)', marginBottom: '16px', fontSize: '1.1rem' }}>
          Deep Dive was built for the AMD AI Hackathon to demonstrate the power of multi-agent AI orchestration over traditional zero-shot prompting.
        </p>
        <p style={{ color: 'var(--text-2)', marginBottom: '16px' }}>
          Why agents? When you ask a single Large Language Model a complex research question, it hallucinates, loses context, or provides shallow summaries. A single AI call simply cannot plan, investigate, write, and review its own work simultaneously.
        </p>
        <p style={{ color: 'var(--text-2)' }}>
          Deep Dive solves this by orchestrating a specialized crew of autonomous agents. By separating the workflow into distinct roles—Planning, Parallel Research, Synthesis, and Critique—the system behaves like a real human research team. The result is deeper investigation, perfectly cited claims, and robust outputs that a single prompt could never achieve.
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
