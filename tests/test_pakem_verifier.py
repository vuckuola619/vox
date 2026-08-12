import pytest
from pathlib import Path
from src.pakem_verifier import PakemVerifier, PakemVerificationError

def test_pakem_verifier_valid_manifest(tmp_path):
    audio_file = tmp_path / "test.mp3"
    audio_file.write_bytes(b"dummy audio data")
    image_file = tmp_path / "test.png"
    image_file.write_bytes(b"dummy image data")

    manifest = {
        "scenes": [
            {
                "sceneIndex": 1,
                "audio_path": str(audio_file),
                "image_path": str(image_file),
                "vtt_cues": [
                    {"word": "Hello", "start": 0.0, "end": 0.5},
                    {"word": "World", "start": 0.51, "end": 1.0}
                ]
            }
        ]
    }

    warnings = PakemVerifier.verify_scene_manifest(manifest)
    assert isinstance(warnings, list)

def test_pakem_verifier_non_monotonic_throws(tmp_path):
    audio_file = tmp_path / "test.mp3"
    audio_file.write_bytes(b"dummy audio data")

    manifest = {
        "scenes": [
            {
                "sceneIndex": 1,
                "audio_path": str(audio_file),
                "vtt_cues": [
                    {"word": "Hello", "start": 1.0, "end": 1.5},
                    {"word": "World", "start": 0.5, "end": 2.0}  # Non-monotonic!
                ]
            }
        ]
    }

    with pytest.raises(PakemVerificationError, match="Non-monotonic"):
        PakemVerifier.verify_scene_manifest(manifest)

def test_pakem_verifier_missing_audio_throws(tmp_path):
    manifest = {
        "scenes": [
            {
                "sceneIndex": 1,
                "audio_path": str(tmp_path / "non_existent.mp3")
            }
        ]
    }

    with pytest.raises(PakemVerificationError, match="Audio file missing"):
        PakemVerifier.verify_scene_manifest(manifest)
