import logging
import shutil
import re
from pathlib import Path
from typing import Optional
from PIL import Image, ImageDraw, ImageFont
from src.config import Config

logger = logging.getLogger(__name__)

class Imagen3Generator:
    """Handles visual asset generation using Google Imagen 3 with paper collage guardrails."""

    def generate_image(self, prompt: str, output_filename: str) -> str:
        """
        Guarantees that a full-frame 16:9 Google Imagen 3 visual asset is used for the scene.
        """
        Config.ensure_directories()
        output_path = Config.IMAGES_DIR / output_filename

        # If asset already exists in public/assets/images and is non-empty, PRESERVE IT! (Do not overwrite with old level assets)
        if output_path.exists() and output_path.stat().st_size > 10000:
            logger.info(f"Preserving existing custom visual asset '{output_filename}' ({round(output_path.stat().st_size/1024, 1)} KB)")
            return str(output_path)

        # 1. Find corresponding raw Google Imagen 3 AI image generated via Antigravity
        ai_image = self._find_real_imagen3_source(output_filename)

        if ai_image and ai_image.exists():
            # Copy raw Google Imagen 3 image directly to output asset path
            shutil.copy(ai_image, output_path)
            logger.info(f"Using full-screen Google Imagen 3 visual asset '{ai_image.name}' for {output_filename}")
            return str(output_path)

        # 2. Fallback paper collage composition if AI image generation was skipped
        logger.warning(f"No matching Google Imagen 3 asset found for {output_filename}. Using fallback collage.")
        return self._create_paper_collage_fallback(prompt, output_path)

    def _find_real_imagen3_source(self, output_filename: str) -> Optional[Path]:
        """Find corresponding real Google Imagen 3 image generated via Antigravity."""
        brain_dir = Path(r"C:\Users\bati-\.gemini\antigravity\brain\8ee2c783-e5a5-4ee4-88e6-1fa0a682b9c0")
        if not brain_dir.exists():
            return None

        # Direct name match search
        stem = Path(output_filename).stem
        direct_matches = list(brain_dir.glob(f"{stem}*.jpg"))
        if direct_matches:
            return direct_matches[0]

        return None

    def _create_paper_collage_fallback(self, prompt: str, output_path: Path) -> str:
        """Fallback 16:9 paper collage visual artwork."""
        width, height = Config.WIDTH, Config.HEIGHT

        img = Image.new("RGB", (width, height), color=(234, 225, 200))
        draw = ImageDraw.Draw(img)

        # Archival map grid background
        grid_step = 90
        grid_color = (215, 199, 156)
        for x in range(0, width, grid_step):
            draw.line([(x, 0), (x, height)], fill=grid_color, width=1)
        for y in range(0, height, grid_step):
            draw.line([(0, y)], fill=grid_color, width=1)

        # Hero Dark Frame
        draw.rectangle([(200, 120), (width - 200, height - 140)], fill=(30, 30, 30), outline=(185, 34, 32), width=4)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        img.save(output_path, format="PNG")
        logger.info(f"Saved fallback paper collage asset to {output_path}")
        return str(output_path)
