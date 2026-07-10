"""
Planner agent for the Deep Dive research system.

Breaks a broad research topic down into 3–5 distinct, independent,
researchable sub-questions that can be investigated in parallel.
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
# Structured output model
# ---------------------------------------------------------------------------

class PlannerOutput(BaseModel):
    """Structured output produced by the planner agent."""

    sub_questions: List[str] = Field(
        description="List of 3-5 distinct, independent, researchable sub-questions",
    )


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_planner(topic: str, depth: str = "standard") -> list[str]:
    """Execute the Planner agent to break down a topic into sub-questions.

    Args:
        topic: The broad research topic (e.g. "Quantum Computing")
        depth: The research depth ("quick", "standard", or "deep")
    """
    try:
        llm = get_default_llm()

        planner_agent = Agent(
            role="Research Planner",
            goal=(
                "Break down a research topic into 3-5 distinct, independent, "
                "researchable sub-questions that collectively cover the topic "
                "comprehensively."
            ),
            backstory=(
                "You are an expert research methodologist with decades of "
                "experience in academic and industry research.  You excel at "
                "decomposing complex topics into well-scoped, non-overlapping "
                "questions that can be investigated independently.  Each "
                "sub-question you produce should target a different facet of "
                "the topic — technical, historical, social, economic, or "
                "comparative — so that researchers working in parallel can "
                "cover the full landscape without duplicating effort. "
                "CRITICAL: You must output your response entirely in English, "
                "regardless of the input language."
            ),
            llm=llm,
            verbose=False,
        )

        # Determine question count based on depth
        count = 5
        if depth == "quick":
            count = 2
        elif depth == "deep":
            count = 10

        planning_task = Task(
            description=(
                f"Given the topic: '{topic}', break it down into exactly {count} distinct, "
                f"highly specific sub-questions that must be researched to form a comprehensive report. "
                f"The questions should cover history, technical details, current state, and future roadmap if applicable.\n\n"
                "Requirements:\n"
                "- Each sub-question must be self-contained and answerable "
                "through web research.\n"
                "- Avoid overlapping questions.\n"
                "- Cover different angles: technical details, history, "
                "current state, future outlook, comparisons, etc.\n"
                "- Return ONLY a JSON object with a single key "
                '"sub_questions" containing a list of question strings.'
            ),
            expected_output=(
                'A JSON object like: {"sub_questions": ["Question 1?", '
                '"Question 2?", "Question 3?"]}'
            ),
            agent=planner_agent,
            output_pydantic=PlannerOutput,
        )

        crew = Crew(
            agents=[planner_agent],
            tasks=[planning_task],
            process=Process.sequential,
            verbose=False,
        )

        # Prefer async kickoff; fall back to threaded sync kickoff
        logger.info("Planner: invoking CrewAI kickoff...")
        try:
            result = await asyncio.wait_for(
                crew.akickoff(inputs={"topic": topic}),
                timeout=120.0,
            )
        except asyncio.TimeoutError:
            logger.error("Planner: CrewAI akickoff timed out after 120s")
            raise TimeoutError("Planner agent timed out after 120 seconds")
        except AttributeError:
            logger.info("akickoff not available — falling back to threaded kickoff")
            result = await asyncio.wait_for(
                asyncio.to_thread(crew.kickoff, inputs={"topic": topic}),
                timeout=120.0,
            )
        logger.info("Planner: CrewAI kickoff returned result type=%s", type(result).__name__)

        return _extract_sub_questions(result)

    except Exception as exc:
        logger.error("Planner failed for topic '%s': %s", topic, exc, exc_info=True)
        raise


# ---------------------------------------------------------------------------
# Result extraction helpers
# ---------------------------------------------------------------------------

def _extract_sub_questions(result: object) -> list[str]:
    """Best-effort extraction of sub-questions from a CrewAI result."""

    # 1. Try structured pydantic output
    try:
        pydantic_obj = getattr(result, "pydantic", None)
        if pydantic_obj is not None and hasattr(pydantic_obj, "sub_questions"):
            questions = pydantic_obj.sub_questions
            if questions:
                logger.debug("Extracted %d sub-questions via pydantic output", len(questions))
                return list(questions)
    except Exception:
        pass

    # 2. Try parsing raw output as JSON
    raw = getattr(result, "raw", str(result))
    try:
        data = json.loads(raw)
        if isinstance(data, dict) and "sub_questions" in data:
            return list(data["sub_questions"])
    except (json.JSONDecodeError, TypeError):
        pass

    # 3. Try extracting a JSON block embedded in markdown / fenced code
    json_match = re.search(r"\{[\s\S]*?\"sub_questions\"\s*:\s*\[[\s\S]*?\]\s*\}", raw)
    if json_match:
        try:
            data = json.loads(json_match.group())
            return list(data["sub_questions"])
        except (json.JSONDecodeError, TypeError):
            pass

    # 4. Last resort — treat each non-empty line that looks like a question
    lines = [line.strip() for line in raw.splitlines() if line.strip()]
    questions = [
        re.sub(r"^[\d\.\)\-\*]+\s*", "", line)
        for line in lines
        if line.endswith("?") or re.match(r"^[\d\.\)\-\*]+\s+", line)
    ]
    if questions:
        logger.debug("Extracted %d sub-questions via line parsing", len(questions))
        return questions

    # If nothing works, return the raw lines (shouldn't normally happen)
    logger.warning("Could not parse planner output — returning raw lines")
    return lines[:5]
