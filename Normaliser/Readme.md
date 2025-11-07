# Normaliser (Chrome Extension)

![Screenshot](normaliser.png)

A simple audio normalizer and equalizer for Chrome that boosts loudness consistently across sites, provides a vertical Winamp-like EQ, and shows live meters.

Features
- Loudness normalization via DynamicsCompressor
- Vertical parametric EQ (±12 dB) with presets and custom presets
- Two meters: Raw (pre‑EQ) and Processed (post‑EQ) with gain reduction (GR)
- Fast/Eco refresh toggle for the meters (100ms / 300ms)
- Apply everywhere or only on an allowlist of sites

Install (Developer mode)
1. Download/clone this repo locally.
2. Open Chrome → More tools → Extensions.
3. Enable “Developer mode” (top-right).
4. Click “Load unpacked” and pick the folder that contains `manifest.json` (the extension root).
5. The “Audio Normalizer & EQ” icon appears in the toolbar.

Usage
- Click the extension icon while audio is playing in the active tab.
- Use the volume slider to boost (post-processing gain).
- Choose a preset or tweak EQ sliders; you can save/delete custom presets.
- Input level meter
- Toggle Fast/Eco refresh to balance responsiveness and CPU usage.
- Settings: Enable/disable, apply to all sites, and manage allowlist.

Notes
- Some sites restrict access to detailed audio data; meters still show peaks using time-domain data.
- For best results, play audio or interact with the page so the AudioContext can run.


