import os
import logging
import subprocess
from pathlib import Path
from typing import List
from src.config import Config

logger = logging.getLogger(__name__)

def concatenate_audio_files(audio_files: List[Path], output_path: Path) -> Path:
    """Concatenate multiple scene audio files into a single master voiceover track."""
    if not audio_files:
        raise ValueError("No audio files provided for concatenation.")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Fast direct binary stream concatenation for standard EdgeTTS MP3 frames
    with open(output_path, "wb") as outfile:
        for audio_file in audio_files:
            p = Path(audio_file)
            if p.exists():
                outfile.write(p.read_bytes())

    logger.info(f"Successfully concatenated master narration audio: {output_path} ({output_path.stat().st_size} bytes)")
    return output_path
