# AG-VOX Production Engine Guardrails & Best Practices (VOX-PAKEM.md)

Dokumen ini mencatat seluruh pakem arsitektur, temuan bug, perbaikan, dan standar kualitas (QC/QA/UAT) untuk sistem **AG-VOX Faceless YouTube Documentary Explainer Engine (Vox-Style)**.

---

## 1. Core Production Architecture

### A. Alur Produksi Long-Form Video (12 - 15 Menit)
```
[ Naskah & Script Breakdown ]
             │
             ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 1: TTS Neural 48kHz (Synthesize Text First)         │
 ├──────────────────────────────────────────────────────────┤
 │  • Durasi Suara di-Lock sebagai GROUND TRUTH milidetik  │
 └──────────────────────────────────────────────────────────┘
             │
             ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 2: Google Imagen 3 Visual Asset Generation (SDK)    │
 ├──────────────────────────────────────────────────────────┤
 │  • Set Frame Visual = Full Screen 16:9 (1376x768 / 1080p)│
 │  • Prompting: Paper collage, scissor-cut keyline, newsprint│
 │  • Wajib Unique Visual Asset per Frame (No Reuse Slop)   │
 └──────────────────────────────────────────────────────────┘
             │
             ▼
 ┌──────────────────────────────────────────────────────────┐
 │ STEP 3: Subtitle VTT Word-Level Alignment (Monotonic)    │
 ├──────────────────────────────────────────────────────────┤
 │  • Acoustic Character-Weighted Duration Distribution      │
 │  • Global Time Conversion: `sceneStartTime + frame / fps` │
 │  • Display Context: Max 5 kata kontekstual per baris     │
 └──────────────────────────────────────────────────────────┘
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

---

## 4. Standard QC / QA / UAT Verification Checklist

Sebelum merilis video level atau master documentary, selalu jalankan checklist berikut:
- [x] **TTS Synthesis**: Audio MP4 & VTT file ter-generate lengkap di `public/assets/audio/`.
- [x] **Imagen 3 SDK Assets**: Seluruh frame memiliki file `.png` unik berukuran 1MB+ di `public/assets/images/`.
- [x] **Subtitle Sync Verification**: Uji kecocokan kata visual vs suara narator di frame awal, tengah, dan akhir level.
- [x] **Visual Layer Priority**: Pastikan tidak ada grafik SVG/Canvas yang menutupi gambar Imagen 3.
- [x] **Seamless Video Concat**: Putar sambungan antar-level (misal detik 0:20, 1:06, 1:15) untuk memastikan zero-lag.
