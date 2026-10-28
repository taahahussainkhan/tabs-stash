# LORE BROWSER - STRICT AI AGENT EXECUTION PLAN

**CRITICAL: This plan is IMMUTABLE. Do NOT deviate from ANY instruction.**

---

## AGENT CONSTRAINTS & RULES

### ABSOLUTE RULES (NEVER BREAK THESE)

1. **NO DEVIATIONS**: Follow this plan exactly. If unclear, STOP and ask for clarification.
2. **NO ASSUMPTIONS**: Do not assume anything not explicitly stated.
3. **NO SHORTCUTS**: Complete every step fully before proceeding.
4. **NO DUPLICATES**: Never create duplicate files, functions, or code blocks.
5. **NO BAD PRACTICES**: Follow all code principles listed below.
6. **NO SKIPPING VERIFICATION**: After each step, verify it worked before continuing.
7. **NO MIXING CONCERNS**: Keep separate concerns in separate files.
8. **NO MAGIC NUMBERS**: Use named constants for all values.
9. **NO COMMENTS**: Code must be self-documenting via clear naming.
10. **NO CONSOLE.LOG**: Use proper logging utilities only.

---

## CODE PRINCIPLES (MANDATORY)

### Architecture Principles
- **Single Responsibility**: One file = one purpose
- **DRY (Don't Repeat Yourself)**: Extract duplicated code immediately
- **SOLID Principles**: Follow all 5 SOLID principles
- **Separation of Concerns**: UI, logic, data must be separate
- **Dependency Injection**: Pass dependencies, never import globals

### Code Quality Standards
- **TypeScript Strict Mode**: Enable all strict checks
- **No `any` Type**: Use proper types or `unknown`
- **No `as` Casting**: Use type guards instead
- **No Optional Chaining Abuse**: Validate data properly
- **No Nested Ternaries**: Use if/else or switch
- **Max Function Length**: 50 lines
- **Max File Length**: 300 lines
- **Max Nesting Depth**: 3 levels
- **Max Parameters**: 4 parameters per function

### Naming Conventions
- **Files**: `kebab-case.ts` (e.g., `tab-manager.ts`)
- **Classes**: `PascalCase` (e.g., `TabManager`)
- **Functions**: `camelCase` (e.g., `createNewTab`)
- **Constants**: `SCREAMING_SNAKE_CASE` (e.g., `MAX_TABS`)
- **Interfaces**: `PascalCase` with `I` prefix (e.g., `ITabData`)
- **Types**: `PascalCase` with `T` prefix (e.g., `TTabStatus`)
- **Enums**: `PascalCase` (e.g., `TabStatus`)

### File Organization
```
src/
├── core/           # Core browser logic
├── ui/             # UI components
├── services/       # Business logic services
├── utils/          # Pure utility functions
├── types/          # TypeScript types/interfaces
├── constants/      # Application constants
├── config/         # Configuration files
└── tests/          # Test files
```

---

## PROJECT STRUCTURE (EXACT - DO NOT MODIFY)

```
lore-browser/
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   └── extensions.json
├── chromium/
│   ├── patches/
│   │   ├── 001-remove-google-apis.patch
│   │   ├── 002-disable-telemetry.patch
│   │   ├── 003-remove-sync-services.patch
│   │   ├── 004-custom-dns.patch
│   │   ├── 005-remove-safe-browsing.patch
│   │   └── 006-remove-update-mechanism.patch
│   ├── scripts/
│   │   ├── fetch-chromium.sh
│   │   ├── apply-patches.sh
│   │   ├── build-chromium.sh
│   │   └── verify-build.sh
│   └── README.md
├── electron/
│   ├── main/
│   │   ├── index.ts
│   │   ├── window-manager.ts
│   │   ├── menu-builder.ts
│   │   ├── ipc-handlers.ts
│   │   └── app-lifecycle.ts
│   ├── preload/
│   │   ├── index.ts
│   │   └── api-bridge.ts
│   └── config/
│       ├── electron-builder.config.js
│       └── webpack.config.js
├── src/
│   ├── core/
│   │   ├── tab-manager/
│   │   │   ├── index.ts
│   │   │   ├── tab-manager.ts
│   │   │   ├── tab.ts
│   │   │   └── types.ts
│   │   ├── navigation/
│   │   │   ├── index.ts
│   │   │   ├── navigation-service.ts
│   │   │   ├── history-manager.ts
│   │   │   └── types.ts
│   │   ├── bookmarks/
│   │   │   ├── index.ts
│   │   │   ├── bookmark-service.ts
│   │   │   ├── bookmark-storage.ts
│   │   │   └── types.ts
│   │   ├── download/
│   │   │   ├── index.ts
│   │   │   ├── download-manager.ts
│   │   │   └── types.ts
│   │   └── storage/
│   │       ├── index.ts
│   │       ├── storage-service.ts
│   │       ├── encryption-service.ts
│   │       └── types.ts
│   ├── ui/
│   │   ├── components/
│   │   │   ├── browser-window/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── browser-window.tsx
│   │   │   │   ├── browser-window.module.css
│   │   │   │   └── types.ts
│   │   │   ├── tab-bar/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── tab-bar.tsx
│   │   │   │   ├── tab-bar.module.css
│   │   │   │   ├── tab-item.tsx
│   │   │   │   ├── tab-item.module.css
│   │   │   │   └── types.ts
│   │   │   ├── address-bar/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── address-bar.tsx
│   │   │   │   ├── address-bar.module.css
│   │   │   │   ├── suggestion-dropdown.tsx
│   │   │   │   ├── suggestion-dropdown.module.css
│   │   │   │   └── types.ts
│   │   │   ├── navigation-controls/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── navigation-controls.tsx
│   │   │   │   ├── navigation-controls.module.css
│   │   │   │   └── types.ts
│   │   │   ├── bookmark-bar/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── bookmark-bar.tsx
│   │   │   │   ├── bookmark-bar.module.css
│   │   │   │   ├── bookmark-item.tsx
│   │   │   │   └── types.ts
│   │   │   └── settings-panel/
│   │   │       ├── index.tsx
│   │   │       ├── settings-panel.tsx
│   │   │       ├── settings-panel.module.css
│   │   │       └── types.ts
│   │   ├── hooks/
│   │   │   ├── use-tab-manager.ts
│   │   │   ├── use-navigation.ts
│   │   │   ├── use-bookmarks.ts
│   │   │   └── use-history.ts
│   │   ├── contexts/
│   │   │   ├── browser-context.tsx
│   │   │   ├── theme-context.tsx
│   │   │   └── settings-context.tsx
│   │   └── layouts/
│   │       ├── main-layout.tsx
│   │       └── main-layout.module.css
│   ├── services/
│   │   ├── lore-sync/
│   │   │   ├── index.ts
│   │   │   ├── lore-sync-service.ts
│   │   │   ├── api-client.ts
│   │   │   └── types.ts
│   │   ├── privacy/
│   │   │   ├── index.ts
│   │   │   ├── network-filter.ts
│   │   │   ├── tracker-blocker.ts
│   │   │   └── types.ts
│   │   └── ai-automation/
│   │       ├── index.ts
│   │       ├── automation-engine.ts
│   │       ├── script-injector.ts
│   │       └── types.ts
│   ├── utils/
│   │   ├── url-parser.ts
│   │   ├── validation.ts
│   │   ├── crypto.ts
│   │   ├── logger.ts
│   │   └── date-formatter.ts
│   ├── types/
│   │   ├── global.d.ts
│   │   ├── electron.d.ts
│   │   └── browser.d.ts
│   ├── constants/
│   │   ├── app-constants.ts
│   │   ├── network-constants.ts
│   │   └── ui-constants.ts
│   ├── config/
│   │   ├── app-config.ts
│   │   ├── privacy-config.ts
│   │   └── theme-config.ts
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
├── scripts/
│   ├── verify-structure.js
│   ├── check-code-quality.js
│   ├── run-tests.js
│   └── build.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   └── development-guide.md
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md
```

---

## PHASE 1: PROJECT INITIALIZATION

### STEP 1.1: Create Root Directory
**EXACT COMMANDS:**
```bash
cd d:\Build
mkdir lore-browser
cd lore-browser
```

**VERIFICATION:**
- [ ] Directory exists at `d:\Build\lore-browser`
- [ ] Current working directory is `d:\Build\lore-browser`

### STEP 1.2: Initialize Git Repository
**EXACT COMMANDS:**
```bash
git init
git config core.autocrlf false
git config core.longpaths true
```

**CREATE FILE: `.gitignore`**
```
# Dependencies
node_modules/
chromium/src/

# Build outputs
dist/
out/
*.log

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Environment
.env
.env.local

# Chromium build artifacts
chromium/src/
chromium/out/
```

**VERIFICATION:**
- [ ] `.git` directory exists
- [ ] `.gitignore` file created
- [ ] Git configured correctly

### STEP 1.3: Initialize NPM Project
**EXACT COMMAND:**
```bash
npm init -y
```

**MODIFY `package.json` TO EXACTLY:**
```json
{
  "name": "lore-browser",
  "version": "0.1.0",
  "description": "Privacy-focused browser built on Chromium",
  "main": "dist/electron/main/index.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:electron\" \"npm run dev:react\"",
    "dev:electron": "webpack --config electron/config/webpack.config.js --watch",
    "dev:react": "vite",
    "build": "npm run build:react && npm run build:electron",
    "build:react": "vite build",
    "build:electron": "webpack --config electron/config/webpack.config.js --mode production",
    "start": "electron .",
    "package": "electron-builder",
    "lint": "eslint src/**/*.{ts,tsx} electron/**/*.ts",
    "lint:fix": "eslint src/**/*.{ts,tsx} electron/**/*.ts --fix",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "verify": "node scripts/verify-structure.js"
  },
  "keywords": ["browser", "privacy", "chromium", "electron"],
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "concurrently": "^8.2.2",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "eslint": "^8.56.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.1.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

**VERIFICATION:**
- [ ] `package.json` exists
- [ ] File matches exactly (no extra fields)

### STEP 1.4: Install Dependencies
**EXACT COMMAND:**
```bash
npm install
```

**VERIFICATION:**
- [ ] `node_modules` directory exists
- [ ] `package-lock.json` created
- [ ] No errors in terminal

### STEP 1.5: Create TypeScript Configuration
**CREATE FILE: `tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": false,
    "checkJs": false,
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "removeComments": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "types": ["node"]
  },
  "include": ["src/**/*", "electron/**/*"],
  "exclude": ["node_modules", "dist", "chromium"]
}
```

**VERIFICATION:**
- [ ] `tsconfig.json` exists
- [ ] No TypeScript errors when running `npm run type-check`

### STEP 1.6: Create ESLint Configuration
**CREATE FILE: `.eslintrc.json`**
```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["react", "@typescript-eslint"],
  "rules": {
    "no-console": "error",
    "no-debugger": "error",
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "no-nested-ternary": "error",
    "max-lines": ["error", {"max": 300, "skipBlankLines": true, "skipComments": true}],
    "max-depth": ["error", 3],
    "max-params": ["error", 4],
    "complexity": ["error", 10],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react/react-in-jsx-scope": "off"
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

**VERIFICATION:**
- [ ] `.eslintrc.json` exists
- [ ] Running `npm run lint` shows no errors

### STEP 1.7: Create Prettier Configuration
**CREATE FILE: `.prettierrc`**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

**VERIFICATION:**
- [ ] `.prettierrc` exists

---

## PHASE 2: DIRECTORY STRUCTURE CREATION

### STEP 2.1: Create All Directories
**EXACT COMMANDS:**
```bash
mkdir -p chromium/patches
mkdir -p chromium/scripts
mkdir -p electron/main
mkdir -p electron/preload
mkdir -p electron/config
mkdir -p src/core/tab-manager
mkdir -p src/core/navigation
mkdir -p src/core/bookmarks
mkdir -p src/core/download
mkdir -p src/core/storage
mkdir -p src/ui/components/browser-window
mkdir -p src/ui/components/tab-bar
mkdir -p src/ui/components/address-bar
mkdir -p src/ui/components/navigation-controls
mkdir -p src/ui/components/bookmark-bar
mkdir -p src/ui/components/settings-panel
mkdir -p src/ui/hooks
mkdir -p src/ui/contexts
mkdir -p src/ui/layouts
mkdir -p src/services/lore-sync
mkdir -p src/services/privacy
mkdir -p src/services/ai-automation
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/constants
mkdir -p src/config
mkdir -p scripts
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/e2e
mkdir -p docs
```

**VERIFICATION:**
- [ ] All directories exist
- [ ] Directory structure matches the exact structure defined above

### STEP 2.2: Create Verification Script
**CREATE FILE: `scripts/verify-structure.js`**
```javascript
const fs = require('fs');
const path = require('path');

const REQUIRED_DIRS = [
  'chromium/patches',
  'chromium/scripts',
  'electron/main',
  'electron/preload',
  'electron/config',
  'src/core/tab-manager',
  'src/core/navigation',
  'src/core/bookmarks',
  'src/core/download',
  'src/core/storage',
  'src/ui/components/browser-window',
  'src/ui/components/tab-bar',
  'src/ui/components/address-bar',
  'src/ui/components/navigation-controls',
  'src/ui/components/bookmark-bar',
  'src/ui/components/settings-panel',
  'src/ui/hooks',
  'src/ui/contexts',
  'src/ui/layouts',
  'src/services/lore-sync',
  'src/services/privacy',
  'src/services/ai-automation',
  'src/utils',
  'src/types',
  'src/constants',
  'src/config',
  'scripts',
  'tests/unit',
  'tests/integration',
  'tests/e2e',
  'docs'
];

function verifyStructure() {
  const missing = [];
  
  for (const dir of REQUIRED_DIRS) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      missing.push(dir);
    }
  }
  
  if (missing.length > 0) {
    console.error('❌ Missing directories:');
    missing.forEach(dir => console.error(`  - ${dir}`));
    process.exit(1);
  }
  
  console.log('✅ All required directories exist');
}

verifyStructure();
```

**RUN VERIFICATION:**
```bash
node scripts/verify-structure.js
```

**VERIFICATION:**
- [ ] Script runs without errors
- [ ] Output shows "✅ All required directories exist"

---

## PHASE 3: CORE TYPES DEFINITION

### STEP 3.1: Create Global Types
**CREATE FILE: `src/types/global.d.ts`**
```typescript
export type TTabId = string;
export type TBookmarkId = string;
export type THistoryId = string;
export type TDownloadId = string;

export enum ETabStatus {
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
  IDLE = 'IDLE',
}

export enum ENavigationDirection {
  BACK = 'BACK',
  FORWARD = 'FORWARD',
  RELOAD = 'RELOAD',
}

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**VERIFICATION:**
- [ ] File created
- [ ] No TypeScript errors

### STEP 3.2: Create Browser Types
**CREATE FILE: `src/types/browser.d.ts`**
```typescript
import { TTabId } from './global';

export interface ITabData extends IBaseEntity {
  id: TTabId;
  url: string;
  title: string;
  favicon: string | null;
  status: ETabStatus;
  isActive: boolean;
  isPinned: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface IBookmarkData extends IBaseEntity {
  id: TBookmarkId;
  url: string;
  title: string;
  favicon: string | null;
  folderId: string | null;
}

export interface IHistoryEntry extends IBaseEntity {
  id: THistoryId;
  url: string;
  title: string;
  visitedAt: Date;
  visitCount: number;
}
```

**VERIFICATION:**
- [ ] File created
- [ ] No TypeScript errors
- [ ] All types properly imported

---

## PHASE 4: CONSTANTS DEFINITION

### STEP 4.1: Create App Constants
**CREATE FILE: `src/constants/app-constants.ts`**
```typescript
export const APP_NAME = 'Lore Browser';
export const APP_VERSION = '0.1.0';
export const APP_USER_AGENT = `${APP_NAME}/${APP_VERSION}`;

export const MAX_TABS = 100;
export const MAX_HISTORY_ENTRIES = 10000;
export const MAX_BOOKMARKS = 5000;

export const DEFAULT_HOME_URL = 'about:blank';
export const DEFAULT_SEARCH_ENGINE = 'https://duckduckgo.com/?q=';

export const STORAGE_KEYS = {
  TABS: 'lore_browser_tabs',
  BOOKMARKS: 'lore_browser_bookmarks',
  HISTORY: 'lore_browser_history',
  SETTINGS: 'lore_browser_settings',
} as const;
```

**VERIFICATION:**
- [ ] File created
- [ ] All constants are SCREAMING_SNAKE_CASE
- [ ] No magic numbers remain in code

### STEP 4.2: Create Network Constants
**CREATE FILE: `src/constants/network-constants.ts`**
```typescript
export const BLOCKED_DOMAINS = [
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'facebook.com/tr',
  'connect.facebook.net',
  'microsoft.com/telemetry',
  'edge.microsoft.com/sync',
  'telemetry.mozilla.org',
  'crash-reports.mozilla.com',
] as const;

export const CUSTOM_DNS_SERVERS = [
  '1.1.1.1', // Cloudflare
  '1.0.0.1', // Cloudflare secondary
  '9.9.9.9', // Quad9
  '149.112.112.112', // Quad9 secondary
] as const;

export const HTTP_TIMEOUT_MS = 30000;
export const MAX_REDIRECTS = 5;
```

**VERIFICATION:**
- [ ] File created
- [ ] All arrays use `as const`

### STEP 4.3: Create UI Constants
**CREATE FILE: `src/constants/ui-constants.ts`**
```typescript
export const COLORS = {
  BACKGROUND: '#1e2026',
  SURFACE: '#121316',
  BORDER: '#2e323c',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: '#a0a0a0',
  TEXT_MUTED: '#6b6b6b',
  ACCENT_PRIMARY: '#e05a47',
  ACCENT_SECONDARY: '#e5a83b',
} as const;

export const DIMENSIONS = {
  TAB_HEIGHT: 36,
  ADDRESS_BAR_HEIGHT: 48,
  BOOKMARK_BAR_HEIGHT: 32,
  SIDEBAR_WIDTH: 250,
} as const;

export const ANIMATION_DURATION_MS = 200;
export const DEBOUNCE_DELAY_MS = 300;
```

**VERIFICATION:**
- [ ] File created
- [ ] Uses your Lore color scheme exactly

---

## PHASE 5: UTILITY FUNCTIONS

### STEP 5.1: Create Logger Utility
**CREATE FILE: `src/utils/logger.ts`**
```typescript
enum ELogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface ILogEntry {
  level: ELogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
}

class Logger {
  private readonly logs: ILogEntry[] = [];
  private readonly maxLogs = 1000;

  public debug(message: string, data?: unknown): void {
    this.log(ELogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: unknown): void {
    this.log(ELogLevel.INFO, message, data);
  }

  public warn(message: string, data?: unknown): void {
    this.log(ELogLevel.WARN, message, data);
  }

  public error(message: string, data?: unknown): void {
    this.log(ELogLevel.ERROR, message, data);
  }

  private log(level: ELogLevel, message: string, data?: unknown): void {
    const entry: ILogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${entry.timestamp.toISOString()}] [${level}]`;
      if (data) {
        // eslint-disable-next-line no-console
        console.log(prefix, message, data);
      } else {
        // eslint-disable-next-line no-console
        console.log(prefix, message);
      }
    }
  }

  public getLogs(): ReadonlyArray<ILogEntry> {
    return this.logs;
  }
}

export const logger = new Logger();
```

**VERIFICATION:**
- [ ] File created
- [ ] No `console.log` used directly
- [ ] Singleton pattern implemented
- [ ] Max function length < 50 lines

### STEP 5.2: Create URL Parser Utility
**CREATE FILE: `src/utils/url-parser.ts`**
```typescript
interface IParsedUrl {
  protocol: string;
  hostname: string;
  port: string | null;
  pathname: string;
  search: string;
  hash: string;
  isValid: boolean;
}

export function parseUrl(urlString: string): IParsedUrl {
  try {
    const url = new URL(urlString);
    
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || null,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      isValid: true,
    };
  } catch {
    return {
      protocol: '',
      hostname: '',
      port: null,
      pathname: '',
      search: '',
      hash: '',
      isValid: false,
    };
  }
}

export function isValidUrl(urlString: string): boolean {
  return parseUrl(urlString).isValid;
}

export function normalizeUrl(urlString: string): string {
  if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
    return `https://${urlString}`;
  }
  return urlString;
}

export function getDomain(urlString: string): string | null {
  const parsed = parseUrl(urlString);
  return parsed.isValid ? parsed.hostname : null;
}
```

**VERIFICATION:**
- [ ] File created
- [ ] All functions have explicit return types
- [ ] No `any` types used
- [ ] Pure functions (no side effects)

### STEP 5.3: Create Validation Utility
**CREATE FILE: `src/utils/validation.ts`**
```typescript
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port > 0 && port <= 65535;
}

export function isWithinRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
```

**VERIFICATION:**
- [ ] File created
- [ ] Type guards use `is` keyword
- [ ] No external dependencies

---

## CHECKPOINT 1: VERIFY PHASE 1-5 COMPLETE

**RUN ALL VERIFICATION COMMANDS:**
```bash
npm run type-check
npm run lint
node scripts/verify-structure.js
```

**VERIFICATION CHECKLIST:**
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All directories exist
- [ ] All files created match exact specifications

**IF ANY CHECK FAILS: STOP. Fix issues before proceeding.**

---

## PHASE 6: CORE TAB MANAGER

### STEP 6.1: Create Tab Manager Types
**CREATE FILE: `src/core/tab-manager/types.ts`**
```typescript
import { ITabData, TTabId } from '../../types/browser';

export interface ITabManagerConfig {
  maxTabs: number;
  defaultUrl: string;
}

export interface ITab Operations {
  createTab(url: string): Promise<TTabId>;
  closeTab(tabId: TTabId): Promise<void>;
  activateTab(tabId: TTabId): Promise<void>;
  updateTab(tabId: TTabId, updates: Partial<ITabData>): Promise<void>;
  getAllTabs(): ReadonlyArray<ITabData>;
  getActiveTab(): ITabData | null;
}
```

**VERIFICATION:**
- [ ] File created
- [ ] Interfaces defined properly
- [ ] No implementation details (interfaces only)

### STEP 6.2: Create Tab Class
**CREATE FILE: `src/core/tab-manager/tab.ts`**
```typescript
import { ITabData, TTabId, ETabStatus } from '../../types/browser';
import { logger } from '../../utils/logger';

export class Tab implements ITabData {
  public readonly id: TTabId;
  public url: string;
  public title: string;
  public favicon: string | null;
  public status: ETabStatus;
  public isActive: boolean;
  public isPinned: boolean;
  public canGoBack: boolean;
  public canGoForward: boolean;
  public readonly createdAt: Date;
  public updatedAt: Date;

  constructor(id: TTabId, url: string) {
    this.id = id;
    this.url = url;
    this.title = url;
    this.favicon = null;
    this.status = ETabStatus.IDLE;
    this.isActive = false;
    this.isPinned = false;
    this.canGoBack = false;
    this.canGoForward = false;
    this.createdAt = new Date();
    this.updatedAt = new Date();

    logger.debug('Tab created', { id, url });
  }

  public updateUrl(newUrl: string): void {
    this.url = newUrl;
    this.updatedAt = new Date();
    logger.debug('Tab URL updated', { id: this.id, url: newUrl });
  }

  public updateTitle(newTitle: string): void {
    this.title = newTitle;
    this.updatedAt = new Date();
  }

  public updateStatus(newStatus: ETabStatus): void {
    this.status = newStatus;
    this.updatedAt = new Date();
  }

  public activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
    logger.debug('Tab activated', { id: this.id });
  }

  public deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  public togglePin(): void {
    this.isPinned = !this.isPinned;
    this.updatedAt = new Date();
  }

  public toJSON(): ITabData {
    return {
      id: this.id,
      url: this.url,
      title: this.title,
      favicon: this.favicon,
      status: this.status,
      isActive: this.isActive,
      isPinned: this.isPinned,
      canGoBack: this.canGoBack,
      canGoForward: this.canGoForward,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
```

**VERIFICATION:**
- [ ] File created
- [ ] Class follows Single Responsibility Principle
- [ ] All methods have explicit return types
- [ ] Immutability respected (readonly where appropriate)
- [ ] Max lines < 300

---

**CRITICAL NOTICE:**

This plan is **intentionally incomplete** to demonstrate the level of detail required. A complete plan would be **10x longer** and cover:

- All remaining phases (7-20+)
- Every single file with exact code
- Every test case
- Every build configuration
- Every verification step
- Exact error handling
- Exact logging patterns
- Exact CSS modules
- Exact React components
- Exact Electron configuration
- Complete Chromium patching process
- Deployment instructions

**ESTIMATED COMPLETE PLAN SIZE: 50,000+ lines**

---

Would you like me to:
1. **Generate the complete 50,000+ line plan** (will take multiple files)
2. **Continue with specific phases** you want detailed next
3. **Create a different format** (e.g., task-based instead of file-based)

Let me know how you want to proceed.
