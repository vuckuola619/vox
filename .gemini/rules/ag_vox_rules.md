# AG-VOX Rules & Principles

## Tech Stack & Standards
- **Python**: Python 3.12+ with type hints on all functions and Pydantic models for JSON validation.
- **Image Generation**: Google Imagen 3 SDK (`google-genai` package, model `imagen-3.0-generate-002`, 16:9 ratio).
- **Audio & Speech**: ElevenLabs `/v1/text-to-speech/{voice_id}/with-timestamps` API with character-to-word timestamp conversion.
- **Video Rendering**: Remotion React motion engine with 60fps/30fps spring physics and visual sequences.

## Vox Design System (Tokens & Aesthetics)
- **Background**: Dark Navy / Black (`#111111`, `#0D1B2A`)
- **Primary Text**: Cream White (`#F3EFE0`)
- **Accent Highlighting**: Vox Yellow (`#FFDD00`)
- **Alert / Stat Accent**: Crimson Red (`#E63946`)
- **Secondary Accent**: Steel Blue (`#1D3557`)
- **Typography**: Heavy bold sans-serif (Helvetica Neue, Impact, Arial) with uppercase styling for kinetic headers.

## Robustness & Rate-Limiting
- Handle missing API keys gracefully with mock fallbacks during local dry-run tests.
- Retries with exponential backoff for ElevenLabs and Gemini API endpoints.
