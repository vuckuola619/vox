import pytest
from pathlib import Path
from src.sound_designer import SoundDesigner

def test_sound_designer_fallback(tmp_path):
    designer = SoundDesigner()
    voiceover = tmp_path / "test_voice.mp3"
    voiceover.write_bytes(b"mock audio content")
    output = tmp_path / "mixed_output.mp3"

    res = designer.mix_master_audio(voiceover, output)
    assert res.exists()
    assert res.read_bytes() == b"mock audio content"
