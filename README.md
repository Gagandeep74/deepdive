# 🔬 Deep Dive

> **An Autonomous Multi-Agent Research & Report Generation System**

Deep Dive is an intelligent orchestration system that takes a broad research topic and autonomously produces a structured, cited, and comprehensive Markdown report. It achieves this by coordinating a swarm of specialized AI agents that plan, research, synthesize, and critique in parallel.

---

## ✨ Key Features

- **Parallel Hive-Mind Research:** Spawns multiple web-searching agents simultaneously to cut down research time by up to 90%.
- **Self-Correcting Critique Loop:** An independent Critic agent reviews the drafted report against raw facts, forcing revisions if claims are unsupported or citations are missing.
- **Real-time Streaming:** Watch the agents work in real-time with an interactive UI that streams SSE events directly from the backend.
- **Hardware Optimized:** Designed to leverage custom-hosted vLLM inference servers (e.g., AMD Developer Cloud with MI300X GPUs) for extremely fast parallel context processing.

---

## 🧠 Agent Architecture

Deep Dive operates using a 4-phase, multi-agent pipeline built on top of CrewAI:

1. **The Planner (Architect):** Breaks down your broad prompt into 2, 5, or 10 highly specific, non-overlapping sub-questions.
2. **The Researchers (Hive Mind):** A dynamic swarm of agents where each is assigned exactly one sub-question. They independently scour the web (via Tavily), read articles, and compile raw, factual notes.
3. **The Synthesizer (Writer):** Stitches together the disjointed notes from all researchers into a single, cohesive, logically flowing Markdown draft.
4. **The Critic (Editor):** Verifies facts, checks citations, and reviews formatting. If the draft fails quality checks, the Critic rejects it and forces the Synthesizer to rewrite (up to 2 passes).

*(For a detailed sequence diagram, see [WORKFLOW.md](WORKFLOW.md))*

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- [Tavily API Key](https://tavily.com/) (For web searching)
- [Supabase Project](https://supabase.com/) (For Authentication and History)

### 1. Clone & Configure

```bash
git clone https://github.com/Gagandeep74/deepdive.git
cd deepdive

# Copy the environment template
cp .env.example .env
```
Edit the `.env` file and add your `TAVILY_API_KEY` and LLM configurations.

### 2. Start the Backend (FastAPI)

```bash
cd backend
python -m venv .venv

# Windows
.\.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 3. Start the Frontend (React + Vite)

Open a new terminal window:

```bash
cd frontend_new
npm install
npm run dev
```

The application will be available at `http://localhost:5173` (or `http://localhost:8000` via the backend proxy).

---

## 🏆 AMD Compute Hackathon Note

This project was built to take full advantage of AMD compute infrastructure for lightning-fast LLM inference. Deep Dive relies on a custom-hosted `vLLM` inference server on an **AMD Developer Cloud** droplet, serving Llama 3 models via AMD MI300X GPUs. 

*Note: Because our live endpoint is ephemeral to conserve compute resources, the hardcoded tunnel URL may expire. Please refer to our demo video for a complete walkthrough of the pipeline utilizing the AMD GPU cluster!*
