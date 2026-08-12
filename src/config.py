import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load .env if present
load_dotenv()

class Config:
    """Configuration settings for AG-VOX paper collage video engine."""

    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    ELEVENLABS_VOICE_ID: str = os.getenv("ELEVENLABS_VOICE_ID", "21m00Tcm4TlvDq8ikWAM")  # Rachel default

    BASE_DIR: Path = Path(__file__).parent.parent
    PUBLIC_DIR: Path = BASE_DIR / "public"
    OUTPUT_DIR: Path = BASE_DIR / os.getenv("OUTPUT_DIR", "output")
    ASSET_DIR: Path = PUBLIC_DIR / "assets"
    AUDIO_DIR: Path = ASSET_DIR / "audio"
    IMAGES_DIR: Path = ASSET_DIR / "images"

    FPS: int = int(os.getenv("FPS", "30"))
    WIDTH: int = int(os.getenv("RESOLUTION_WIDTH", "1920"))
    HEIGHT: int = int(os.getenv("RESOLUTION_HEIGHT", "1080"))

    # Vox Paper Collage Color Palette (Naseh Ngulik AI Reference System)
    COLOR_PAPER: str = "#EAE1C8"        # Aged newsprint paper
    COLOR_PAPER_DARK: str = "#D7C79C"   # Archival tan
    COLOR_INK: str = "#1A1A1A"         # Ink black
    COLOR_RED: str = "#B92220"         # Hot signal red
    COLOR_MUSTARD: str = "#BE8F2C"     # Restrained mustard yellow
    COLOR_GRAY: str = "#726C5E"        # Halftone gray

    # Master Style Prompt Template
    STYLE_BLOCK: str = (
        "hand-cut documentary paper collage on aged newsprint and archival map surfaces, "
        "black and white halftone photograph cutouts with rough scissor-cut edges and offset accent strokes, "
        "torn paper edges, masking tape fragments, typewriter caption strips, rubber stamp marks, "
        "red string and brass pins, desaturated archival palette of tan (#EAE1C8), ink black (#1A1A1A), "
        "and halftone gray with hot red (#B92220) signal accent and mustard yellow (#BE8F2C), "
        "condensed bold headline lettering, visible print grain, flat documentary lighting with soft cutout drop shadows."
    )

    @classmethod
    def ensure_directories(cls) -> None:
        """Create necessary project asset and output directories."""
        cls.PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
        cls.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        cls.ASSET_DIR.mkdir(parents=True, exist_ok=True)
        cls.AUDIO_DIR.mkdir(parents=True, exist_ok=True)
        cls.IMAGES_DIR.mkdir(parents=True, exist_ok=True)
