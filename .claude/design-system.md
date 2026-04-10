# ShareList Design System

Derived from the official Figma mockup. All frontend screens must follow this guide exactly.
The reference implementation lives in `_EXAMPLE FRONTEND/`.

> **Note on token usage:** The Tailwind config defines `sl.*` color tokens, but custom tokens may fail
> to render under Vite dev server caching. Always use the reliable alternatives listed below.

---

## Color Reference

| Token | Hex | Use | Reliable class |
|---|---|---|---|
| `sl-bg` | `#111314` | Page/root background | `bg-[#111314]` |
| `sl-surface` | `#1C1F21` | Cards, modals, elevated containers | `bg-[#1C1F21]` |
| `sl-nav` | `#161819` | Top and bottom navigation bars | `bg-[#161819]` |
| `sl-border` | `#2A2D30` | Dividers, input borders, table rows | `border-[#2A2D30]`, `divide-[#2A2D30]` |
| `sl-accent` | `#38BDF8` | Interactive elements, active states, focus rings | `text-sky-400`, `bg-sky-400` |
| `sl-mint` | `#4ADE80` | Success, sync indicators, "new" badges | `text-emerald-400`, `bg-emerald-400` |
| `sl-text` | `#F1F5F9` | Primary text | `text-slate-100` |
| `sl-muted` | `#64748B` | Secondary/helper text, inactive nav items | `text-slate-500` |

### Status & semantic colors (dark-adapted)

| Purpose | Classes |
|---|---|
| Error/destructive | `text-red-400`, `border-red-500/40`, `bg-red-500/10` |
| Warning | `text-amber-400`, `bg-amber-500/10` |
| Success | `text-emerald-400`, `bg-emerald-400/10`, `border-emerald-400/30` |
| Info | `text-sky-400`, `bg-sky-400/10` |
| Suspended badge | `bg-red-500/15 text-red-400` |
| Active badge | `bg-emerald-400/15 text-emerald-400` |
| Unverified label | `text-amber-400` |

---

## Typography

**Font family:** Inter (loaded from Google Fonts — `weights=300;400;500;600;700`)

| Role | Size | Weight | Letter-spacing | Color |
|---|---|---|---|---|
| Page heading | `text-2xl` | `font-bold` | default | `text-slate-100` |
| Section heading | `text-lg` | `font-semibold` | default | `text-slate-100` |
| Section label (uppercase) | `text-xs` | `font-semibold` | `tracking-wider` | `text-slate-500` |
| Table header | `text-xs` | `font-medium` | `tracking-wide uppercase` | `text-slate-500` |
| Body / form labels | `text-sm` | `font-medium` | default | `text-slate-100` |
| Helper / secondary | `text-xs` | `font-normal` | default | `text-slate-500` |
| Badges / pills | `text-xs` | `font-semibold` | `tracking-wide` | varies |
| Nav labels | `text-xs` | `font-medium`/`font-semibold` (active) | default | `text-slate-500`/`text-sky-400` |

### Logo treatment

```tsx
<span className="font-light text-slate-100">Share</span>
<span className="font-bold text-sky-400">List</span>
```

---

## Surface Hierarchy

```
Layer 0 — Root background:   bg-[#111314]
  + radial-gradient top-left: rgba(56,189,248,0.06) → transparent
Layer 1 — Cards/sections:    bg-[#1C1F21]
  optional glass:            backdrop-blur-xl + border border-sky-400/10
Layer 2 — Elevated (modal):  bg-[#1C1F21] shadow-2xl
Layer 3 — Nav bars:          bg-[#161819] + border-[#2A2D30]
```

### Root background gradient (App-level)
```css
background: #111314;
background-image: radial-gradient(circle at 20% 10%, rgba(56,189,248,0.06) 0%, rgba(56,189,248,0.02) 40%, transparent 70%);
```

---

## Glass Card Pattern

Used for primary content cards (hero sections, elevated surfaces):

```tsx
className="bg-[#1C1F21]/80 backdrop-blur-xl border border-sky-400/10 rounded-[20px]"
```

For standard (non-glass) cards:
```tsx
className="bg-[#1C1F21] border border-[#2A2D30] rounded-[20px]"
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
  bg-[#111314] border border-[#2A2D30] rounded-xl px-4 py-2.5 text-sm text-slate-100
  placeholder:text-slate-500 w-full
  focus:outline-none focus:ring-2 focus:ring-sky-400/50 focus:border-sky-400/50
  disabled:opacity-40 disabled:cursor-not-allowed
  transition-colors
"
```

