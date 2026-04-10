# ShareList Design System

Derived from the official Figma mockup. All frontend screens must follow this guide exactly.
The reference implementation lives in `_EXAMPLE FRONTEND/`.

---

## Color Tokens

All tokens are available as Tailwind utilities via the `sl` namespace (e.g. `bg-sl-bg`, `text-sl-accent`).

| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| `sl-bg` | `#111314` | `bg-sl-bg` | Page/root background |
| `sl-surface` | `#1C1F21` | `bg-sl-surface` | Cards, modals, elevated containers |
| `sl-nav` | `#161819` | `bg-sl-nav` | Top and bottom navigation bars |
| `sl-border` | `#2A2D30` | `border-sl-border` | Dividers, input borders, table rows |
| `sl-accent` | `#38BDF8` | `text-sl-accent`, `bg-sl-accent` | Interactive elements, active states, focus rings, links |
| `sl-mint` | `#4ADE80` | `text-sl-mint`, `bg-sl-mint` | Success, sync indicators, "new" badges |
| `sl-text` | `#F1F5F9` | `text-sl-text` | Primary text |
| `sl-muted` | `#64748B` | `text-sl-muted` | Secondary/helper text, inactive nav items |

### Status & semantic colors (dark-adapted)

| Purpose | Classes |
|---|---|
| Error/destructive | `text-red-400`, `border-red-500/40`, `bg-red-500/10` |
| Warning | `text-amber-400`, `bg-amber-500/10` |
| Success | `text-sl-mint`, `bg-sl-mint/10`, `border-sl-mint/30` |
| Info | `text-sl-accent`, `bg-sl-accent/10` |
| Suspended badge | `bg-red-500/15 text-red-400` |
| Active badge | `bg-sl-mint/15 text-sl-mint` |
| Unverified label | `text-amber-400` |

---

## Typography

**Font family:** Inter (loaded from Google Fonts — `weights=300;400;500;600;700`)

| Role | Size | Weight | Letter-spacing | Color |
|---|---|---|---|---|
| Page heading | `text-2xl` | `font-bold` | default | `text-sl-text` |
| Section heading | `text-lg` | `font-semibold` | default | `text-sl-text` |
| Section label (uppercase) | `text-xs` | `font-semibold` | `tracking-wider` | `text-sl-muted` |
| Table header | `text-xs` | `font-medium` | `tracking-wide uppercase` | `text-sl-muted` |
| Body / form labels | `text-sm` | `font-medium` | default | `text-sl-text` |
| Helper / secondary | `text-xs` | `font-normal` | default | `text-sl-muted` |
| Badges / pills | `text-xs` | `font-semibold` | `tracking-wide` | varies |
| Nav labels | `text-xs` | `font-medium`/`font-semibold` (active) | default | `text-sl-muted`/`text-sl-accent` |

### Logo treatment

```tsx
<span className="font-light text-sl-text">Share</span>
<span className="font-bold text-sl-accent">List</span>
```

---

## Surface Hierarchy

```
Layer 0 — Root background:   bg-sl-bg     (#111314)
  + radial-gradient top-left: rgba(56,189,248,0.06) → transparent
Layer 1 — Cards/sections:    bg-sl-surface (#1C1F21)
  optional glass:            backdrop-blur-xl + border border-sl-accent/10
Layer 2 — Elevated (modal):  bg-sl-surface shadow-2xl
Layer 3 — Nav bars:          bg-sl-nav    (#161819) + border-sl-border
```

### Root background gradient (App-level)
```css
background: #111314;
/* Add as a non-interactive overlay: */
background-image: radial-gradient(circle at 20% 10%, rgba(56,189,248,0.06) 0%, rgba(56,189,248,0.02) 40%, transparent 70%);
```

---

## Glass Card Pattern

Used for primary content cards (hero sections, elevated surfaces):

```tsx
className="bg-sl-surface/80 backdrop-blur-xl border border-sl-accent/10 rounded-[20px]"
```

For standard (non-glass) cards:
```tsx
className="bg-sl-surface border border-sl-border rounded-[20px]"
```

---

## Border Radii

| Element | Radius |
|---|---|
| Page cards / containers | `rounded-[20px]` |
| Modals | `rounded-2xl` |
| Buttons (standard) | `rounded-xl` |
| Inputs | `rounded-xl` |
| Small buttons / badges | `rounded-lg` |
| Pills / status badges | `rounded-full` |
| Avatar circles | `rounded-full` |
| Album art / thumbnails | `rounded-[6px]` |

---

## Inputs

```tsx
className="
  bg-sl-bg border border-sl-border rounded-xl px-4 py-2.5 text-sm text-sl-text
  placeholder:text-sl-muted w-full
  focus:outline-none focus:ring-2 focus:ring-sl-accent/50 focus:border-sl-accent/50
  disabled:opacity-40 disabled:cursor-not-allowed
"
```

Labels:
```tsx
className="block text-sm font-medium text-sl-text mb-1.5"
```

---

## Buttons

### Primary (filled accent)
```tsx
className="
  bg-sl-accent text-sl-bg px-4 py-2.5 rounded-xl text-sm font-semibold
  hover:bg-sl-accent/90 disabled:opacity-40 disabled:cursor-not-allowed
  transition-colors
"
```

