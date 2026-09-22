# Lore 📜✨

> **Personal Assistant & All-in-One Life, Media, and Knowledge Platform**  
> *From instant tab preservation to an intelligent companion for what you read, watch, research, and keep.*

[![Manifest V3](https://img.shields.io/badge/Manifest-V3%20Universal-4285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/)
[![Cross-Browser](https://img.shields.io/badge/Browsers-Chrome%20%7C%20Firefox%20%7C%20Edge%20%7C%20Brave-success)](https://github.com/taahahussainkhan/tabs-stash/releases)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20Tailwind-61DAFB?logo=react)](https://react.dev)
[![Node.js & MongoDB](https://img.shields.io/badge/Backend-Express%20%2B%20MongoDB-47A248?logo=mongodb)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🧭 The Story of Lore

**Lore** began with a simple necessity: our browser tabs were out of control, hogging gigabytes of RAM and cluttering our minds. We built a lightning-fast browser extension to stash tabs in milliseconds and sync them across devices.

As our digital routines grew richer, the project expanded into something much deeper: a **personal culture and knowledge sanctuary**. We added deep tracking for the books we read, the authors we admire, the movies and series that inspire us, and the articles we save for quiet evenings.

Today, **Lore** is evolving into a **full personal assistant**—an attentive, quiet guardian that helps you organize your days, recall your thoughts, curate your culture, and keep your place in the world.

---

## ✨ Core Pillars & Features

### ⚡ 1. Tab Stash & Workspace Engine
*Reclaim your focus and memory without losing your digital trail.*

- **1-Click Tab Stashing**: Stash all open browser tabs in under 50ms with a single click or keyboard shortcut (`Alt+Shift+S`).
- **Massive RAM Savings**: Free up to 95% of your browser's memory footprint by turning heavy active tabs into lightweight, indexed records.
- **Directional & Selective Stashing**:
  - Stash all tabs except the current active tab
  - Stash tabs to the right or left
  - Stash all tabs belonging to a specific domain (e.g. `github.com` or `youtube.com`)
- **Reading Shelf (Quick Link Saver)**: Right-click any hyperlink on the web and select *"Save Link to Lore Reading List"* to tuck it away without opening a tab.
- **Multi-PC Device Identity**: Automatically identifies the originating operating system (Windows, macOS, Linux), browser engine, and window ID with support for custom machine renaming.
- **Flat "Master Tabs" View & Archive System**: Browse all tabs outside session boundaries, grouped by domain, date, or device, with protected archiving that prevents accidental deletions.
- **Dynamic Card Resizing**: Drag the bottom-right corner or edges of any session card to adjust width and height to your liking.

---

### 🎬 2. Cinema & TV Series Studio
*A private studio to log, review, and curate everything you watch.*

- **Feature Films Vault**:
  - Track films with director, release year, genre, poster art, personal ratings, and notes
  - Maintain an active Watchlist / Queue for upcoming movie nights
  - Track rewatches and viewing dates
- **Episodic Television & Series Tracker**:
  - Complete multi-season hierarchy with per-episode runtimes and viewing statuses
  - Dedicated states: *Watching*, *Completed*, and *Plan to Watch*
  - Fast progress incrementing directly from the dashboard
- **Documentaries & Mini-Series**:
  - Dedicated archive for educational, nature, historical, and investigative documentaries

---

### 📚 3. Literature & Publication Vault
*An editorial archive for thinkers, collectors, and bibliophiles.*

- **Book Library**:
  - Log reading status (*Currently Reading*, *Finished*, *Wishlist*)
  - Track page counts, publication dates, personal summaries, and quotes
- **Authors & Intellectual Network**:
  - Dedicated author profiles with interactive network graphs showing related authors and genres
- **Publishers & Genres Directory**:
  - Categorize works by presses, imprints, and granular literary genres
- **Periodicals & Magazines**:
  - Track print and digital magazine subscriptions, issues, and archive volumes

---

### 🤖 4. Personal Assistant & Intelligence (Upcoming Roadmap)
*Turning your archive into an intelligent companion.*

- **🌅 Morning & Evening Briefings**: Digest view highlighting saved reading items, current episodes in progress, and daily focus areas.
- **🧠 Proactive Memory Recall**: Conversational queries to find lost links, forgotten book quotes, or which device a tab was stashed on.
- **🔍 Universal Cross-Vault Search**: Search across tabs, books, movies, series notes, and authors from a single command palette (`Ctrl+K`).
- **💡 Smart Culture Recommendations**: Intelligently suggested reading and viewing pairings based on your logged tastes.

---

## 🎨 Design Philosophy: Editorial Minimal

Lore is purposefully designed as an antidote to noisy, gradient-heavy web apps. It feels like fine paper, dark wood, and quiet study rooms:

* **Matte Charcoal Surfaces** (`#121316` / `#1e2026`) — Easy on the eyes for day-and-night use.
* **Tactile Terracotta Accents** (`#e05a47`) — Inspired by red ochre ink used in classical illuminated manuscripts.
* **Warm Ochre Badges** (`#e5a83b`) — Dignified status tags for devices, media types, and edition labels.
* **Sage Green State Dots** (`#38a169`) — Quiet indicators of active sync and completion.
* **Typography** — Clean legibility with [Inter](https://fonts.google.com/specimen/Inter) for reading and [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) for metadata tags.

---

## 🏗️ Architecture & Monorepo Structure

```
lore/
├── extension/             # Manifest V3 Universal Browser Extension
│   ├── manifest.json      # Cross-browser extension configuration
│   ├── popup.html / .js   # Lightweight 1-click stashing popup UI
│   ├── dashboard.html     # Dedicated standalone extension dashboard
│   ├── background.js      # Service worker handling hotkeys & context menus
│   └── lib/               # Modular adapters: sync, device, links, and filters
│
├── frontend/              # Modern React 19 Single-Page Web Application
│   ├── src/
│   │   ├── app/           # Theme engine & global application setup
│   │   ├── features/      # Feature-sliced modules (tabs, books, movies, series, etc.)
│   │   ├── routes/        # Declarative lazy-loaded route configuration
│   │   ├── services/      # Axios & TanStack React Query API integration
│   │   └── shared/        # Reusable editorial UI components, modals, and layouts
│   └── vite.config.ts     # Vite bundler configuration
│
├── server/                # High-Performance Node.js & Express REST API
│   ├── src/
│   │   ├── config/        # Environment and MongoDB connection managers
│   │   ├── controllers/   # Request handlers for sync, media, and auth
│   │   ├── models/        # Mongoose schemas (sessions, books, movies, users)
│   │   ├── routes/        # Express routers with rate-limiting & JWT auth
│   │   └── server.ts      # Main HTTP server entry point
│   └── package.json
│
├── scripts/               # Packaging and build automation scripts
├── terraform/             # AWS Lambda & Serverless infrastructure as code
└── package.json           # Monorepo root workspace configuration
```

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local instance (`mongodb://localhost:27017`) or MongoDB Atlas URI

---

### 1. Clone the Repository
```bash
git clone https://github.com/taahahussainkhan/tabs-stash.git lore
cd lore
```

---

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

---

### 3. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lore
JWT_SECRET=your_super_secret_jwt_key_here
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

### 4. Run Locally (Full Stack)
From the root directory, launch both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)

---

### 5. Install the Browser Extension

You can load the unpacked extension in any Chromium or Firefox browser in under 10 seconds:

#### Chrome / Edge / Brave / Opera:
1. Open your browser and navigate to:
   - **Google Chrome**: `chrome://extensions/`
   - **Microsoft Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the `extension/` folder in this repository.
5. Pin **Lore** to your browser toolbar!

#### Mozilla Firefox:
1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select `extension/manifest.json`.

---

## ⌨️ Keyboard Shortcuts & Quick Actions

| Shortcut | Action | Scope |
| :--- | :--- | :--- |
| `Alt + Shift + S` | Stash all open tabs in active window | Browser-wide |
| `Right-Click Link` → *Save Link to Lore* | Save hyperlink directly to Reading Shelf | Browser-wide |
| `Ctrl + K` / `Cmd + K` | Open Universal Search palette | Web Dashboard |
| `Enter` | Save title or field edit | Web Dashboard |
| `Escape` | Dismiss modal or cancel edit | Web Dashboard |

---

## 📦 Building & Packaging Releases

To create browser-specific distribution zips:

```bash
# Package Chrome zip
node scripts/package-extensions.js chrome

# Package Firefox zip
node scripts/package-extensions.js firefox

# Package all browsers at once
npm run package:all
```
Generated zips will appear in the `releases/` directory ready for sideloading or Web Store submission.

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).
