# AG-VOX Production Engine Guardrails & Best Practices (VOX-PAKEM.md)

Dokumen ini mencatat seluruh pakem arsitektur, temuan bug, perbaikan, dan standar kualitas (QC/QA/UAT) untuk sistem **AG-VOX Faceless YouTube Documentary Explainer Engine (Vox-Style)**.

---

## 1. Core Production Architecture

### A. Alur Produksi Long-Form Video (12 - 15 Menit)
```
 ┌──────────────────────────────────────────────────────────┐
 │ PHASE 0: Nexlev AI Niche Intelligence & Pre-Production   │
 ├──────────────────────────────────────────────────────────┤
 │  • Outlier Validation (Score >= 2.0x vs channel average) │
 │  • Small Channel Viral Breakouts (<50k subs, >100k views)│
 │  • Transcript Deconstruction & Hook Reverse-Engineering  │
 │  • Monetization & RPM Targeting ($8 - $25/1k views)      │
 └────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 1: TTS Neural 48kHz (Synthesize Text First)         │
 ├──────────────────────────────────────────────────────────┤
 │  • Durasi Suara di-Lock sebagai GROUND TRUTH milidetik  │
 └────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 2: Google Imagen 3 Visual Asset Generation (SDK)    │
 ├──────────────────────────────────────────────────────────┤
 │  • Set Frame Visual = Full Screen 16:9 (1376x768 / 1080p)│
 │  • Prompting: Paper collage, scissor-cut keyline, newsprint│
 │  • Wajib Unique Visual Asset per Frame (No Reuse Slop)   │
 └────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 3: Subtitle VTT Word-Level Alignment (Monotonic)    │
 ├──────────────────────────────────────────────────────────┤
 │  • Acoustic Character-Weighted Duration Distribution      │
 │  • Global Time Conversion: `sceneStartTime + frame / fps` │
 │  • Display Context: Max 5 kata kontekstual per baris     │
 └────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 4: Level-by-Level Remotion Render & FFmpeg Concat   │
 ├──────────────────────────────────────────────────────────┤
 │  • Seamless H.264 Re-Encoding Concat (`-crf 18 -preset`) │
 │  • Crossfade (xfade) 15-frame transition                 │
 └──────────────────────────────────────────────────────────┘
```

---

## 2. Mandatory Rules & Guardrails (Pakem Wajib)

### 🖼️ A. Visual Guardrails (Google Imagen 3 via Antigravity SDK)
1. **No Blank Frames / No Fallback Canvas**: Setiap frame wajib menggunakan gambar visual asli Google Imagen 3 SDK 16:9 full screen.
2. **Hero Visual Layer Direct Placement**: Di file `VoxVideoComposition.tsx`, gambar `KenBurnsImage` **TIDAK BOLEH** ditimpa atau disembunyikan oleh komponen grafik lain. Grafik SVG/peta hanya boleh sebagai *overlay transparan (zIndex: 15)* di atas gambar Imagen 3.
3. **Unique Asset Mapping per Frame**: Mapping gambar wajib menghitung *Global Scene Index* (`(level_num - 1) * 2 + frame_num`) untuk mencegah reuse gambar yang sama di frame lain.

### 🎙️ B. Audio & Subtitle Alignment Guardrails
1. **TTS First Ground Truth**: Sintesis suara narasi Neural harus dieksekusi sebelum rendering video. Durasi audio di-lock presisi hingga milidetik (`round(duration, 3)`).
2. **Strict Monotonic Word Timestamps**: Parser VTT wajib mengurutkan kata secara monotonik (`w_start = max(item.start_time, prev_end)`). Tumpang tindih waktu (overlap cue) tidak boleh terjadi.
3. **Acoustic Character Weighting**: Alokasi waktu kata wajib dihitung berbasis **panjang karakter + bonus pause tanda baca** (koma/titik = 0.8s bonus) untuk mencegah desync pada kata panjang (seperti *"semiconductors"*).
4. **Remotion Sequence Global Time Calculation**: Di dalam komponen Remotion `<Sequence>`, waktu `frame` adalah lokal (mulai dari 0). Pengaksesan kata aktif di `<KineticCaptions>` WAJIB menggunakan rumus waktu global:
   ```tsx
   const currentTime = sceneStartTime + frame / fps;
   ```
5. **Caption Pacing Comfort**: Maksimal 5 kata yang ditampilkan sekaligus dengan transisi sorotan halus (`transition: 'all 0.12s ease-in-out'`) agar sangat nyaman dibaca mata.

