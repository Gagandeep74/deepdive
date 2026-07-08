"""
Orchestration pipeline for the Deep Dive research system.

Coordinates the four agent phases — planning, research, synthesis, and
critique — and streams structured status events through an
``asyncio.Queue`` so the API layer can forward them to the client via SSE.
"""

import asyncio
import json
import logging

from app.agents.planner import run_planner
from app.agents.researcher import run_researcher
from app.agents.synthesizer import run_synthesizer
from app.agents.critic import run_critic
from app.config import get_all_provider_info
from app.database import save_report

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def run_pipeline(topic: str, depth: str, queue: asyncio.Queue, synthesis_provider: str = "fireworks", user_id: str = None) -> None:
    """Execute the full research pipeline for *topic*.

    Progress events are pushed onto *queue* as dicts with the shape::

        {"event": "status", "data": { ... }}
        {"event": "report", "data": { ... }}
        {"event": "error",  "data": {"message": str}}

    A ``None`` sentinel is pushed last to signal completion.
    """
    try:
        # ==================================================================
        # Phase 1 — Planning
        # ==================================================================
        await queue.put({
            "event": "status",
            "data": {
                "agent": "planner",
                "state": "planning",
                "message": f"Breaking down topic: {topic}",
            },
        })

        logger.info(">>> Phase 1: Starting Planner agent for topic: %s (Depth: %s)", topic, depth)
        sub_questions = await run_planner(topic, depth)
        logger.info("<<< Phase 1: Planner returned %d sub-questions: %s", len(sub_questions), sub_questions)

        await queue.put({
            "event": "status",
            "data": {
                "agent": "planner",
                "state": "done",
                "sub_questions": sub_questions,
            },
        })

        logger.info("Planner produced %d sub-questions", len(sub_questions))

        # ==================================================================
        # Phase 2 — Parallel Research
        # ==================================================================
        for idx, sq in enumerate(sub_questions, start=1):
            await queue.put({
                "event": "status",
                "data": {
                    "agent": f"researcher_{idx}",
                    "state": "researching",
                    "sub_question": sq,
                },
            })

        research_results: list[dict] = []
        logger.info(">>> Phase 2: Starting Research for %d sub-questions", len(sub_questions))
        for sq in sub_questions:
            res = await run_researcher(sq)
            logger.info("    Researcher completed sub-question: %s (confidence: %s)", sq[:60], res.get('confidence', '?'))
            research_results.append(res)
            # Add a small 2-second sleep to be safe with rate limits
            await asyncio.sleep(2)

        await queue.put({
            "event": "status",
            "data": {
                "agent": "researchers",
                "state": "done",
                "count": len(research_results),
                "results": research_results
            },
        })

        logger.info("All %d researchers completed", len(research_results))

        # ==================================================================
        # Phase 3 — Synthesis
        # ==================================================================
        await queue.put({
            "event": "status",
            "data": {
                "agent": "synthesizer",
                "state": "synthesizing",
                "message": "Compiling research into a report",
            },
        })

        logger.info(">>> Phase 3: Starting Synthesizer")
        report = await run_synthesizer(topic, research_results, synthesis_provider=synthesis_provider)
        logger.info("<<< Phase 3: Synthesizer returned %d chars", len(report))

        await queue.put({
            "event": "status",
            "data": {
                "agent": "synthesizer",
                "state": "done",
            },
        })

        logger.info("Initial synthesis complete (%d chars)", len(report))

        # ==================================================================
        # Phase 4 — Critic Review Loop (up to 2 passes)
        # ==================================================================
        for pass_num in range(2):
            await queue.put({
                "event": "status",
                "data": {
                    "agent": "critic",
                    "state": "critiquing",
                    "pass": pass_num + 1,
                    "message": f"Review pass {pass_num + 1}",
                },
            })

            logger.info(">>> Phase 4: Starting Critic pass %d", pass_num + 1)
            critique = await run_critic(report, research_results)
            logger.info("<<< Phase 4: Critic returned: %s", critique[:100] if critique else '(empty)')

            # Check whether the critic is satisfied
            if "no issues found" in critique.lower():
                await queue.put({
                    "event": "status",
                    "data": {
                        "agent": "critic",
                        "state": "approved",
                        "pass": pass_num + 1,
                        "message": "Report approved by critic",
                    },
                })
                logger.info("Critic approved the report on pass %d", pass_num + 1)
                break

            # Critic found issues
            await queue.put({
                "event": "status",
                "data": {
                    "agent": "critic",
                    "state": "revision_needed",
                    "pass": pass_num + 1,
                    "feedback": critique,
                },
            })

            logger.info("Critic requested revisions (pass %d)", pass_num + 1)

            # Only revise if this isn't the last pass
            if pass_num == 0:
                await queue.put({
                    "event": "status",
                    "data": {
                        "agent": "synthesizer",
                        "state": "revising",
                        "message": "Revising report based on critic feedback",
                    },
                })

                report = await run_synthesizer(
                    topic,
                    research_results,
                    critic_feedback=critique,
                    synthesis_provider=synthesis_provider,
                )

                await queue.put({
                    "event": "status",
                    "data": {
                        "agent": "synthesizer",
                        "state": "done",
                        "message": "Revision complete",
                    },
                })

                logger.info("Revision complete (%d chars)", len(report))

        # ==================================================================
        # Final — Deliver the report
        # ==================================================================
        providers = get_all_provider_info(synthesis_provider)

        await queue.put({
            "event": "report",
            "data": {
                "markdown": report,
                "providers": providers,
            },
        })

        # Save to database
        try:
            await asyncio.to_thread(save_report, topic, depth, "complete", report, research_results, user_id)
        except Exception as e:
            logger.error("Failed to save report to database: %s", e)

        logger.info("Pipeline finished successfully for topic: %s", topic)

    except Exception as exc:
        logger.error("!!! PIPELINE FAILED: %s", exc, exc_info=True)
        await queue.put({
            "event": "error",
            "data": {"message": str(exc)},
        })

    finally:
        # Sentinel to signal that the stream is complete
        await queue.put(None)
