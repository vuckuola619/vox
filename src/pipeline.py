import json
import logging
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, List, Optional
from src.config import Config
from src.script_writer import VoxScriptWriter, VoxScriptBlueprint
from src.voice_synthesizer import get_synthesizer, BaseTTSSynthesizer
from src.image_generator import Imagen3Generator
from src.audio_concatenator import concatenate_audio_files

from src.pakem_verifier import PakemVerifier

logger = logging.getLogger(__name__)

class VoxVideoPipeline:
    """Orchestrates end-to-end Vox video creation from topic script to rendered Remotion video."""

    def __init__(
        self,
        tts_provider: str = "edge-tts",
        elevenlabs_api_key: Optional[str] = None,
        voice_id: Optional[str] = None
    ) -> None:
        self.script_writer = VoxScriptWriter()
        self.synthesizer: BaseTTSSynthesizer = get_synthesizer(tts_provider, api_key=elevenlabs_api_key, voice_id=voice_id)
        self.image_gen = Imagen3Generator()

    def create_video(
        self,
        topic: str,
        duration_seconds: int = 45,
        render: bool = False,
        output_filename: str = "vox_video.mp4"
    ) -> Dict[str, Any]:
        """
        Run complete generation workflow: Script -> Voice -> Images -> Remotion Manifest -> Render (optional).
        """
        Config.ensure_directories()
        logger.info(f"Starting AG-VOX video pipeline for topic: '{topic}'")

        # 1. Generate Script Blueprint
        blueprint: VoxScriptBlueprint = self.script_writer.generate_script(topic, duration_seconds)
        logger.info(f"Generated script blueprint with {len(blueprint.scenes)} scenes.")

        # 2. Process Scenes: Synthesize Voice & Generate Imagen 3 Images
        remotion_scenes: List[Dict[str, Any]] = []
        generated_audio_paths: List[Path] = []
        current_time_offset: float = 0.0

        for idx, scene in enumerate(blueprint.scenes, 1):
            audio_filename = f"scene_{idx}_audio.mp3"
            image_filename = f"scene_{idx}_image.png"

            # Voiceover TTS + word alignments
            synth_res = self.synthesizer.synthesize(scene.narration_text, output_filename=audio_filename)
            generated_audio_paths.append(Path(synth_res.audio_path))

            # Imagen 3 Visual Asset Generation
            image_path = self.image_gen.generate_image(scene.imagen_prompt, output_filename=image_filename)

            # Convert to relative path for Remotion staticFile()
            rel_audio_path = f"assets/audio/{audio_filename}"
            rel_image_path = f"assets/images/{image_filename}"

            # Adjust word timestamps by cumulative scene time offset
            scene_word_timestamps = [
                {
                    "word": wt.word,
                    "startTime": round(current_time_offset + wt.start_time, 3),
                    "endTime": round(current_time_offset + wt.end_time, 3)
                }
                for wt in synth_res.word_timestamps
            ]

            scene_duration = synth_res.duration_seconds
            scene_data = {
                "sceneIndex": scene.scene_index,
                "narrationText": scene.narration_text,
                "kineticHeading": scene.kinetic_heading,
                "lowerThird": scene.lower_third,
                "highlightWords": scene.highlight_words,
                "transitionStyle": scene.transition_style,
                "audioPath": rel_audio_path,
                "imagePath": rel_image_path,
                "startTime": round(current_time_offset, 3),
                "endTime": round(current_time_offset + scene_duration, 3),
                "duration": round(scene_duration, 3),
                "wordTimestamps": scene_word_timestamps
            }

            remotion_scenes.append(scene_data)
            current_time_offset += scene_duration

        # Concatenate into master voiceover narration track
        master_audio_path = Config.AUDIO_DIR / "narration_master.mp3"
        concatenate_audio_files(generated_audio_paths, master_audio_path)
        rel_master_audio_path = "assets/audio/narration_master.mp3"

        total_duration_seconds = round(current_time_offset, 3)
        total_frames = int(total_duration_seconds * Config.FPS)

        # 3. Create Remotion Scene Manifest
        manifest_data = {
            "title": blueprint.title,
            "topic": blueprint.topic,
            "totalDurationSeconds": total_duration_seconds,
            "totalFrames": total_frames,
            "fps": Config.FPS,
            "width": Config.WIDTH,
            "height": Config.HEIGHT,
            "masterAudioPath": rel_master_audio_path,
            "scenes": remotion_scenes
        }

        # Validate manifest against VOX-PAKEM guardrails
        PakemVerifier.verify_scene_manifest(manifest_data)

        manifest_path = Config.PUBLIC_DIR / "scene_manifest.json"
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2)

        logger.info(f"Saved Remotion scene manifest to {manifest_path}")

        # 4. Optional Remotion Render Call
        rendered_output_path = None
        if render:
            composition_id = "VoxShorts" if duration_seconds <= 60 and "shorts" in output_filename.lower() else "VoxVideo"
            rendered_output_path = self.render_with_remotion(manifest_path, output_filename, composition_id=composition_id)
            if rendered_output_path:
                PakemVerifier.verify_rendered_mp4(Path(rendered_output_path))

        return {
            "manifest_path": str(manifest_path),
            "manifest_data": manifest_data,
            "output_video_path": rendered_output_path
        }

    def render_with_remotion(self, manifest_path: Path, output_filename: str, composition_id: str = "VoxVideo") -> str:
        """Invoke Remotion CLI to render video from the generated scene manifest."""
        output_video_path = Config.OUTPUT_DIR / output_filename
        logger.info(f"Rendering video with Remotion ({composition_id}) to {output_video_path}...")

        cmd = [
            "npx", "remotion", "render",
            "remotion/src/index.ts",
            composition_id,
            str(output_video_path),
            f"--props={manifest_path}"
        ]

        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True, shell=True)
            logger.info(f"Remotion render ({composition_id}) completed successfully.")
            return str(output_video_path)
        except subprocess.CalledProcessError as err:
            logger.error(f"Remotion render failed: {err.stderr}")
            raise RuntimeError(f"Remotion render error: {err.stderr}")
