import pytest
from pathlib import Path
from src.security_validator import SecurityValidator

def test_security_validator_environment():
    res = SecurityValidator.validate_environment()
    assert "valid" in res
    assert "issues" in res
    assert "warnings" in res

def test_security_validator_sanitize():
    test_manifest = {
        "title": "Quantum Computing",
        "api_key": "sk-1234567890123456789012345678901234"
    }
    sanitized = SecurityValidator.sanitize_manifest(test_manifest)
    assert sanitized["api_key"] == "[REDACTED_SECRET]"
    assert sanitized["title"] == "Quantum Computing"
