# 03 — Component Architecture & Project Structure

## What We Did
We organized the project into an **industry-standard folder structure** and built three components: `GammaLogo`, `Navbar`, and `Sidebar`, composed together in `App.jsx` to form the application shell.

---

## 🧱 What is a React Component?

A component is a **reusable, self-contained piece of UI**. It's a JavaScript function that returns JSX (HTML-like syntax).

```jsx
// Simplest possible component
const Greeting = () => {
  return <h1>Hello, World!</h1>;
};
```

### Components Have Two Superpowers:

1. **Composition** — components can contain other components
   ```jsx
   <App>            {/* Parent */}
     <Navbar />     {/* Child */}
     <Sidebar />    {/* Child */}
     <MainContent />{/* Child */}
   </App>
   ```

2. **Props** — data flows from parent to child
   ```jsx
   // Parent passes data down
   <Navbar onMenuToggle={handleToggle} />
   
   // Child receives and uses it
   const Navbar = ({ onMenuToggle }) => {
     return <button onClick={onMenuToggle}>☰</button>;
   };
   ```

---

## 📁 The Folder Structure

```
src/
├── components/
│   ├── common/           ← Shared, reusable across the whole app
│   │   └── GammaLogo.jsx
│   └── layout/           ← Structural components (shell of the app)
│       ├── Navbar.jsx
│       └── Sidebar.jsx
├── assets/               ← Static files (images, fonts, icons)
├── index.css             ← Global styles + Tailwind config
├── main.jsx              ← Entry point — boots React
└── App.jsx               ← Root component — assembles the layout
```

### Why This Structure?

| Folder | Purpose | Example Contents |
|--------|---------|-----------------|
| `components/common/` | UI elements used everywhere | Logo, Button, Modal, Avatar |
| `components/layout/` | Page structure components | Navbar, Sidebar, Footer, PageWrapper |
| `components/features/` | Feature-specific components (future) | AnimeCard, EpisodeTracker, SearchResults |
| `assets/` | Static files | Images, SVGs, fonts |

This follows the **"group by type"** convention — common in industry React projects. As the app grows, you might also add:

```
src/
├── hooks/       ← Custom React hooks (reusable logic)
├── store/       ← Zustand state management
├── pages/       ← Route-level page components
├── services/    ← API call functions
├── utils/       ← Helper functions
└── constants/   ← Shared constant values
```

---

## 🏗️ The App Shell: `App.jsx`

`App.jsx` is the **root component** — the top of the component tree. It defines the overall layout:

```jsx
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="flex flex-col h-screen bg-surface-base">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto p-6">
            {/* Page content goes here */}
          </main>
        </div>
      </div>
    </Router>
  );
}
```

### Layout Anatomy (CSS Flexbox)

```
┌─────────────────────────────────────────────────┐
│  NAVBAR  (flex-col: row 1, fixed height h-16)   │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ SIDEBAR  │         MAIN CONTENT                 │
│ (flex)   │         (flex-1, scrollable)          │
│ (shrink-0)│                                      │
│          │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

**Key CSS concepts at play:**

- `flex flex-col h-screen` — The root is a vertical flexbox taking the full viewport height
- `flex-1` — Fills all remaining space (both the sidebar row and the main content)
- `overflow-hidden` — Prevents the sidebar row from scrolling as a whole
- `overflow-y-auto` — Allows only the main content area to scroll
- `shrink-0` — Prevents the sidebar from shrinking when content is wide

---

## 🔄 State Lifting: The Sidebar Toggle

This is a core React pattern called **"lifting state up"**:

**The Problem:** The Navbar's hamburger button needs to toggle the Sidebar. But Navbar and Sidebar are siblings — they can't directly talk to each other.

**The Solution:** Put the shared state in their common parent (App), and pass it down as props:

```
        App (owns state: sidebarOpen)
       /    \
      /      \
Navbar        Sidebar
(receives     (receives
onMenuToggle)  isOpen)
```

```jsx
// App.jsx — owns the state
const [sidebarOpen, setSidebarOpen] = useState(true);

// Passes a toggle function DOWN to Navbar
<Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

// Passes the current value DOWN to Sidebar
<Sidebar isOpen={sidebarOpen} />
```

This is **unidirectional data flow** — data flows down via props, events flow up via callback functions. This is fundamental to React's architecture.

---

## 🧩 Component Types We Used

### 1. Presentational Components (Dumb Components)
Components that just render UI based on props. No internal logic.

```jsx
// GammaLogo — pure presentation
const GammaLogo = ({ size = 32 }) => (
  <svg width={size} height={size}>
    {/* Just renders SVG — no state, no side effects */}
  </svg>
);
```

### 2. Container Components (Smart Components)
Components that manage state and pass data to children.

```jsx
// Navbar — manages search state, dropdown state, etc.
const Navbar = ({ onMenuToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  // ... manages multiple pieces of internal state
};
```

### 3. Layout Components
Components that define the structural arrangement of the page.

```jsx
// App.jsx — defines the shell layout
<div className="flex flex-col h-screen">
  <Navbar />
  <div className="flex flex-1">
    <Sidebar />
    <main>{/* Content */}</main>
  </div>
</div>
```

---

## 📤 Exports & Imports

Every component file follows this pattern:

```jsx
// 1. Imports at the top
import { useState } from 'react';
import SomeComponent from './SomeComponent';

// 2. Component definition
const MyComponent = ({ someProp }) => {
  return <div>{someProp}</div>;
};

// 3. Default export at the bottom
export default MyComponent;
```

**Default export** (`export default`) means the importing file can name it anything:
```jsx
import Navbar from './Navbar';       // ✅
import TopNav from './Navbar';       // ✅ also works (same component)
import Whatever from './Navbar';     // ✅ any name works
```

**Named export** (`export const`) requires the exact name:
```jsx
export const Navbar = () => { ... };
import { Navbar } from './Navbar';   // ✅ must match
import { TopNav } from './Navbar';   // ❌ error
```

---

## 🧪 Try This Yourself

1. Create a new file `src/components/common/Badge.jsx` — make a simple colored badge component that accepts `text` and `color` props
2. In `App.jsx`, try moving `<Sidebar>` after `<main>` — see how flexbox changes the layout
3. Add a new prop to Sidebar (like `width={300}`) and use it inside the component
4. Open React DevTools in your browser → Components tab → explore the component tree and props
