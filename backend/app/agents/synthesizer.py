"""
Synthesizer agent for the Deep Dive research system.

Compiles individual research results into a cohesive, well-structured
markdown report with proper citations.  This is the only agent whose
LLM provider can be switched between Fireworks and AMD Cloud.
"""

import asyncio
import logging
from typing import Optional

from crewai import Agent, Crew, Process, Task

from app.config import get_synthesis_llm

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_synthesizer(
    topic: str,
    research_results: list[dict],
    critic_feedback: str | None = None,
    synthesis_provider: str = "fireworks",
) -> str:
    """Synthesise *research_results* into a markdown report on *topic*.

    Parameters
    ----------
    topic:
        The original high-level research topic.
    research_results:
        A list of dicts, each with keys ``sub_question``, ``summary``,
        ``sources`` (list of ``{title, url}``), and ``confidence``.
    critic_feedback:
        Optional feedback from the critic agent.  When provided, the
        synthesizer is instructed to revise the report accordingly.

    Returns
    -------
    str
        A markdown-formatted research report.
    """
    try:
        llm = get_synthesis_llm(synthesis_provider)

        synthesizer_agent = Agent(
            role="Research Synthesizer",
            goal=(
                "Create a comprehensive, well-structured research report "
                "with proper citations that integrates findings from "
                "multiple research streams."
            ),
            backstory=(
                "You are an expert technical writer and research analyst "
                "renowned for transforming disparate research findings into "
                "clear, authoritative reports.  You pay meticulous attention "
                "to source attribution, logical flow, and balanced "
                "presentation of evidence.  When sources conflict you "
                "highlight the discrepancy rather than silently choosing a "
                "side. "
                "CRITICAL: You must output your response entirely in English, "
                "regardless of the input language."
            ),
            llm=llm,
            verbose=False,
        )

        # ------------------------------------------------------------------
        # Build the task description
        # ------------------------------------------------------------------
        research_block = _format_research_results(research_results)

        task_description = (
            f"Write a comprehensive research report on the following topic:\n\n"
            f"**Topic:** {topic}\n\n"
            f"## Research Findings\n\n{research_block}\n\n"
            "Instructions:\n"
            "- Start with an Executive Summary (3-5 sentences).\n"
            "- Create one section per sub-question, weaving in the research "
            "findings with inline numbered citations like [1], [2].\n"
            "- End with a References section listing all sources.\n"
            "- Note any contradictions or disagreements between sources.\n"
        )

        if critic_feedback is not None:
            task_description += (
                "\n## Critic Feedback — MUST ADDRESS\n\n"
                f"{critic_feedback}\n\n"
                "Carefully revise the report to address every point raised "
                "by the critic above while preserving existing strengths.\n"
            )

        synthesis_task = Task(
            description=task_description,
            expected_output=(
                "A structured markdown report with: Executive Summary, "
                "one section per sub-question with inline numbered "
                "citations [1][2], a References section listing all "
                "sources, and a note on any contradictions found between "
                "sources."
            ),
            agent=synthesizer_agent,
        )

        crew = Crew(
            agents=[synthesizer_agent],
            tasks=[synthesis_task],
            process=Process.sequential,
            verbose=False,
        )

        # Prefer async kickoff; fall back to threaded sync kickoff
        logger.info("Synthesizer: invoking CrewAI kickoff...")
        try:
            result = await asyncio.wait_for(
                crew.akickoff(inputs={}),
                timeout=300.0,
            )
        except asyncio.TimeoutError:
            logger.error("Synthesizer: CrewAI akickoff timed out after 300s")
            raise TimeoutError("Synthesizer agent timed out after 300 seconds")
        except AttributeError:
            logger.info("akickoff not available — falling back to threaded kickoff")
            result = await asyncio.wait_for(
                asyncio.to_thread(crew.kickoff, inputs={}),
                timeout=300.0,
            )
        logger.info("Synthesizer: CrewAI kickoff returned result type=%s", type(result).__name__)

        return getattr(result, "raw", str(result))

    except Exception as exc:
        logger.error("Synthesizer failed: %s", exc, exc_info=True)
        raise


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _format_research_results(research_results: list[dict]) -> str:
    """Render a list of research-result dicts into a readable text block."""
    blocks: list[str] = []
    for idx, res in enumerate(research_results, start=1):
        sources_text = ""
        for src in res.get("sources", []):
            title = src.get("title", "Untitled")
            url = src.get("url", "")
            sources_text += f"  - {title}: {url}\n"
        if not sources_text:
            sources_text = "  (no sources)\n"

        blocks.append(
            f"### Sub-Question {idx}: {res.get('sub_question', 'N/A')}\n"
            f"**Confidence:** {res.get('confidence', 'unknown')}\n\n"
            f"{res.get('summary', '(no summary)')}\n\n"
            f"**Sources:**\n{sources_text}"
        )

    return "\n---\n\n".join(blocks)
