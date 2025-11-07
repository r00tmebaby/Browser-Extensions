# Privacy Policy for Audio Normalizer & EQ (Chrome Extension)

Effective date: November 7, 2025

Audio Normalizer & EQ respects your privacy. This extension does not collect, store, or share any personal information beyond the preferences you explicitly set.

## Data Usage

- The extension operates entirely within your browser using the Web Audio API.
- Audio is processed locally on your device and is never transmitted to any server.
- The extension uses Chrome storage only to save user preferences such as:
  - Equalizer presets
  - Loudness/normalization options
  - Site allowlist preferences
- Preferences are stored using `chrome.storage.local` and/or `chrome.storage.sync` for convenience across devices. This data remains under your browser profile and is not shared with third parties by the extension.

## Permissions

- `scripting` and `activeTab` are used to apply audio processing to the current active tab only when you interact with the extension.
- `<all_urls>` host permission allows the extension to work on any website where audio plays. The extension does not read or modify webpage content; it only attaches audio processing nodes to the page’s media elements.
- `storage` is used to persist your settings (presets, allowlist, and options).

## Third Parties

- This extension does not use third‑party analytics, tracking, or advertising services.
- The extension does not communicate with external servers.

## Your Consent

By using the extension, you consent to this privacy policy.

## Changes to This Policy

We may update this policy from time to time. If changes are made, the effective date above will be updated accordingly.

## Contact

If you have questions about this policy, please open an issue on the GitHub repository:

- https://github.com/r00tmebaby/Chrome-Extensions/tree/master/Normaliser
