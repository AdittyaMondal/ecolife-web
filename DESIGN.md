# EcoLife Geometric Design System & Tokens

The source of truth is [`src/app/globals.css`](src/app/globals.css). Tailwind 4 is configured CSS-first via `@theme` and `@theme inline`.

---

## 1. Core Brand Palette

| Role | Hex | Token | Typical Use |
| --- | --- | --- | --- |
| **Primary** | `#7EBF52` | `--primary` / `--color-lime-500` | Primary actions, active segments, progress fills, highlights |
| **Secondary** | `#1E4732` | `--secondary` / `--color-forest-700` | Deep forest feature surfaces, secondary buttons, structural accents |
| **Tertiary** | `#9FD475` | `--tertiary` / `--color-lime-400` | Hover states, chart series, supporting active accents |
| **Neutral** | `#1A2119` | `--foreground` / `--color-neutral-900` | Primary typography, high-contrast ink on light surfaces |

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
| `--background` | `#F8FAF6` | `#0F1511` | Page canvas |
| `--foreground` | `#1A2119` | `#EDF3EA` | Primary ink (`Neutral #1A2119` in light mode) |
| `--card` | `#FFFFFF` | `#162018` | Card surface |
| `--primary` | `#7EBF52` | `#8ED464` | Pastel meadow leaf |
| `--primary-foreground` | `#0F261A` | `#0F1E13` | High-contrast neutral ink on primary |
| `--secondary` | `#1E4732` | `#1E4732` | Deep British pine |
| `--secondary-foreground` | `#F2F7F4` | `#EDF7E2` | Crisp light text on secondary |
| `--tertiary` | `#9FD475` | `#A5DC7C` | Warm pastel lime |
| `--positive` | `#26693D` | `#8ED464` | Accessible positive text/icon token on light/dark cards |
| `--border` | `#E2E9DE` | `#2A3C2F` | Hairline structural border |
| `--input` | `#71826D` | `#5C7764` | WCAG 3:1 control boundary |
| `--ring` | `#7EBF52` | `#8ED464` | Focus ring |
