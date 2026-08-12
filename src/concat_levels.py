import subprocess
from pathlib import Path

def concat_levels():
    out_dir = Path(r"c:\Users\bati-\Documents\AG-VOX\output")
    concat_list = out_dir / "concat_list.txt"

    lines = [f"file 'level_{i}.mp4'" for i in range(1, 7)]
    concat_list.write_text("\n".join(lines), encoding="utf-8")
    print("Concat List:\n" + concat_list.read_text())

    master_out = out_dir / "vox_master_documentary_full.mp4"
    
    # Re-encode video & audio streams to eliminate keyframe lag at level boundaries (1:06 - 1:07)
    cmd = [
        "npx.cmd", "remotion", "ffmpeg",
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", str(concat_list),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-c:a", "aac",
        "-b:a", "192k",
        str(master_out)
    ]

    print("Executing Seamless FFmpeg Concat with Re-Encoding...")
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(out_dir))
    print("FFmpeg Exit Code:", res.returncode)
    if master_out.exists():
        size_mb = master_out.stat().st_size / (1024 * 1024)
        print(f"SEAMLESS MASTER VIDEO GENERATED SUCCESSFULLY: {master_out} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    concat_levels()
