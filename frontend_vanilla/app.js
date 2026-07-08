/* ============================================================
   Deep Dive — App Logic (Orb UI)
   All API/SSE logic unchanged. Visual layer for orbit chips.
   ============================================================ */

const API_BASE = window.location.origin;

// DOM
const topicInput        = document.getElementById('topic-input');
const depthSelect       = document.getElementById('depth-select');
const providerSelect    = document.getElementById('provider-select');
const startBtn          = document.getElementById('start-btn');
const statusSection     = document.getElementById('status-section');
const reportSection     = document.getElementById('report-section');
const errorSection      = document.getElementById('error-section');
const errorMessage      = document.getElementById('error-message');
const reportContent     = document.getElementById('report-content');
const reportProviders   = document.getElementById('report-providers');
const researcherChips   = document.getElementById('researcher-chips');
const themeToggle       = document.getElementById('theme-toggle');
const historyList       = document.getElementById('history-list');
const researcherCounter = document.getElementById('researcher-counter');
const theOrb            = document.getElementById('the-orb');

const modal      = document.getElementById('notes-modal');
const modalTitle = document.getElementById('modal-title');
const modalText  = document.getElementById('modal-text');

// Orbit chip elements
const orbitChips = {
    planner:     document.getElementById('orbit-planner'),
    researchers: document.getElementById('orbit-researchers'),
    synthesizer: document.getElementById('orbit-synthesizer'),
    critic:      document.getElementById('orbit-critic'),
};

let isRunning = false;
let currentMarkdown = "";
let currentResearchResults = [];
let totalResearchers = 0;
let doneResearchers = 0;

// ---- Orbit Animation ----
const ORBIT_RADIUS = 155;
const ORBIT_SPEED = 0.0004; // radians per ms
let orbitAngles = { planner: 0, researchers: Math.PI / 2, synthesizer: Math.PI, critic: (3 * Math.PI) / 2 };
let orbitPaused = { planner: false, researchers: false, synthesizer: false, critic: false };
let orbitRAF = null;
let lastTime = 0;

function positionOrbitChips(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    for (const [name, chip] of Object.entries(orbitChips)) {
        if (!chip) continue;
        if (!orbitPaused[name]) {
            orbitAngles[name] += ORBIT_SPEED * dt;
        }
        const x = Math.cos(orbitAngles[name]) * ORBIT_RADIUS;
        const y = Math.sin(orbitAngles[name]) * (ORBIT_RADIUS * 0.35); // elliptical
        chip.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    }

    orbitRAF = requestAnimationFrame(positionOrbitChips);
}

function startOrbit() {
    if (orbitRAF) cancelAnimationFrame(orbitRAF);
    lastTime = 0;
    orbitRAF = requestAnimationFrame(positionOrbitChips);
}

function setOrbitChipState(name, state) {
    const chip = orbitChips[name];
    if (!chip) return;
    chip.dataset.state = state;
    
    if (state === 'active' || state === 'revision') {
        orbitPaused[name] = true;
        // Move closer to center
        const angle = orbitAngles[name];
        const nearRadius = 65;
        const x = Math.cos(angle) * nearRadius;
        const y = Math.sin(angle) * (nearRadius * 0.35);
        chip.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        // Intensify orb
        theOrb.classList.add('orb-intense');
    } else if (state === 'done') {
        orbitPaused[name] = false;
        // Check if any are still active
        const anyActive = Object.values(orbitChips).some(c => c && (c.dataset.state === 'active' || c.dataset.state === 'revision'));
        if (!anyActive) theOrb.classList.remove('orb-intense');
    } else {
        orbitPaused[name] = false;
        const anyActive = Object.values(orbitChips).some(c => c && (c.dataset.state === 'active' || c.dataset.state === 'revision'));
        if (!anyActive) theOrb.classList.remove('orb-intense');
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    startOrbit();
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.classList.add('light-theme');
    }
});

// ---- Theme ----
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    html.classList.toggle('light-theme');
    localStorage.setItem('theme', html.classList.contains('light-theme') ? 'light' : 'dark');
});