### Secondary (outlined)
```tsx
className="
  border border-sl-border text-sl-text px-4 py-2.5 rounded-xl text-sm font-medium
  hover:bg-sl-surface hover:border-sl-accent/30 disabled:opacity-40
  transition-colors
"
```

### Destructive
```tsx
className="
  bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm font-medium
  hover:bg-red-500/20 disabled:opacity-40 transition-colors
"
```

### Ghost / text link
```tsx
className="text-sl-accent text-sm font-medium hover:text-sl-accent/80 transition-colors"
```

---

## Toggle Switch

```tsx
// Outer button
className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
  focus:outline-none focus-visible:ring-2 focus-visible:ring-sl-accent
  disabled:cursor-not-allowed disabled:opacity-40
  ${active ? 'bg-sl-accent' : 'bg-sl-border'}`}

// Inner knob
className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
  ${active ? 'translate-x-6' : 'translate-x-1'}`}
```

---

## Status Badges

```tsx
// Active / success
className="bg-sl-mint/15 text-sl-mint border border-sl-mint/30 px-2.5 py-0.5 rounded-full text-xs font-semibold"

// Suspended / error
className="bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold"

// Warning / unverified
className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold"

// Info pill (permissions)
className="bg-sl-accent/10 text-sl-accent px-2 py-0.5 rounded-md text-xs font-semibold"
```

---

## Auth / Form Card Layout

Used for: Sign In, Sign Up, Password Reset pages.

```tsx
// Page wrapper
<div className="min-h-screen bg-sl-bg flex items-center justify-center p-4">
  {/* optional gradient overlay */}
  <div className="pointer-events-none fixed inset-0"
    style={{ background: 'radial-gradient(circle at 20% 10%, rgba(56,189,248,0.06) 0%, transparent 60%)' }} />
  
  {/* Card */}
  <div className="relative w-full max-w-md bg-sl-surface border border-sl-border rounded-[20px] p-8 shadow-2xl">
    <h1 className="text-2xl font-bold text-sl-text mb-2">...</h1>
    <p className="text-sm text-sl-muted mb-8">...</p>
    {/* form */}
  </div>
</div>
```

---

## Navigation (Top Bar)

```tsx
<nav className="bg-sl-nav border-b border-sl-border px-5 py-3.5 flex items-center justify-between">
  {/* Logo */}
  <span className="font-light text-sl-text">Share</span>
  <span className="font-bold text-sl-accent">List</span>
  
  {/* Links: text-sl-muted hover:text-sl-text */}
  {/* Active link: text-sl-accent */}
  {/* Sign out: text-sl-muted hover:text-red-400 */}
</nav>
```

---

## Data Tables (Admin)

```tsx
// Container
className="bg-sl-surface border border-sl-border rounded-[20px] overflow-hidden"

// Header row
className="border-b border-sl-border bg-sl-bg/50"

// Header cell
className="px-4 py-3 text-left text-xs font-medium text-sl-muted uppercase tracking-wide"

// Body row
className="border-b border-sl-border/50 last:border-0 hover:bg-sl-accent/5 transition-colors"

// Body cell
className="px-4 py-3 text-sm text-sl-text"
```

---

## Modal

```tsx
// Overlay
className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"

// Dialog
className="bg-sl-surface border border-sl-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"

// Header
className="px-6 py-5 border-b border-sl-border flex items-center gap-4"

// Body
className="overflow-y-auto flex-1 divide-y divide-sl-border/50"

// Section
className="px-6 py-5"

// Section label
className="text-xs font-semibold uppercase tracking-wider text-sl-muted mb-4"

// Footer
className="px-6 py-4 border-t border-sl-border bg-sl-bg/30 rounded-b-2xl flex justify-end"
```

---

## Danger Zone (Modal Section)

```tsx
// Section title
className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-4"

// Container
className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5"

// Confirm state
className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 space-y-3"
```

---

## Focus Ring

All focusable elements: `focus:outline-none focus-visible:ring-2 focus-visible:ring-sl-accent/60`

---

## Spacing Conventions

| Context | Pattern |
|---|---|
| Page container (narrow) | `max-w-md mx-auto px-4 py-12` |
| Page container (wide/admin) | `max-w-5xl mx-auto px-6 py-10` |
| Card internal padding | `p-6` or `p-8` (auth) |
| Section padding (modal) | `px-6 py-5` |
| Form field gap | `space-y-4` or `flex flex-col gap-4` |
| Inline row gap | `gap-3` or `gap-4` |

---

## Transitions & Interaction

- **Default transition:** `transition-colors duration-150`
- **Button press:** subtle opacity or background shift via hover class
- **Row hover:** `hover:bg-sl-accent/5`
- **Icon hover opacity:** `opacity-50 hover:opacity-100 transition-opacity`

---

## Do Not Use

- `bg-white`, `bg-gray-50`, `bg-gray-100` — these are light-mode colors
- `text-gray-900`, `text-gray-800`, `text-gray-700` — use `text-sl-text` instead
- `text-gray-500`, `text-gray-600` — use `text-sl-muted` instead
- `border-gray-200`, `border-gray-300` — use `border-sl-border` instead
- `bg-gray-900 text-white` for buttons — use the accent button pattern above
- `focus:ring-gray-900` — use `focus:ring-sl-accent/50` instead
