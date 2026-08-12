import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from src.config import Config

logger = logging.getLogger(__name__)

class PakemVerificationError(Exception):
    """Raised when a video render manifest or asset set violates VOX-PAKEM guardrails."""
    pass

class PakemVerifier:
    """Pre-render & Post-synthesis verification hook enforcing VOX-PAKEM rules."""

    @staticmethod
    def verify_scene_manifest(manifest: Dict[str, Any]) -> List[str]:
        """Validate a scene manifest against VOX-PAKEM quality guardrails."""
        warnings: List[str] = []
        scenes = manifest.get("scenes", [])
        if not scenes:
            raise PakemVerificationError("Manifest contains no scenes!")

        seen_images = set()

        for idx, scene in enumerate(scenes, start=1):
            # Guardrail 1: TTS Audio file presence
            audio_path_str = scene.get("audio_path")
            if audio_path_str:
                audio_path = Path(audio_path_str)
                if not audio_path.exists() or audio_path.stat().st_size == 0:
                    raise PakemVerificationError(f"Scene {idx}: Audio file missing or 0 bytes: {audio_path}")

            # Guardrail 2: Visual Hero Layer asset uniqueness & existence
            image_path_str = scene.get("image_path")
            if image_path_str:
                image_path = Path(image_path_str)
                if not image_path.exists() or image_path.stat().st_size == 0:
                    raise PakemVerificationError(f"Scene {idx}: Hero image asset missing or 0 bytes: {image_path}")

                if image_path in seen_images:
                    warnings.append(f"Scene {idx}: Reusing image asset {image_path.name} (VOX-PAKEM prefers unique assets per frame).")
                seen_images.add(image_path)

            # Guardrail 3: Subtitle timestamp monotonicity
            vtt_cues = scene.get("vtt_cues", [])
            prev_end = 0.0
            for cue_idx, cue in enumerate(vtt_cues, start=1):
                start = cue.get("start", 0.0)
                end = cue.get("end", 0.0)
                if start < prev_end - 0.001:
                    raise PakemVerificationError(
                        f"Scene {idx}, Cue {cue_idx} ({cue.get('word')}): Non-monotonic start time ({start}s < prev {prev_end}s)"
                    )
                if end <= start:
                    raise PakemVerificationError(
                        f"Scene {idx}, Cue {cue_idx} ({cue.get('word')}): Invalid cue duration ({start}s -> {end}s)"
                    )
                prev_end = end

        logger.info(f"VOX-PAKEM verification passed for manifest with {len(scenes)} scenes! (Warnings: {len(warnings)})")
        return warnings

    @staticmethod
    def verify_rendered_mp4(mp4_path: Path) -> bool:
        """Verify rendered MP4 video file exists and is valid."""
        if not mp4_path.exists():
            raise PakemVerificationError(f"Rendered video missing at {mp4_path}")
        if mp4_path.stat().st_size < 10000:
            raise PakemVerificationError(f"Rendered video is corrupted or too small ({mp4_path.stat().st_size} bytes)")
        return True
