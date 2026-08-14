import logging
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger(__name__)

def create_vox_frame_collage(frame_idx: int, script_text: str, output_path: Path, topic: str = "Strait of Hormuz"):
    """
    Generates rich, authentic, frame-specific Vox Paper Collage hero visuals (1920x1080)
    for Strait of Hormuz documentary.
    """
    width, height = 1920, 1080
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # 1. Base Paper Canvas: Aged Tan Newsprint (#EAE1C8)
    img = Image.new("RGB", (width, height), color=(234, 225, 200))
    draw = ImageDraw.Draw(img)

    # Load Fonts
    try:
        font_title = ImageFont.truetype("arialbd.ttf", 44)
        font_stat = ImageFont.truetype("arialbd.ttf", 64)
        font_sub = ImageFont.truetype("arial.ttf", 26)
        font_type = ImageFont.truetype("courier.ttf", 22)
    except:
        font_title = font_stat = font_sub = font_type = ImageFont.load_default()

    # Colors
    RED_ACCENT = (185, 34, 32)       # Vox Hot Red #B92220
    DARK_INK = (26, 26, 26)         # Ink Black #1A1A1A
    TAN_PAPER = (215, 199, 156)     # Archival Paper #D7C79C
    PAPER_BG = (234, 225, 200)      # Newsprint #EAE1C8
    NAVY_OCEAN = (30, 45, 65)       # Deep Ocean #1E2D41
    GOLD_HIGHLIGHT = (210, 160, 45) # Gold

    # 2. Archival Grid Lines Background
    for x in range(0, width, 120):
        draw.line([(x, 0), (x, height)], fill=(215, 202, 172), width=1)
    for y in range(0, height, 120):
        draw.line([(0, y), (width, y)], fill=(215, 202, 172), width=1)

    # Outer Margins
    draw.text((100, 50), "VOX DOCUMENTARY VISUAL ENGINE • STRAIT OF HORMUZ", fill=(140, 125, 95), font=font_type)

    if frame_idx == 5:
        # Frame 5: Global Energy Flow Converging on Hormuz
        draw.rectangle([(160, 120), (width - 160, height - 120)], fill=NAVY_OCEAN, outline=DARK_INK, width=4)
        
        # Draw Energy Vector Lines
        for i in range(8):
            y1 = 200 + i * 80
            draw.line([(220, y1), (width // 2, height // 2)], fill=GOLD_HIGHLIGHT, width=5)
            draw.line([(width // 2, height // 2), (width - 220, y1)], fill=RED_ACCENT, width=5)

        # Center Red Target Ring (Hormuz Chokepoint)
        draw.ellipse([(width//2 - 90, height//2 - 90), (width//2 + 90, height//2 + 90)], outline=RED_ACCENT, width=8)
        draw.ellipse([(width//2 - 40, height//2 - 40), (width//2 + 40, height//2 + 40)], fill=RED_ACCENT)

        # Stat Card (#B92220)
        draw.rectangle([(width - 750, 160), (width - 180, 340)], fill=RED_ACCENT, outline=DARK_INK, width=4)
        draw.text((width - 465, 220), "21% OF WORLD PETROLEUM", fill=(255, 255, 255), font=font_stat, anchor="mm")
        draw.text((width - 465, 290), "FLOWS THROUGH HORMUZ", fill=PAPER_BG, font=font_title, anchor="mm")

        # Second Stat Card
        draw.rectangle([(200, height - 300), (750, height - 160)], fill=PAPER_BG, outline=RED_ACCENT, width=4)
        draw.text((475, height - 250), "GLOBAL CHOKEPOINT #1", fill=DARK_INK, font=font_title, anchor="mm")
        draw.text((475, height - 190), "20.5 MILLION BARRELS / DAY", fill=RED_ACCENT, font=font_type, anchor="mm")

    elif frame_idx == 6:
        # Frame 6: $1.2 Billion Daily Crude Oil Market Ticker
        draw.rectangle([(140, 140), (width - 140, height - 140)], fill=PAPER_BG, outline=DARK_INK, width=4)
        
        # Stock Ticker Grid Cards
        draw.rectangle([(220, 220), (840, 480)], fill=DARK_INK, outline=RED_ACCENT, width=4)
        draw.text((530, 300), "BRENT CRUDE OIL", fill=GOLD_HIGHLIGHT, font=font_title, anchor="mm")
        draw.text((530, 390), "$89.30 / BARREL (+2.1%)", fill=(100, 255, 150), font=font_stat, anchor="mm")

        draw.rectangle([(width - 840, 220), (width - 220, 480)], fill=DARK_INK, outline=RED_ACCENT, width=4)
        draw.text((width - 530, 300), "DAILY TRANSIT VALUE", fill=PAPER_BG, font=font_title, anchor="mm")
        draw.text((width - 530, 390), "$1.2 BILLION / DAY", fill=GOLD_HIGHLIGHT, font=font_stat, anchor="mm")

        # Huge Money Banner Card
        draw.rectangle([(width // 2 - 500, height - 300), (width // 2 + 500, height - 180)], fill=RED_ACCENT, outline=DARK_INK, width=4)
        draw.text((width // 2, height - 240), "IMMEDIATE STRUCTURAL MARKET SHOCK", fill=(255, 255, 255), font=font_title, anchor="mm")

    elif frame_idx == 7:
        # Frame 7: Persian Gulf Oil Producers Network Map
        draw.rectangle([(160, 140), (width - 160, height - 140)], fill=NAVY_OCEAN, outline=DARK_INK, width=4)
        
        # 6 Producer Cards
        nations = [
            ("SAUDI ARABIA", "RAS TANURA TERMINAL"),
            ("KUWAIT", "AL-AHMADI HUB"),
            ("UAE", "FUJAIRAH ANCHORAGE"),
            ("QATAR", "20% WORLD LNG"),
            ("IRAQ", "BASRA OIL TERMINAL"),
            ("IRAN", "KHARG ISLAND TERMINAL")
        ]
        for idx, (nation, desc) in enumerate(nations):
            row = idx // 3
            col = idx % 3
            cx = 240 + col * 500
            cy = 220 + row * 220
            draw.rectangle([(cx, cy), (cx + 440, cy + 180)], fill=PAPER_BG, outline=RED_ACCENT, width=3)
            draw.text((cx + 220, cy + 60), nation, fill=RED_ACCENT, font=font_title, anchor="mm")
            draw.text((cx + 220, cy + 120), desc, fill=DARK_INK, font=font_type, anchor="mm")

        # Flow Label
        draw.rectangle([(width // 2 - 400, height - 220), (width // 2 + 400, height - 160)], fill=RED_ACCENT, outline=DARK_INK, width=3)
        draw.text((width // 2, height - 190), "ALL GULF PRODUCERS CONVERGE AT HORMUZ", fill=(255, 255, 255), font=font_title, anchor="mm")

    elif frame_idx == 8:
        # Frame 8: Shallow Water Depth (50m-100m) Cross Section
        draw.rectangle([(160, 140), (width - 160, height - 140)], fill=NAVY_OCEAN, outline=DARK_INK, width=4)
        
        # Seabed Shelf Diagram
        draw.rectangle([(220, height - 380), (width - 220, height - 200)], fill=TAN_PAPER, outline=DARK_INK, width=3)
        draw.text((width // 2, height - 320), "SHALLOW SEABED SHELF (50m - 100m)", fill=DARK_INK, font=font_stat, anchor="mm")
        draw.text((width // 2, height - 240), "300,000-TON VLCC SUPERTANKERS HAVE ZERO MARGIN FOR ERROR", fill=RED_ACCENT, font=font_title, anchor="mm")

    # Save PNG asset
    img.save(output_path, format="PNG")
    logger.info(f"Generated frame-specific Vox Paper Collage asset: {output_path} ({output_path.stat().st_size} bytes)")
    return str(output_path)
