import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const LandingPage = () => {
  const { session } = useAuth();

  return (
    <div style={{ textAlign: 'center', padding: '60px 0' }}>
      <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '16px', background: 'linear-gradient(135deg, var(--text-1) 0%, var(--accent-b) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Four AI agents. One research team.
      </h1>
      <p style={{ color: 'var(--text-2)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px' }}>
        Orchestrate a specialized AI crew that works in parallel to research, synthesize, and critique complex topics.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '60px' }}>
        {!session ? (
          <>
            <Link to="/sign-up" className="run-btn" style={{ textDecoration: 'none' }}>Get Started</Link>
            <Link to="/sign-in" className="nav-pill nav-pill-btn" style={{ textDecoration: 'none', padding: '10px 28px', fontSize: '0.9rem' }}>Sign In</Link>
          </>
        ) : (
          <Link to="/app" className="run-btn" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
        )}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '80px', opacity: 0.8 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', padding: '6px 12px', background: 'var(--bg-2)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>CrewAI Orchestration</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', padding: '6px 12px', background: 'var(--bg-2)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>Fireworks AI Inference</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', padding: '6px 12px', background: 'var(--bg-2)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>AMD Instinct MI300X</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-3)', padding: '6px 12px', background: 'var(--bg-2)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>Parallel Agent Execution</span>
      </div>

      <div className="orb-arena" style={{ margin: '0 auto', maxWidth: '600px' }}>
        <div className="orb" style={{ opacity: 0.6, filter: 'blur(60px)' }}></div>
      </div>

      <section style={{ marginTop: '100px', textAlign: 'left' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', color: 'var(--text-1)', marginBottom: '40px', textAlign: 'center' }}>How the agents work together</h2>
        
        {/* Connected Agent Flow Visual */}
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-b)', boxShadow: '0 0 10px var(--accent-b)' }}></div>
              <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--text-1)', margin: 0 }}>Planner Agent</h3>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>Automatically breaks your complex topic down into focused, independent research questions.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4', boxShadow: '0 0 10px #06B6D4' }}></div>
              <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--text-1)', margin: 0 }}>Researcher Agents</h3>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>A swarm of agents that investigate multiple sub-topics in parallel, rather than one at a time.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
              <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--text-1)', margin: 0 }}>Synthesizer Agent</h3>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>Merges every data point and citation from the researchers into one coherent, unified report.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 10px #F59E0B' }}></div>
              <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--text-1)', margin: 0 }}>Critic Agent</h3>
            </div>
            <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', lineHeight: 1.5 }}>Reviews the team's own draft before you see it, demanding revisions if claims are unsupported.</p>
          </div>
          
          {/* Connecting line (hidden on mobile) */}
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'var(--glass-border)', zIndex: 1, display: 'none' }} className="desktop-line"></div>
        </div>
      </section>

      <section style={{ marginTop: '100px', textAlign: 'left', maxWidth: '800px', margin: '100px auto 0' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', color: 'var(--text-1)', marginBottom: '40px', textAlign: 'center' }}>Handoffs & Workflow</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '8px' }}>1. You ask, the Planner listens</h3>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Describe the topic you want investigated. The Planner agent immediately breaks it down into a strategic series of questions, ensuring no stone is left unturned.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '8px' }}>2. Researchers go to work</h3>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Instead of waiting for a single AI to search sequentially, multiple Researcher agents spawn dynamically to scour the web and investigate every sub-question simultaneously.</p>
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '8px' }}>3. Synthesizer and Critic collaborate</h3>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>One agent writes the draft, and another actively tries to poke holes in it. They iterate on the report until the Critic is satisfied with the citations and logical flow.</p>
          </div>
        </div>
      </section>

      <section style={{ marginTop: '100px', textAlign: 'left', maxWidth: '800px', margin: '100px auto 0' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2rem', color: 'var(--text-1)', marginBottom: '40px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>How do the agents coordinate?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>They are orchestrated using CrewAI. The Planner passes its output directly to the Researcher swarm as tasks, and the final data is piped into the Synthesizer.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>What happens if agents disagree?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>If the Critic agent finds logical inconsistencies or lack of evidence in the Synthesizer's draft, it will reject the output and force the Synthesizer to rewrite the section.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>Can I see what each agent is doing?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>Yes. The dashboard provides a live stream of the orchestration process, allowing you to watch the exact thoughts, actions, and handoffs of every agent in real-time.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>What models power each agent?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>The Planner, Researchers, and Critic use high-speed models, while the Synthesizer leverages heavy-duty models on AMD MI300X infrastructure to handle massive context windows.</p>
          </div>
        </div>
      </section>

      <style>{`
        @media (min-width: 800px) {
          .desktop-line { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
