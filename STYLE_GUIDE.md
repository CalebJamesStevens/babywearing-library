# Tailwind Style Guide for an AI Agent UI

Elegant, calm, readable. Flat color (no gradients), subtle elevation, restrained radius.

---

# Mobile-First + PWA Requirement

This project is primarily a phone app. Every UI should be designed mobile-first and support seamless use as a PWA.

- Build layouts for small screens first, then enhance for larger screens.
- Use touch-friendly targets and spacing.
- Ensure navigation is simple and reachable on mobile.
- PWA-ready: offline-safe shell, fast load, app-like navigation, and installable behavior.

---

# 1) Design Principles

* **Quiet UI, loud content:** prefer whitespace, typography, and hierarchy over decoration.
* **One primary action per view:** everything else is secondary/tertiary.
* **Subtle surfaces:** use light borders + faint shadows, not heavy cards.
* **Consistent rhythm:** a single spacing scale and consistent component heights.

---

# 2) Foundations

## Color System (semantic-first)

Use neutrals for most UI; reserve color for actions, states, and small accents.

### Recommended palette (Tailwind defaults)

* **Base / text:** `slate`
* **Primary (brand/action):** `indigo`
* **Success:** `emerald`
* **Warning:** `amber`
* **Danger:** `rose`

### Tokens (how the agent should think)

* `bg-app` → overall app background
* `bg-surface` → cards/panels
* `text-primary` → main text
* `text-muted` → secondary text
* `border-subtle` → dividers / outlines
* `ring-focus` → focus ring color
* `action-primary` → primary CTA

#### Light mode mapping (classes)

* App background: `bg-slate-50`
* Surface: `bg-white`
* Text: `text-slate-900`
* Muted: `text-slate-600`
* Subtle: `text-slate-500`
* Border: `border-slate-200`
* Divider: `divide-slate-200`
* Primary: `text-indigo-600` / `bg-indigo-600`
* Focus ring: `focus:ring-indigo-500`

#### Dark mode mapping (optional)

* App background: `dark:bg-slate-950`
* Surface: `dark:bg-slate-900`
* Text: `dark:text-slate-100`
* Muted: `dark:text-slate-300`
* Border: `dark:border-slate-800`
* Primary: `dark:bg-indigo-500`

**Rule:** don’t use more than **one** accent color in a single component (besides state colors).

---

## Typography

Aim for strong hierarchy and comfortable reading.

### Base

* Body: `text-sm leading-6` (most UI)
* Long-form content: `text-base leading-7`
* Small/meta: `text-xs leading-5`

### Headings

* H1: `text-2xl font-semibold tracking-tight`
* H2: `text-xl font-semibold tracking-tight`
* H3: `text-lg font-semibold`

### UI text rules

* Use `font-medium` for labels and button text.
* Use `font-semibold` only for headings and the primary CTA.

---

## Spacing & Layout

Stick to a small set of spacing steps.

* Component padding: `p-4` (default), `p-6` (large)
* Inline gaps: `gap-2` (tight), `gap-3` (default), `gap-4` (roomy)
* Section spacing: `space-y-6`
* Container: `max-w-5xl mx-auto px-4 sm:px-6 lg:px-8`

**Rule:** avoid micro-variations (e.g., don’t mix `p-3`, `p-5` everywhere).

---

## Radius, Border, Shadow

No “pill UI” by default.

* Radius:

  * Default: `rounded-lg`
  * Small elements: `rounded-md`
  * Never exceed: `rounded-xl`
* Borders:

  * Default: `border border-slate-200`
* Shadows:

  * Default surface: `shadow-sm`
  * Popover: `shadow-md`
  * Avoid heavy shadows unless needed for layering.

---

# 3) Interaction & States

## Focus (keyboard)

Use consistent focus styles everywhere:

* `focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white`
* In dark mode add: `dark:focus:ring-offset-slate-900`

## Hover / Active

* Hover should be subtle: background tint or border darken.
* Active: small translate or darker shade, not dramatic animations.

## Disabled

* Reduce contrast and stop hover:

  * `disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-inherit`

---

# 4) Component Recipes (copy/paste)

## Buttons

**Primary**

```html
<button class="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
  Primary
</button>
```

**Secondary**

```html
<button class="inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
  Secondary
</button>
```

**Tertiary (ghost)**

