# AG-VOX: Vox-Studio Editorial Production Engine 🎬

[![Python 3.12+](https://img.shields.io/badge/python-3.12+-blue.svg)](https://www.python.org/downloads/)
[![Remotion 4.0](https://img.shields.io/badge/remotion-4.0-blueviolet.svg)](https://www.remotion.dev/)
[![Google Imagen 3](https://img.shields.io/badge/Google%20Imagen%203-SDK-green.svg)](https://deepmind.google/technologies/imagen-3/)

**AG-VOX** is an automated, production-grade documentary engine built to create high-impact, Vox-style editorial videos using Neural TTS Ground Truth, Google Imagen 3 SDK paper-collage visuals, and Remotion React video rendering.

---

## 🌟 Key Features

- **TTS First Ground Truth**: Synthesizes 48kHz Neural Audio and extracts exact millisecond speech timestamps to lock frame durations precisely.
- **Google Imagen 3 Hero Layer**: Authentic 16:9 archival paper-collage visuals generated via Antigravity SDK.
- **Level-by-Level Chapter Workflow**: Builds long-form 12-15 minute documentaries in 6 distinct Chapter Levels (~1 min / 6 frames per Level) for fast preview and QA.
- **Clean Editorial Remotion Engine**: React video compositions with Ken Burns motion dynamics, Oswald condensed headlines, paper textures, and typewriter lower thirds.
- **Seamless Master Concat**: Combines level MP4 files using FFmpeg H.264 re-encoding (`-c:v libx264 -preset fast -crf 18`) for zero-lag chapter transitions.

---

## 🚀 Quickstart Guide

### 1. Prerequisites

- **Python**: `3.12+`
- **Node.js**: `18.0+`
- **FFmpeg**: (Bundled automatically via Remotion or system PATH)

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone repository
git clone https://github.com/user/AG-VOX.git
cd AG-VOX

# Install Node dependencies for Remotion
npm install

# Install Python dependencies
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and set your optional API keys:

```bash
cp .env.example .env
```

```env
TTS_PROVIDER=edge-tts
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=eastus
```

### 4. Generate Documentary Video

Run the complete pipeline for any topic:

```bash
# Process individual Level 1
python -c "from src.longform_orchestrator import LongFormVoxStudio; studio = LongFormVoxStudio('Quantum Supremacy'); studio.run_level(1)"

# Render Level 1 MP4
npx remotion render remotion/src/index.ts VoxVideo output/level_1.mp4 --props=out/levels/level_1_manifest.json

# Concatenate all 6 completed Chapters into Master Documentary Video
python concat_levels.py
```

Master output video will be generated at:
`output/vox_master_documentary_full.mp4`

---

## 📁 Repository Structure

```
AG-VOX/
├── src/
│   ├── config.py                 # Central configuration & FPS settings
│   ├── voice_synthesizer.py      # Azure / Edge Neural TTS with WordBoundary timestamps
│   ├── script_writer.py         # 6-Level 6-Frame Vox Script Blueprint Generator
│   ├── image_generator.py       # Google Imagen 3 SDK Integration & Fallback Collage
│   ├── audio_concatenator.py    # Seamless MP3 audio track stitching
│   └── longform_orchestrator.py # Level-by-Level Chapter Orchestrator
├── remotion/
│   ├── src/
│   │   ├── VoxVideoComposition.tsx # Core 16:9 Editorial Video Composition
│   │   ├── Root.tsx                # Remotion Composition Definitions
│   │   └── components/
│   │       ├── KenBurnsImage.tsx   # Dynamic Pan & Zoom Motion Layer
│   │       ├── LowerThird.tsx      # Typewriter Caption Strip
│   │       ├── PaperBackground.tsx # Aged Newsprint Texture
│   │       └── FilmGrainOverlay.tsx# Global Film Grain & Vignette
├── concat_levels.py             # FFmpeg Master Video Concatenation Engine
├── AGENTS.md                    # Core Vox Architectural Guardrails & Rules
└── VOX-PAKEM.md                 # Complete Architectural Documentation & Bug History
```

---

## 🛠️ Contributing & Code Reviews

We welcome community contributions! Please follow our development workflow:

1. Fork the repo and create your feature branch: `git checkout -b feature/awesome-feature`
2. Run unit tests before submitting PR: `pytest test_*.py -v`
3. Submit a Pull Request with detailed descriptions and visual screenshots.

---

## 📄 License

MIT License. Developed for Vox-style editorial video production.
