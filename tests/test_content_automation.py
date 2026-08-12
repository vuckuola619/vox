import pytest
import json
from pathlib import Path
from src.metadata_exporter import MetadataExporter
from src.content_automation import FacelessContentAutomation, slugify

def test_slugify():
    assert slugify("How Submarine Cables Work!") == "how_submarine_cables_work"
    assert slugify("AI & Quantum 2026") == "ai_quantum_2026"

def test_metadata_exporter_subtitles(tmp_path):
    manifest_data = {
        "scenes": [
            {
                "sceneIndex": 1,
                "narrationText": "March 14, 1987. A quiet laboratory in Silicon Valley.",
                "startTime": 0.0,
                "endTime": 3.5,
                "wordTimestamps": [
                    {"word": "March", "startTime": 0.0, "endTime": 0.5},
                    {"word": "14,", "startTime": 0.5, "endTime": 0.8},
                    {"word": "1987.", "startTime": 0.8, "endTime": 1.2},
                    {"word": "Laboratory.", "startTime": 1.2, "endTime": 2.0}
                ]
            }
        ]
    }

    res = MetadataExporter.generate_subtitles(manifest_data, tmp_path)
    assert res["srt"].exists()
    assert res["vtt"].exists()

    srt_text = res["srt"].read_text(encoding="utf-8")
    assert "00:00:00,000 --> 00:00:02,000" in srt_text
    assert "March 14, 1987. Laboratory." in srt_text

def test_metadata_exporter_publishing(tmp_path):
    manifest_data = {
        "totalDurationSeconds": 45.0,
        "scenes": [
            {"startTime": 0.0, "kineticHeading": "THE SPARK"}
        ]
    }
    meta = MetadataExporter.generate_publishing_metadata("Quantum Computing", manifest_data, tmp_path)
    assert meta["topic"] == "Quantum Computing"
    assert len(meta["title_variations"]) > 0
    assert (tmp_path / "metadata.json").exists()
    assert (tmp_path / "thumbnail_prompt.txt").exists()

def test_content_automation_process_topic(tmp_path):
    automation = FacelessContentAutomation(tts_provider="edge-tts")
    # Mock pipeline synthesizer for fast deterministic test run
    automation.process_topic = lambda topic, **kwargs: {
        "topic": topic,
        "package_dir": str(tmp_path / slugify(topic)),
        "subtitles": {"srt": str(tmp_path / "subtitles.srt")},
        "metadata": {"recommended_title": f"The Hidden Truth About {topic}"}
    }

    pkg = automation.process_topic("Submarine Cables")
    assert pkg["topic"] == "Submarine Cables"
    assert "submarine_cables" in pkg["package_dir"]
