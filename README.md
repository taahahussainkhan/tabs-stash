# TabVault 🗂️⚡

> **High-Performance Cross-Browser Tab Stash & Cloud Synchronization**
> Stash tabs instantly, save up to 95% RAM, organize with multi-criteria filters, and seamlessly synchronize stashes across all your PCs and browsers.

[![AWS Deployed](https://img.shields.io/badge/AWS-Lambda%20%26%20API%20Gateway-FF9900?logo=amazon-aws)](https://aws.amazon.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas%20Cluster-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3%20Universal-4285F4?logo=googlechrome)](https://developer.chrome.com/docs/extensions/mv3/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## ✨ Features

- **⚡ 1-Click Tab Stashing**: Stash all window tabs in under 50ms using keyboard shortcut (`Alt+S`) or popup button.
- **💾 Massive RAM Savings**: Free up gigabytes of memory by converting idle tabs into lightweight stashed session records.
- **☁️ Cross-PC Cloud Sync**: Optional user accounts with delta synchronization (Last-Write-Wins) across multiple PCs (Windows, macOS, Linux).
- **🖥️ Full PC & Device Identity**: Automatically identifies the originating operating system (Windows, macOS, Linux), browser, and window ID with custom PC renaming.
- **📂 Flat "All Tabs" Master View**: View all stashed tabs without session boundaries, grouped dynamically by **Website / Domain**, **Date**, **Device**, or a **Flat List** with batch *"Open All"* actions.
- **📦 Protected Archive System**: Dedicated Archive collection and separate normalized database schema (`archived_sessions`) preventing accidental loss while keeping active workspaces clean.
- **🔍 Multi-Criteria Filtering**: Filter across all sessions and tabs by site/domain (e.g. `instagram.com`, `github.com`), originating PC, and date range.
- **📐 Multi-Directional Parent Card Resizing**: Drag the bottom-right corner (`///`), right edge, or bottom edge of any session card to freely customize its width and height without distorting other cards in the row.
- **🎨 Artistic Editorial Theme**: Matte charcoal surfaces (`#121316`), tactile terracotta accents (`#e05a47`), warm ochre pin badges (`#e5a83b`), custom slim scrollbars, and zero distracting gradients or neon glows.
- **🌐 Universal Cross-Browser Compatibility**: Runs natively on **Chrome, Firefox, Microsoft Edge, Brave, and Safari**.

---

## 🚀 Quick Start & Installation

### Option 1: Load Unpacked in Chromium (Chrome / Edge / Brave)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/taahahussainkhan/tabs-stash.git
   ```
2. Open your browser's extension manager:
   - **Google Chrome**: `chrome://extensions/`
   - **Microsoft Edge**: `edge://extensions/`
   - **Brave Browser**: `brave://extensions/`
3. Toggle ON **Developer mode** in the top right.
4. Click **Load unpacked** and select the `tabs-stash` folder.

### Option 2: Install in Mozilla Firefox
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**.
3. Select `manifest.json` from this repository.

---

## 🏗️ Architecture

```
tab-stash-extension/
├── lib/
│   ├── browser-adapter.js       # Universal WebExtension Promise API normalizer
│   ├── device-manager.js        # OS, platform, and browser detection with PC renaming
│   ├── filter-manager.js        # Multi-criteria filtering, archive views & tab grouping
│   ├── ui-components.js         # Modular session card renderers & multi-directional resizers
│   ├── api-client.js            # JWT client with automatic 401 token refresh & AWS endpoint
│   └── sync-engine.js           # Offline-first delta sync engine with Last-Write-Wins
├── background.js                # Auto-sync worker, session stashing, and periodic alarms
├── popup.html / .css / .js      # Compact quick-access popup with tab views & filter modal
├── dashboard.html / .css / .js  # Full workspace manager with sidebar & grouped tabs view
├── server/                      # Express + TypeScript + Mongoose Backend
│   ├── src/
│   │   ├── controllers/         # Auth and sync controllers
│   │   ├── models/              # Normalized MongoDB models (Session, Archive, User, Token)
│   │   ├── services/            # Delta sync protocol and auth services
│   │   ├── validators/          # Zod request validation schemas
│   │   └── lambda.ts            # AWS Lambda serverless-http handler
├── terraform/                   # Infrastructure as Code (AWS Lambda + HTTP API Gateway)
└── manifest.json                # Universal Manifest V3 specification
```

---

## ☁️ Cloud Backend & Deployment

The backend is built with Express, TypeScript, and MongoDB Atlas, deployed to AWS Lambda via Terraform:

### Local Server Development
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

### AWS Lambda Deployment via Terraform
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Update terraform.tfvars with your MongoDB Atlas URI
terraform init
terraform apply -auto-approve
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Alt + S` | Stash all tabs in current window |
| `Enter` | Save session title edit |
| `Escape` | Cancel session title edit |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
