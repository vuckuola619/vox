import pytest
from pathlib import Path
from src.voice_synthesizer import get_synthesizer, ElevenLabsSynthesizer, EdgeTTSSynthesizer, VoiceboxTTSSynthesizer

def test_vtt_timestamp_parsing(tmp_path):
    vtt_content = """WEBVTT

00:00:00.200 --> 00:00:01.400
Hello World

00:00:01.500 --> 00:00:02.800
Testing Subtitle Sync
"""
    vtt_file = tmp_path / "test.vtt"
    vtt_file.write_text(vtt_content, encoding="utf-8")

    synth = EdgeTTSSynthesizer()
    words, duration = synth._parse_vtt_timestamps(vtt_file, "Hello World Testing Subtitle Sync")

    assert len(words) == 5
    assert words[0].word == "Hello"
    assert words[0].start_time == 0.2
    assert words[1].word == "World"
    assert words[1].end_time == 1.4
    assert duration >= 2.8

def test_fallback_synthesizer():
    synth = get_synthesizer("edge-tts")
    result = synth.synthesize("This is a test narration for video.", output_filename="test_audio.mp3")

    assert result.audio_path != ""
    assert result.duration_seconds > 0
    assert len(result.word_timestamps) == 7
    assert result.word_timestamps[0].word == "This"

def test_factory_synthesizers():
    e_synth = get_synthesizer("edge-tts")
    v_synth = get_synthesizer("voicebox")
    el_synth = get_synthesizer("elevenlabs")

    assert isinstance(e_synth, EdgeTTSSynthesizer)
    assert isinstance(v_synth, VoiceboxTTSSynthesizer)
    assert isinstance(el_synth, ElevenLabsSynthesizer)