### 🎬 C. Video Rendering & Master Concatenation Guardrails
1. **Dynamic Remotion Duration**: File `remotion/src/Root.tsx` WAJIB menyertakan `calculateMetadata` membaca `props.totalFrames` agar tidak terpotong di detik 15.
2. **Seamless Master Re-Encoding Concat**: Penggabungan file `.mp4` antar-level wajib menggunakan **FFmpeg Re-Encoding (`-c:v libx264 -preset fast -crf 18`)**. Dilarang menggunakan `-c copy` karena akan menimbulkan lag/gagap 1 detik di titik sambungan level (seperti di detik 1:06 - 1:07).

### 🎥 D. Google Omni Video I2V Living Poster Standard (Pipeline C — LOCKED)
1. **Visual Keyframe Generation**: Menggunakan `cx/gpt-5.4-image` via 9Router atau Google Imagen 3 via Antigravity SDK untuk membuat visual 16:9 newsprint paper-collage.
2. **I2V Video Animation**: Modul `src/omni_video_generator.py` mengirim static image + motion guidance prompt ke Google Omni Video (`models/gemini-omni-flash-preview`), menghasilkan klip video 5s–10s MP4 dengan pergerakan air/debu/kapal yang halus tanpa merusak tekstur 2D kertas.
3. **Remotion Multi-Layer Compositing**:
   - `KenBurnsImage.tsx` memuat `.mp4` via `<OffthreadVideo>` sebagai background dinamis.
   - `LivingSceneOverlay.tsx` merender karakter pengamat di tepi kanal (melambaikan tangan, teropong 12fps stop-motion), riak air di haluan kapal, badai debu, dan radar telemetri berputar 360°.
   - `VoxMotionOverlay.tsx` merender spidol merah melingkari target, jangka sorong pengukur lebar kanal, dan garis rute navigasi bercahaya.

### 📊 E. Nexlev AI Niche Intelligence & Pre-Production Gate (Phase 0 — MANDATORY)
Sebelum masuk ke penulisan naskah atau sintesis suara, setiap topik video WAJIB melewati **Phase 0 Niche Intelligence Gate** menggunakan Nexlev MCP:
1. **Outlier Score Gate ($\ge 2.0\times$)**: Topik harus tervalidasi memiliki video kompetitor / faceless outlier dengan `outlierScore >= 2.0` (memperoleh views minimal 2x lipat dari rata-rata channel mereka) via `faceless_outliers_videos` atau `search_videos`.
2. **Small Channel Breakout Validation**: Cari bukti bahwa channel kecil ($<50\text{k}$ subs) berhasil menembus $>100\text{k}$ views pada topik terkait via `search_viral_videos_small_channels`. Ini membuktikan tingginya *search intent* dan *algorithm appetite* tanpa bergantung pada basis subscriber besar.
3. **Monetization & RPM Target ($\ge \$8-\$25$)**: Utamakan sub-niche dengan estimasi RPM tinggi (Geopolitik, Semikonduktor, Infrastruktur Energi, Komoditas Global) yang tervalidasi via `get_video_rpm` / `search_niche_finder_channels`.
4. **Hook & Chapter Reverse-Engineering**: Gunakan `get_video_transcript` untuk membedah video viral teratas. Ekstrak struktur 30-detik retention hook pertama, pola pergantian konflik per babak, dan data tension points untuk disusun ke dalam 12–15 level manifesto AG-VOX.
5. **High-CTR Packaging Benchmark**: Analisis framing thumbnail dari outlier teratas via `get_similar_thumbnails` atau `search_videos` sebelum mengeksekusi visual prompt hero layer.

---

## 3. History of Iterations & Bug Fixes

