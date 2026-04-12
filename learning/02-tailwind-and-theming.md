# 02 — Tailwind CSS & The Gamma Green Theme

## What We Did
We installed **Tailwind CSS v3** and created a custom dark-mode theme called **Gamma Green**, built around the color `#10B981` (emerald green), designed to look like a premium media streaming platform.

---

## 🎨 What is Tailwind CSS?

Tailwind is a **utility-first CSS framework**. Instead of writing custom CSS classes:

```css
/* Traditional CSS */
.navbar {
  display: flex;
  align-items: center;
  background-color: #111B18;
  padding: 0 1.5rem;
  height: 4rem;
}
```

You compose small utility classes directly in your HTML/JSX:

```jsx
{/* Tailwind approach */}
<nav className="flex items-center bg-surface-raised px-6 h-16">
```

### Why Utility-First?
| Advantage | Explanation |
|-----------|-------------|
| **No naming** | No more inventing class names like `.navbar-wrapper-inner` |
| **No dead CSS** | Tailwind only generates CSS for classes you actually use |
| **Consistency** | Predefined spacing/color scales prevent random values |
| **Speed** | Write styles without switching between files |
| **Responsive** | Add `md:`, `lg:` prefixes for instant responsive design |

### The Mental Model
Think of Tailwind classes as **CSS properties made into class names**:

| Tailwind Class | CSS Equivalent |
|---------------|----------------|
| `flex` | `display: flex` |
| `items-center` | `align-items: center` |
| `p-4` | `padding: 1rem` |
| `text-sm` | `font-size: 0.875rem` |
| `rounded-xl` | `border-radius: 0.75rem` |
| `bg-red-500` | `background-color: #ef4444` |
| `hover:bg-red-600` | on hover → `background-color: #dc2626` |
| `transition-all` | `transition: all` |
| `duration-200` | `transition-duration: 200ms` |

---

## ⚙️ How Tailwind Is Configured

### Three Config Files

