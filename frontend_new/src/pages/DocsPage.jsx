import React from 'react';

const DocsPage = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 0', display: 'flex', gap: '40px' }}>
      
      {/* Sidebar TOC */}
      <aside style={{ width: '250px', flexShrink: 0 }}>
        <div style={{ position: 'sticky', top: '40px' }}>
          <h4 style={{ fontFamily: 'var(--font-m)', color: 'var(--text-3)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Contents</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li><a href="#architecture" style={{ color: 'var(--text-2)', textDecoration: 'none' }}>Agent Architecture</a></li>
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

        <section id="architecture" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '24px' }}>Agent Architecture</h2>
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '12px 24px', background: 'rgba(124, 58, 237, 0.2)', border: '1px solid var(--accent-b)', borderRadius: '8px', color: 'var(--text-1)' }}>1. Planner</div>
            <div style={{ color: 'var(--text-3)' }}>↓</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ padding: '12px 24px', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06B6D4', borderRadius: '8px', color: 'var(--text-1)' }}>2. Researcher (A)</div>
              <div style={{ padding: '12px 24px', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06B6D4', borderRadius: '8px', color: 'var(--text-1)' }}>2. Researcher (B)</div>
              <div style={{ padding: '12px 24px', background: 'rgba(6, 182, 212, 0.2)', border: '1px solid #06B6D4', borderRadius: '8px', color: 'var(--text-1)' }}>2. Researcher (C)</div>
            </div>
            <div style={{ color: 'var(--text-3)' }}>↓</div>
            <div style={{ padding: '12px 24px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', borderRadius: '8px', color: 'var(--text-1)' }}>3. Synthesizer</div>
            <div style={{ color: 'var(--text-3)' }}>⇅</div>
            <div style={{ padding: '12px 24px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #F59E0B', borderRadius: '8px', color: 'var(--text-1)' }}>4. Critic</div>
          </div>
        </section>

        <section id="how-it-works" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '16px' }}>How it Works</h2>
          <p style={{ color: 'var(--text-2)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            Deep Dive replaces standard zero-shot LLM queries with an orchestrated workflow of AI agents. By breaking a topic down, researching in parallel, synthesizing findings, and critiquing the output, Deep Dive produces highly accurate, deeply researched reports that bypass the limitations of single-prompt generation.
          </p>
        </section>

        <section id="the-agents" style={{ marginBottom: '60px' }}>
          <h2 style={{ fontFamily: 'var(--font-h)', fontSize: '1.8rem', color: 'var(--accent-b)', marginBottom: '24px' }}>The 4-Agent Pipeline</h2>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '12px' }}>1. The Planner Agent</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Role:</strong> Strategic breakdown of the user's initial prompt.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Input:</strong> The user's raw research topic and desired depth.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Output:</strong> A JSON array of highly specific sub-questions.</p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.5 }}><strong>Handoff:</strong> The Planner's output dictates exactly how many Researcher agents are spawned in the next step.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '12px' }}>2. The Researcher Swarm</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Role:</strong> Information gathering and citation extraction.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Input:</strong> A single specific sub-question from the Planner.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Output:</strong> A structured list of facts, data points, and their corresponding URL citations.</p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.5 }}><strong>Handoff:</strong> Multiple researchers run concurrently using asynchronous tasks. Their results are pooled together and sent to the Synthesizer.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '12px' }}>3. The Synthesizer Agent</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Role:</strong> Drafting the final markdown report.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Input:</strong> The massive, deduplicated JSON blob of all findings from all researchers.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Output:</strong> A beautifully formatted Markdown document.</p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.5 }}><strong>Handoff:</strong> The draft is immediately passed to the Critic before the user is allowed to see it.</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', color: 'var(--text-1)', marginBottom: '12px' }}>4. The Critic Agent</h3>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Role:</strong> Quality assurance and fact-checking.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Input:</strong> The Synthesizer's markdown draft.</p>
            <p style={{ color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.5 }}><strong>Output:</strong> An approval flag, or a list of demanded revisions.</p>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.5 }}><strong>Handoff:</strong> If rejected, the draft loops back to the Synthesizer. If approved, the pipeline concludes and the report is delivered to the user dashboard.</p>
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
