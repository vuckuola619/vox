import argparse
import logging
import sys
from pathlib import Path
from src.config import Config
from src.pipeline import VoxVideoPipeline
from src.longform_orchestrator import LongFormVoxStudio
from src.content_automation import FacelessContentAutomation

def setup_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)]
    )

def main() -> None:
    setup_logging()
    parser = argparse.ArgumentParser(description="AG-VOX: Faceless Video Content Automation Engine")
    parser.add_argument("--topic", type=str, default="How Microchips Are Made", help="Video documentary topic")
    parser.add_argument("--mode", type=str, choices=["short", "longform"], default="short", help="Video mode: short (1-2 mins) or longform (12-15 mins)")
    parser.add_argument("--format", type=str, choices=["16x9", "9x16", "hybrid"], default="16x9", help="Video aspect ratio format: 16x9 (VoxVideo), 9x16 (VoxShorts), or hybrid (both)")
    parser.add_argument("--duration", type=int, default=45, help="Target duration in seconds (for short mode)")
    parser.add_argument("--tts-provider", type=str, choices=["edge-tts", "voicebox", "elevenlabs"], default="edge-tts", help="TTS Engine Provider")
    parser.add_argument("--voice-id", type=str, default=None, help="Voice ID if using ElevenLabs")
    parser.add_argument("--level", type=int, default=None, help="Specific level to generate/preview (1-6) for longform mode")
    parser.add_argument("--render", action="store_true", help="Invoke Remotion CLI to render final MP4 video")
    parser.add_argument("--batch", type=str, default=None, help="Path to JSON file containing a list of topics to process in batch")
    parser.add_argument("--export-metadata", action="store_true", help="Export publishing metadata, captions, and SRT/VTT subtitle files")
    parser.add_argument("--output", type=str, default="vox_video.mp4", help="Output MP4 filename")

    args = parser.parse_args()

    automation = FacelessContentAutomation(tts_provider=args.tts_provider)

    if args.batch:
        batch_path = Path(args.batch)
        print(f"\n============================================================")
        print(f"AG-VOX Faceless Content Automation Batch Execution")
        print(f"Batch File: {batch_path}")
        print(f"TTS Provider: {args.tts_provider.upper()}")
        print(f"============================================================\n")

        results = automation.process_batch(batch_path, render=args.render)
        print(f"\nCompleted batch automation for {len(results)} topics!")
        for res in results:
            print(f" -> Package: {res['package_dir']}")
        print("============================================================\n")

    elif args.export_metadata:
        package = automation.process_topic(
            topic=args.topic,
            mode=args.mode,
            duration_seconds=args.duration,
            render=args.render,
            export_metadata=True
        )

        print("\n" + "="*60)
        print("AG-VOX Content Automation Package Created!")
        print(f"Topic: {args.topic}")
        print(f"Package Directory: {package['package_dir']}")
        if package.get("subtitles"):
            print(f"SRT Subtitles: {package['subtitles'].get('srt')}")
            print(f"VTT Subtitles: {package['subtitles'].get('vtt')}")
        if package.get("metadata"):
            print(f"Recommended Title: {package['metadata'].get('recommended_title')}")
        print("="*60 + "\n")

    elif args.mode == "longform":
        studio = LongFormVoxStudio(topic=args.topic, tts_provider=args.tts_provider)
        print(f"\n============================================================")
        print(f"AG-VOX Long-Form Vox Studio: {args.topic}")
        print(f"TTS Provider: {args.tts_provider.upper()}")
        print(f"============================================================\n")

        if args.level is not None:
            res = studio.run_level(args.level)
            print(f"Level {res['level_number']} Manifest Generated: {res['manifest_path']}")
            print(f"Level Duration: {res['duration_seconds']}s")
        else:
            results = studio.run_all_levels()
            for r in results:
                print(f"Level {r['level_number']} ({r['title']}) Manifest: {r['manifest_path']}")
        print("\nLongform generation step completed successfully!\n")

    else:
        pipeline = VoxVideoPipeline(tts_provider=args.tts_provider, voice_id=args.voice_id)
        result = pipeline.create_video(
            topic=args.topic,
            duration_seconds=args.duration,
            render=args.render,
            output_filename=args.output
        )

        print("\n" + "="*60)
        print("AG-VOX Video Generation Pipeline Complete!")
        print(f"Topic: {args.topic}")
        print(f"TTS Provider: {args.tts_provider.upper()}")
        print(f"Scene Manifest JSON: {result['manifest_path']}")
        if result.get("output_video_path"):
            print(f"Rendered MP4 Output: {result['output_video_path']}")
        else:
            print("Render skipped. Run with --render flag or 'npm run build' to render MP4 video.")
        print("="*60 + "\n")

if __name__ == "__main__":
    main()
