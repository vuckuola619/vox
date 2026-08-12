import json
from pathlib import Path
import pytest
from src.pipeline import VoxVideoPipeline

def test_pipeline_dry_run():
    pipeline = VoxVideoPipeline(tts_provider="edge-tts")
    pipeline.synthesizer.synthesize = lambda text, output_filename: pipeline.synthesizer._fallback_synthesize(text, Path("public/assets/audio") / output_filename)

    result = pipeline.create_video(topic="Black Holes", duration_seconds=15, render=False)

    manifest_path = Path(result["manifest_path"])
    assert manifest_path.exists()

    with open(manifest_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert data["topic"] == "Black Holes"
    assert len(data["scenes"]) > 0
    assert "wordTimestamps" in data["scenes"][0]
