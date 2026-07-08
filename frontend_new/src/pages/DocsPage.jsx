import React from 'react';

const DocsPage = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 0', display: 'flex', gap: '40px' }}>
      
      {/* Sidebar TOC */}
      <aside style={{ width: '250px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '40px' }}>
          <h4 style={{ fontFamily: 'var(--font-m)', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Contents</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#how-it-works" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>How it Works</a></li>
            <li><a href="#the-agents" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>The 4-Agent Pipeline</a></li>
            <li><a href="#compute-nodes" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Compute Nodes</a></li>
            <li><a href="#research-depth" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Research Depth</a></li>
          </ul>
        </div>
      </aside>

      {/* Main Docs Content */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontFamily: 'var(--font-h)', fontSize: '2.5rem', marginBottom: '40px' }}>Documentation</h1>

        <section id="how-it-works" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '16px' }}>How it Works</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Deep Dive replaces standard zero-shot LLM queries with an orchestrated workflow of AI agents. By breaking a topic down, researching in parallel, synthesizing findings, and critiquing the output, Deep Dive produces highly accurate, deeply researched reports that bypass the limitations of single-prompt generation.
          </p>
        </section>

        <section id="the-agents" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '24px' }}>The 4-Agent Pipeline</h2>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: '8px' }}>1. Planner</h3>
            <p style={{ color: 'var(--text-2)' }}>Analyzes your topic and formulates distinct, targeted sub-questions to guide the research phase.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: '8px' }}>2. Researchers</h3>
            <p style={{ color: 'var(--text-2)' }}>A swarm of agents that operate in parallel. Each takes a sub-question, queries the web, scrapes data, and extracts relevant facts and citations.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: '8px' }}>3. Synthesizer</h3>
            <p style={{ color: 'var(--text-2)' }}>Takes the raw data from all researchers, dededuplicates it, and drafts a cohesive markdown report.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', marginBottom: '8px' }}>4. Critic</h3>
            <p style={{ color: 'var(--text-2)' }}>Reviews the synthesized draft against quality standards. If it lacks citations or flows poorly, it sends the draft back for revision.</p>
          </div>
        </section>

        <section id="compute-nodes" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '16px' }}>Compute Nodes</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '12px' }}>You can select which underlying infrastructure powers the inference during synthesis:</p>
          <ul style={{ color: 'var(--text-2)', paddingLeft: '20px', lineHeight: 1.6 }}>
            <li><strong>Fireworks AI:</strong> Lightning-fast inference using optimized open-weight models like Llama 3 and Mixtral.</li>
            <li><strong>AMD MI300X:</strong> Powered by the AMD Developer Cloud, providing massive memory bandwidth for handling huge contexts during deep research tasks.</li>
          </ul>
        </section>

        <section id="research-depth">
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '16px' }}>Research Depth</h2>
          <p style={{ color: 'var(--text-2)', marginBottom: '12px' }}>Depth controls how thoroughly the Planner breaks down your topic:</p>
          <ul style={{ color: 'var(--text-2)', paddingLeft: '20px', lineHeight: 1.6 }}>
            <li><strong>Quick:</strong> 2 sub-questions (Fastest, good for summaries)</li>
            <li><strong>Standard:</strong> 5 sub-questions (Balanced depth and speed)</li>
            <li><strong>Deep:</strong> 10 sub-questions (Exhaustive research, takes longer)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default DocsPage;