| Tanggal / Bug | Akar Masalah (Root Cause) | Solusi & Fix |
| :--- | :--- | :--- |
| **Subtitle Desync di Detik 2 & Terpotong 15s** | `Root.tsx` ter-hardcode `durationInFrames={450}` (15 detik) & regex VTT gagal parsing koma `,` milidetik `edge-tts`. | Menambahkan `calculateMetadata` di `Root.tsx` & update VTT regex ke `[\.,]`. |
| **Gambar Visual Hilang / Canvas Hitam** | Gambar Imagen 3 terpotong atau tertimpa komponen fallback canvas. | Menyiapkan `src/image_generator.py` memuat file Imagen 3 JPG asli 1.1MB full 16:9. |
| **Teks Ke-skip / Melompat** | Cue timestamp VTT memiliki tumpang tindih waktu (overlap). | Implementasi **Monotonic Non-Overlapping Timestamp** di `src/voice_synthesizer.py`. |
| **Desync Kata Panjang di Detik 13 & 14** | Pembagian kata linier linier tidak cocok dengan artikulasi suara, serta `KineticCaptions` memakai frame lokal. | Menggunakan **Phonetic Acoustic Character Weighting** & konversi `currentTime = sceneStartTime + frame/fps`. |
| **Gambar Frame 2, 4, 5, 6 Terlihat Sama** | Hardcoded logic `isChartScene` menimpa gambar Imagen 3 & mapping gambar tidak membedakan frame. | Memperbarui `VoxVideoComposition.tsx` agar Gambar Imagen 3 SELALU menjadi Hero Layer + generate 6 gambar unik via Antigravity SDK. |
| **Lag/Gagap Video di Detik 1:06 - 1:07** | Concat MP4 menggunakan `-c copy` tanpa re-encoding keyframe PTS. | Memperbarui `src/concat_levels.py` dengan re-encoding H.264 CRF 18 seamless stream. |
| **Teks Terasa Kecepetan** | Terlalu banyak kata (6-7 kata) ditampilkan sekaligus dengan animasi kaku. | Menyesuaikan tampilan ke 5 kata kontekstual & animasi `ease-in-out` 0.12s. |
| **Visual Statis (Tanpa Motion Orang/Kapal)** | Gambar hanya menerapkan camera zoom global tanpa motion pada kapal, orang di tepi kanal, riak air, dan grafik kinetik. | Mengimplementasikan **Pipeline C**: Mengintegrasikan `LivingSceneOverlay` (orang melambai, teropong, riak air, badai pasir, radar berputar) + `VoxMotionOverlay` + `KenBurnsImage` `<OffthreadVideo>`. |

---

## 5. 15-Level Master Documentary Standard (Full 15-Minute Pipeline V2)

Untuk proyek dokumenter investigatif 15 Menit (`projects/<project_name>/`), terapkan standar baku berikut:

1. **Struktur Master Blueprint**:
   - **15 Level** (Chapter 1 s/d 15).
   - **5 Scene per Level** = Total **75 Scene** unik.
   - **Word Count Target**: **38 – 48 kata per scene** (~12.0s – 12.5s per scene) untuk menjamin total runtime **900s – 920s (15:00 – 15:20)**.
2. **Audio Synthesis & Millisecond Ground Truth**:
   - Engine: Kokoro-82M v1.0 ONNX (`models/kokoro/kokoro-v1.0.onnx`, voice `am_adam`, speed `1.02`).
   - Format: 48kHz MP3 (`-ar 48000 -b:a 192k`).
   - Durasi fisik MP3 diukur langsung via FFmpeg probe (`get_exact_audio_duration`) untuk mengunci frame Remotion (`Math.round(duration * 30)`).
3. **Hero Visual 8K & Paper Collage Standard (9Router `cx/gpt-5.4-image`)**:
   - Setiap dari 75 scene wajib memiliki 1 gambar hero 16:9 unik.
   - Visual Style Prefix Wajib: `Mixed-media hand-cut PAPER COLLAGE, editorial zine style, torn scissor edges, halftone dots, newspaper clippings, archival maps/technical blueprints, bold electric lime (#00FF66 / #D4FF00), deep void navy (#0B111E), vintage parchment/newsprint cream (#EAE1C8) 16:9 8k`.
4. **Remotion 1080p Concurrency & Memory Cleanup**:
   - Render dilakukan per Level (`level_{i}.mp4`, 1080p @ 30fps, `--concurrency=2`, `--jpeg-quality=85`).
   - Subprocess pada Windows wajib menggunakan `encoding="utf-8", errors="replace"` untuk menangani progress bar spinner Unicode.
   - Cleanup temporary files (`C:\Users\bati-\AppData\Local\Temp\remotion-*`) sebelum render setiap level.
5. **Master Concatenation & Delivery**:
   - Penggabungan 15 level MP4 menggunakan FFmpeg CRF 18 Re-Encoding (`-c:v libx264 -preset fast -crf 18 -c:a aac -b:a 192k`).
   - Target master file size: **~1.5 GB – 2.0 GB**.
   - Export kompresi Telegram: 720p faststart CRF 26 (`~180 MB – 240 MB`).
   - Export YouTube metadata: Markdown lengkap dengan *verified chapter timestamps* yang dihitung dari akumulasi durasi manifest level.

