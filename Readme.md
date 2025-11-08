# Browser Extensions Collection

This repository hosts multiple browser extensions created by **r00tmebaby**. Each extension lives in its own folder (for example `Normaliser/`) and contains a `manifest.json` plus its source files (content scripts, popup UI, icons, etc.). You can clone the repo and load any extension into Chrome in developer mode.

## Current Extensions

- **Normaliser**: Real‑time audio normalizer with vertical parametric EQ and a single peak meter. It now uses `activeTab` + `scripting` to inject code only when you open the popup (no broad host permissions).

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
5. The extension’s icon (e.g. “Audio Normalizer & EQ”) appears in your Chrome toolbar. Click it while audio is playing to let the extension inject into the active tab.

## How it runs without host permissions
- The extension does not declare `host_permissions` or `content_scripts` that auto-inject on every site.
- Instead, it relies on `activeTab` + `scripting` to inject `content.js` into the currently active tab when you open the popup.
- If you navigate or change tabs, open the popup again to re-inject on the new page.

## Updating an Extension
- Make changes to the files inside its folder.
- Return to `chrome://extensions/` and click the **Reload** (↻) button on the extension card.
- Reopen the popup to see changes.

## Troubleshooting
- If the popup shows no activity, interact with the page (play/pause) so the AudioContext is allowed to run.
- Because there are no host permissions, the extension only runs on the tab after you open the popup. Reopen the popup after changing tabs.
- Open DevTools (F12) → Console for the page or the extension popup to inspect errors.

## Contributing
- Create a new folder for your extension with a `manifest.json` and code.
- Document it in `Readme.md` and test via Developer mode.

## License
Unless otherwise stated in a per‑extension folder, assume these extensions are provided "as is" by **r00tmebaby**. Add license details here if you choose a specific license (MIT, GPL, etc.).

---
Feel free to open issues or pull requests for improvements and new extension ideas.
