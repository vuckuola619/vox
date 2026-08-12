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
    list_file = output_path.parent / "concat_list.txt"

    with open(list_file, "w", encoding="utf-8") as f:
        for audio_file in audio_files:
            # Use forward slashes for FFmpeg concat list
            clean_name = audio_file.name
            f.write(f"file '{clean_name}'\n")

    cmd = [
        "npx", "remotion", "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_file),
        "-c", "copy",
        str(output_path)
    ]

    try:
        import sys
        use_shell = sys.platform == "win32"
        subprocess.run(cmd, check=True, capture_output=True, text=True, shell=use_shell)
        logger.info(f"Successfully concatenated master narration audio: {output_path}")
        return output_path
    except Exception as err:
        logger.error(f"FFmpeg audio concatenation failed: {err}")
        # Fallback: simple binary concatenation if copy fails
        with open(output_path, "wb") as outfile:
            for audio_file in audio_files:
                if audio_file.exists():
                    outfile.write(audio_file.read_bytes())
        return output_path
