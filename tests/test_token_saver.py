import pytest
from pathlib import Path
from src.token_saver import PromptCompressor, ContextCacheManager

def test_prompt_compressor():
    raw_prompt = "Please make sure to synthesize a high quality documentary video in order to show the history."
    compressed = PromptCompressor.compress_prompt(raw_prompt)
    assert "please make sure to" not in compressed.lower()
    assert "in order to" not in compressed.lower()
    assert "high quality documentary video" in compressed

def test_extract_keywords():
    text = "Semiconductor microchip fabrication cleanrooms produce global computer hardware."
    keywords = PromptCompressor.extract_keywords(text, max_words=3)
    assert len(keywords.split()) == 3
    assert "Semiconductor" in keywords

def test_context_cache_manager(tmp_path):
    cache_mgr = ContextCacheManager(cache_dir=tmp_path)
    topic = "Quantum Computing"
    mode = "short"
    data = {"title": "Quantum Revolution", "topic": topic, "scenes": []}

    # Should be None initially
    assert cache_mgr.get_cached_script(topic, mode) is None

    # Save and retrieve
    cache_mgr.save_script(topic, mode, data)
    retrieved = cache_mgr.get_cached_script(topic, mode)
    assert retrieved is not None
    assert retrieved["title"] == "Quantum Revolution"
