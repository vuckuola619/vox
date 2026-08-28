# Vox-Studio Editorial Production Engine Guide

This rules file enforces all Vox-style documentary video creation guidelines and architectural rules for the AG-VOX project.

## Core Rules & Architecture
1. **Nexlev AI Niche Intelligence (Phase 0 Gate)**: Every documentary project must be validated with Nexlev MCP (`search_niche_finder_channels`, `faceless_outliers_videos`, `search_viral_videos_small_channels`) with Outlier Score $\ge 2.0\times$, high RPM ($\ge \$8-\$25$), and narrative hook deconstruction via `get_video_transcript` before scriptwriting.
2. **TTS First Ground Truth**: Always synthesize Neural Audio (48kHz) and parse WebVTT subtitles first to lock scene and frame durations precisely in milliseconds.
3. **Google Imagen 3 SDK Hero Layer**: Every frame must use authentic 16:9 Google Imagen 3 visuals generated via Antigravity SDK. Motion graphics/SVG maps must only be transparent overlays on top of the hero artwork.
4. **Monotonic & Phonetic Subtitle Sync**: Word display must use character-weighted acoustic duration distribution (`src/voice_synthesizer.py`) and global time frame calculation (`sceneStartTime + frame / fps` in `KineticCaptions.tsx`).
5. **Level-by-Level Incremental QA**: Build 12-15 minute documentaries in 6 distinct Chapter Levels (~2 mins / 6 frames per Level). Verify each Level MP4 before master concatenation.
6. **Physical Audio Ground Truth & Zero-Padding Level Transitions**: Frame durations must be measured directly from synthesized physical MP3 file durations via FFmpeg (`get_exact_mp3_duration`) to ensure 100% exact visual/narration alignment. Level MP4 files must end immediately after the final frame audio without artificial tail silence so levels concatenate seamlessly without audio pauses.
7. **Google Omni Video I2V Living Poster Standard (Pipeline C — LOCKED)**: Every 16:9 hero visual generated via `cx/gpt-5.4-image` or Google Imagen 3 is converted into a 2.5D living stop-motion video clip via `src/omni_video_generator.py` (`models/gemini-omni-flash-preview`). Remotion loads the animated MP4 via `<OffthreadVideo>` in `KenBurnsImage.tsx`, overlaying living scene elements (`LivingSceneOverlay.tsx` with animated people, ship water wake, and radar telemetry) while preserving 2D paper textures and zero CGI distortion.

For detailed bug history, root causes, and technical fixes, see [`VOX-PAKEM.md`](file:///c:/Users/bati-/Documents/AG-VOX/VOX-PAKEM.md).

