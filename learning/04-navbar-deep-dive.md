# 04 — Navbar Deep Dive: Hooks, Events, Animations

## What We Built
A fully-featured navigation bar with:
- Logo + app name (left)
- Animated search bar (center)
- Notification bell with badge + dropdown (right)
- Profile avatar with dropdown menu (right)

> **Source file:** `src/components/layout/Navbar.jsx`

---

## 🎣 React Hooks Used

### 1. `useState` — Managing Component State

```jsx
const [searchFocused, setSearchFocused] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [profileOpen, setProfileOpen] = useState(false);
const [notifOpen, setNotifOpen] = useState(false);
```

**What is `useState`?**
A hook that gives a component "memory". It returns a pair:
- The **current value** (e.g., `searchFocused`)
- A **setter function** to update it (e.g., `setSearchFocused`)

When you call the setter, React **re-renders** the component with the new value.

```jsx
// Reading state
searchFocused  // → true or false

// Updating state
setSearchFocused(true)   // Triggers re-render
setSearchQuery('naruto') // Triggers re-render
```

**Why four separate useState calls?** Each piece of state is independent. This is the recommended pattern — avoid stuffing unrelated data into one state object.

---

### 2. `useRef` — Persistent References Without Re-renders

```jsx
const profileRef = useRef(null);
const notifRef = useRef(null);
```

**What is `useRef`?**
A hook that creates a mutable reference that persists across re-renders but **does NOT trigger re-renders** when changed.

**Key difference from `useState`:**
| | `useState` | `useRef` |
|--|-----------|---------|
| Triggers re-render on change? | ✅ Yes | ❌ No |
| Persists across re-renders? | ✅ Yes | ✅ Yes |
| Common use | UI state (open/closed, input values) | DOM element references, timers |

**Why we use it here:**
We attach refs to the dropdown container elements so we can check if a click happened _inside_ or _outside_ them:

```jsx
<div ref={profileRef} className="relative">
  {/* dropdown content */}
</div>
```

Now `profileRef.current` points to the actual DOM element.

---

### 3. `useEffect` — Side Effects (Click Outside Detection)

```jsx
useEffect(() => {
  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setProfileOpen(false);
    }
    if (notifRef.current && !notifRef.current.contains(e.target)) {
      setNotifOpen(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

**What is `useEffect`?**
A hook for running **side effects** — code that interacts with things outside React's rendering (DOM events, API calls, timers, etc.).

**Anatomy:**
```jsx
useEffect(() => {
  // 1. SETUP — runs after render
  document.addEventListener('mousedown', handler);
  
  // 2. CLEANUP — runs before unmount (or before next effect)
  return () => document.removeEventListener('mousedown', handler);
}, []);
  // 3. DEPENDENCY ARRAY — when to re-run
  // [] = run once on mount only
  // [someVar] = re-run when someVar changes
  // (no array) = run on every render ← usually a bug
```

**The Click-Outside Pattern (industry standard):**
1. Attach a `mousedown` listener to the entire `document`
2. When any click happens, check: was it inside our dropdown element?
3. `profileRef.current.contains(e.target)` — returns `true` if the clicked element is inside the ref
4. If clicked outside → close the dropdown
5. **Always clean up** — remove the listener when the component unmounts to prevent memory leaks

---

## 🖱️ Event Handling

### Controlled Input (Search Bar)
```jsx
<input
  value={searchQuery}                          // React controls the value
  onChange={(e) => setSearchQuery(e.target.value)} // Update state on every keystroke
  onFocus={() => setSearchFocused(true)}
  onBlur={() => setSearchFocused(false)}
