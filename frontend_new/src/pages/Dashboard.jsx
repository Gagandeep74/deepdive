import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { marked } from 'marked';

// Configure marked to render citations
marked.use({
  renderer: {
    text(text) {
      return text.replace(/\[(\d+)\]/g, '<sup><a href="#ref-$1" class="citation">[$1]</a></sup>');
    }
  }
});

const ORBIT_RADIUS = 155;
const ORBIT_SPEED = 0.0004; // radians per ms

const Dashboard = () => {
  const { session, user } = useAuth();
  
  const [history, setHistory] = useState([]);
  const [topic, setTopic] = useState('');
  const [provider, setProvider] = useState('fireworks');
  const [depth, setDepth] = useState('standard');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState('status'); // 'status' | 'report'
  
  // Research state
  const [agents, setAgents] = useState({
    planner: { state: 'idle', statusText: 'Idle', detail: '', badge: '' },
    researchers: { state: 'idle', statusText: 'Idle', detail: '', badge: '' },
    synthesizer: { state: 'idle', statusText: 'Idle', detail: '', badge: '' },
    critic: { state: 'idle', statusText: 'Idle', detail: '', badge: '' }
  });
  const [subQuestions, setSubQuestions] = useState([]);
  const [researcherStates, setResearcherStates] = useState({});
  const [totalResearchers, setTotalResearchers] = useState(0);
  const [doneResearchers, setDoneResearchers] = useState(0);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [reportProvider, setReportProvider] = useState('');
  const [rawResults, setRawResults] = useState([]);

  // Refs for orbit animation
  const orbRef = useRef(null);
  const plannerRef = useRef(null);
  const researchersRef = useRef(null);
  const synthesizerRef = useRef(null);
  const criticRef = useRef(null);
  const orbitAnglesRef = useRef({ planner: 0, researchers: Math.PI / 2, synthesizer: Math.PI, critic: (3 * Math.PI) / 2 });
  const orbitPausedRef = useRef({ planner: false, researchers: false, synthesizer: false, critic: false });
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');

  // Fetch History
  useEffect(() => {
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/history', {
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'X-User-Id': user?.id || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error("History load failed", e);
    }
  };

  // Orbit Animation Loop
  useEffect(() => {
    const positionOrbitChips = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      const chips = {
        planner: plannerRef.current,
        researchers: researchersRef.current,
        synthesizer: synthesizerRef.current,
        critic: criticRef.current
      };

      for (const [name, chip] of Object.entries(chips)) {
        if (!chip) continue;
        if (!orbitPausedRef.current[name]) {
          orbitAnglesRef.current[name] += ORBIT_SPEED * dt;
        }
        const angle = orbitAnglesRef.current[name];
        const state = chip.dataset.state;
        let radius = ORBIT_RADIUS;
        
        if (state === 'active' || state === 'revision') {
          radius = 65; // move closer
          orbitPausedRef.current[name] = true;
        } else if (state === 'done') {
          orbitPausedRef.current[name] = false;
        } else {
          orbitPausedRef.current[name] = false;
        }

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * (radius * 0.35); // elliptical
        chip.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
      }

      // Check if any active to intensify orb
      const anyActive = Object.values(chips).some(c => c && (c.dataset.state === 'active' || c.dataset.state === 'revision'));
      if (orbRef.current) {
        if (anyActive) orbRef.current.classList.add('orb-intense');
        else orbRef.current.classList.remove('orb-intense');
      }

      rafRef.current = requestAnimationFrame(positionOrbitChips);
    };

    rafRef.current = requestAnimationFrame(positionOrbitChips);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const updateAgentState = (agent, updates) => {
    setAgents(prev => ({ ...prev, [agent]: { ...prev[agent], ...updates } }));
  };

  const startResearch = async () => {
    if (!topic.trim() || isRunning) return;
    setIsRunning(true);
    setReportMarkdown('');
    setRawResults([]);
    setSubQuestions([]);
    setResearcherStates({});
    setTotalResearchers(0);
    setDoneResearchers(0);
    setError(null);
    setView('status');
    setAgents({
      planner: { state: 'idle', statusText: 'Idle', detail: '' },
      researchers: { state: 'idle', statusText: 'Idle', detail: '' },
      synthesizer: { state: 'idle', statusText: 'Idle', detail: '' },
      critic: { state: 'idle', statusText: 'Idle', detail: '' }
    });

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${session?.access_token}`,
          'X-User-Id': user?.id || ''
        },
        body: JSON.stringify({ topic: topic.trim(), synthesis_provider: provider, depth }),
      });
      
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split(/\r?\n\r?\n/);
        buffer = messages.pop();
        for (const msg of messages) {
          if (msg.trim()) processSSEMessage(msg);
        }
      }
      if (buffer.trim()) processSSEMessage(buffer);
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setIsRunning(false);
      loadHistory();
    }
  };

  const processSSEMessage = (raw) => {
    let event = 'message', data = '';
    for (const line of raw.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!data) return;
    try { handleEvent(event, JSON.parse(data)); } catch (e) { console.error('Parse error', e); }
  };

  const handleEvent = (event, data) => {
    if (event === 'status') {
      const { agent, state, sub_questions, message, pass: passNum, feedback, count, results } = data;

      if (agent === 'planner') {
        if (state === 'planning') {
          updateAgentState('planner', { state: 'active', statusText: 'Planning…', detail: message });
        } else if (state === 'done') {
          updateAgentState('planner', { state: 'done', statusText: 'Done' });
          if (sub_questions) {
            updateAgentState('planner', { detail: `${sub_questions.length} sub-questions` });
            setTotalResearchers(sub_questions.length);
            setDoneResearchers(0);
            setSubQuestions(sub_questions);
          }
        }
      }

      if (agent && agent.startsWith('researcher_')) {
        const idx = parseInt(agent.split('_')[1], 10);
        updateAgentState('researchers', { state: 'active', statusText: 'Researching…' });
        setResearcherStates(prev => ({ ...prev, [idx]: 'active' }));
      }

      if (agent === 'researchers' && state === 'done') {
        setDoneResearchers(prev => {
           updateAgentState('researchers', { state: 'done', statusText: `Done — ${count} results` });
           return count; // rough approximation for state sync
        });
        if (results) setRawResults(results);
        setResearcherStates(prev => {
          const next = {...prev};
          Object.keys(next).forEach(k => next[k] = 'done');
          return next;
        });
      }

      if (agent === 'synthesizer') {
        if (state === 'synthesizing') updateAgentState('synthesizer', { state: 'active', statusText: 'Synthesizing…', detail: message });
        else if (state === 'revising') updateAgentState('synthesizer', { state: 'revision', statusText: 'Revising…', detail: message });
        else if (state === 'done') updateAgentState('synthesizer', { state: 'done', statusText: message || 'Done', detail: '' });
      }

      if (agent === 'critic') {
        if (state === 'critiquing') updateAgentState('critic', { state: 'active', statusText: `Reviewing (pass ${passNum})…`, detail: '' });
        else if (state === 'approved') updateAgentState('critic', { state: 'done', statusText: `Approved (pass ${passNum})`, detail: 'Quality checks passed' });
        else if (state === 'revision_needed') updateAgentState('critic', { state: 'revision', statusText: `Revision needed (pass ${passNum})`, detail: feedback ? feedback.slice(0,120)+'…' : '' });
      }

    } else if (event === 'report') {
      setView('report');
      if (data.providers) setReportProvider(data.providers.model);
      animateReport(data.markdown);
    } else if (event === 'error') {
      setError(data.message || data.error);
    }
  };

  const animateReport = async (fullMarkdown) => {
    let buffer = "";
    const chars = fullMarkdown.split('');
    setReportMarkdown('');
    for (let i = 0; i < chars.length; i++) {
      buffer += chars[i];
      if (i % 3 === 0 || i === chars.length - 1) {
        setReportMarkdown(buffer);
        await new Promise(r => setTimeout(r, 1));
      }
    }
  };

  const openHistoricalReport = async (id) => {
    try {
      const res = await fetch(`/api/history/${id}`, { 
        headers: { 
          'Authorization': `Bearer ${session?.access_token}`,
          'X-User-Id': user?.id || ''
        }
      });
      const report = await res.json();
      setTopic(report.topic);
      setDepth(report.depth);
      setRawResults(report.research_raw_data || []);
      setReportMarkdown(report.report_markdown);
      setView('report');
      setError(null);
    } catch (e) {
      alert("Failed to load report.");
    }
  };

  const showRawNotes = (idx) => {
    if (!rawResults || !rawResults[idx]) {
      alert("Raw notes not available yet.");
      return;
    }
    const res = rawResults[idx];
    setModalTitle(`Raw Notes: Researcher #${idx + 1}`);
    setModalContent(res.report || JSON.stringify(res, null, 2));
    setModalOpen(true);
  };

  const copyReport = () => {
    navigator.clipboard.writeText(reportMarkdown).then(() => alert("Copied!"));
  };

  const exportMarkdown = () => {
    const blob = new Blob([reportMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topic || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <aside className="sidebar" id="history-sidebar" data-entrance="1">
        <div className="sidebar-label">History</div>
        <div className="sidebar-list">
          {history.map(item => (
            <div key={item.id} className="history-item" onClick={() => openHistoricalReport(item.id)}>
              <div className="history-topic">{item.topic}</div>
              <div className="history-meta">
                <span>{item.depth}</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <section className="config-section" data-entrance="1">
          <div className="config-bar">
            <div className="config-pill-group">
              <label className="pill-label">Node</label>
              <select className="pill-select" value={provider} onChange={e => setProvider(e.target.value)}>
                <option value="fireworks">Fireworks AI</option>
                <option value="amd_cloud">AMD MI300X</option>
              </select>
            </div>
            <div className="config-pill-group">
              <label className="pill-label">Depth</label>
              <select className="pill-select" value={depth} onChange={e => setDepth(e.target.value)}>
                <option value="quick">Quick · 2</option>
                <option value="standard">Standard · 5</option>
                <option value="deep">Deep · 10</option>
              </select>
            </div>
          </div>
          <div className="topic-bar">
            <input type="text" className="topic-input" placeholder="What do you want to research?" 
              value={topic} onChange={e => setTopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && startResearch()} />
            <button className="run-btn" onClick={startResearch} disabled={isRunning}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>{isRunning ? 'Running…' : 'Run'}</span>
            </button>
          </div>
        </section>

        {view === 'status' && (
          <section className="pipeline-section" data-entrance="2">
            <div className="orb-arena">
              <div className="orb" ref={orbRef}></div>
              <div className="orb-ring"></div>

              <div className="orbit-chip" ref={plannerRef} data-state={agents.planner.state}>
                <span className="oc-dot"></span><span className="oc-label">Planner</span>
              </div>
              <div className="orbit-chip" ref={researchersRef} data-state={agents.researchers.state}>
                <span className="oc-dot"></span><span className="oc-label">Researchers</span>
                {totalResearchers > 0 && <span className="oc-counter visible">{doneResearchers}/{totalResearchers}</span>}
              </div>
              <div className="orbit-chip" ref={synthesizerRef} data-state={agents.synthesizer.state}>
                <span className="oc-dot"></span><span className="oc-label">Synthesizer</span>
              </div>
              <div className="orbit-chip" ref={criticRef} data-state={agents.critic.state}>
                <span className="oc-dot"></span><span className="oc-label">Critic</span>
              </div>
            </div>

            <div className="status-details">
              <div className="status-row" data-state={agents.planner.state}>
                <span className="sr-name">Planner</span>
                <span className="sr-status">{agents.planner.statusText}</span>
                <span className="sr-detail">{agents.planner.detail}</span>
              </div>
              <div className="status-row status-row-wide" data-state={agents.researchers.state}>
                <span className="sr-name">Researchers</span>
                <span className="sr-status">{agents.researchers.statusText}</span>
                <div className="researcher-chips">
                  {subQuestions.map((q, idx) => (
                    <div key={idx} className="researcher-chip" data-state={researcherStates[idx + 1] || 'idle'} onClick={() => showRawNotes(idx)} title={q}>
                      <span className="chip-dot"></span>#{idx + 1}: {q}
                    </div>
                  ))}
                </div>
              </div>
              <div className="status-row" data-state={agents.synthesizer.state}>
                <span className="sr-name">Synthesizer</span>
                <span className="sr-status">{agents.synthesizer.statusText}</span>
                <span className="sr-detail">{agents.synthesizer.detail}</span>
              </div>
              <div className="status-row" data-state={agents.critic.state}>
                <span className="sr-name">Critic</span>
                <span className="sr-status">{agents.critic.statusText}</span>
                <span className="sr-detail">{agents.critic.detail}</span>
              </div>
            </div>
          </section>
        )}

        {view === 'report' && (
          <section className="report-section">
            <div className="report-bar">
              <h2 className="report-title">Research Report</h2>
              <div className="report-actions">
                <button className="pill-btn-sm" onClick={copyReport}>⎘ Copy</button>
                <button className="pill-btn-sm" onClick={exportMarkdown}>↓ Download .md</button>
                <button className="pill-btn-sm" onClick={() => window.print()}>⎙ Save as PDF</button>
              </div>
            </div>
            {reportProvider && (
              <div className="report-providers">
                <span className="provider-tag">{reportProvider}</span>
              </div>
            )}
            <article className="report-content glass-panel" dangerouslySetInnerHTML={{ __html: marked.parse(reportMarkdown) }}></article>
          </section>
        )}

        {error && (
          <section className="error-section">
            <div className="error-card glass-panel">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#F87171" strokeWidth="2"/><line x1="12" y1="8" x2="12" y2="13" stroke="#F87171" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1" fill="#F87171"/></svg>
              <span>{error}</span>
            </div>
          </section>
        )}
      </main>

      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="modal-pane glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-top">
              <h3>{modalTitle}</h3>
              <button className="close-x" onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <div className="modal-body"><pre>{modalContent}</pre></div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
