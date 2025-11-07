# Chrome Extensions Collection

This repository hosts multiple Chrome extensions created by **r00tmebaby**. Each extension lives in its own folder (for example `Normaliser/`) and contains a `manifest.json` plus its source files (content scripts, popup UI, icons, etc.). You can clone the repo and load any extension into Chrome in developer mode.

## Current Extensions

- **Normaliser**: Real‑time audio normalizer with vertical parametric EQ and automatic headroom + peak meter.
- (Add future extensions here) Keep each in its own subfolder with a manifest.

## Folder Structure (example)

```
Youtubenormaliser/
├─ Normaliser/
│  ├─ manifest.json
│  ├─ content.js
│  ├─ popup.html
│  ├─ popup.js
│  ├─ icon.png (optional)
│  └─ Readme.md (extension-specific details)
├─ Readme.md (this file)
└─ ...other extension folders...
```

## Install (Developer mode)

1. Download or clone this repository:
   ```bash
   git clone https://github.com/r00tmebaby/Chrome-Extensions.git
   cd Chrome-Extensions/Youtubenormaliser
   ```
2. Open Chrome and navigate to: `chrome://extensions/` (Menu → More tools → Extensions).
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the extension folder that contains its `manifest.json` (e.g. `Normaliser/`).
5. The extension’s icon (e.g. “Audio Normalizer & EQ”) appears in your Chrome toolbar. Click it while audio is playing in the active tab to open the popup.

## Updating an Extension
- Make changes to the files inside its folder.
- Return to `chrome://extensions/` and click the **Reload** (↻) button on the extension card.
- Reopen the popup to see changes.

## Common Files
- `manifest.json`: Declares extension metadata and permissions.
- `content.js`: Injected into matched pages; implements core logic (e.g. audio chain).
- `popup.html` / `popup.js`: User interface code opened from the browser toolbar.
- `Readme.md`: Optional per-extension documentation.

## Troubleshooting
- If the popup shows no activity, interact (play/pause) with the page; Chrome may suspend the AudioContext until a gesture.
- Confirm the site matches host permissions and/or your allowlist if the extension has one.
- Open DevTools (F12) → Console for the page or the extension popup to inspect errors.

## Contributing / Adding a New Extension
1. Create a new folder (e.g. `MyExtension/`).
2. Add a `manifest.json` (Manifest V3 recommended) plus your scripts and UI.
3. Document the extension in its own `Readme.md` and list it in the **Current Extensions** section above.
4. Test via Developer mode load and verify functionality.

## License
Unless otherwise stated in a per‑extension folder, assume these extensions are provided "as is" by **r00tmebaby**. Add license details here if you choose a specific license (MIT, GPL, etc.).

---
Feel free to open issues or pull requests for improvements and new extension ideas.

