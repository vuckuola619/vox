import os
import subprocess
import shutil
from pathlib import Path

def compress_for_telegram():
    base_dir = Path(r"c:\Users\bati-\Documents\AG-VOX")
    output_dir = base_dir / "output"
    master_input = output_dir / "vox_master_documentary_full.mp4"

    if not master_input.exists():
        raise FileNotFoundError(f"Master video not found at {master_input}")

    # Find FFmpeg binary
    ffmpeg_bin = shutil.which("ffmpeg")
    if not ffmpeg_bin:
        node_ffmpeg = base_dir / "node_modules" / "@remotion" / "compositor-win32-x64-msvc" / "ffmpeg.exe"
        if node_ffmpeg.exists():
            ffmpeg_bin = str(node_ffmpeg)
        else:
            raise FileNotFoundError("FFmpeg executable not found.")

    telegram_output = output_dir / "vox_master_documentary_telegram.mp4"

    print(f"Compressing master video ({round(master_input.stat().st_size / 1024 / 1024, 1)} MB) for Telegram...")

    # Faststart, CRF 26, AAC 128k for Telegram streaming & low bandwidth
    cmd = [
        ffmpeg_bin,
        "-i", str(master_input),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "26",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        "-c:a", "aac",
        "-b:a", "128k",
        str(telegram_output),
        "-y"
    ]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Compression Error:", res.stderr)
        raise RuntimeError("FFmpeg Telegram compression failed.")

    orig_size = round(master_input.stat().st_size / 1024 / 1024, 1)
    new_size = round(telegram_output.stat().st_size / 1024 / 1024, 1)
    reduction = round((1 - (new_size / orig_size)) * 100, 1)

    print(f"SUCCESS: Created Telegram-Optimized Video at {telegram_output}")
    print(f" -> Original Size: {orig_size} MB")
    print(f" -> Telegram Size: {new_size} MB (Reduced by {reduction}%)")

if __name__ == "__main__":
    compress_for_telegram()
