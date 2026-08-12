import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

SECRET_PATTERNS = [
    re.compile(r"sk-[a-zA-Z0-9]{32,}", re.IGNORECASE),
    re.compile(r"AIzaSy[a-zA-Z0-9_-]{33}", re.IGNORECASE),
]

class SecurityValidator:
    """Security audit utility for validating credential hygiene, inputs, and exported manifests."""

    @staticmethod
    def validate_environment() -> Dict[str, Any]:
        """Validate environment variables and check for secure configuration."""
        issues = []
        warnings = []

        env_file = Path(".env")
        if not env_file.exists():
            warnings.append(".env file not found in workspace root. Falling back to system environment variables.")

        # Check for potential exposed keys in git tracking
        git_ignore = Path(".gitignore")
        if git_ignore.exists():
            content = git_ignore.read_text(encoding="utf-8")
            if ".env" not in content:
                issues.append("CRITICAL: '.env' is missing from .gitignore!")

        return {
            "valid": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }

    @staticmethod
    def sanitize_manifest(manifest_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure no sensitive tokens or paths leak into public scene manifests."""
        serialized = json.dumps(manifest_data)
        for pattern in SECRET_PATTERNS:
            serialized = pattern.sub("[REDACTED_SECRET]", serialized)
        return json.loads(serialized)

    @staticmethod
    def audit_output_dir(output_dir: Path) -> List[str]:
        """Scan generated JSON and manifest files in output directory for potential secret leaks."""
        leaks = []
        if not output_dir.exists():
            return leaks

        for file_path in output_dir.rglob("*.json"):
            try:
                content = file_path.read_text(encoding="utf-8")
                for pattern in SECRET_PATTERNS:
                    if pattern.search(content):
                        matches = pattern.findall(content)
                        for match in matches:
                            leaks.append(f"Potential secret leak in {file_path.name}: {match[:6]}...")
            except Exception as e:
                logger.warning(f"Error auditing {file_path}: {e}")

        return leaks
