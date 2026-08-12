import json
import logging
import subprocess
from pathlib import Path
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
from src.config import Config
from src.voice_synthesizer import get_synthesizer, BaseTTSSynthesizer
from src.script_writer import VoxScriptWriter
from src.image_generator import Imagen3Generator
from src.audio_concatenator import concatenate_audio_files

logger = logging.getLogger(__name__)

@dataclass
class FrameBlueprint:
    frame_index: int
    narration_text: str
    kinetic_heading: str
    lower_third: str
    highlight_words: List[str]
    transition_style: str
    imagen3_prompt: str

@dataclass
class LevelBlueprint:
    level_number: int
    level_title: str
    level_summary: str
    frames: List[FrameBlueprint]

class LongFormVoxStudio:
    """Orchestrates 12-15 minute Vox explainers using a Level-by-Level Chapter & QA workflow."""

    def __init__(self, topic: str, total_target_minutes: int = 12, tts_provider: str = "edge-tts") -> None:
        self.topic = topic
        self.target_minutes = total_target_minutes
        self.synthesizer: BaseTTSSynthesizer = get_synthesizer(tts_provider)
        self.image_gen = Imagen3Generator()
        self.levels_dir = Config.BASE_DIR / "out" / "levels"
        self.levels_dir.mkdir(parents=True, exist_ok=True)
        self.script_writer = VoxScriptWriter()

    def generate_level_blueprints(self) -> List[LevelBlueprint]:
        """Generate structured 6-Level Script & Frame Breakdown for 12-15 minute documentary."""
        levels_raw = self.script_writer.generate_longform_levels(self.topic)
        blueprints: List[LevelBlueprint] = []

        for l_raw in levels_raw:
            frames = [FrameBlueprint(**f) for f in l_raw["frames"]]
            blueprints.append(LevelBlueprint(
                level_number=l_raw["level_number"],
                level_title=l_raw["level_title"],
                level_summary=l_raw["level_summary"],
                frames=frames
            ))

        return blueprints

    def process_level(self, level_bp: LevelBlueprint) -> Dict[str, Any]:
        """Synthesize TTS audio, VTT subtitles, Imagen 3 images, and manifest for one Level."""
        logger.info(f"--- Processing {level_bp.level_title} ---")
        level_num = level_bp.level_number

        level_audio_paths: List[Path] = []
        scene_manifest_list: List[Dict[str, Any]] = []
        time_offset = 0.0
        num_frames = len(level_bp.frames)

        for f_idx, frame in enumerate(level_bp.frames, 1):
            audio_name = f"level_{level_num}_frame_{f_idx}_audio.mp3"
            img_name = f"level_{level_num}_frame_{f_idx}_image.png"

            # 1. Voice & VTT Subtitle Sync
            synth_res = self.synthesizer.synthesize(frame.narration_text, audio_name)
            level_audio_paths.append(Path(synth_res.audio_path))

            # 2. Imagen 3 Image Asset
            img_path = self.image_gen.generate_image(frame.imagen3_prompt, img_name)

            word_timestamps = [
                {
                    "word": wt.word,
                    "startTime": round(time_offset + wt.start_time, 3),
                    "endTime": round(time_offset + wt.end_time, 3)
                }
                for wt in synth_res.word_timestamps
            ]

            # Add 1.2s trailing silence padding to final frame of level to prevent voice cutoff
            frame_duration = synth_res.duration_seconds
            if f_idx == num_frames:
                frame_duration = round(frame_duration + 1.2, 3)

            scene_manifest_list.append({
                "sceneIndex": f_idx,
                "narrationText": frame.narration_text,
                "kineticHeading": frame.kinetic_heading,
                "lowerThird": frame.lower_third,
                "highlightWords": frame.highlight_words,
                "transitionStyle": frame.transition_style,
                "audioPath": f"assets/audio/{audio_name}",
                "imagePath": f"assets/images/{img_name}",
                "startTime": round(time_offset, 3),
                "endTime": round(time_offset + frame_duration, 3),
                "duration": frame_duration,
                "wordTimestamps": word_timestamps
            })
            time_offset += frame_duration

        # Master Level Audio Track
        master_level_audio = Config.AUDIO_DIR / f"level_{level_num}_master.mp3"
        concatenate_audio_files(level_audio_paths, master_level_audio)

        total_sec = round(time_offset, 3)
        total_frames = int(total_sec * Config.FPS) + 36 # Add 36 frames extra buffer for total video safety

        manifest_data = {
            "title": f"{self.topic} - {level_bp.level_title}",
            "topic": self.topic,
            "totalDurationSeconds": total_sec,
            "totalFrames": total_frames,
            "fps": Config.FPS,
            "width": Config.WIDTH,
            "height": Config.HEIGHT,
            "masterAudioPath": f"assets/audio/level_{level_num}_master.mp3",
            "scenes": scene_manifest_list
        }

        level_manifest_path = self.levels_dir / f"level_{level_num}_manifest.json"
        level_manifest_path.write_text(json.dumps(manifest_data, indent=2), encoding="utf-8")

        return {
            "level_number": level_num,
            "title": level_bp.level_title,
            "manifest_path": str(level_manifest_path),
            "duration_seconds": total_sec
        }

    def run_level(self, level_number: int) -> Dict[str, Any]:
        """Process a specific single level for fast preview and iteration."""
        blueprints = self.generate_level_blueprints()
        target_bp = next((bp for bp in blueprints if bp.level_number == level_number), None)
        if not target_bp:
            raise ValueError(f"Level number {level_number} not found. Must be between 1 and {len(blueprints)}.")
        return self.process_level(target_bp)

    def run_all_levels(self) -> List[Dict[str, Any]]:
        """Process all 6 levels in sequence."""
        blueprints = self.generate_level_blueprints()
        results = []
        for bp in blueprints:
            res = self.process_level(bp)
            results.append(res)
        return results
