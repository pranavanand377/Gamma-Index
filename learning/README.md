# 📖 Gamma Index — Learning Guide

Welcome! This folder is your **learning companion** for the Gamma Index project. Every file here explains _what_ was built, _why_ certain decisions were made, and _how_ each piece works — using real industry terminology.

Read these in order for the best learning experience.

---

## 📂 Guide Index

| # | File | What You'll Learn |
|---|------|-------------------|
| 1 | [01-project-setup.md](./01-project-setup.md) | Vite, React, npm, project scaffolding, dev toolchain |
| 2 | [02-tailwind-and-theming.md](./02-tailwind-and-theming.md) | Tailwind CSS, design tokens, utility-first CSS, custom themes |
| 3 | [03-component-architecture.md](./03-component-architecture.md) | React components, file structure, props, composition patterns |
| 4 | [04-navbar-deep-dive.md](./04-navbar-deep-dive.md) | Hooks (useState, useRef, useEffect), event handling, dropdowns, Framer Motion |
| 5 | [05-sidebar-deep-dive.md](./05-sidebar-deep-dive.md) | Data-driven rendering, collapsible UI, layout animations, conditional rendering |

---

## 🧠 How To Use This

1. **Read a guide** → understand the concepts
2. **Open the actual source file** → see the concepts in real code
3. **Experiment** → change something, break it, fix it
4. **Move to the next guide** → each builds on the previous

> 💡 **Tip**: Every time a new feature is added to Gamma Index, a new guide (or update) will be added here. Just say **"Store"** after any feature build.

---

## 🏷️ Terminology Cheat Sheet

| Term | What It Means |
|------|---------------|
| **SPA** | Single-Page Application — the browser loads one HTML page, and JavaScript handles all page transitions |
| **Component** | A reusable, self-contained piece of UI (like a Navbar or Button) |
| **Props** | Data passed from a parent component to a child component |
| **State** | Data that a component manages internally and that triggers re-renders when changed |
| **Hook** | A special React function (starts with `use`) that lets you "hook into" React features like state and lifecycle |
| **JSX** | JavaScript XML — a syntax that lets you write HTML-like code inside JavaScript |
| **Build Tool** | Software (like Vite) that transforms your source code into optimized files browsers can run |
| **HMR** | Hot Module Replacement — updates your app in the browser without a full page reload |
| **Utility-First CSS** | A CSS methodology (Tailwind) where you style by combining small, single-purpose classes |
| **Design Token** | A named value (color, spacing, font) that represents a design decision, used consistently across the app |