#### 1. `postcss.config.js` — The Pipeline
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```
**PostCSS** is a CSS transformation pipeline. Tailwind runs as a PostCSS plugin that reads your source files, finds Tailwind classes, and generates the actual CSS. **Autoprefixer** adds browser-specific prefixes like `-webkit-` automatically.

#### 2. `tailwind.config.js` — The Theme
This is where we define our custom **design tokens** (colors, fonts, spacing).

#### 3. `src/index.css` — The Entry Point
```css
@tailwind base;       /* Reset styles + CSS custom properties */
@tailwind components; /* Component-level classes */
@tailwind utilities;  /* All utility classes (flex, p-4, text-sm, etc.) */
```
These three `@tailwind` directives tell Tailwind where to inject its generated CSS. Without them, no Tailwind classes work.

---

## 🎨 Design Tokens: The Gamma Green Theme

**Design tokens** are named values that represent design decisions. Instead of using raw hex codes everywhere, we define them once in the config and reference them by name.

### Our Token Categories

#### 1. Brand Colors — `gamma`
A 10-shade scale from light to dark, built around our primary green:

```
gamma-50  ██ #ECFDF5  ← Lightest (subtle backgrounds)
gamma-100 ██ #D1FAE5
gamma-200 ██ #A7F3D0
gamma-300 ██ #6EE7B7
gamma-400 ██ #34D399  ← Used for active states, highlights
gamma-500 ██ #10B981  ← PRIMARY — the hero color
gamma-600 ██ #059669
gamma-700 ██ #047857
gamma-800 ██ #065F46
gamma-900 ██ #064E3B  ← Darkest
```

**Why a 10-shade scale?** Different UI states need different intensities:
- `gamma-500` → buttons, primary actions
- `gamma-400` → active nav items, links
- `gamma-500/10` → subtle background tints (the `/10` means 10% opacity)
- `gamma-800` → hover states on dark backgrounds

#### 2. Surface Colors — `surface`
These define the **layered surfaces** of the dark-mode UI:

```
surface-base    ██ #0B0F0E  ← Page background (deepest)
surface-raised  ██ #111B18  ← Cards, navbar, sidebar
surface-overlay ██ #162420  ← Dropdowns, modals, hovers
surface-border  ██ #1E3A34  ← Borders and dividers
```

**Why separate surface colors?** This implements the **elevation model** — in dark mode, higher elements are _lighter_, not shadowed. Each layer sits "above" the previous one:

```
╔═══════════════════════════╗  ← overlay (#162420) — dropdown
║  ╔═══════════════════╗    ║  
║  ║   Dropdown item   ║    ║  
║  ╚═══════════════════╝    ║  
╚═══════════════════════════╝  
╔═══════════════════════════╗  ← raised (#111B18) — navbar/sidebar
║  Logo    Search    Profile ║  
╚═══════════════════════════╝  
│                             │  ← base (#0B0F0E) — page background
```

#### 3. Text Colors — `text`
```
text-primary   ██ #F0FDF4  ← Main content (near-white with green tint)
text-secondary ██ #94A3A8  ← Supporting text, labels
text-muted     ██ #5E6E6A  ← Placeholder text, disabled items
```

#### 4. Accent Colors
```
accent-pink  ██ #EC4899  ← Favorites, special badges
accent-cyan  ██ #06B6D4  ← Gradient end, secondary highlights
accent-amber ██ #F59E0B  ← Warnings, ratings
```

#### 5. Status Colors (semantic)
```
status-success ██ #22C55E  ← Completed, positive feedback
status-warning ██ #F59E0B  ← Caution, pending
status-error   ██ #EF4444  ← Error, destructive actions, "dropped"
```

---

## 🪄 Custom Utility Classes

In `src/index.css`, we defined custom utilities using Tailwind's `@layer` system:

### `glass` — Glassmorphism Effect
```css
.glass {
  background: rgba(17, 27, 24, 0.7);     /* Semi-transparent dark */
  backdrop-filter: blur(12px);             /* Blur what's behind */
  border: 1px solid rgba(30, 58, 52, 0.5); /* Subtle border */
}
```
**Glassmorphism** is a modern UI trend where elements look like frosted glass — you can partially see through them. Used for overlays and floating elements.

### `glow-green` — Soft Glow Effect
```css
.glow-green {
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.15),
              0 0 60px rgba(16, 185, 129, 0.05);
}
```
Two layered shadows create a soft green aura. The first shadow is tight and visible; the second is wide and almost invisible. Together they create a "radioactive glow" effect.

### `gradient-text` — Green-to-Cyan Text
```css
.gradient-text {
  background: linear-gradient(135deg, #10B981, #06B6D4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```
**How gradient text works:**
1. Apply a gradient as the background
2. Clip the background to the text shape only
3. Make the text fill transparent so the gradient shows through

---

## 📐 Using Tokens in Components

Once defined in `tailwind.config.js`, tokens become Tailwind classes:

```jsx
{/* Using our custom colors */}
<div className="bg-surface-raised">        {/* Custom surface color */}
<p className="text-text-secondary">         {/* Custom text color */}
<button className="bg-gamma-500">           {/* Brand color */}
<span className="text-status-error">        {/* Semantic color */}

{/* Opacity modifier — works with any color */}
<div className="bg-gamma-500/10">           {/* 10% opacity green */}
<div className="border-surface-border/50">  {/* 50% opacity border */}

{/* Responsive + hover */}
<div className="px-4 lg:px-6">             {/* 1rem padding, 1.5rem on large screens */}
<button className="hover:bg-surface-overlay"> {/* Change bg on hover */}
```

---

## 🧪 Try This Yourself

1. Open `tailwind.config.js` and change `gamma-500` to a different color — watch the whole app update
2. In any component, try `className="bg-gamma-500 hover:bg-gamma-600 transition-colors"` — instant interactive button
3. Try responsive prefixes: `className="text-sm md:text-base lg:text-xl"` — resize your browser
4. Experiment with opacity: `bg-gamma-500/20` vs `bg-gamma-500/50` vs `bg-gamma-500`
5. Open browser DevTools → Elements tab → hover over an element → see the Tailwind classes mapped to CSS properties