Labels:
```tsx
className="block text-sm font-medium text-slate-100 mb-1.5"
```

> **Webkit autofill:** `apps/web/src/index.css` already contains a `-webkit-box-shadow` override to
> prevent the browser from overriding dark input backgrounds when autofill triggers.

---

## Buttons

### Primary (filled accent)
```tsx
className="
  bg-sky-400 text-[#111314] px-4 py-2.5 rounded-xl text-sm font-semibold
  hover:bg-sky-400/90 disabled:opacity-40 disabled:cursor-not-allowed
  transition-colors
"
```

### Secondary (outlined)
```tsx
className="
  border border-[#2A2D30] text-slate-100 px-4 py-2.5 rounded-xl text-sm font-medium
  hover:bg-[#1C1F21] hover:border-sky-400/30 disabled:opacity-40
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
className="text-sky-400 text-sm font-medium hover:text-sky-400/80 transition-colors"
```

---

## Toggle Switch

```tsx
// Outer button
className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors
  focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400
  disabled:cursor-not-allowed disabled:opacity-40
  ${active ? 'bg-sky-400' : 'bg-[#2A2D30]'}`}

// Inner knob
className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
  ${active ? 'translate-x-6' : 'translate-x-1'}`}
```

---

## Status Badges

```tsx
// Active / success
className="bg-emerald-400/15 text-emerald-400 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-xs font-semibold"

// Suspended / error
className="bg-red-500/15 text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold"

// Warning / unverified
className="bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold"

// Info pill (permissions)
className="bg-sky-400/10 text-sky-400 px-2 py-0.5 rounded-md text-xs font-semibold"
```

---

## Auth / Form Card Layout

Used for: Sign In, Sign Up, Password Reset pages.

```tsx
// Page wrapper
<div className="min-h-[calc(100vh-57px)] flex items-center justify-center p-4">
  {/* Card */}
  <div className="w-full max-w-md bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] p-8 shadow-2xl">
    <h1 className="text-2xl font-bold text-slate-100 mb-1">...</h1>
    <p className="text-sm text-slate-500 mb-8">...</p>
    {/* form */}
  </div>
</div>
```

---

## Navigation (Top Bar)

```tsx
<nav className="bg-[#161819] border-b border-[#2A2D30] px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
  {/* Logo */}
  <Link to="/">
    <span className="font-light text-slate-100">Share</span>
    <span className="font-bold text-sky-400">List</span>
  </Link>

  {/* Links: text-slate-500 hover:text-slate-100 */}
  {/* Active link: text-sky-400 */}
  {/* Sign out: text-slate-500 hover:text-red-400 */}
</nav>
```

---

## Data Tables (Admin)

```tsx
// Container
className="bg-[#1C1F21] border border-[#2A2D30] rounded-[20px] overflow-hidden"

// Header row
className="border-b border-[#2A2D30] bg-[#111314]/50"

// Header cell
className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wide"

// Body row
className="border-b border-[#2A2D30]/50 last:border-0 hover:bg-sky-400/5 transition-colors"

// Body cell
className="px-4 py-3 text-sm text-slate-100"
```

---

## Modal

```tsx
// Overlay
className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"

// Dialog
className="bg-[#1C1F21] border border-[#2A2D30] rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"

// Header
className="px-6 py-5 border-b border-[#2A2D30] flex items-center gap-4"

// Body — use divide-y to avoid trailing bottom border on last section
className="overflow-y-auto flex-1 divide-y divide-[#2A2D30]/50"

// Section
className="px-6 py-5"

// Section label
className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4"

// Footer
className="px-6 py-4 border-t border-[#2A2D30] bg-[#111314]/30 rounded-b-2xl flex justify-end"
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

All focusable elements: `focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60`

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
- **Row hover:** `hover:bg-sky-400/5`
- **Icon hover opacity:** `opacity-50 hover:opacity-100 transition-opacity`

---

## Do Not Use

- `bg-white`, `bg-gray-50`, `bg-gray-100` — these are light-mode colors
- `text-gray-900`, `text-gray-800`, `text-gray-700` — use `text-slate-100` instead
- `text-gray-500`, `text-gray-600` — use `text-slate-500` instead
- `border-gray-200`, `border-gray-300` — use `border-[#2A2D30]` instead
- `bg-gray-900 text-white` for buttons — use the accent button pattern above
- `focus:ring-gray-900` — use `focus:ring-sky-400/50` instead
- Any `sl-*` Tailwind token (e.g. `bg-sl-bg`, `text-sl-text`) — use the reliable classes above
