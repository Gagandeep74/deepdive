"""
Researcher agent for the Deep Dive research system.

Investigates a single sub-question by performing web searches,
producing a concise summary with cited sources and a confidence rating.
"""

import asyncio
import json
import logging
import re
from typing import List

from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task

from app.config import get_default_llm

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Tavily search tool — graceful fallback if crewai_tools is missing
# ---------------------------------------------------------------------------

try:
    from crewai_tools import TavilySearchResults as TavilySearchTool  # type: ignore
except ImportError:
    try:
        from crewai_tools import TavilySearchTool  # type: ignore
    except ImportError:
        logger.warning(
            "crewai_tools is not installed — using a no-op search fallback. "
            "Install crewai_tools and set TAVILY_API_KEY for real web search."
        )

        from crewai.tools import BaseTool as _CrewBaseTool  # type: ignore

        class TavilySearchTool(_CrewBaseTool):  # type: ignore[no-redef]
            """Minimal fallback when crewai_tools is unavailable."""

            name: str = "tavily_search"
            description: str = (
                "Search the web for information. "
                "(Fallback stub — install crewai_tools for real results.)"
            )

            def _run(self, query: str) -> str:
                return (
                    "Web search is unavailable (crewai_tools not installed). "
                    "Please answer based on your training data."
                )


# ---------------------------------------------------------------------------
# Structured output models
# ---------------------------------------------------------------------------

class Source(BaseModel):
    """A single reference source."""

    title: str
    url: str


class ResearchResult(BaseModel):
    """Structured output produced by the researcher agent."""

    sub_question: str
    summary: str
    sources: List[Source] = Field(default_factory=list)
    confidence: str = Field(
        description="Confidence rating: high, medium, or low",
        default="medium",
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_researcher(sub_question: str) -> dict:
    """Research *sub_question* and return a result dict.

    Returned dict has keys: ``sub_question``, ``summary``, ``sources``
    (list of ``{title, url}``), and ``confidence``.
    """
    try:
        llm = get_default_llm()

        search_tool = TavilySearchTool()

        researcher_agent = Agent(
            role="Research Specialist",
            goal=(
                "Thoroughly research a specific question using web search "
                "and produce a factual, well-sourced summary."
            ),
            backstory=(
                "You are a meticulous researcher who leaves no stone "
                "unturned.  You always verify claims by cross-referencing "
                "multiple sources and clearly distinguish between established "
                "facts and emerging opinions.  You cite every source you "
                "rely on and honestly assess the confidence level of your "
                "findings. "
                "CRITICAL: You must output your response entirely in English, "
                "regardless of the input language."
            ),
            llm=llm,
            tools=[search_tool],
            max_iter=10,
            verbose=False,
        )

        research_task = Task(
            description=(
                "Research the following question thoroughly:\n\n"
                f"Question: {sub_question}\n\n"
                "Instructions:\n"
                "1. Perform 2-4 web searches with varied queries to gather "
                "diverse perspectives.\n"
                "2. Write a 150-250 word summary of your findings.\n"
                "3. List every source you used with its title and URL.\n"
                "4. Rate your confidence as 'high', 'medium', or 'low' "
                "based on source agreement and quality.\n\n"
                "Return your answer as a JSON object with keys: "
                '"sub_question", "summary", "sources" (list of '
                '{"title", "url"}), and "confidence".'
            ),
            expected_output=(
                "A JSON object containing: sub_question (str), summary "
                "(150-250 words), sources (list of objects with title and "
                "url), and confidence (high/medium/low)."
            ),
            agent=researcher_agent,
            output_pydantic=ResearchResult,
        )

        crew = Crew(
            agents=[researcher_agent],
            tasks=[research_task],
            process=Process.sequential,
            verbose=False,
        )

        # Prefer async kickoff; fall back to threaded sync kickoff
        logger.info("Researcher: invoking CrewAI kickoff for: %s", sub_question[:60])
        try:
            result = await asyncio.wait_for(
                crew.akickoff(inputs={}),
                timeout=120.0,
            )
        except asyncio.TimeoutError:
            logger.error("Researcher: CrewAI akickoff timed out after 120s for: %s", sub_question[:60])
            raise TimeoutError(f"Researcher agent timed out for: {sub_question[:60]}")
        except AttributeError:
            logger.info("akickoff not available — falling back to threaded kickoff")
            result = await asyncio.wait_for(
                asyncio.to_thread(crew.kickoff, inputs={}),
                timeout=120.0,
            )
        logger.info("Researcher: CrewAI kickoff returned result type=%s", type(result).__name__)

        return _extract_research_result(result, sub_question)

    except Exception as exc:
        logger.error(
            "Researcher failed for sub-question '%s': %s",
            sub_question,
            exc,
            exc_info=True,
        )
        # Return a degraded but valid result so the pipeline can continue
        return {
            "sub_question": sub_question,
            "summary": f"Research could not be completed due to an error: {exc}",
            "sources": [],
            "confidence": "low",
        }


# ---------------------------------------------------------------------------
# Result extraction helpers
# ---------------------------------------------------------------------------

def _extract_research_result(result: object, sub_question: str) -> dict:
    """Best-effort extraction of research data from a CrewAI result."""

    # 1. Try structured pydantic output
    try:
        pydantic_obj = getattr(result, "pydantic", None)
        if pydantic_obj is not None and isinstance(pydantic_obj, ResearchResult):
            return pydantic_obj.model_dump()
    except Exception:
        pass

    # 2. Try parsing raw output as JSON
    raw = getattr(result, "raw", str(result))

    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return _normalise_result_dict(data, sub_question)
    except (json.JSONDecodeError, TypeError):
        pass

    # 3. Try extracting an embedded JSON block
    json_match = re.search(
        r"\{[\s\S]*?\"summary\"\s*:[\s\S]*?\}", raw, re.DOTALL,
    )
    if json_match:
        try:
            data = json.loads(json_match.group())
            if isinstance(data, dict):
                return _normalise_result_dict(data, sub_question)
        except (json.JSONDecodeError, TypeError):
            pass

    # 4. Fallback — treat raw text as the summary
    logger.warning("Could not parse researcher output — using raw text as summary")
    return {
        "sub_question": sub_question,
        "summary": raw[:1000],
        "sources": [],
        "confidence": "low",
    }


def _normalise_result_dict(data: dict, sub_question: str) -> dict:
    """Ensure the dict has the expected shape."""
    sources_raw = data.get("sources", [])
    sources = []
    for src in sources_raw:
        if isinstance(src, dict) and "title" in src and "url" in src:
            sources.append({"title": src["title"], "url": src["url"]})

    return {
        "sub_question": data.get("sub_question", sub_question),
        "summary": data.get("summary", ""),
        "sources": sources,
        "confidence": data.get("confidence", "medium"),
    }
