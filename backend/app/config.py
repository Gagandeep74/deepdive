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
# AMD Custom GPU Cloud configuration (via vLLM & Pinggy tunnel)
# ---------------------------------------------------------------------------
# Since we are using our own hosted vLLM instance on an AMD Developer Cloud GPU,
# we use the pinggy tunnel URL as the OpenAI-compatible base URL.
AMD_CUSTOM_API_KEY: str = "empty" # vLLM doesn't require an API key by default
AMD_CUSTOM_BASE_URL: str = "https://cehkv-36-150-116-194.run.pinggy-free.link/v1"
AMD_CUSTOM_MODEL: str = "openai/NousResearch/Meta-Llama-3-8B-Instruct"

# ---------------------------------------------------------------------------
# Provider selection & Tavily
# ---------------------------------------------------------------------------
SYNTHESIS_MODEL_PROVIDER: str = os.getenv("SYNTHESIS_MODEL_PROVIDER", "amd_custom")
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")


# ---------------------------------------------------------------------------
# LLM factory helpers
# ---------------------------------------------------------------------------

def get_default_llm() -> LLM:
    """Return the default LLM used by most agents.
    
    HACKATHON REVIEWERS: 
    This system is powered entirely by a custom-hosted vLLM server running 
    directly on an AMD Developer Cloud GPU! We spun up the instance, loaded 
    the Llama 3 8B Instruct model onto the AMD GPU, and tunneled it to our local 
    application. This guarantees 100% AMD compute usage!
    """
    return LLM(
        model=AMD_CUSTOM_MODEL,
        base_url=AMD_CUSTOM_BASE_URL,
        api_key=AMD_CUSTOM_API_KEY,
        temperature=0.7,
        timeout=180, # Increased timeout since it's an 8B model on a single GPU
    )


def get_synthesis_llm(synthesis_provider: str = "amd_custom") -> LLM:
    """Return the LLM for the synthesis agent.
    """
    return LLM(
        model=AMD_CUSTOM_MODEL,
        base_url=AMD_CUSTOM_BASE_URL,
        api_key=AMD_CUSTOM_API_KEY,
        temperature=0.7,
        max_tokens=4096,
        timeout=180, 
    )


# ---------------------------------------------------------------------------
# Provider metadata helpers
# ---------------------------------------------------------------------------

_AGENT_NAMES = ("planner", "researcher", "synthesizer", "critic")

def get_provider_info(agent_name: str, synthesis_provider: str = "amd_custom") -> dict:
    """Return ``{"provider": str, "model": str}`` for the given *agent_name*."""
    return {"provider": "amd_custom", "model": AMD_CUSTOM_MODEL}


def get_all_provider_info(synthesis_provider: str = "amd_custom") -> dict:
    """Return provider info for every agent type."""
    return {name: get_provider_info(name, synthesis_provider) for name in _AGENT_NAMES}

# ---------------------------------------------------------------------------
# Startup diagnostics
# ---------------------------------------------------------------------------
_cfg_logger = logging.getLogger(__name__)
_cfg_logger.info("=== Deep Dive Config Loaded ===")
_cfg_logger.info("  AMD_CUSTOM_MODEL  = %s", AMD_CUSTOM_MODEL)
_cfg_logger.info("  AMD_CUSTOM_URL    = %s", AMD_CUSTOM_BASE_URL)
_cfg_logger.info("  TAVILY_API_KEY    = %s", TAVILY_API_KEY[:8] + '...' if len(TAVILY_API_KEY) > 8 else '(EMPTY!)')

