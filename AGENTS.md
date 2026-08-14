# Vox-Studio Editorial Production Engine Guide

This rules file enforces all Vox-style documentary video creation guidelines and architectural rules for the AG-VOX project.

## Core Rules & Architecture
1. **TTS First Ground Truth**: Always synthesize Neural Audio (48kHz) and parse WebVTT subtitles first to lock scene and frame durations precisely in milliseconds.
2. **Google Imagen 3 SDK Hero Layer**: Every frame must use authentic 16:9 Google Imagen 3 visuals generated via Antigravity SDK. Motion graphics/SVG maps must only be transparent overlays on top of the hero artwork.
3. **Monotonic & Phonetic Subtitle Sync**: Word display must use character-weighted acoustic duration distribution (`src/voice_synthesizer.py`) and global time frame calculation (`sceneStartTime + frame / fps` in `KineticCaptions.tsx`).
4. **Level-by-Level Incremental QA**: Build 12-15 minute documentaries in 6 distinct Chapter Levels (~2 mins / 6 frames per Level). Verify each Level MP4 before master concatenation.
6. **Physical Audio Ground Truth & Zero-Padding Level Transitions**: Frame durations must be measured directly from synthesized physical MP3 file durations via FFmpeg (`get_exact_mp3_duration`) to ensure 100% exact visual/narration alignment. Level MP4 files must end immediately after the final frame audio without artificial tail silence so levels concatenate seamlessly without audio pauses.

For detailed bug history, root causes, and technical fixes, see [`VOX-PAKEM.md`](file:///c:/Users/bati-/Documents/AG-VOX/VOX-PAKEM.md).
