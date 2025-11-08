 
# Universal Accessibility Enhancer (UAE)

A browser extension that makes websites more accessible through customizable text, contrast, and layout adjustments.

![Main](media/main.png)
![Main](media/options1.png)
![Main](media/options2.png)
![Main](media/options3.png)
![Main](media/options4.png)
![Main](media/options5.png)
![Main](media/helper.png)
![Main](media/helper1.png)
![Main](media/helper2.png)

## What It Does

UAE transforms any website to meet your accessibility needs:

- **Adjust Text**: Change font size, line height, and font family (including OpenDyslexic and Atkinson Hyperlegible)
- **Improve Readability**: Easy Read mode simplifies layouts, reduces distractions, and increases spacing
- **Enhance Vision**: Vision Boost increases contrast, High Contrast mode for better visibility
- **Color Filters**: Built-in filters for color blindness (Protanopia, Deuteranopia, Tritanopia, Grayscale)
- **Focus Mode**: Dims distractions and highlights main content
- **Reduce Motion**: Stops animations that can cause discomfort
- **Larger Targets**: Makes buttons and links easier to click

## Problem It Solves

Many websites are difficult to read or navigate for people with:
- **Visual impairments** (small text, low contrast, poor color choices)
- **Dyslexia** (dense paragraphs, unsuitable fonts)
- **ADHD/Focus issues** (distracting elements, animations)
- **Color blindness** (reliance on color alone for information)
- **Light sensitivity** (bright backgrounds, flashing content)

UAE fixes these issues **locally in your browser** without changing the actual website.

## How It Works

1. **Privacy-First**: All changes happen in your browser. No data is collected or sent anywhere.
2. **Instant Preview**: See changes in real-time as you adjust settings
3. **Per-Site Settings**: Save different preferences for different websites
4. **Preset Modes**: Quick presets for Dyslexia, ADHD, and Low Vision
5. **Cross-Browser**: Works on Chrome, Firefox, Edge, and Brave

## Installation

### Quick Start

1. **Clone or download** this repository
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the extension**:
   ```bash
   npm run build:all
   ```

### Load in Your Browser

**Chrome / Edge / Brave:**
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/chrome` folder

**Firefox:**
1. Open `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `build/firefox/manifest.json`

## Features

### Quick Presets
- **Dyslexia Mode**: OpenDyslexic font, increased spacing, Easy Read layout
- **ADHD Mode**: Focus mode, reduced motion, auto-pause media
- **Low Vision Mode**: Large text, high contrast, vision boost

### Manual Controls
- **Text**: Adjust size (80-200%), line height (1.2-2.6), font family
- **Vision**: Vision boost, high contrast mode, color filters
- **Layout**: Easy Read mode, Focus mode, reduce motion
- **Interaction**: Larger click targets, underline all links, enhanced focus outlines
- **Media**: Auto-pause videos, text-to-speech (basic)

### Smart Features
- **Real-time Preview**: See changes instantly as you adjust settings
- **Per-Site Settings**: Save different preferences for each website
- **Keyboard Shortcuts**: 
  - `Alt+Shift+F` - Toggle Focus Mode
  - `Alt+Shift+E` - Toggle Easy Read
  - `Alt+Shift+V` - Toggle Vision Boost

## Usage

1. **Click the extension icon** to open the popup
2. **Try a preset** or adjust individual settings
3. **Changes apply immediately** as a preview
4. **Click "Save Global"** in Options to make permanent
5. Or **click "Save Domain Override"** for site-specific settings

## Privacy & Permissions

**What we need:**
- `storage` - Save your preferences locally
- `activeTab` - Apply changes to current page
- `scripting` - Inject accessibility CSS/JS
- `<all_urls>` - Work on any website you visit

**What we DON'T do:**
- ❌ No tracking
- ❌ No data collection
- ❌ No external servers
- ❌ No analytics

**Everything happens locally in your browser.**

## Testing

The extension includes comprehensive automated tests:

```bash
npm test                        # Unit tests
npm run test:e2e               # End-to-end tests
npm run test:e2e:websites      # Test on 16 real websites
npm run test:e2e:visual        # Visual regression testing
npm run test:e2e:firefox       # Firefox compatibility
npm run test:e2e:performance   # Performance benchmarks
```

## Development

- **Core framework**: Vanilla JavaScript (no dependencies)
- **Cross-browser**: Chrome (MV3) and Firefox (MV2) manifests
- **Fonts**: OpenDyslexic and Atkinson Hyperlegible included
- **Architecture**: Content scripts + background service worker + options page

## Project Structure

```
src/
├── popup/          # Extension popup UI
├── options/        # Options page with all settings
├── content/        # Scripts injected into web pages
├── background/     # Background service worker
├── common/         # Shared utilities
└── assets/         # Icons and fonts
```

## Contributing

This is a personal accessibility project. Contributions welcome for:
- Bug fixes
- Accessibility improvements
- Cross-browser compatibility
- Performance optimizations

## License

MIT License - Free to use and modify

---

**Built with accessibility in mind, for everyone.** 🌍

