# Design System & Token Architecture: Stratos Alignment

This document serves as the single source of truth for the visual design system of the **Artifact Dashboard**, modeled with exact visual and operational parity to **Stratos** (`~/dev/SEI/Stratos`).

---

## 1. Creative North Star: "The Institutional Command Console"

The Artifact Dashboard is an institutional prompt pipeline and JSON schema command center. Built for prompt authors, developers, and administrators managing extraction workflows, it operates with dense tabular data, uppercase micro-labels, tabular-figure numerals, and high contrast.

### Core Visual Principles:
- **Navy-Tinted Shadows**: Every shadow (`--shadow-level1` through `--shadow-level5`) is a navy-tinted `rgba(8, 35, 64, ...)` rather than neutral gray.
- **Two Named Corals**:
  - **Brand Coral (`#F15840`)**: Primary CTA buttons, action highlights, and accent badges.
  - **Alert Coral (`#E06D53`)**: Status alerts, destructive actions, and error badges. Never interchangeable.
- **Kicker-Over-Divider Idiom**: Sections are announced by uppercase letter-spaced micro-labels (`0.625rem - 0.75rem`, weight 700–800, `letter-spacing: 0.1em - 0.15em`) rather than heavy horizontal rules.
- **Display vs. Body Typography**:
  - **Display / Headlines**: `Anek Latin` (weight 700–900, uppercase, tracking-tight).
  - **Body Text**: `Tahoma, Verdana, "Segoe UI", sans-serif` for enterprise reliability and dense data scanning.
  - **Code & Numerals**: `JetBrains Mono` with `tabular-nums` alignment.

---

## 2. Color Palette Matrix

### Brand Primitives (Layer 1)
| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| `brand-navy` | `#082340` | System Anchor, Primary Headers, Active Nav & Table Highlights |
| `brand-navy-dark` | `#041324` | Deep Background & Contrast Fill |
| `brand-coral` | `#F15840` | Primary Call-to-Action, Display Highlights |
| `alert-coral` | `#E06D53` | Error / Alert Status |
| `brand-green` | `#089F6A` | 100% Valid Health, Published Status |
| `brand-blue` | `#5F8AC7` | Info Indicators & Schema Tagging |
| `brand-black` | `#141414` | High-emphasis Typography |
| `brand-grey` | `#5A5A5A` | Default Body Copy & Secondary Labels |
| `brand-grey-light` | `#94A3B8` | Muted Text & Placeholders |

### Elevation Shadows (Navy-Tinted)
| Level | Value | Usage |
| :--- | :--- | :--- |
| `level1` | `0 2px 8px rgba(8, 35, 64, 0.06)` | Table containers, Stat cards, Inactive buttons |
| `level2` | `0 4px 16px rgba(8, 35, 64, 0.08)` | Hover cards, Dropdown menus |
| `level3` | `0 8px 24px rgba(8, 35, 64, 0.12)` | Sidebar navigation drawer, Flyouts |
| `level4` | `0 12px 32px rgba(8, 35, 64, 0.16)` | Popovers, Hover tooltips |
| `level5` | `0 20px 48px rgba(8, 35, 64, 0.20)` | Modals, System dialogs |

---

## 3. Component Specs

### 1. Buttons
- **Primary / Navy**: `bg-brand-navy hover:bg-brand-navy/90 text-white rounded-level3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-level1`
- **Coral CTA**: `bg-brand-coral hover:bg-brand-coral/90 text-white rounded-level3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-level1`
- **Secondary / Outline**: `bg-white text-brand-navy border border-brand-navy/15 rounded-level3 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-brand-navy/5`

### 2. Tables & Expandable Rows
- **Container**: `bg-white dark:bg-slate-900 rounded-level4 border border-brand-navy/[0.06] dark:border-white/10 shadow-level1 overflow-hidden`
- **Header**: `border-b border-brand-navy/[0.06] text-[10px] font-bold uppercase tracking-widest text-brand-grey bg-brand-navy/[0.02]`
- **Row**: `hover:bg-brand-navy/[0.02] cursor-pointer transition-colors divide-y divide-brand-navy/[0.04]`
- **Expanded Accordion**: `bg-brand-navy/[0.015] p-5 border-b border-brand-navy/[0.06]` with full nested pipeline tables.

### 3. Detail Tabs
- **Container**: `flex items-center gap-1.5 p-1 bg-brand-navy/[0.04] rounded-level3 border border-brand-navy/[0.06]`
- **Active Tab**: `bg-brand-navy text-white shadow-level1 font-bold text-xs uppercase tracking-wide rounded-level2 px-4 py-2`
- **Inactive Tab**: `text-brand-grey hover:text-brand-navy hover:bg-brand-navy/5 font-bold text-xs uppercase tracking-wide rounded-level2 px-4 py-2`