// ---- Main ----
function startResearch() {
    const topic = topicInput.value.trim();
    const provider = providerSelect.value;
    const depth = depthSelect.value;
    if (!topic || isRunning) return;

    isRunning = true;
    startBtn.disabled = true;
    startBtn.querySelector('span').textContent = 'Running…';
    currentMarkdown = "";
    currentResearchResults = [];
    totalResearchers = 0;
    doneResearchers = 0;
    reportContent.innerHTML = "";
    reportProviders.innerHTML = "";

    resetStatus();
    statusSection.classList.remove('hidden');
    reportSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    streamResearch(topic, provider, depth);
}

topicInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startResearch(); });

// ---- SSE (unchanged) ----
async function streamResearch(topic, provider, depth) {
    try {
        const response = await fetch(`${API_BASE}/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, synthesis_provider: provider, depth }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const messages = buffer.split(/\r?\n\r?\n/);
            buffer = messages.pop();
            for (const msg of messages) { if (msg.trim()) processSSEMessage(msg); }
        }
        if (buffer.trim()) processSSEMessage(buffer);
    } catch (err) {
        showError(err.message || 'Connection failed');
    } finally {
        finishRun();
        loadHistory();
    }
}

function processSSEMessage(raw) {
    let event = 'message', data = '';
    for (const line of raw.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!data) return;
    try { handleEvent(event, JSON.parse(data)); } catch (e) { console.error('Parse error', e); }
}

function handleEvent(event, data) {
    if (event === 'status') handleStatus(data);
    else if (event === 'report') handleReport(data);
    else if (event === 'error') showError(data.message || data.error);
}

function handleStatus(data) {
    const { agent, state, sub_questions, message, pass: passNum, feedback, count, results } = data;

    if (agent === 'planner') {
        if (state === 'planning') {
            setAgentState('planner', 'active', 'Planning…');
            setAgentDetail('planner', message);
        } else if (state === 'done') {
            setAgentState('planner', 'done', 'Done');
            if (sub_questions) {
                setAgentDetail('planner', `${sub_questions.length} sub-questions`);
                totalResearchers = sub_questions.length;
                doneResearchers = 0;
                createResearcherChips(sub_questions);
            }
        }
    }

    if (agent && agent.startsWith('researcher_')) {
        const idx = parseInt(agent.split('_')[1], 10);
        setAgentState('researchers', 'active', 'Researching…');
        updateResearcherCounter();
        const chip = document.querySelector(`.researcher-chip[data-idx="${idx}"]`);
        if (chip) chip.dataset.state = 'active';
    }

    if (agent === 'researchers' && state === 'done') {
        doneResearchers = totalResearchers;
        setAgentState('researchers', 'done', `Done — ${count} results`);
        updateResearcherCounter();
        document.querySelectorAll('.researcher-chip').forEach(c => c.dataset.state = 'done');
        if (results) currentResearchResults = results;
    }

    if (agent === 'synthesizer') {
        if (state === 'synthesizing') { setAgentState('synthesizer', 'active', 'Synthesizing…'); setAgentDetail('synthesizer', message); }
        else if (state === 'revising') { setAgentState('synthesizer', 'revision', 'Revising…'); setAgentDetail('synthesizer', message); }
        else if (state === 'done') { setAgentState('synthesizer', 'done', message || 'Done'); setAgentDetail('synthesizer', ''); }
    }

    if (agent === 'critic') {
        if (state === 'critiquing') { setAgentState('critic', 'active', `Reviewing (pass ${passNum})…`); setAgentDetail('critic', ''); }
        else if (state === 'approved') { setAgentState('critic', 'done', `Approved (pass ${passNum})`); setAgentDetail('critic', 'Quality checks passed'); }
        else if (state === 'revision_needed') { setAgentState('critic', 'revision', `Revision needed (pass ${passNum})`); if (feedback) setAgentDetail('critic', feedback.slice(0, 120) + '…'); }
    }
}

async function handleReport(data) {
    statusSection.classList.add('hidden');
    reportSection.classList.remove('hidden');

    if (data.providers) {
        reportProviders.innerHTML = '';
        const tag = document.createElement('span');
        tag.className = 'provider-tag';
        tag.textContent = data.providers.model;
        reportProviders.appendChild(tag);
    }

    currentMarkdown = data.markdown;
    let buffer = "";
    const chars = currentMarkdown.split('');
    reportContent.innerHTML = "";

    marked.use({
        renderer: {
            text(text) {
                return text.replace(/\[(\d+)\]/g, '<sup><a href="#ref-$1" class="citation">[$1]</a></sup>');
            }
        }
    });

    for (let i = 0; i < chars.length; i++) {
        buffer += chars[i];
        if (i % 3 === 0 || i === chars.length - 1) {
            reportContent.innerHTML = marked.parse(buffer);
            await new Promise(r => setTimeout(r, 1));
        }
    }
}

// ---- UI Helpers ----
function createResearcherChips(questions) {
    researcherChips.innerHTML = '';
    questions.forEach((q, idx) => {
        const chip = document.createElement('div');
        chip.className = 'researcher-chip';
        chip.dataset.idx = idx + 1;
        chip.dataset.state = 'idle';
        const dot = document.createElement('span');
        dot.className = 'chip-dot';
        chip.appendChild(dot);
        chip.appendChild(document.createTextNode(`#${idx + 1}: ${q}`));
        chip.title = q;
        chip.onclick = () => showRawNotes(idx);
        researcherChips.appendChild(chip);
    });
}

