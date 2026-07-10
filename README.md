# 🔬 Deep Dive — Multi-Agent AI Research & Report Generation System

**Deep Dive leverages Fireworks AI, which serves high-performance Llama models via AMD Instinct™ MI300X GPUs, ensuring incredibly fast inference for our multi-agent pipeline.**

Deep Dive takes a research topic and produces a structured, cited report by coordinating four specialized AI agents that work together. 

## AMD Infrastructure

This project is built to take full advantage of AMD compute infrastructure for lightning-fast LLM inference.

- **Compute Provider:** Fireworks AI
- **Hardware:** AMD Instinct™ MI300X Accelerators
- **Models Used:** Llama-3 (70B & 8B)
- **Agent Usage:** The Planner, Researchers, Synthesizer, and Critic agents all rely exclusively on Fireworks AI endpoints backed by AMD hardware for low-latency generation. (See `backend/app/config.py` for verification).

## Architecture

Deep Dive orchestrates four AI agents to automate the research process:

1. **Planner Agent:** Breaks a broad topic down into 3-5 distinct, non-overlapping sub-questions.
2. **Researcher Agents:** Work in parallel, using Tavily to search the web for each sub-question, extracting facts and citing sources.
3. **Synthesizer Agent:** Compiles all findings into a unified, markdown-formatted report.
4. **Critic Agent:** Reviews the report against the raw findings to check for unsupported claims or hallucinations, forcing a revision if needed.

All agents are explicitly instructed to output in English and enforce strict 30-second execution timeouts.

## Quick Start

### Prerequisites
- Node.js 18+ (for frontend)
- Python 3.11+ (for backend)
- [Fireworks AI API Key](https://fireworks.ai/)
- [Tavily API Key](https://tavily.com/)

### 1. Clone & Configure

Clone the repository and set up your environment variables:

```bash
cd deep-dive
cp .env.example .env
# Edit .env and add your API keys:
#   FIREWORKS_API_KEY=your-key-here
#   TAVILY_API_KEY=your-key-here
```

### 2. Run Locally (Standard)

**Backend:**
```bash
cd backend
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

### Alternative: Run with Docker

If you prefer containerization, you can run the entire stack with Docker:

```bash
docker compose up --build
```
The application will be available at `http://localhost:8000`.
