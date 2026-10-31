# EcoLife design tokens

The source of truth is [`src/app/globals.css`](src/app/globals.css). This file documents it so
`ecolife-mobile` can mirror the same values. **If a value changes here, it changes in both
repos.** Tailwind 4 is configured CSS-first via `@theme` — there is no `tailwind.config.js`.

---

## 1. The `eco` scale

EcoLife's green identity. Used directly (`bg-eco-500`, `text-eco-700`) when a specific step is
wanted, and behind the semantic tokens otherwise.

| Step | Hex | Typical use |
| --- | --- | --- |
| `eco-50`  | `#f0fdf4` | Page tint, light `secondary` |
| `eco-100` | `#dcfce7` | Light `accent`, selected rows |
| `eco-200` | `#bbf7d0` | Light borders on tinted surfaces |
| `eco-300` | `#86efac` | Dark-mode hover on primary |
| `eco-400` | `#4ade80` | **Dark-mode `primary`** |
| `eco-500` | `#22c55e` | Status dots, chart series 1 |
| `eco-600` | `#16a34a` | **`primary` (light) — the brand green** |
| `eco-700` | `#15803d` | Light-mode hover on primary |
| `eco-800` | `#166534` | Chart series, heavy emphasis |
| `eco-900` | `#14532d` | Deep text on tinted surfaces |
| `eco-950` | `#052e16` | **`foreground` (light)**, `primary-foreground` |

Tailwind exposes each as `--color-eco-<step>`.

**Primary is `eco-600`.** Nothing else is the brand colour.

---

## 2. Semantic tokens

Plain CSS custom properties on `:root`, overridden under `.dark`, then re-exported through
`@theme inline` so every one is also a Tailwind utility (`bg-card`, `text-muted-foreground`,
`border-border`, `ring-ring`, …).

| Token | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `--background` | `#ffffff` | `#0a1410` | Page base |
| `--foreground` | `#052e16` | `#ecfdf3` | Body text on `background` |
| `--card` | `#ffffff` | `#11201a` | Raised surface |
| `--card-foreground` | `#052e16` | `#ecfdf3` | Text on `card` |
| `--primary` | `#16a34a` | `#4ade80` | Brand green; primary actions |
| `--primary-foreground` | `#052e16` | `#052e16` | Text/icons on `primary` |
| `--secondary` | `#f0fdf4` | `#16251e` | Quiet tinted surface |
| `--muted` | `#f1f5f3` | `#16251e` | Neutral fill (skeletons, wells) |
| `--muted-foreground` | `#4b5a53` | `#9fb3a9` | Secondary / helper text |
| `--accent` | `#dcfce7` | `#1d3b2c` | Hover and selected states |
| `--border` | `#dfe5e2` | `#22362c` | **Decorative** dividers and card edges |
| `--input` | `#7d8d85` | `#637a6e` | **Control boundaries** — darker on purpose |
| `--ring` | `#16a34a` | `#4ade80` | Focus ring |
| `--destructive` | `#b91c1c` | `#f87171` | Errors, delete actions |

### Why `--input` is darker than `--border`

WCAG 2.2 wants a 3:1 boundary on any control whose edge is the only thing identifying it.
`--border` is decorative (1.3:1) and used on dividers and card edges, where the surface change
already does the work. `--input` is the boundary of a real control and clears 3:1 on its own.
Do not swap them.

### Measured contrast (WCAG 2.2)

| Pair | Light | Dark | Needs |
| --- | --- | --- | --- |
| `foreground` on `background` | 14.9:1 | 17.8:1 | 4.5:1 |
| `card-foreground` on `card` | 14.9:1 | 16.0:1 | 4.5:1 |
| `primary-foreground` on `primary` | 4.5:1 | 8.6:1 | 4.5:1 |
| `muted-foreground` on `background` | 7.3:1 | 8.5:1 | 4.5:1 |
| `muted-foreground` on `muted` | 6.6:1 | 7.2:1 | 4.5:1 |
| `destructive` on `background` | 6.5:1 | 6.8:1 | 4.5:1 |
| `primary` on `background` | 3.3:1 | 10.8:1 | 3:1 (non-text) |
| `input` on `background` | 3.5:1 | 4.1:1 | 3:1 (non-text) |

`primary-foreground` is `eco-950`, not white: white on `eco-600` is only 3.3:1, which fails body
text on a primary button. Keeping `primary = eco-600` and darkening its foreground is how both
constraints are met.

### Dark mode

A `.dark` class on `<html>`, set by `next-themes` (`attribute="class"`, `defaultTheme="system"`)
via a blocking inline script, so there is no flash. Tailwind's `dark:` variant is redefined to
follow the class rather than `prefers-color-scheme`:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

Mobile mirrors this by switching the same token set on a theme context — the hex values are what
transfers, not the mechanism.

---

## 3. Type scale

Tailwind 4 defaults, unchanged. Listed so mobile can hard-code the same numbers.

| Utility | Size | Line height |
| --- | --- | --- |
| `text-xs`   | 12px / 0.75rem  | 16px |
| `text-sm`   | 14px / 0.875rem | 20px |
| `text-base` | 16px / 1rem     | 24px |
| `text-lg`   | 18px / 1.125rem | 28px |
| `text-xl`   | 20px / 1.25rem  | 28px |
| `text-2xl`  | 24px / 1.5rem   | 32px |
| `text-3xl`  | 30px / 1.875rem | 36px |
| `text-4xl`  | 36px / 2.25rem  | 40px |
| `text-5xl`  | 48px / 3rem     | 1 |

Weights in use: `400` body, `500` labels and buttons, `600` headings. No `700`+.

Roles:

- Page title — `text-2xl font-semibold tracking-tight`
- Section heading — `text-base font-medium`
- Body — `text-base` (never below `text-sm` for anything a user must read)
- Helper / meta — `text-sm text-muted-foreground`

Body text is never smaller than 16px on mobile, so iOS does not zoom on focus.

---

## 4. Spacing

Tailwind 4's `--spacing` base of `0.25rem` (4px); `n` → `n × 4px`. Steps actually in use:

| Step | px | Use |
| --- | --- | --- |
| `1` | 4 | Icon/text gap |
| `2` | 8 | Tight stacks, inline gaps |
| `3` | 12 | Label-to-field |
| `4` | 16 | **Page gutter on mobile**, card padding |
| `5` | 20 | Card padding ≥sm |
| `6` | 24 | Between cards |
| `10` | 40 | Page block padding |

Layout rules:

- Mobile-first. Designed at **360px**; no horizontal scroll at **320px**.
- Page container: `mx-auto w-full max-w-3xl px-4 py-10`.
- Radii: `rounded-lg` (8px) controls, `rounded-xl` (12px) cards, `rounded-full` pills and dots.
- Minimum touch target **44px** (`min-h-11`).
- Bottom nav sits inside `env(safe-area-inset-bottom)`.
- `prefers-reduced-motion: reduce` collapses animation and transition durations — set globally
  in `globals.css`, so nothing has to opt in.
- Colour is never the only signal: a green dot is paired with its word, a gauge with an icon and
  a number.
