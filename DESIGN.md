# EcoLife Geometric Design System & Tokens

The source of truth is [`src/app/globals.css`](src/app/globals.css). Tailwind 4 is configured CSS-first via `@theme` and `@theme inline`.

---

## 1. Core Brand Palette

| Role | Hex | Token | Typical Use |
| --- | --- | --- | --- |
| **Primary** | `#A8DB36` | `--primary` / `--color-lime-400` | Primary actions, active segments, progress fills, highlights |
| **Secondary** | `#244D36` | `--secondary` / `--color-forest-700` | Deep forest feature surfaces, secondary buttons, structural accents |
| **Tertiary** | `#83C43C` | `--tertiary` / `--color-lime-500` | Hover states, chart series, supporting active accents |
| **Neutral** | `#202820` | `--foreground` / `--color-neutral-900` | Primary typography, high-contrast ink on `#A8DB36`, dark surfaces |

Supporting scales (`--color-lime-50..900`, `--color-forest-50..950`, `--color-neutral-50..950`) are derived directly from these four anchors.

---

## 2. Concentric Geometric Radius System

Every container and nested child follows a strict concentric curvature law:

$$\text{inner radius} = \text{outer radius} - \text{inset}$$

All spacing and padding insets use a unified `4px` (`0.25rem`) grid:

| Radius Token | Value | Utility | Parent / Child Pairing |
| --- | --- | --- | --- |
| `--radius-xl` | `36px` (`2.25rem`) | `rounded-xl` | Feature hero surfaces & modal dialogs (`p-6` = `24px` inset $\rightarrow$ `rounded-sm` `12px` inner controls; or `p-4` = `16px` inset $\rightarrow$ `rounded-md` `20px` inner sub-cards) |
| `--radius-lg` | `28px` (`1.75rem`) | `rounded-lg` | Standard cards (`p-4` = `16px` inset $\rightarrow$ `rounded-sm` `12px` inner controls/rows; or `p-2` = `8px` inset $\rightarrow$ `rounded-md` `20px` media frames) |
| `--radius-md` | `20px` (`1.25rem`) | `rounded-md` | Media frames inside `p-2` cards (`28px - 8px = 20px`), mobile dock shell |
| `--radius-sm` | `12px` (`0.75rem`) | `rounded-sm` | Buttons, inputs, selects, segmented tracks, list rows inside `p-4` cards (`28px - 16px = 12px`) |
| `--radius-xs` | `8px` (`0.5rem`) | `rounded-xs` | Segments, badges, steppers, and icon tiles nested inside `p-1` (`4px`) controls (`12px - 4px = 8px`) |

---

## 3. Semantic Tokens (Light & Dark)

| Token | Light | Dark | Meaning |
| --- | --- | --- | --- |
| `--background` | `#F6F8F3` | `#141A14` | Page canvas |
| `--foreground` | `#202820` | `#F1F5EE` | Primary ink (`Neutral #202820` in light mode) |
| `--card` | `#FFFFFF` | `#202820` | Card surface |
| `--primary` | `#A8DB36` | `#A8DB36` | Primary lime (`#A8DB36`) |
| `--primary-foreground` | `#202820` | `#202820` | High-contrast neutral ink on `#A8DB36` |
| `--secondary` | `#244D36` | `#244D36` | Deep forest (`#244D36`) |
| `--secondary-foreground` | `#F6F8F3` | `#F6F8F3` | Crisp light text on `#244D36` |
| `--tertiary` | `#83C43C` | `#83C43C` | Tertiary leaf green (`#83C43C`) |
| `--positive` | `#244D36` | `#A8DB36` | Accessible positive text/icon token on light/dark cards |
| `--border` | `#DCE3D6` | `#2E3D31` | Hairline structural border |
| `--input` | `#637362` | `#5E7866` | WCAG 3:1 control boundary |
| `--ring` | `#244D36` | `#A8DB36` | Focus ring |
