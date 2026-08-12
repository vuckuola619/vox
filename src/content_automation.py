import json
import logging
import re
from pathlib import Path
from typing import Dict, Any, List, Optional
from src.config import Config
from src.pipeline import VoxVideoPipeline
from src.longform_orchestrator import LongFormVoxStudio
from src.metadata_exporter import MetadataExporter
from src.security_validator import SecurityValidator

logger = logging.getLogger(__name__)

def slugify(text: str) -> str:
    """Convert text to URL/filesystem friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[-\s]+", "_", text)

class FacelessContentAutomation:
    """Engine for end-to-end automated faceless video content creation and publishing package generation."""

    def __init__(self, tts_provider: str = "edge-tts") -> None:
        self.tts_provider = tts_provider

    def process_topic(
        self,
        topic: str,
        mode: str = "short",
        duration_seconds: int = 45,
        render: bool = True,
        export_metadata: bool = True
    ) -> Dict[str, Any]:
        """Process a single topic into a complete faceless video publishing package."""
        topic_slug = slugify(topic)
        package_dir = Config.OUTPUT_DIR / topic_slug
        package_dir.mkdir(parents=True, exist_ok=True)

        logger.info(f"=== Starting Faceless Video Automation for Topic: '{topic}' [{mode.upper()}] ===")

        manifest_data = {}
        rendered_mp4_path = None

        if mode == "longform":
            studio = LongFormVoxStudio(topic=topic, tts_provider=self.tts_provider)
            level_results = studio.run_all_levels()
            
            # Combine level 1 manifest as sample or combine level manifests
            level1_manifest = studio.levels_dir / "level_1_manifest.json"
            if level1_manifest.exists():
                manifest_data = json.loads(level1_manifest.read_text(encoding="utf-8"))
        else:
            pipeline = VoxVideoPipeline(tts_provider=self.tts_provider)
            output_filename = f"{topic_slug}.mp4"
            pipeline_result = pipeline.create_video(
                topic=topic,
                duration_seconds=duration_seconds,
                render=render,
                output_filename=output_filename
            )
            manifest_data = pipeline_result.get("manifest_data", {})
            rendered_mp4_path = pipeline_result.get("output_video_path")

            if rendered_mp4_path and Path(rendered_mp4_path).exists():
                # Copy/move rendered video into topic package directory
                dest_mp4 = package_dir / "master_video.mp4"
                dest_mp4.write_bytes(Path(rendered_mp4_path).read_bytes())
                rendered_mp4_path = str(dest_mp4)

        subtitle_paths = {}
        metadata_res = {}
        if export_metadata and manifest_data:
            manifest_data = SecurityValidator.sanitize_manifest(manifest_data)
            subtitle_paths = MetadataExporter.generate_subtitles(manifest_data, package_dir)
            metadata_res = MetadataExporter.generate_publishing_metadata(topic, manifest_data, package_dir)

        leaks = SecurityValidator.audit_output_dir(package_dir)
        if leaks:
            logger.warning(f"Security Audit Warning: Potential leaks detected: {leaks}")

        package_info = {
            "topic": topic,
            "topic_slug": topic_slug,
            "package_dir": str(package_dir),
            "rendered_video": rendered_mp4_path,
            "subtitles": {k: str(v) for k, v in subtitle_paths.items()},
            "metadata": metadata_res,
            "security_leaks": leaks
        }

        summary_file = package_dir / "package_summary.json"
        summary_file.write_text(json.dumps(package_info, indent=2), encoding="utf-8")

        logger.info(f"=== Completed Faceless Video Automation Package: {package_dir} ===")
        return package_info

    def process_batch(self, batch_file_path: Path, render: bool = True) -> List[Dict[str, Any]]:
        """Process a batch of topics defined in a JSON file."""
        if not batch_file_path.exists():
            raise FileNotFoundError(f"Batch topic file not found: {batch_file_path}")

        data = json.loads(batch_file_path.read_text(encoding="utf-8"))
        topics = data.get("topics", [])
        if not topics:
            logger.warning(f"No topics found in batch file: {batch_file_path}")
            return []

        results = []
        for item in topics:
            if isinstance(item, str):
                topic_name = item
                mode = "short"
                duration = 45
            else:
                topic_name = item.get("topic", "Untitled Topic")
                mode = item.get("mode", "short")
                duration = item.get("duration", 45)

            res = self.process_topic(
                topic=topic_name,
                mode=mode,
                duration_seconds=duration,
                render=render,
                export_metadata=True
            )
            results.append(res)

        return results
