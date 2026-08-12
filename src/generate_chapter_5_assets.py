import os
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps

def create_vox_paper_texture(width=1920, height=1080, bg_color=(234, 225, 200)):
    """Create authentic aged Vox newsprint paper texture base."""
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Add newspaper column lines background
    column_width = 380
    for x in range(60, width, column_width):
        draw.line([(x, 0), (x, height)], fill=(210, 200, 175), width=2)
        # Add subtle fake text lines
        for y in range(80, height - 100, 18):
            if (x + y) % 37 != 0:
                line_len = (x * 13 + y * 7) % (column_width - 80) + 40
                draw.line([(x + 20, y), (x + 20 + line_len, y)], fill=(195, 185, 160), width=3)

    return img

def add_scissor_cut_border(draw, bbox, fill=(245, 240, 225), outline=(34, 29, 20), width=4):
    """Draw a paper cutout with scissor-cut edges and drop shadow."""
    x0, y0, x1, y1 = bbox
    # Shadow
    draw.rectangle([x0 + 12, y0 + 14, x1 + 12, y1 + 14], fill=(30, 25, 20))
    # Paper Body
    draw.rectangle([x0, y0, x1, y1], fill=fill, outline=outline, width=width)

def generate_chapter_5_image_assets(output_dir: Path):
    """Generate 6 BRAND NEW 100% unique 1920x1080 Vox Paper-Collage visual assets for Chapter 5."""
    output_dir.mkdir(parents=True, exist_ok=True)
    W, H = 1920, 1080

    # Frame 5.1: The 2-Nanometer Limit (Atomic Grid)
    img1 = create_vox_paper_texture(W, H)
    d1 = ImageDraw.Draw(img1)
    # Scissor cutout for 2nm grid
    add_scissor_cut_border(d1, (180, 140, 1740, 940), fill=(242, 238, 224))
    # Draw Atomic Lattice Grid
    cx, cy = 960, 520
    for r in range(40, 360, 45):
        d1.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(185, 34, 32), width=3)
    for i in range(12):
        angle = i * (math.pi / 6)
        d1.line([(cx, cy), (cx + 380 * math.cos(angle), cy + 380 * math.sin(angle))], fill=(185, 34, 32), width=2)
    # Atoms
    for i in range(16):
        a = i * (math.pi / 8)
        rad = 220
        ax, ay = cx + rad * math.cos(a), cy + rad * math.sin(a)
        d1.ellipse([ax - 18, ay - 18, ax + 18, ay + 18], fill=(185, 34, 32), outline=(34, 29, 20), width=3)
    # Text Stamp
    d1.rectangle([300, 200, 850, 320], fill=(185, 34, 32))
    d1.rectangle([320, 220, 830, 300], fill=(242, 238, 224))
    d1.text((350, 235), "2nm SILICON ATOMIC GRID", fill=(185, 34, 32))
    img1.save(output_dir / "level_5_frame_1_image.png")

    # Frame 5.2: Quantum Tunneling Leakage (Electron Leap Vectors)
    img2 = create_vox_paper_texture(W, H)
    d2 = ImageDraw.Draw(img2)
    add_scissor_cut_border(d2, (150, 120, 1770, 960), fill=(238, 232, 215))
    # Barrier Walls
    d2.rectangle([450, 220, 580, 860], fill=(34, 29, 20))
    d2.rectangle([1340, 220, 1470, 860], fill=(34, 29, 20))
    # Quantum Wave Trail
    points = []
    for x in range(200, 1700, 15):
        y = 540 + math.sin(x * 0.025) * 140
        points.append((x, y))
    d2.line(points, fill=(185, 34, 32), width=8)
    # Tunneling Arrow
    d2.polygon([(940, 480), (1060, 540), (940, 600)], fill=(185, 34, 32))
    d2.rectangle([250, 160, 800, 270], fill=(185, 34, 32))
    d2.text((270, 190), "QUANTUM TUNNELING LEAKAGE", fill=(255, 255, 255))
    img2.save(output_dir / "level_5_frame_2_image.png")

    # Frame 5.3: GAAFET 3D Nanosheet Architecture
    img3 = create_vox_paper_texture(W, H)
    d3 = ImageDraw.Draw(img3)
    add_scissor_cut_border(d3, (200, 150, 1720, 930), fill=(245, 240, 225))
    # 3D Nanosheet Layers
    for layer in range(3):
        ly0 = 320 + layer * 160
        ly1 = ly0 + 90
        d3.rectangle([400, ly0, 1520, ly1], fill=(190, 143, 44), outline=(34, 29, 20), width=4)
        # Gate Wrap
        d3.rectangle([750, ly0 - 25, 1170, ly1 + 25], fill=(185, 34, 32), outline=(34, 29, 20), width=3)
    d3.rectangle([250, 180, 850, 280], fill=(34, 29, 20))
    d3.text((280, 210), "GAAFET 3D NANOSHEET GATE", fill=(245, 240, 225))
    img3.save(output_dir / "level_5_frame_3_image.png")

    # Frame 5.4: High-NA EUV Thermodynamics ($350M Machine)
    img4 = create_vox_paper_texture(W, H)
    d4 = ImageDraw.Draw(img4)
    add_scissor_cut_border(d4, (160, 130, 1760, 950), fill=(240, 235, 218))
    # Heat Gradient Rays
    for r in range(500, 50, -35):
        d4.ellipse([960 - r, 540 - r, 960 + r, 540 + r], outline=(185, 34 + (500 - r)//3, 32), width=6)
    # High-NA Optics Barrel
    d4.rectangle([780, 240, 1140, 840], fill=(34, 29, 20), outline=(185, 34, 32), width=5)
    d4.rectangle([220, 170, 780, 280], fill=(185, 34, 32))
    d4.text((250, 200), "HIGH-NA EUV: $350M THERMAL CORE", fill=(255, 255, 255))
    img4.save(output_dir / "level_5_frame_4_image.png")

    # Frame 5.5: The End of Moore's Law (Crashing Brick Wall Curve)
    img5 = create_vox_paper_texture(W, H)
    d5 = ImageDraw.Draw(img5)
    add_scissor_cut_border(d5, (140, 120, 1780, 960), fill=(242, 236, 220))
    # Brick Wall
    for y in range(200, 900, 50):
        offset = 40 if (y // 50) % 2 == 0 else 0
        for x in range(1200 + offset, 1700, 80):
            d5.rectangle([x, y, x + 75, y + 45], fill=(185, 34, 32), outline=(34, 29, 20), width=2)
    # Moore's Law Curve crashing
    curve = []
    for x in range(250, 1220, 15):
        y = 820 - math.pow((x - 250) / 970, 2.5) * 580
        curve.append((x, y))
    d5.line(curve, fill=(34, 29, 20), width=10)
    # Collision Explosion Mark
    d5.ellipse([1180, 200, 1280, 300], fill=(185, 34, 32), outline=(34, 29, 20), width=4)
    d5.rectangle([200, 160, 750, 260], fill=(34, 29, 20))
    d5.text((220, 190), "MOORE'S LAW COLLAPSE (1965-2026)", fill=(242, 236, 220))
    img5.save(output_dir / "level_5_frame_5_image.png")

    # Frame 5.6: Chapter 5 Synthesis (Quantum Supremacy Qubits)
    img6 = create_vox_paper_texture(W, H)
    d6 = ImageDraw.Draw(img6)
    add_scissor_cut_border(d6, (150, 130, 1770, 950), fill=(245, 240, 225))
    # Quantum Bloch Sphere Qubit Overlay
    d6.ellipse([710, 290, 1210, 790], outline=(185, 34, 32), width=6)
    d6.ellipse([710, 480, 1210, 600], outline=(190, 143, 44), width=4)
    d6.line([(960, 240), (960, 840)], fill=(34, 29, 20), width=4)
    d6.line([(660, 540), (1260, 540)], fill=(34, 29, 20), width=4)
    # Qubit Vector
    d6.line([(960, 540), (1140, 360)], fill=(185, 34, 32), width=8)
    d6.ellipse([1120, 340, 1160, 380], fill=(185, 34, 32))
    d6.rectangle([220, 170, 850, 280], fill=(185, 34, 32))
    d6.text((240, 200), "THE ATOMIC CEILING & QUANTUM AGE", fill=(255, 255, 255))
    img6.save(output_dir / "level_5_frame_6_image.png")

    print(f"SUCCESS: Generated 6 BRAND NEW 100% unique Vox Paper-Collage visual assets for Chapter 5 in {output_dir}")

if __name__ == "__main__":
    generate_chapter_5_image_assets(Path(r"c:\Users\bati-\Documents\AG-VOX\public\assets\images"))
