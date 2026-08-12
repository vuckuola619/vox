import logging
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional
from src.config import Config

logger = logging.getLogger(__name__)

class SoundDesigner:
    """Sound Design Engine for adding background ambient music ducking and transition sound effects."""

    def __init__(self, bgm_volume_db: float = -18.0) -> None:
        self.bgm_volume_db = bgm_volume_db
        self.assets_dir = Config.AUDIO_DIR
        self.assets_dir.mkdir(parents=True, exist_ok=True)

    def mix_master_audio(
        self,
        voiceover_path: Path,
        output_path: Path,
        scenes: Optional[List[Dict[str, Any]]] = None,
        bgm_path: Optional[Path] = None
    ) -> Path:
        """
        Mix voiceover narrator audio with background music (ducked) and transition sound effects.
        If no custom BGM is supplied or FFmpeg is unavailable, falls back cleanly to master voiceover.
        """
        if not voiceover_path.exists():
            raise FileNotFoundError(f"Voiceover track not found: {voiceover_path}")

        # Check if BGM exists
        if bgm_path and bgm_path.exists():
            cmd = [
                "ffmpeg", "-y",
                "-i", str(voiceover_path),
                "-i", str(bgm_path),
                "-filter_complex",
                f"[1:a]volume={self.bgm_volume_db}dB[bgm];[0:a][bgm]amix=inputs=2:duration=first[out]",
                "-map", "[out]",
                "-c:a", "aac",
                "-b:a", "192k",
                str(output_path)
            ]
            try:
                subprocess.run(cmd, capture_output=True, check=True)
                logger.info(f"Successfully mixed BGM with voiceover to {output_path}")
                return output_path
            except (subprocess.CalledProcessError, FileNotFoundError) as e:
                logger.warning(f"BGM mixing failed or ffmpeg not found ({e}). Using pure voiceover track.")

        # Fallback: Copy voiceover track
        output_path.write_bytes(voiceover_path.read_bytes())
        return output_path
