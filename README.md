# PhoneSim

A frameless, transparent Electron app that simulates a mobile phone on your desktop. Browse websites, install PWAs to the home screen, and switch between iPhone and Android designs.

![Electron](https://img.shields.io/badge/Electron-41-blue) ![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey)

## Features

- **Phone Designs** — Switch between iPhone 15 and Android phone frames with realistic bezels, notch/punch-hole, and side buttons
- **Built-in Browser** — Full webview browser with URL bar, search (via Google), refresh, and back navigation
- **PWA Detection** — Automatically detects websites with a Web App Manifest and offers an "Add to Home Screen" option
- **Home Screen Apps** — Installed PWAs appear as icons on the home screen and launch in full-screen app mode (no URL bar)
- **Frameless & Transparent** — The app window is the phone itself, no title bar or chrome
- **Draggable** — Grab the top bezel area to move the phone around your screen
- **OS-Accurate UI** — iOS home indicator bar, Android navigation buttons, real-time status bar clock

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)

### Install & Run

```bash
git clone <repo-url>
cd phonesim
npm install
npm start
```

## Usage

### Navigation

- **iOS** — Tap the home indicator bar at the bottom to go home
- **Android** — Use the back, home, and recents navigation buttons
- **Drag** — Click and drag the top bezel area to reposition the phone

### Settings

Tap the **Settings** icon in the dock to switch between phone designs:

- iPhone 15
- Android Phone

### Browser

Tap the **Browser** icon in the dock to open the built-in browser:

- Type a URL or search term in the address bar
- Tap the refresh button to reload the page
- If a site has a PWA manifest, an install banner appears — tap **Add** to pin it to the home screen

### PWA Apps

- PWAs added from the browser appear as icons on the home screen
- Tapping a PWA icon launches it in full-screen mode (no URL bar)
- Long-press an icon to enter edit mode and remove apps

## Project Structure

```
phonesim/
├── main.js                 # Electron main process
├── preload.js              # Context bridge (IPC)
├── package.json
├── renderer/
│   ├── index.html          # Phone UI structure
│   ├── css/
│   │   ├── phone.css       # Phone frame & layout
│   │   ├── statusbar.css   # Status bar icons & clock
│   │   ├── homescreen.css  # App grid, dock, PWA icons
│   │   ├── settings.css    # Settings view
│   │   └── browser.css     # Browser & PWA banner
│   └── js/
│       ├── app.js          # Navigation & design system
│       ├── homescreen.js   # Home screen interactions
│       ├── browser.js      # Webview, PWA detection
│       ├── settings.js     # Settings UI
│       ├── statusbar.js    # Clock updates
│       └── phone-designs.js # Device configurations
```

## License

MIT
