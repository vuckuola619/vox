import re
import json
import hashlib
from pathlib import Path
from typing import Dict, Any, Optional
from src.config import Config

class PromptCompressor:
    """RTK-inspired token compression utility for LLM prompt optimization."""

    @staticmethod
    def compress_prompt(text: str) -> str:
        """Strip filler phrases, normalize whitespace, and compress prompt token footprint."""
        if not text:
            return ""

        # Remove redundant phrase patterns
        fillers = [
            r"\bplease make sure to\b",
            r"\bit is important to note that\b",
            r"\bin order to\b",
            r"\bas a matter of fact\b",
            r"\bfor the purpose of\b",
            r"\bwith reference to\b"
        ]

        compressed = text
        for filler in fillers:
            compressed = re.sub(filler, "", compressed, flags=re.IGNORECASE)

        # Collapse whitespace & repeated newlines
        compressed = re.sub(r"\s+", " ", compressed).strip()
        return compressed

    @staticmethod
    def extract_keywords(text: str, max_words: int = 10) -> str:
        """Extract core subject keywords from narrative text."""
        words = re.findall(r"\b[A-Za-z0-9_-]{4,}\b", text)
        stopwords = {"this", "that", "with", "from", "have", "were", "been", "their", "there", "about", "which", "would"}
        filtered = [w for w in words if w.lower() not in stopwords]
        unique_words = list(dict.fromkeys(filtered))
        return " ".join(unique_words[:max_words])

class ContextCacheManager:
    """Manages local JSON context cache to prevent duplicate LLM calls."""

    def __init__(self, cache_dir: Optional[Path] = None):
        self.cache_dir = cache_dir or (Config.BASE_DIR / ".cache")
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _get_key(self, topic: str, mode: str) -> str:
        hash_input = f"{topic.strip().lower()}:{mode}"
        return hashlib.md5(hash_input.encode("utf-8")).hexdigest()

    def get_cached_script(self, topic: str, mode: str = "short") -> Optional[Dict[str, Any]]:
        """Retrieve cached script blueprint if available."""
        key = self._get_key(topic, mode)
        cache_file = self.cache_dir / f"script_{key}.json"
        if cache_file.exists():
            try:
                with open(cache_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return None
        return None

    def save_script(self, topic: str, mode: str, data: Dict[str, Any]) -> None:
        """Save script blueprint to local cache."""
        key = self._get_key(topic, mode)
        cache_file = self.cache_dir / f"script_{key}.json"
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
