# AG-VOX: Vox-Style Geopolitical Documentary Explainer Engine 🎬

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Remotion 4.0](https://img.shields.io/badge/remotion-4.0-blueviolet.svg)](https://www.remotion.dev/)
[![React 18](https://img.shields.io/badge/react-18.2-cyan.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![FFmpeg](https://img.shields.io/badge/ffmpeg-6.0+-green.svg)](https://ffmpeg.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**AG-VOX** is an automated, production-grade video generation engine designed to create high-impact, long-form (12–15 minute) **Vox-style geopolitical documentary explainers**. It combines **TTS Neural Audio Ground Truth**, **Direct AI Text-to-Image Generation (9Router `cx/gpt-5.4-image` & Google Imagen 3)**, and a **Remotion React Video Composition Engine** with clean editorial motion graphics.

---

## 🏗️ System Architecture & Production Pipeline

```
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 1: Project Bible & Script Breakdown (12 Levels / 96 Frames)       │
  │ • Strategic thesis, geopolitical tension points, metrics, and prompts  │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 2: TTS Ground Truth & Monotonic Acoustic Alignment               │
  │ • EdgeTTS Neural 48kHz (`en-US-ChristopherNeural`)                     │
  │ • Physical MP3 millisecond duration lock via FFmpeg probe              │
  │ • Monotonic, character-weighted phonetic word timestamps (VTT)         │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 3: Direct AI Visual Asset Generation                             │
  │ • 9Router Text-to-Image Proxy (`cx/gpt-5.4-image`) / Google Imagen 3   │
  │ • 16:9 full-resolution archival collage visual per frame               │
  │ • Strict Zero-Fallback / Zero-Placeholder policy                       │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 4: Remotion React Video Engine (Level-by-Level Render)           │
  │ • Subtitles on top (`zIndex: 50`) with signature Vox Yellow highlight  │
  │ • 2-Second Auto-Exit for Top Title Card & Lower-Third Strip            │
  │ • Smooth Ken Burns pan/zoom/tilt (100% Zero Camera Shake / Jitter)     │
  │ • Concurrency: 2, JPEG Quality: 85 (Clean Webpack Memory Profile)      │
  └───────────────────────────────────┬────────────────────────────────────┘
                                      │
                                      ▼
  ┌────────────────────────────────────────────────────────────────────────┐
  │ PHASE 5: Master Concat & Multi-Tier Video Distribution                 │
  │ • Master 1080p: FFmpeg H.264 CRF 18 + AAC 192k (Zero-gap transition)   │
  │ • Mobile 720p: Telegram faststart stream (CRF 27, ~150MB)              │
  └────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### 1. Video Composition & Motion Graphics
- **[Remotion 4.0](https://www.remotion.dev/)**: Programmatic video rendering in React & TypeScript.
- **[React 18](https://react.dev/)**: Component-driven video layout (`VoxVideoComposition`, `KenBurnsImage`, `KineticCaptions`, `KineticHeadline`, `LowerThird`, `AlertWash`).
- **Typography & Styling**: Oswald (700 Bold Condensed) for headlines, JetBrains Mono / Typewriter for case-file stamps, Inter for body copy, and signature **Vox Yellow (`#FFDE59`)** kinetic keyword badges.

### 2. Narration & Acoustic Ground Truth
- **[EdgeTTS](https://github.com/rany2/edge-tts)**: High-fidelity Neural 48kHz voice synthesis (`en-US-ChristopherNeural`).
- **Phonetic Acoustic Character Weighting**: Calculates word display timestamps based on acoustic phoneme length + punctuation pauses (comma/period = +0.8s), preventing long-word desync.
- **Physical MP3 Duration Lock**: Reads physical audio durations via FFmpeg to guarantee exact millisecond audio-visual synchronization.

### 3. AI Visual Art Generation
- **[9Router](https://github.com/) / OpenAI-Compatible Image API**: Direct text-to-image synthesis using `cx/gpt-5.4-image` producing ~2.8–3.5 MB 16:9 visuals.
- **[Google Imagen 3 SDK](https://deepmind.google/technologies/imagen-3/)**: Direct integration via Antigravity SDK for authentic newsprint and archival collage visual styles.

### 4. Encoding & Post-Processing
- **[FFmpeg](https://ffmpeg.org/)**:
  - Master Assembly: `libx264` `-preset fast` `-crf 18` with AAC 192k audio.
  - Telegram Mobile: `libx264` `-preset fast` `-crf 27` `-movflags +faststart` 720p.

---

## 📁 Repository Structure

```
AG-VOX/
├── projects/                        # Active documentary projects & outputs
│   └── taiwan_strait_15min/         # 15-Minute / 12-Level Documentary
│       ├── PROJECT_BIBLE.md         # Comprehensive editorial project bible
│       ├── manifest.json            # Master project manifest
│       ├── levels/                  # Individual level manifests (1–12)
│       ├── images/                  # 96 Generated 16:9 AI Visuals (~3MB each)
│       ├── audio/                   # 96 TTS Narration MP3s + 12 Master Level MP3s
│       ├── subtitles/               # 96 Word-level timestamp JSONs / VTTs
│       ├── output/                  # 12 Rendered Level MP4s (level_1.mp4 ... level_12.mp4)
│       ├── master_taiwan_strait_15min.mp4 # Full 1080p Master Video (1.73 GB)
│       └── taiwan_strait_telegram.mp4     # Compressed Telegram Stream (159.3 MB)
├── remotion/                        # Remotion React Video Project
│   └── src/
│       ├── Root.tsx                 # Remotion root configuration & dynamic metadata
│       ├── VoxVideoComposition.tsx  # Core 16:9 layer hierarchy & timing engine
│       ├── index.ts                 # Remotion registration entrypoint
│       └── components/
│           ├── KineticCaptions.tsx  # Subtitles on top (zIndex: 50) with Vox Yellow badges
│           ├── KineticHeadline.tsx  # Top Title Banner with 2-second auto-exit
│           ├── LowerThird.tsx       # Case File & Level Title with 2-second auto-exit
│           ├── KenBurnsImage.tsx    # Smooth cinematic pan/zoom/tilt (Zero shake)
│           ├── AlertWash.tsx        # Geopolitical tension color overlays
│           ├── PaperBackground.tsx  # Archival newspaper texture
│           └── FilmGrainOverlay.tsx # 35mm film grain texture
├── src/                             # Core Python Pipeline Modules
│   ├── config.py                    # Global paths, resolutions, and FPS constants
│   ├── voice_synthesizer.py         # TTS generation & monotonic phonetic alignment
│   ├── image_generator.py           # 9Router & Imagen 3 visual synthesis engine
│   ├── audio_concatenator.py        # FFmpeg audio stitching & physical duration probe
│   ├── longform_orchestrator.py     # Multi-level batch orchestrator
│   └── video_builder.py             # Remotion CLI render wrapper
├── concat_levels.py                 # Master multi-level MP4 concatenator
├── compress_for_telegram.py         # Faststart 720p mobile compression script
├── AGENTS.md                        # Vox-Studio agentic guidelines & rules
├── VOX-PAKEM.md                     # Mandatory architectural pakem & bug history
├── requirements.txt                 # Python dependencies
└── package.json                     # Node.js & Remotion dependencies
```

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- **Python**: `3.12+`
- **Node.js**: `18.0+` (LTS recommended)
- **FFmpeg**: Installed and available on system `PATH`

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/vuckuola619/vox.git AG-VOX
cd AG-VOX

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Start 9Router AI Visual Service (Daemon)
To enable direct text-to-image generation via `cx/gpt-5.4-image`:
```powershell
$env:PORT="20128"
$env:HOSTNAME="127.0.0.1"
node C:\Users\bati-\AppData\Roaming\npm\node_modules\9router\app\server.js
```

---

## 🎬 How to Produce a Full Documentary

### 1. Run Automated Production Orchestrator
Execute the complete end-to-end pipeline (Audio Synthesis ➔ 9Router Image Generation ➔ Remotion Rendering ➔ Master Concatenation ➔ Telegram Compression):
```bash
python scratch/build_and_render_all_taiwan_strait.py
```

### 2. Render an Individual Level Manually
```bash
npx remotion render remotion/src/index.ts VoxVideo projects/taiwan_strait_15min/output/level_1.mp4 \
  --props=projects/taiwan_strait_15min/levels/level_1_manifest.json \
  --concurrency=2 \
  --jpeg-quality=85
```

### 3. Concatenate and Compress for Mobile
```bash
# Concatenate all 12 level MP4s into 1080p Master
python concat_levels.py

# Compress Master into 720p Faststart for Telegram
python compress_for_telegram.py projects/taiwan_strait_15min/master_taiwan_strait_15min.mp4 projects/taiwan_strait_15min/taiwan_strait_telegram.mp4
```

---

## 📐 Editorial Guardrails & Quality Standards (VOX-PAKEM)

All documentaries produced by this engine adhere to the strict guardrails in [`VOX-PAKEM.md`](VOX-PAKEM.md):

1. **TTS First Ground Truth**: Speech durations are generated and probed down to the millisecond *before* visual compositing to prevent audio drift.
2. **Subtitles on Top (`zIndex: 50`)**: Subtitles are always rendered on top of graphics, cards, and overlays.
3. **2-Second Auto-Exit**: The top title card and lower-third banner animate in smoothly at $t=0$, hold for 2 seconds (60 frames), and exit cleanly (`return null`), leaving the hero visual unobstructed.
4. **Zero Camera Shake / Jitter**: Jitter, shudder, and stepped oscillation effects are replaced with silky-smooth cinematic Ken Burns pan and slow zooms.
5. **Authentic 16:9 Visuals (Zero Slop)**: Every frame uses unique, high-resolution AI art generated from the Project Bible. No placeholder canvases or repetitive stock imagery.

---

## 📚 Produced Documentaries

1. **TAIWAN STRAIT: The $10 Trillion Semiconductor Pinch Point** (14.5 Min / 12 Levels / 96 Frames)
   - Master 1080p: `projects/taiwan_strait_15min/master_taiwan_strait_15min.mp4` (1.73 GB)
   - Telegram 720p: `projects/taiwan_strait_15min/taiwan_strait_telegram.mp4` (159.3 MB)
2. **STRAIT OF HORMUZ: The World's Most Dangerous Oil Chokepoint** (15.2 Min / 12 Levels / 96 Frames)
3. **BAB EL-MANDEB: The Red Sea Drone Chokepoint** (15.2 Min / 12 Levels / 96 Frames)

---

## 📄 License
MIT License. Developed for automated Vox-style geopolitical explainer documentaries.
