"""
Central configuration module for the Deep Dive research system.

Loads environment variables and provides LLM factory functions
for the various agent roles (planner, researcher, synthesizer, critic).
"""

import os
import logging

from dotenv import load_dotenv
from crewai import LLM
import litellm

# Ensure LiteLLM drops unsupported parameters
litellm.drop_params = True

# Monkey-patch litellm.completion to strip `cache_breakpoint` from messages
_original_completion = litellm.completion

def _patched_completion(*args, **kwargs):
    messages = kwargs.get("messages", [])
    if isinstance(messages, list):
        for msg in messages:
            if isinstance(msg, dict) and "cache_breakpoint" in msg:
                del msg["cache_breakpoint"]
    
    if len(args) > 1 and isinstance(args[1], list):
        for msg in args[1]:
            if isinstance(msg, dict) and "cache_breakpoint" in msg:
                del msg["cache_breakpoint"]
                
    return _original_completion(*args, **kwargs)

litellm.completion = _patched_completion

# ---------------------------------------------------------------------------
# Load .env at module level so every downstream import gets the values
# ---------------------------------------------------------------------------
load_dotenv()

# ---------------------------------------------------------------------------
# FIREWORKS AI CONFIGURATION (AMD MI300X ACCELERATORS)
# ---------------------------------------------------------------------------
# We are using Fireworks AI since it natively serves models on AMD Instinct GPUs,
# meeting the AMD Compute requirement for the hackathon perfectly.

FIREWORKS_API_KEY: str = os.getenv("FIREWORKS_API_KEY", "")

def get_default_llm() -> LLM:
    """Returns the default LLM for agent reasoning."""
    return LLM(
        model="fireworks_ai/accounts/fireworks/models/deepseek-v4-pro",
        api_key=FIREWORKS_API_KEY,
        temperature=0.7,
        timeout=180,
    )

def get_synthesis_llm(synthesis_provider: str = "fireworks") -> LLM:
    """Returns the LLM for heavy report synthesis."""
    return LLM(
        model="fireworks_ai/accounts/fireworks/models/deepseek-v4-pro",
        api_key=FIREWORKS_API_KEY,
        temperature=0.3,
        timeout=300,
    )

# ---------------------------------------------------------------------------
# Provider selection & Tavily
# ---------------------------------------------------------------------------
SYNTHESIS_MODEL_PROVIDER: str = "fireworks"
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

# ---------------------------------------------------------------------------
# Provider metadata helpers
# ---------------------------------------------------------------------------

_AGENT_NAMES = ("planner", "researcher", "synthesizer", "critic")

def get_provider_info(agent_name: str, synthesis_provider: str = "fireworks") -> dict:
    """Return ``{"provider": str, "model": str}`` for the given *agent_name*."""
    return {"provider": "fireworks", "model": "llama-v3p1"}

def get_all_provider_info(synthesis_provider: str = "fireworks") -> dict:
    """Return provider info for every agent type."""
    return {name: get_provider_info(name, synthesis_provider) for name in _AGENT_NAMES}

# ---------------------------------------------------------------------------
# Startup diagnostics
# ---------------------------------------------------------------------------
_cfg_logger = logging.getLogger(__name__)
_cfg_logger.info("=== Deep Dive Config Loaded ===")
_cfg_logger.info("  USING FIREWORKS AI ARCHITECTURE (AMD MI300X)")
_cfg_logger.info("  TAVILY_API_KEY    = %s", TAVILY_API_KEY[:8] + '...' if len(TAVILY_API_KEY) > 8 else '(EMPTY!)')
_cfg_logger.info("  FIREWORKS_API_KEY = %s", FIREWORKS_API_KEY[:8] + '...' if len(FIREWORKS_API_KEY) > 8 else '(EMPTY!)')
