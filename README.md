# 🔬 Deep Dive — Multi-Agent AI Research & Report Generation System

> **⚠️ Live Demo & AMD Compute Notice for Judges:**
> *Because our application relies on a dedicated, custom-hosted vLLM inference server running directly on an AMD Developer Cloud droplet, the live endpoint is ephemeral and shuts down to conserve compute resources.* 
> *Therefore, the Pinggy tunnel URL hardcoded in `config.py` may be expired at the time of judging.* 
> *Please see our **Demo Video** for the complete, unedited live demonstration of our application routing traffic directly through our AMD GPU cluster!*

**Deep Dive leverages a completely custom-hosted vLLM server on AMD Developer Cloud, serving Llama 3 models via AMD GPUs, ensuring incredibly fast inference and 100% AMD Compute usage for our multi-agent pipeline.**

Deep Dive takes a research topic and produces a structured, cited report by coordinating four specialized AI agents that work together. 

## AMD Infrastructure

This project is built to take full advantage of AMD compute infrastructure for lightning-fast LLM inference.

- **Compute Provider:** AMD Developer Cloud
- **Hosting Strategy:** Custom `vLLM` Inference Server over SSH Tunnel
- **Models Used:** `NousResearch/Meta-Llama-3-8B-Instruct`
- **Agent Usage:** The Planner, Researchers, Synthesizer, and Critic agents all rely exclusively on our custom AMD endpoint. (See `backend/app/config.py` for verification).

## Architecture

Deep Dive orchestrates four AI agents to automate the research process:

1. **Planner Agent:** Breaks a broad topic down into 3-5 distinct, non-overlapping sub-questions.
2. **Researcher Agents:** Work in parallel, using Tavily to search the web for each sub-question, extracting facts and citing sources.
3. **Synthesizer Agent:** Compiles all findings into a unified, markdown-formatted report.
4. **Critic Agent:** Reviews the report against the raw findings to check for unsupported claims or hallucinations, forcing a revision if needed.

All agents are explicitly instructed to output in English and enforce strict 180-second execution timeouts for large workloads.

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- [Tavily API Key](https://tavily.com/)
- Custom AMD Server Tunnel (already hardcoded for demo)

### 1. Clone & Configure

Clone the repository and set up your environment variables:

```bash
cd deep-dive
cp .env.example .env
# Edit .env and add your API keys:
#   TAVILY_API_KEY=your-key-here
```

### 2. Run Locally

**Backend:**
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend_new
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.
