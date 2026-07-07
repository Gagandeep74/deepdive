"""
Deep Dive — FastAPI Application Entry Point.

Multi-Agent AI Research & Report Generation System.
Provides SSE-streamed research pipeline execution and health-check endpoints.
"""

import asyncio
import json
import logging
import os
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

from app.pipeline import run_pipeline
from app.database import get_history, get_report

# ---------------------------------------------------------------------------
# Environment & logging
# ---------------------------------------------------------------------------
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Deep Dive",
    description="Multi-Agent AI Research & Report Generation System",
    version="1.0.0",
)

# CORS — allow everything during development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / response models
# ---------------------------------------------------------------------------
class ResearchRequest(BaseModel):
    """Payload accepted by the ``/research`` endpoint."""

    topic: str
    synthesis_provider: str = "fireworks"
    depth: str = "standard"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.post("/research")
async def research(request: Request) -> EventSourceResponse:
    """Launch the multi-agent research pipeline and stream progress via SSE.

    The request body must contain a JSON object with a ``topic`` field.  We
    parse the body manually (instead of relying on a Pydantic parameter) so
    that we retain access to the raw :class:`~fastapi.Request` object — this
    is needed to detect client disconnects via ``request.is_disconnected()``.

    Returns an :class:`~sse_starlette.sse.EventSourceResponse` that yields
    events produced by the pipeline until a ``None`` sentinel signals
    completion.
    """
    body: dict = await request.json()
    topic: str = body.get("topic", "")
    synthesis_provider: str = body.get("synthesis_provider", "fireworks")
    depth: str = body.get("depth", "standard")

    if not topic.strip():
        logger.warning("Received research request with empty topic.")
        return EventSourceResponse(
            content=_error_generator("Topic must not be empty."),
            media_type="text/event-stream",
        )

    logger.info("Starting research pipeline for topic: %s", topic)
    logger.info("Using synthesis_provider=%s", synthesis_provider)

    queue: asyncio.Queue[dict | None] = asyncio.Queue()
    asyncio.create_task(run_pipeline(topic, depth, queue, synthesis_provider))

    return EventSourceResponse(
        content=_event_stream(request, queue),
        media_type="text/event-stream",
    )


async def _event_stream(
    request: Request,
    queue: asyncio.Queue[dict | None],
) -> AsyncGenerator[dict, None]:
    """Async generator that drains *queue* and yields SSE-formatted dicts.

    Terminates when a ``None`` sentinel is received from the pipeline, the
    client disconnects, or a 300-second read timeout elapses.
    """
    try:
        while True:
            # Check for client disconnect.
            if await request.is_disconnected():
                logger.info("Client disconnected — stopping event stream.")
                break

            try:
                msg: dict | None = await asyncio.wait_for(
                    queue.get(), timeout=3600.0
                )
            except asyncio.TimeoutError:
                logger.warning("Event stream timed out after 3600 s.")
                yield {
                    "event": "error",
                    "data": json.dumps({"error": "Stream timed out"}),
                }
                break

            if msg is None:
                # Sentinel: pipeline finished.
                logger.info("Pipeline complete — sending 'done' event.")
                yield {
                    "event": "done",
                    "data": json.dumps({"status": "complete"}),
                }
                break

            logger.info("SSE >>> Sending event: %s | data keys: %s", msg["event"], list(msg["data"].keys()) if isinstance(msg["data"], dict) else '(not dict)')
            yield {
                "event": msg["event"],
                "data": json.dumps(msg["data"]),
            }
    except Exception:
        logger.exception("Unexpected error in SSE event stream.")
        yield {
            "event": "error",
            "data": json.dumps({"error": "Internal server error"}),
        }


async def _error_generator(message: str) -> AsyncGenerator[dict, None]:
    """Yield a single SSE error event and close the stream."""
    yield {
        "event": "error",
        "data": json.dumps({"error": message}),
    }


@app.get("/health")
async def health() -> dict[str, str]:
    """Lightweight liveness / readiness probe."""
    return {"status": "healthy"}

@app.get("/history")
async def list_history():
    """List past research reports."""
    return get_history()

@app.get("/history/{report_id}")
async def fetch_report(report_id: str):
    """Fetch a specific report and its raw data."""
    report = get_report(report_id)
    if not report:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Report not found")
    return report


# ---------------------------------------------------------------------------
# Static-file mounting (must come AFTER route definitions)
# ---------------------------------------------------------------------------
_this_dir = Path(__file__).resolve().parent

# Development: frontend lives alongside backend in the repo.
_frontend_dir = _this_dir.parent.parent / "frontend"

# Docker / production: frontend assets copied into /app/static/
# (since WORKDIR is /app, _this_dir is /app/app, so parent is /app)
_static_dir = _this_dir.parent / "static"

if _frontend_dir.is_dir():
    logger.info("Mounting frontend static files from %s", _frontend_dir)
    app.mount("/", StaticFiles(directory=str(_frontend_dir), html=True), name="frontend")
elif _static_dir.is_dir():
    logger.info("Mounting static files from %s", _static_dir)
    app.mount("/", StaticFiles(directory=str(_static_dir), html=True), name="static")


# ---------------------------------------------------------------------------
# Development server
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