function updateResearcherCounter() {
    if (!researcherCounter) return;
    const doneCount = document.querySelectorAll('.researcher-chip[data-state="done"]').length;
    if (totalResearchers > 0) {
        researcherCounter.textContent = `${doneCount}/${totalResearchers}`;
        researcherCounter.classList.add('visible');
    } else {
        researcherCounter.classList.remove('visible');
    }
}

function setAgentState(agentId, state, statusText) {
    // Status detail row
    const el = document.getElementById(`agent-${agentId}`);
    const st = document.getElementById(`status-${agentId}`);
    if (el) el.dataset.state = state;
    if (st) st.textContent = statusText;
    // Orbit chip
    setOrbitChipState(agentId, state);
}

function setAgentDetail(agentId, text) {
    const det = document.getElementById(`detail-${agentId}`);
    if (det) det.textContent = text;
}

function resetStatus() {
    ['planner', 'researchers', 'synthesizer', 'critic'].forEach(a => {
        setAgentState(a, 'idle', 'Idle');
        setAgentDetail(a, '');
    });
    researcherChips.innerHTML = '';
    if (researcherCounter) { researcherCounter.textContent = ''; researcherCounter.classList.remove('visible'); }
    theOrb.classList.remove('orb-intense');
    // Reset orbit paused
    for (const k of Object.keys(orbitPaused)) orbitPaused[k] = false;
}

function finishRun() {
    isRunning = false;
    startBtn.disabled = false;
    startBtn.querySelector('span').textContent = 'Run';
}

function showError(msg) {
    errorSection.classList.remove('hidden');
    errorMessage.textContent = msg;
    finishRun();
}

// ---- Modal ----
function showRawNotes(index) {
    if (!currentResearchResults || !currentResearchResults[index]) {
        alert("Raw notes not available yet.");
        return;
    }
    const res = currentResearchResults[index];
    modalTitle.textContent = `Raw Notes: Researcher #${index + 1}`;
    modalText.textContent = res.report || JSON.stringify(res, null, 2);
    modal.classList.remove('hidden');
}
function closeModal() { modal.classList.add('hidden'); }
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// ---- Actions ----
function copyReport() {
    navigator.clipboard.writeText(currentMarkdown).then(() => alert("Copied!"));
}
function exportMarkdown() {
    const blob = new Blob([currentMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(topicInput.value || 'report').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ---- History ----
async function loadHistory() {
    try {
        const res = await fetch(`${API_BASE}/history`);
        const history = await res.json();
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            const date = new Date(item.created_at).toLocaleDateString();
            div.innerHTML = `<div class="history-topic">${item.topic}</div><div class="history-meta"><span>${item.depth}</span><span>${date}</span></div>`;
            div.onclick = () => openHistoricalReport(item.id);
            historyList.appendChild(div);
        });
    } catch (e) { console.error("History load failed", e); }
}

async function openHistoricalReport(id) {
    try {
        const res = await fetch(`${API_BASE}/history/${id}`);
        const report = await res.json();
        topicInput.value = report.topic;
        depthSelect.value = report.depth;
        currentResearchResults = report.research_raw_data || [];
        currentMarkdown = report.report_markdown;
        reportContent.innerHTML = marked.parse(currentMarkdown);
        statusSection.classList.add('hidden');
        reportSection.classList.remove('hidden');
        errorSection.classList.add('hidden');
    } catch (e) { alert("Failed to load report."); }
}
