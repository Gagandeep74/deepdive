"""
Critic agent for the Deep Dive research system.

Reviews a synthesised research report against the underlying research
results, flagging unsupported claims, overgeneralisations, missing
counterpoints, and unclear causal reasoning.
"""

import asyncio
import logging

from crewai import Agent, Crew, Process, Task

from app.config import get_default_llm

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_critic(report: str, research_results: list[dict]) -> str:
    """Review *report* against *research_results* and return feedback.

    Returns either a numbered list of specific issues or the exact text
    ``"No issues found."`` if the report passes all quality checks.
    """
    try:
        llm = get_default_llm()

        critic_agent = Agent(
            role="Research Critic",
            goal=(
                "Rigorously review research reports for accuracy, "
                "completeness, and logical soundness."
            ),
            backstory=(
                "You are a demanding peer-review editor at a top-tier "
                "research publication.  You have an eagle eye for "
                "unsupported claims, logical fallacies, and sloppy "
                "attribution.  You never let a weak argument slide, but "
                "you also give credit where it is due.  Your reviews are "
                "constructive: you identify the problem AND explain what "
                "would fix it."
            ),
            llm=llm,
            verbose=False,
        )

        # ------------------------------------------------------------------
        # Build the task description
        # ------------------------------------------------------------------
        research_block = _format_research_for_critic(research_results)

        task_description = (
            "Review the following research report and the raw research "
            "findings it was based on.  Your job is to flag any issues.\n\n"
            "## Report to Review\n\n"
            f"{report}\n\n"
            "## Underlying Research Findings\n\n"
            f"{research_block}\n\n"
            "Check for:\n"
            "1. Claims in the report that are NOT backed by the cited "
            "sources or research findings.\n"
            "2. Overgeneralisations — where the report draws sweeping "
            "conclusions from limited evidence.\n"
            "3. Missing counterpoints — where the research findings "
            "contain conflicting information that the report ignores.\n"
            "4. Unclear causal claims — where correlation is presented as "
            "causation without evidence.\n\n"
            "If you find issues, return a numbered list of specific, "
            "actionable items.\n"
            'If the report passes ALL checks, return exactly: "No issues '
            'found."'
        )

        critic_task = Task(
            description=task_description,
            expected_output=(
                "A numbered list of specific issues found, OR exactly the "
                'text "No issues found." if the report passes all checks.'
            ),
            agent=critic_agent,
        )

        crew = Crew(
            agents=[critic_agent],
            tasks=[critic_task],
            process=Process.sequential,
            verbose=False,
        )

        # Prefer async kickoff; fall back to threaded sync kickoff
        logger.info("Critic: invoking CrewAI kickoff...")
        try:
            result = await asyncio.wait_for(
                crew.akickoff(inputs={}),
                timeout=300.0,
            )
        except asyncio.TimeoutError:
            logger.error("Critic: CrewAI akickoff timed out after 300s")
            raise TimeoutError("Critic agent timed out after 300 seconds")
        except AttributeError:
            logger.info("akickoff not available — falling back to threaded kickoff")
            result = await asyncio.wait_for(
                asyncio.to_thread(crew.kickoff, inputs={}),
                timeout=300.0,
            )
        logger.info("Critic: CrewAI kickoff returned result type=%s", type(result).__name__)

        return getattr(result, "raw", str(result))

    except Exception as exc:
        logger.error("Critic failed: %s", exc, exc_info=True)
        raise


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _format_research_for_critic(research_results: list[dict]) -> str:
    """Render research results into a readable block for the critic."""
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
            f"### Finding {idx}: {res.get('sub_question', 'N/A')}\n"
            f"**Confidence:** {res.get('confidence', 'unknown')}\n\n"
            f"{res.get('summary', '(no summary)')}\n\n"
            f"**Sources:**\n{sources_text}"
        )

    return "\n---\n\n".join(blocks)
