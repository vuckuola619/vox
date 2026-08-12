import json
import logging
import re
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

def format_timestamp_srt(seconds: float) -> str:
    """Format seconds into SRT timestamp format: HH:MM:SS,mmm"""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds % 1) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d},{millis:03d}"

def format_timestamp_vtt(seconds: float) -> str:
    """Format seconds into WebVTT timestamp format: HH:MM:SS.mmm"""
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int(round((seconds % 1) * 1000))
    return f"{hrs:02d}:{mins:02d}:{secs:02d}.{millis:03d}"

class MetadataExporter:
    """Exports publishing metadata, captions, and SRT/VTT subtitle files for video platforms."""

    @staticmethod
    def generate_subtitles(manifest_data: Dict[str, Any], output_dir: Path) -> Dict[str, Path]:
        """Generate .srt and .vtt subtitle files from manifest scenes and wordTimestamps."""
        output_dir.mkdir(parents=True, exist_ok=True)
        srt_path = output_dir / "subtitles.srt"
        vtt_path = output_dir / "subtitles.vtt"

        scenes = manifest_data.get("scenes", [])
        srt_cues = []
        vtt_cues = ["WEBVTT\n"]

        cue_idx = 1
        for scene in scenes:
            word_timestamps = scene.get("wordTimestamps", [])
            if word_timestamps:
                # Group words into chunks of max 5 words for comfortable reading
                chunk_size = 5
                for i in range(0, len(word_timestamps), chunk_size):
                    chunk = word_timestamps[i:i + chunk_size]
                    if not chunk:
                        continue
                    start_t = chunk[0]["startTime"]
                    end_t = chunk[-1]["endTime"]
                    text_content = " ".join([w["word"] for w in chunk])

                    srt_cues.append(
                        f"{cue_idx}\n"
                        f"{format_timestamp_srt(start_t)} --> {format_timestamp_srt(end_t)}\n"
                        f"{text_content}\n"
                    )

                    vtt_cues.append(
                        f"{format_timestamp_vtt(start_t)} --> {format_timestamp_vtt(end_t)}\n"
                        f"{text_content}\n"
                    )
                    cue_idx += 1
            else:
                # Fallback to scene start/end time
                start_t = scene.get("startTime", 0.0)
                end_t = scene.get("endTime", 5.0)
                text_content = scene.get("narrationText", "")

                srt_cues.append(
                    f"{cue_idx}\n"
                    f"{format_timestamp_srt(start_t)} --> {format_timestamp_srt(end_t)}\n"
                    f"{text_content}\n"
                )
                vtt_cues.append(
                    f"{format_timestamp_vtt(start_t)} --> {format_timestamp_vtt(end_t)}\n"
                    f"{text_content}\n"
                )
                cue_idx += 1

        srt_path.write_text("\n".join(srt_cues), encoding="utf-8")
        vtt_path.write_text("\n".join(vtt_cues), encoding="utf-8")

        logger.info(f"Generated SRT subtitles: {srt_path}")
        logger.info(f"Generated WebVTT subtitles: {vtt_path}")

        return {"srt": srt_path, "vtt": vtt_path}

    @staticmethod
    def generate_publishing_metadata(topic: str, manifest_data: Dict[str, Any], output_dir: Path) -> Dict[str, Any]:
        """Generate high-CTR title variations, SEO descriptions, timestamps, tags, and thumbnail prompt."""
        output_dir.mkdir(parents=True, exist_ok=True)
        clean_topic = topic.strip().title()
        upper_topic = clean_topic.upper()

        scenes = manifest_data.get("scenes", [])
        timestamps_list = []
        for scene in scenes:
            s_time = scene.get("startTime", 0.0)
            heading = scene.get("kineticHeading", f"Scene {scene.get('sceneIndex', 1)}")
            mins = int(s_time // 60)
            secs = int(s_time % 60)
            timestamps_list.append(f"{mins:02d}:{secs:02d} - {heading}")

        titles = [
            f"The Hidden Truth About {clean_topic}",
            f"How {clean_topic} Secretly Controls the World",
            f"The Untold History of {clean_topic}",
            f"Why {clean_topic} Is More Dangerous Than You Think"
        ]

        tags = [
            clean_topic.lower(),
            "vox style",
            "documentary",
            "explainer",
            "history",
            "technology",
            "geopolitics",
            "faceless video"
        ]

        description = (
            f"An in-depth Vox-style documentary investigation into {clean_topic}.\n\n"
            "CHAPTER TIMESTAMPS:\n"
            + "\n".join(timestamps_list) + "\n\n"
            "#documentary #explainer #history #" + clean_topic.replace(" ", "")
        )

        thumbnail_prompt = (
            f"High-contrast Vox-style documentary paper collage thumbnail. "
            f"A black and white halftone photograph cutout of {clean_topic} with scissor-cut edges, "
            f"bold hot red accent stroke (#B92220), giant stat number in mustard yellow (#BE8F2C), "
            f"aged newsprint background with rubber stamps reading CONFIDENTIAL."
        )

        metadata = {
            "topic": clean_topic,
            "title_variations": titles,
            "recommended_title": titles[0],
            "description": description,
            "tags": tags,
            "thumbnail_prompt": thumbnail_prompt,
            "total_duration_seconds": manifest_data.get("totalDurationSeconds", 0.0)
        }

        json_path = output_dir / "metadata.json"
        json_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")

        thumb_path = output_dir / "thumbnail_prompt.txt"
        thumb_path.write_text(thumbnail_prompt, encoding="utf-8")

        logger.info(f"Generated publishing metadata: {json_path}")
        return metadata
