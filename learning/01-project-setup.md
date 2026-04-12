# 01 — Project Setup: Vite + React

## What We Did
We scaffolded (created the initial structure of) a React application using **Vite** as the build tool.

```bash
npm create vite@latest . -- --template react
```

This single command generated a complete, ready-to-develop project with React pre-configured.

---

## 🔧 The Build Tool: Vite

### What is a Build Tool?
Browsers don't understand JSX, modern JavaScript modules, or Tailwind CSS natively. A **build tool** takes your source code and transforms it into something browsers can execute.

### Why Vite? (and not Create React App)
| Feature | Vite | Create React App (CRA) |
|---------|------|------------------------|
| Dev server startup | ~150ms (instant) | 10-30 seconds |
| Hot reload speed | Near-instant | 1-5 seconds |
| Build tool under hood | Rollup + ESBuild | Webpack |
| Industry status (2026) | Standard choice | Deprecated |
| Configuration | Minimal, opt-in | Hidden, hard to customize |

Vite is fast because it serves your source files directly using **native ES modules** during development. It only transforms files on demand — when the browser requests them. CRA bundles _everything_ before the dev server even starts.

### The Vite Config File — `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

**Line by line:**
- `defineConfig()` — A helper that provides TypeScript intellisense, even in `.js` files
- `plugins: [react()]` — Tells Vite to use the React plugin, which enables:
  - **JSX transformation** — converts `<div>` syntax into `React.createElement()` calls
  - **Fast Refresh** — React-specific HMR that preserves component state during edits

---

## 📦 Package Manager: npm

### What is npm?
**npm** (Node Package Manager) is a tool that:
1. Downloads third-party libraries (called **packages** or **dependencies**)
2. Manages versions of those libraries
3. Runs scripts (like `npm run dev`)

### Key Files

#### `package.json` — The Project Manifest
This is the identity card of your project. Here's what ours contains:

```json
{
  "name": "gamma-index",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": { ... },
  "devDependencies": { ... }
}
```

**Key fields explained:**
| Field | Purpose |
|-------|---------|
| `"name"` | Project identifier |
| `"private": true` | Prevents accidentally publishing to npm's public registry |
| `"type": "module"` | Tells Node.js to treat `.js` files as ES modules (allows `import/export` syntax) |
| `"scripts"` | Custom commands you can run with `npm run <name>` |
| `"dependencies"` | Packages needed at **runtime** (shipped to the user's browser) |
| `"devDependencies"` | Packages needed only during **development** (never shipped to users) |

#### `package-lock.json` — Exact Dependency Tree
While `package.json` says "I need React ^19.2.4" (any 19.x version), the lock file pins the _exact_ version installed: "19.2.4". This ensures every developer on the team gets identical packages.

> 🔑 **Rule**: Always commit `package-lock.json` to version control.

#### `node_modules/` — The Installed Packages
This folder contains the actual downloaded code for every dependency. It's often huge (100MB+) and is **never committed to Git** — it's listed in `.gitignore`.

---

## 📁 Our Dependencies Explained

### Runtime Dependencies (`dependencies`)

| Package | What It Does | Why We Need It |
|---------|-------------|----------------|
| `react` | UI library — lets you build interfaces with components | The core of our app |
| `react-dom` | Renders React components into the browser's DOM | Connects React to the webpage |
| `react-router-dom` | Client-side routing (URL → Component mapping) | Navigate between pages without reload |
| `framer-motion` | Animation library for React | Smooth, physics-based animations |
| `lucide-react` | Icon library (SVG icons as React components) | Clean, consistent icons throughout the UI |
| `zustand` | Lightweight global state management | Share state between unrelated components |
| `@tanstack/react-query` | Server state management + caching | Fetch, cache, and sync API data |

### Development Dependencies (`devDependencies`)

| Package | What It Does |
|---------|-------------|
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | React support for Vite (JSX, Fast Refresh) |
| `tailwindcss` | Utility-first CSS framework |
| `postcss` | CSS transformation engine (Tailwind runs as a PostCSS plugin) |
| `autoprefixer` | Adds vendor prefixes (`-webkit-`, `-moz-`) for browser compatibility |
| `eslint` | Code linter — catches bugs and enforces style rules |

---

## 🚀 The Entry Point: How React Boots Up

When you run `npm run dev`, here's the chain of events:

### Step 1: `index.html` (the only HTML file)
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
```
The browser loads this HTML, finds the `<script>` tag, and requests `main.jsx`.

### Step 2: `src/main.jsx` (the JavaScript entry point)
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

**What each line does:**
1. `createRoot(document.getElementById('root'))` — tells React to take control of the `<div id="root">` element
2. `.render(<StrictMode><App /></StrictMode>)` — renders the `App` component into that div
3. `StrictMode` — a development-only wrapper that:
   - Warns about deprecated patterns
   - Double-invokes certain functions to catch side effects
   - Does nothing in production

### Step 3: `src/App.jsx` (the root component)
This is where our actual application begins. Every component we build becomes a descendant of `App`.

---

## 📝 npm Scripts Cheat Sheet

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Create production-optimized build in dist/
npm run preview  # Preview the production build locally
npm run lint     # Check code for errors and style issues
```

---

## 🧪 Try This Yourself

1. Open `src/App.jsx` and change the welcome text — watch HMR update instantly
2. Run `npm run build` and look at the `dist/` folder — that's what gets deployed
3. Open `package.json` and read every dependency — google any you don't recognize
4. Try `npm ls --depth=0` to see all top-level packages installed
