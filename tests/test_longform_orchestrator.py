import pytest
import json
from pathlib import Path
from unittest.mock import MagicMock, patch
from src.longform_orchestrator import LongFormVoxStudio

def test_longform_blueprints_generation():
    studio = LongFormVoxStudio(topic="Quantum Mechanics", tts_provider="edge-tts")
    blueprints = studio.generate_level_blueprints()

    assert len(blueprints) == 6
    assert blueprints[0].level_number == 1
    assert "QUANTUM MECHANICS" in blueprints[0].level_title
    assert len(blueprints[0].frames) > 0

def test_longform_single_level_processing(tmp_path):
    studio = LongFormVoxStudio(topic="Space Exploration", tts_provider="edge-tts")
    # Patch synthesizer to use fallback synthesizer directly for instant test execution
    studio.synthesizer.synthesize = lambda text, output_filename: studio.synthesizer._fallback_synthesize(text, studio.levels_dir / output_filename)

    res = studio.run_level(level_number=1)

    assert res["level_number"] == 1
    manifest_path = Path(res["manifest_path"])
    assert manifest_path.exists()

    data = json.loads(manifest_path.read_text(encoding="utf-8"))
    assert data["topic"] == "Space Exploration"
    assert len(data["scenes"]) > 0