```html
<button class="inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
  Ghost
</button>
```

**Danger**

```html
<button class="inline-flex items-center justify-center gap-2 rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
  Delete
</button>
```

---

## Inputs

**Text input**

```html
<input class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50" placeholder="Type here..." />
```

**Textarea**

```html
<textarea class="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-6 text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50" rows="4"></textarea>
```

**Label + help + error**

```html
<label class="block text-sm font-medium text-slate-900">Label</label>
<p class="mt-1 text-xs text-slate-500">Helpful hint.</p>
<p class="mt-1 text-xs text-rose-600">Error message.</p>
```

---

## Cards / Panels

```html
<div class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
  <div class="flex items-start justify-between gap-4">
    <div>
      <h3 class="text-sm font-semibold text-slate-900">Card title</h3>
      <p class="mt-1 text-sm text-slate-600">Supporting content.</p>
    </div>
  </div>
</div>
```

---

## Chat Bubbles (AI agent)

**Assistant message**

```html
<div class="max-w-2xl rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm">
  Assistant message…
</div>
```

**User message**

```html
<div class="ml-auto max-w-2xl rounded-lg bg-slate-900 px-4 py-3 text-sm leading-6 text-white shadow-sm">
  User message…
</div>
```

**System / tool message**

```html
<div class="max-w-2xl rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-700">
  System / tool output…
</div>
```

---

## Badges

```html
<span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
  Neutral
</span>
<span class="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
  Success
</span>
<span class="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
  Warning
</span>
<span class="inline-flex items-center rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
  Danger
</span>
```

---

## Alerts

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <div class="flex gap-3">
    <div class="mt-0.5 h-2.5 w-2.5 rounded-full bg-indigo-600"></div>
    <div>
      <p class="text-sm font-medium text-slate-900">Notice</p>
      <p class="mt-1 text-sm text-slate-600">This is a calm alert message.</p>
    </div>
  </div>
</div>
```

---

## Tables

```html
<div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
  <table class="w-full text-left text-sm">
    <thead class="bg-slate-50 text-xs font-medium text-slate-600">
      <tr>
        <th class="px-4 py-3">Name</th>
        <th class="px-4 py-3">Value</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-200">
      <tr class="hover:bg-slate-50">
        <td class="px-4 py-3 text-slate-900">Row</td>
        <td class="px-4 py-3 text-slate-600">Data</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## Modals / Dialogs

```html
<div class="fixed inset-0 bg-slate-900/40"></div>

<div class="fixed left-1/2 top-1/2 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-6 shadow-md">
  <h2 class="text-lg font-semibold text-slate-900">Title</h2>
  <p class="mt-2 text-sm text-slate-600">Description goes here.</p>
  <div class="mt-6 flex justify-end gap-3">
    <button class="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Cancel</button>
    <button class="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Confirm</button>
  </div>
</div>
```

---

# 5) Motion

Keep it subtle and fast.

* Default transition: `transition-colors duration-150`
* For elevation/transform: `transition duration-150 ease-out`
* Avoid bouncy easing or long durations.

---

# 6) Content Formatting (AI responses)

* Use generous line height for messages: `leading-6` or `leading-7`.
* Keep code blocks visually quiet:

```html
<pre class="overflow-x-auto rounded-lg bg-slate-950 px-4 py-3 text-xs leading-5 text-slate-100">
  <code>...</code>
</pre>
```

* For inline code: `rounded bg-slate-100 px-1 py-0.5 text-xs font-medium text-slate-800`

---

# 7) Accessibility Defaults

* Minimum text contrast: use `slate-900` on light backgrounds; avoid `slate-400` for body text.
* Interactive targets: `min-h-10` for buttons/inputs where possible.
* Always visible focus ring (don’t remove it without replacement).
* Errors should be conveyed with text + color (not color alone).

---

# 8) Agent Behavior Rules (styling decisions)

When generating UI, the agent should follow:

1. Use **`rounded-md` or `rounded-lg`** only.
2. Prefer **borders** over heavy shadows.
3. Use **one** accent color per view.
4. Default to **`text-sm leading-6`** and upgrade only for long-form.
5. Keep layouts centered with **consistent padding** (`px-4 sm:px-6`).
6. Avoid visual noise: no gradients, no glassmorphism, no thick outlines.
