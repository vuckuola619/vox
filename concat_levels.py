import os
import shutil
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def find_ffmpeg_path() -> str:
    # 1. System PATH
    p = shutil.which("ffmpeg")
    if p:
        return p

    # 2. Remotion bundled ffmpeg
    node_ffmpeg = Path(r"c:\Users\bati-\Documents\AG-VOX\node_modules\@remotion\compositor-win32-x64-msvc\ffmpeg.exe")
    if node_ffmpeg.exists():
        return str(node_ffmpeg)

    # 3. Fallback search in node_modules
    for root, dirs, files in os.walk(r"c:\Users\bati-\Documents\AG-VOX\node_modules"):
        if "ffmpeg.exe" in files:
            return os.path.join(root, "ffmpeg.exe")

    raise FileNotFoundError("FFmpeg executable not found in system PATH or node_modules.")

def concat_all_levels():
    base_dir = Path(r"c:\Users\bati-\Documents\AG-VOX")
    output_dir = base_dir / "output"
    out_dir = base_dir / "out"
    out_dir.mkdir(parents=True, exist_ok=True)

    ffmpeg_bin = find_ffmpeg_path()
    print(f"Using FFmpeg binary at: {ffmpeg_bin}")

    level_files = [
        output_dir / "level_1.mp4",
        output_dir / "level_2.mp4",
        output_dir / "level_3.mp4",
        output_dir / "level_4.mp4",
        output_dir / "level_5.mp4",
        output_dir / "level_6.mp4",
    ]

    existing_files = [f for f in level_files if f.exists()]
    print(f"Found {len(existing_files)} level files out of {len(level_files)}:")
    for f in existing_files:
        print(f" -> {f.name} ({round(f.stat().st_size / 1024 / 1024, 1)} MB)")

    if len(existing_files) < 6:
        raise FileNotFoundError(f"Expected 6 level MP4 files, but found only {len(existing_files)}.")

    # Create FFmpeg concat list
    list_path = out_dir / "ffmpeg_concat_list.txt"
    with open(list_path, "w", encoding="utf-8") as f:
        for lvl in existing_files:
            clean_p = str(lvl).replace("\\", "/")
            f.write(f"file '{clean_p}'\n")

    master_output = output_dir / "vox_master_documentary_full.mp4"
    cmd = [
        ffmpeg_bin,
        "-f", "concat",
        "-safe", "0",
        "-i", str(list_path),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        str(master_output),
        "-y"
    ]

    print("Running FFmpeg Master Concat command...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg Concat Error:", res.stderr)
        raise RuntimeError("FFmpeg master concatenation failed.")

    print(f"SUCCESS: Master Documentary Video generated at {master_output} ({round(master_output.stat().st_size / 1024 / 1024, 1)} MB)")

if __name__ == "__main__":
    concat_all_levels()
