"""
Google Omni Video & Veo Generator for AG-VOX
Transforms 16:9 Imagen 3 Paper-Collage Visuals into 2.5D Living Posters / Motion Graphics
Powered by Google Gemini Omni Flash Video REST API (models/gemini-omni-flash-preview)
"""

import os
import io
import ssl
import json
import base64
import logging
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, Dict, Any
from PIL import Image

logger = logging.getLogger(__name__)

class OmniVideoGenerator:
    """
    Google Omni Video / Veo Generator for AG-VOX.
    Takes static 16:9 paper-collage hero frames and generates 5s/10s subtle motion living video clips.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "models/gemini-omni-flash-preview"):
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
        self.model = model
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/interactions"
        self.ctx = ssl.create_default_context()

    def is_available(self) -> bool:
        """Check if a valid Gemini API key is configured for Omni Video."""
        return bool(self.api_key and self.api_key != "your_gemini_api_key_here")

    def animate_hero_image(
        self,
        image_path: Path,
        motion_prompt: str,
        output_video_path: Path,
        duration: str = "10s",
        aspect_ratio: str = "16:9"
    ) -> bool:
        """
        Animate a static paper-collage hero frame into a living video via Google Omni Video.
        
        Args:
            image_path: Path to static 16:9 PNG/JPG hero image.
            motion_prompt: Axis & atmospheric motion prompt (e.g. 'Slow cinematic camera push-in, subtle canal water ripples').
            output_video_path: Path to save the resulting .mp4 file.
            duration: Video duration ('5s' or '10s').
            aspect_ratio: Aspect ratio ('16:9' or '9:16').
            
        Returns:
            True if video generated successfully, False otherwise.
        """
        if not self.is_available():
            logger.warning("[OmniVideo] GEMINI_API_KEY not configured. Falling back to Remotion KenBurns / 2.5D Diorama.")
            return False

        if not image_path.exists():
            logger.error(f"[OmniVideo] Hero image not found: {image_path}")
            return False

        try:
            # 1. Prepare Base64 PNG image
            img = Image.open(image_path).convert("RGB")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            b64_img = base64.b64encode(buf.getvalue()).decode("utf-8")

            # 2. Strict 2D Paper-Collage Motion Prompt Formula
            vox_motion_prompt = (
                f"{motion_prompt}. "
                "CRITICAL STYLE: Maintain flat 2D hand-cut paper collage aesthetic, stop-motion stepped animation, "
                "preserve paper cutouts and halftone texture, no CGI, no 3D distortion, no artificial text overlays."
            )

            # 3. Construct Gemini Omni Payload
            payload = {
                "model": self.model,
                "generation_config": {"thinking_level": "high"},
                "response_format": {
                    "type": "video",
                    "aspect_ratio": aspect_ratio,
                    "duration": duration
                },
                "input": [
                    {"type": "text", "text": vox_motion_prompt},
                    {"type": "image", "mime_type": "image/png", "data": b64_img}
                ]
            }

            req = urllib.request.Request(
                self.api_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": self.api_key
                }
            )

            logger.info(f"[OmniVideo] Requesting Google Omni Video animation for {image_path.name}...")
            with urllib.request.urlopen(req, context=self.ctx, timeout=180) as resp:
                res = json.loads(resp.read().decode("utf-8"))
                for step in res.get("steps", []):
                    for item in step.get("content", []):
                        if item.get("type") == "video" or "video" in str(item.get("mime_type")):
                            output_video_path.parent.mkdir(parents=True, exist_ok=True)
                            with open(output_video_path, "wb") as f:
                                f.write(base64.b64decode(item["data"]))
                            logger.info(f"[OmniVideo] Living poster MP4 saved to {output_video_path} ({output_video_path.stat().st_size} bytes)")
                            return True

            logger.warning("[OmniVideo] No video data in response payload.")
            return False

        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="replace")
            logger.error(f"[OmniVideo] API HTTP Error {e.code}: {err_msg}")
            return False
        except Exception as e:
            logger.error(f"[OmniVideo] Video generation error: {e}")
            return False
