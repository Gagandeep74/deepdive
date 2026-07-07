"""
Central configuration module for the Deep Dive research system.

Loads environment variables and provides LLM factory functions
for the various agent roles (planner, researcher, synthesizer, critic).
The synthesis agent can be configured to use either Fireworks AI or
AMD Cloud as its model provider.
"""

import os
import logging

from dotenv import load_dotenv
from crewai import LLM
import litellm

# Ensure LiteLLM drops unsupported parameters
litellm.drop_params = True

# Monkey-patch litellm.completion to strip `cache_breakpoint` from messages
# Fireworks AI rejects requests if this CrewAI/Anthropic-specific parameter is present.
_original_completion = litellm.completion

def _patched_completion(*args, **kwargs):
    messages = kwargs.get("messages", [])
    if isinstance(messages, list):
        for msg in messages:
            if isinstance(msg, dict) and "cache_breakpoint" in msg:
                del msg["cache_breakpoint"]
    
    # Also check args just in case
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
# Fireworks AI configuration
# ---------------------------------------------------------------------------
FIREWORKS_API_KEY: str = os.getenv("FIREWORKS_API_KEY", "")
FIREWORKS_BASE_URL: str = os.getenv(
    "FIREWORKS_BASE_URL",
    "https://api.fireworks.ai/inference/v1",
)
FIREWORKS_MODEL: str = os.getenv(
    "FIREWORKS_MODEL",
    "accounts/fireworks/models/deepseek-v4-pro",
)
if not FIREWORKS_MODEL.startswith("fireworks_ai/"):
    FIREWORKS_MODEL = f"fireworks_ai/{FIREWORKS_MODEL}"

# ---------------------------------------------------------------------------
# AMD Cloud configuration
# ---------------------------------------------------------------------------
AMD_CLOUD_API_KEY: str = os.getenv("AMD_CLOUD_API_KEY", "")
AMD_CLOUD_BASE_URL: str = os.getenv("AMD_CLOUD_BASE_URL", "")
AMD_CLOUD_MODEL: str = os.getenv("AMD_CLOUD_MODEL", "")

# ---------------------------------------------------------------------------
# Provider selection & Tavily
# ---------------------------------------------------------------------------
SYNTHESIS_MODEL_PROVIDER: str = os.getenv("SYNTHESIS_MODEL_PROVIDER", "fireworks")
TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")


# ---------------------------------------------------------------------------
# LLM factory helpers
# ---------------------------------------------------------------------------

def get_default_llm() -> LLM:
    """Return the default LLM used by most agents.
    Now using Fireworks AI instead of Local Ollama.
    """
    return LLM(
        model=FIREWORKS_MODEL,
        base_url=FIREWORKS_BASE_URL,
        api_key=FIREWORKS_API_KEY,
        temperature=0.7,
    )


def get_synthesis_llm(synthesis_provider: str = "fireworks") -> LLM:
    """Return the LLM for the synthesis agent.
    """
    if synthesis_provider == "amd_cloud" and AMD_CLOUD_API_KEY and AMD_CLOUD_API_KEY != "your-amd-cloud-api-key":
        return LLM(
            model=AMD_CLOUD_MODEL,
            base_url=AMD_CLOUD_BASE_URL,
            api_key=AMD_CLOUD_API_KEY,
            temperature=0.7,
            max_tokens=4096,
        )
    # Default synthesis to fireworks
    return LLM(
        model=FIREWORKS_MODEL,
        base_url=FIREWORKS_BASE_URL,
        api_key=FIREWORKS_API_KEY,
        temperature=0.7,
    )


# ---------------------------------------------------------------------------
# Provider metadata helpers
# ---------------------------------------------------------------------------

_AGENT_NAMES = ("planner", "researcher", "synthesizer", "critic")


def get_provider_info(agent_name: str, synthesis_provider: str = "fireworks") -> dict:
    """Return ``{"provider": str, "model": str}`` for the given *agent_name*.

    The synthesis agent may use a different provider based on
    ``synthesis_provider``; all other agents now use Fireworks AI.
    """
    if agent_name == "synthesizer":
        if synthesis_provider == "amd_cloud" and AMD_CLOUD_API_KEY and AMD_CLOUD_API_KEY != "your-amd-cloud-api-key":
            return {"provider": "amd_cloud", "model": AMD_CLOUD_MODEL}
        return {"provider": "fireworks", "model": FIREWORKS_MODEL}

    # All non-synthesis agents use Fireworks AI
    return {"provider": "fireworks", "model": FIREWORKS_MODEL}


def get_all_provider_info(synthesis_provider: str = "fireworks") -> dict:
    """Return provider info for every agent type.

    Returns a dict keyed by agent name (``planner``, ``researcher``,
    ``synthesizer``, ``critic``), each mapped to a
    ``{"provider": str, "model": str}`` dict.
    """
    return {name: get_provider_info(name, synthesis_provider) for name in _AGENT_NAMES}

# ---------------------------------------------------------------------------
# Startup diagnostics
# ---------------------------------------------------------------------------
_cfg_logger = logging.getLogger(__name__)
_cfg_logger.info("=== Deep Dive Config Loaded ===")
_cfg_logger.info("  FIREWORKS_MODEL   = %s", FIREWORKS_MODEL)
_cfg_logger.info("  FIREWORKS_BASE_URL= %s", FIREWORKS_BASE_URL)
_cfg_logger.info("  FIREWORKS_API_KEY = %s", FIREWORKS_API_KEY[:8] + '...' if len(FIREWORKS_API_KEY) > 8 else '(EMPTY!)')
_cfg_logger.info("  TAVILY_API_KEY    = %s", TAVILY_API_KEY[:8] + '...' if len(TAVILY_API_KEY) > 8 else '(EMPTY!)')
_cfg_logger.info("  SYNTH_PROVIDER    = %s", SYNTHESIS_MODEL_PROVIDER)