/>
```

This is a **controlled component** — React is the single source of truth for the input's value. Every keystroke:
1. Fires `onChange`
2. Updates `searchQuery` via `setSearchQuery`
3. Triggers re-render
4. Input displays the new value from state

**Contrast with "uncontrolled":** letting the DOM manage the value (via `defaultValue` + refs). Controlled is the React-recommended pattern.

### Toggle Pattern (Dropdowns)
```jsx
<button onClick={() => {
  setNotifOpen(!notifOpen);    // Toggle this dropdown
  setProfileOpen(false);       // Close the other one
}}>
```

When opening one dropdown, we explicitly close the other. This prevents both from being open simultaneously — a common **mutual exclusion** pattern.

---

## 💫 Framer Motion Animations

### Search Bar Scale Animation
```jsx
<motion.div
  animate={{ scale: searchFocused ? 1.02 : 1 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
```

- `motion.div` — A Framer Motion wrapper around a regular `<div>` that enables animation
- `animate` — Target values. When `searchFocused` changes, it smoothly animates to the new scale
- `transition: { type: 'spring' }` — Uses spring physics instead of linear easing. `stiffness` = how snappy, `damping` = how much bounce

### Notification Badge Pop
```jsx
<motion.span
  initial={{ scale: 0 }}    // Start invisible (scaled to 0)
  animate={{ scale: 1 }}    // Pop into view
>
  {unreadCount}
</motion.span>
```

- `initial` — The starting state when the element first mounts
- Creates a satisfying "pop" effect when the badge appears

### Dropdown Enter/Exit
```jsx
<AnimatePresence>
  {notifOpen && (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}   // Start: invisible, shifted down, slightly small
      animate={{ opacity: 1, y: 0, scale: 1 }}       // End: fully visible, normal position
      exit={{ opacity: 0, y: 8, scale: 0.96 }}       // Exit: reverse of enter
      transition={{ duration: 0.15 }}
    >
      {/* dropdown content */}
    </motion.div>
  )}
</AnimatePresence>
```

**`AnimatePresence`** — This is crucial. Normally, when a React element is removed from the DOM (conditional rendering), it disappears instantly. `AnimatePresence` tells Framer Motion to wait — play the `exit` animation first, _then_ remove it from the DOM.

Without `AnimatePresence`: dropdown disappears instantly ❌
With `AnimatePresence`: dropdown fades out smoothly ✅

---

## 🏷️ Conditional Rendering Patterns

### Pattern 1: Short-circuit (`&&`)
```jsx
{searchQuery && (
  <button onClick={() => setSearchQuery('')}>
    <X size={14} />
  </button>
)}
```
If `searchQuery` is truthy (non-empty string), render the clear button. If empty, render nothing. This is the most common conditional rendering pattern in React.

### Pattern 2: Ternary (`? :`)
```jsx
className={searchFocused ? 'text-gamma-400' : 'text-text-muted'}
```
If focused → green icon. If not → muted icon. Used when you need to render one of two options.

### Pattern 3: Logical combinations
```jsx
{!searchFocused && !searchQuery && (
  <kbd>⌘K</kbd>
)}
```
Only show the keyboard shortcut hint when the search bar is NOT focused AND has no query text. Once the user starts interacting, the hint disappears.

---

## ♿ Accessibility (a11y)

### `aria-label`
```jsx
<button aria-label="Toggle sidebar">
  <Menu size={20} />
</button>
```
Screen readers can't see the icon. `aria-label` provides an invisible text label for assistive technology. Every icon-only button needs this.

### Semantic HTML
```jsx
<nav>     {/* Not <div> — tells screen readers "this is navigation" */}
<main>    {/* Not <div> — tells screen readers "this is main content" */}
<button>  {/* Not <div> — keyboard focusable, works with Enter/Space */}
<kbd>     {/* Represents a keyboard key */}
```

Using semantic elements means the app works with keyboards, screen readers, and assistive devices out of the box.

---

## 🎨 UI Patterns & Microinteractions

### Backdrop Blur (Navbar)
```jsx
className="bg-surface-raised/80 backdrop-blur-xl"
```
The navbar background is 80% opaque with a blur effect — content scrolling behind it appears blurred rather than cut off. This is a signature modern UI pattern.

### Hover Transitions
```jsx
className="text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-all duration-200"
```
Every interactive element has:
1. A **default state** (muted appearance)
2. A **hover state** (brighter, with background)
3. A **transition** (smooth 200ms animation between states)

This triad is an industry standard for interactive elements.

### Keyboard Shortcut Hint
```jsx
<kbd className="px-1.5 py-0.5 rounded text-[10px] ...">⌘K</kbd>
```
The `⌘K` visual hint teaches users that a keyboard shortcut exists — a pattern popularized by apps like VS Code, Slack, and Linear.

---

## 🧪 Try This Yourself

1. Change `transition={{ duration: 0.15 }}` on a dropdown to `duration: 0.5` — see the animation slow down
2. Remove `<AnimatePresence>` wrapping a dropdown — notice it no longer has an exit animation
3. Add `console.log('render')` at the top of the Navbar function — see how often it re-renders
4. Try the click-outside behavior — open a dropdown, then click elsewhere
5. In DevTools → Elements, inspect the notification badge — see the Framer Motion inline styles
