import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useMouseTilt } from '../hooks/useMouseTilt';
import Starfield from '../components/Starfield';

const AgentSwarmScene = lazy(() => import('../components/AgentSwarmScene'));

// Reusable animated section component
const RevealSection = ({ children, style, className }) => {
  const revealRef = useScrollReveal();
  return (
    <section ref={revealRef} className={`reveal ${className || ''}`} style={style}>
      {children}
    </section>
  );
};

// Reusable feature card with scroll delay
const FeatureCard = ({ title, desc, delay, iconColor, icon }) => {
  const revealRef = useScrollReveal();
  return (
    <div ref={revealRef} className={`glass-panel reveal reveal-delay-${delay}`} style={{ padding: '24px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `rgba(${iconColor}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: `rgb(${iconColor})`, fontSize: '1.2rem', boxShadow: `0 0 15px rgba(${iconColor}, 0.2)` }}>
          {icon}
        </div>
        <h3 style={{ fontFamily: 'var(--font-h)', color: 'var(--text-1)', margin: 0, fontSize: '1.2rem' }}>{title}</h3>
      </div>
      <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
};

const LandingPage = () => {
  const { session } = useAuth();
  const heroReveal = useScrollReveal();

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative overflow-hidden bg-[#0A0A0F]">
      
      {/* Site-wide Ambient Starfield Background */}
      <Starfield />

      {/* Decorative SVG Connectors */}
      <svg className="ambient-svg ambient-svg-1 hidden md:block" style={{ top: '25%', left: '5%', width: '300px', height: '300px' }} viewBox="0 0 200 200">
        <path d="M 10 190 Q 50 10 190 10" fill="none" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="5,5" />
        <defs>
          <linearGradient id="grad1" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6c5ce7" stopOpacity="0" />
            <stop offset="50%" stopColor="#6c5ce7" stopOpacity="1" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="ambient-svg ambient-svg-2 hidden md:block" style={{ top: '65%', right: '5%', width: '400px', height: '200px' }} viewBox="0 0 400 200">
        <path d="M 10 10 C 150 200 250 0 390 190" fill="none" stroke="url(#grad2)" strokeWidth="1.5" strokeDasharray="10,5" />
        <defs>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient Geometric Orbs */}
      <div className="ambient-orb hidden md:block" style={{ width: '400px', height: '400px', top: '35%', right: '-10%', backgroundColor: '#06b6d4' }}></div>
      <div className="ambient-orb hidden md:block" style={{ width: '500px', height: '500px', top: '75%', left: '-15%', backgroundColor: '#f59e0b' }}></div>

      {/* Glowing Orb Background at Top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] pointer-events-none overflow-hidden flex justify-center -z-10">
        <div className="orb" style={{ opacity: 0.6, filter: 'blur(60px)', position: 'absolute', top: '-100px' }}></div>
      </div>

      {/* HERO SECTION */}
      <div ref={heroReveal} className="reveal" style={{ textAlign: 'center', marginBottom: '80px', padding: '0 20px' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'var(--glass)', border: '1px solid var(--glass-border)', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-2)', marginBottom: '24px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          One Platform. Every Agent. Every Insight.
        </div>
        <h1 style={{ fontFamily: 'var(--font-h)', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '20px', background: 'linear-gradient(135deg, var(--text-1) 0%, var(--accent-b) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Research · Synthesize · Deliver<br/>
          <span style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--text-3)', fontWeight: 600 }}>Turning Questions into Answers</span>
        </h1>
        <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto 40px', lineHeight: 1.6 }}>
          Orchestrate a specialized AI crew that works in parallel to research, synthesize, and critique complex topics. Explore vast domains of knowledge with agents that do the heavy lifting for you.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {!session ? (
            <>
              <Link to="/sign-up" className="run-btn" style={{ textDecoration: 'none', padding: '14px 36px', fontSize: '1rem', borderRadius: '8px' }}>Get Started Free</Link>
              <Link to="/sign-in" className="nav-pill nav-pill-btn" style={{ textDecoration: 'none', padding: '12px 32px', fontSize: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>Sign In</Link>
            </>
          ) : (
            <Link to="/app" className="run-btn" style={{ textDecoration: 'none', padding: '14px 36px', fontSize: '1rem', borderRadius: '8px' }}>Go to Dashboard</Link>
          )}
        </div>
      </div>

      {/* 3D AGENT SWARM CENTERPIECE */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        <Suspense fallback={
          <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', margin: '40px auto 80px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 1.5s infinite', boxShadow: '0 0 20px var(--accent-glow)' }}></div>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginTop: '16px' }}>Loading Orchestration Visuals...</p>
          </div>
        }>
          <AgentSwarmScene />
        </Suspense>
      </div>

      {/* DOMAIN GRID */}
      <RevealSection style={{ maxWidth: '1000px', margin: '120px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', color: 'var(--text-1)', marginBottom: '16px' }}>All Domains. One Platform.</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem' }}>Explore diverse fields, build real insights, and accelerate your research.</p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', color: 'var(--text-1)', marginBottom: '8px' }}>Market Analysis</h3>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Competitor tracking, industry trends, and SWOT breakdowns.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', color: 'var(--text-1)', marginBottom: '8px' }}>Technical Specs</h3>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>API comparisons, architectural reviews, and stack analysis.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px 24px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', color: 'var(--text-1)', marginBottom: '8px' }}>Academic Literature</h3>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Paper summarization, citation tracking, and methodology reviews.</p>
          </div>
        </div>
      </RevealSection>

      {/* WHY CHOOSE US */}
      <RevealSection style={{ maxWidth: '1000px', margin: '120px auto', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', color: 'var(--text-1)', marginBottom: '40px', textAlign: 'center' }}>Research Like You're Already an Expert</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <FeatureCard 
            delay="0"
            iconColor="108, 92, 231"
            icon="🧠"
            title="We Teach You How to Think"
            desc="Our Planner Agent doesn't just search; it breaks down your prompt into logical, strategic sub-questions before executing."
          />
          <FeatureCard 
            delay="1"
            iconColor="6, 182, 212"
            icon="⚡"
            title="Build, Break, Repeat"
            desc="The Critic Agent actively attacks the initial draft, forcing the Synthesizer to improve logical flow and add citations."
          />
          <FeatureCard 
            delay="2"
            iconColor="16, 185, 129"
            icon="🚀"
            title="From Zero → Report Ready"
            desc="Whether you're starting fresh or diving deep, our agents take you from confused to confident with a clear output."
          />
          <FeatureCard 
            delay="3"
            iconColor="245, 158, 11"
            icon="⏱️"
            title="Research Smarter. Grow Faster."
            desc="Instead of sequential searching, multiple Researcher Agents scour the web simultaneously to cut research time by 90%."
          />
        </div>
      </RevealSection>

      {/* WORKFLOW ROADMAP */}
      <RevealSection style={{ maxWidth: '800px', margin: '120px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', color: 'var(--text-1)', marginBottom: '16px' }}>Start Your Journey</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1.05rem' }}>Pick a topic and begin your research path with absolute clarity.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
          <div style={{ position: 'absolute', left: '20px', top: '24px', bottom: '24px', width: '2px', background: 'var(--glass-border)', zIndex: -1 }}></div>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 0 20px var(--accent-glow)' }}>1</div>
            <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '8px' }}>Ask the Question</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>Describe the topic you want investigated. The Planner agent maps out the strategy.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}>2</div>
            <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '8px' }}>Learn by Doing</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>The Researchers spawn dynamically to scour the web and investigate every sub-question in parallel.</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)' }}>3</div>
            <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '8px' }}>Grow & Succeed</h3>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>The Synthesizer and Critic collaborate to deliver a perfectly formatted, highly accurate final report.</p>
            </div>
          </div>
        </div>
      </RevealSection>

      {/* FAQ */}
      <RevealSection style={{ maxWidth: '800px', margin: '120px auto 100px', padding: '0 24px' }}>
        <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '2.2rem', color: 'var(--text-1)', marginBottom: '16px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', textAlign: 'center', marginBottom: '40px' }}>Some frequently asked questions about our Program.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>How do the agents coordinate?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>They are orchestrated using CrewAI. The Planner passes its output directly to the Researcher swarm as tasks, and the final data is piped into the Synthesizer.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>What happens if agents disagree?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>If the Critic agent finds logical inconsistencies or lack of evidence in the Synthesizer's draft, it will reject the output and force the Synthesizer to rewrite the section.</p>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', color: 'var(--accent-b)', marginBottom: '8px' }}>What models power each agent?</h4>
            <p style={{ color: 'var(--text-2)', fontSize: '0.95rem', lineHeight: 1.5 }}>The Planner, Researchers, and Critic use high-speed models, while the Synthesizer leverages heavy-duty models on AMD MI300X infrastructure to handle massive context windows.</p>
          </div>
        </div>
      </RevealSection>

      <style>{`
        .glass-panel:hover {
          transform: translateY(-2px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 40px -20px var(--glass-glow);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
