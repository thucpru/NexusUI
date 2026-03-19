# NexusUI — Design Guidelines

## Brand Identity

**Aesthetic**: Clean, functional, warm. Inspired by Figma's design language — flat surfaces, compact density, information-rich.
**Personality**: Intelligent, fast, trustworthy. Design meets engineering.
**Voice**: Concise, clear, confident. No fluff.

---

## Color Palette

### Dark Theme (Primary) — Figma Warm Grays

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#1E1E1E` | App background (Canvas) |
| `--bg-secondary` | `#2C2C2C` | Cards, panels (Surface) |
| `--bg-tertiary` | `#383838` | Elevated surfaces, hover states |
| `--bg-quaternary` | `#444444` | Active/selected states |
| `--border-default` | `#383838` | Default borders |
| `--border-subtle` | `#333333` | Subtle separators |
| `--border-strong` | `#4D4D4D` | Emphasized borders |
| `--text-primary` | `#FFFFFF` | Headings, primary content |
| `--text-secondary` | `#B3B3B3` | Body text, descriptions |
| `--text-tertiary` | `#808080` | Placeholders, disabled |
| `--text-quaternary` | `#666666` | Muted hints |

### Light Theme

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#FFFFFF` | App background |
| `--bg-secondary` | `#F8F8FA` | Cards, panels |
| `--bg-tertiary` | `#F0F0F4` | Elevated surfaces |
| `--border-default` | `#E2E2E8` | Default borders |
| `--text-primary` | `#111114` | Headings |
| `--text-secondary` | `#63637A` | Body text |

### Accent Colors — Figma Blue

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-primary` | `#0C8CE9` | Primary actions, links, focus rings (Figma blue) |
| `--accent-primary-hover` | `#0D99FF` | Hover state (brighter blue) |
| `--accent-primary-muted` | `rgba(12,140,233,0.12)` | Subtle backgrounds |
| `--accent-brand` | `#A259FF` | AI/premium features (Figma purple) |
| `--accent-success` | `#14AE5C` | Synced, connected, success |
| `--accent-warning` | `#F2994A` | Warnings, pending states |
| `--accent-error` | `#F24822` | Errors, destructive actions |
| `--accent-info` | `#0C8CE9` | Informational notices |

> **Note**: Flat/solid colors only. No gradients, no glows. Figma purple (#A259FF) reserved for AI features.

### AI Accent

Used for AI-powered features — Figma purple, no gradients:
```css
/* AI emphasis text */
color: #A259FF; /* Figma purple */

/* AI feature background */
background: rgba(162,89,255,0.12);

/* AI shimmer loading */
background: linear-gradient(90deg, transparent 25%, rgba(162,89,255,0.08) 50%, transparent 75%);
background-size: 200% 100%;
animation: shimmer 3s infinite;
```

> **Note**: No glow shadows. AI features use purple (#A259FF) to differentiate from primary blue (#0C8CE9).

---

## Typography

### Font Family

**Primary**: `"Inter"` — neutral, highly legible sans-serif optimized for screens. Clean and professional.

**Monospace**: `"JetBrains Mono"` — for code snippets, token values, technical data.

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-display` | 48px / 3rem | 700 | 1.1 | Hero headings |
| `--text-h1` | 32px / 2rem | 700 | 1.2 | Page titles |
| `--text-h2` | 24px / 1.5rem | 600 | 1.25 | Section headings |
| `--text-h3` | 20px / 1.25rem | 600 | 1.3 | Subsection headings |
| `--text-h4` | 16px / 1rem | 600 | 1.4 | Card titles |
| `--text-body` | 14px / 0.875rem | 400 | 1.5 | Body text |
| `--text-small` | 13px / 0.8125rem | 400 | 1.5 | Secondary text |
| `--text-caption` | 12px / 0.75rem | 500 | 1.4 | Labels, captions |
| `--text-overline` | 11px / 0.6875rem | 600 | 1.3 | Overlines, badges (uppercase, tracking 0.05em) |

### Plugin Typography (Figma Plugin)

Smaller scale for 320px panel:
| Token | Size | Usage |
|-------|------|-------|
| `--plugin-h1` | 14px | Panel section titles |
| `--plugin-body` | 12px | Body content |
| `--plugin-caption` | 11px | Labels, metadata |

---

## Spacing System

Base unit: **4px**

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | Reset |
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Icon-to-text gap, tight padding |
| `--space-3` | 12px | Compact element spacing |
| `--space-4` | 16px | Default padding, input padding |
| `--space-5` | 20px | Card padding |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Content group separation |
| `--space-12` | 48px | Section separation |
| `--space-16` | 64px | Page section gaps |
| `--space-24` | 96px | Hero/major section spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, tags, small elements |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, panels, modals |
| `--radius-xl` | 12px | Hero cards, feature sections |
| `--radius-full` | 9999px | Avatars, pills, toggle |

---

## Shadows & Elevation

Dark theme shadows use colored opacity for subtle glow effects:

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle lift (buttons) |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.4)` | Cards, dropdowns |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.5)` | Modals, dialogs |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.6)` | Floating panels |

> **Note**: No colored glow shadows. Figma style uses minimal shadow — prefer border emphasis over shadow for elevation.

---

## Animation & Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Hover, active states |
| `--duration-normal` | 200ms | Most transitions |
| `--duration-slow` | 300ms | Page transitions, modals |
| `--duration-ai` | 600ms | AI loading pulse |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default ease |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful micro-interactions |

### Animation Patterns

- **Hover**: Opacity/background transition at `--duration-fast`
- **Modal open**: Fade + scale from 0.95 at `--duration-slow`
- **Page navigation**: Fade at `--duration-normal`
- **AI generation**: Purple shimmer sweep at `--duration-ai` (infinite, #A259FF tint)
- **Skeleton loading**: Horizontal shimmer sweep (1.5s, infinite, subtle white tint)
- **Sync indicator**: Rotating icon (1s, linear, infinite)
- **Toast notification**: Slide-in from right at `--duration-slow`

---

## Component Standards

### Buttons

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `--accent-primary` | White | None | Main CTA |
| Secondary | `transparent` | `--text-secondary` | `--border-default` | Secondary actions |
| Ghost | `transparent` | `--text-secondary` | None | Tertiary actions |
| Destructive | `--accent-error` | White | None | Delete, remove |
| AI | Solid `--accent-brand` bg | White | None | AI generation actions |

**Sizes**: `sm` (28px h), `md` (36px h), `lg` (44px h)
**States**: default, hover (+brightness), active (scale 0.98), disabled (opacity 0.5), loading (spinner)

### Inputs

- Height: 36px (md), 44px (lg)
- Background: `--bg-secondary`
- Border: `--border-default`, focus: `--accent-primary`
- Border-radius: `--radius-md`
- Padding: 12px horizontal
- Placeholder color: `--text-tertiary`
- Focus ring: `0 0 0 2px var(--accent-primary-muted)`

### Cards

- Background: `--bg-secondary`
- Border: 1px solid `--border-default`
- Border-radius: `--radius-lg`
- Padding: `--space-5` (20px)
- Hover: border changes to `--border-strong`

### Badges / Status Indicators

| Status | Color | Label |
|--------|-------|-------|
| Synced | `--accent-success` | "Synced" |
| Pending | `--accent-warning` | "Pending" |
| Error | `--accent-error` | "Error" |
| Draft | `--text-tertiary` | "Draft" |
| Generating | `--accent-brand` | "Generating..." |

### Navigation

- **Sidebar**: 240px wide, `--bg-primary` background, collapsible
- **Top bar**: 56px height, `--bg-primary` with bottom border
- **Breadcrumbs**: Text caption size, `--text-tertiary` separators
- **Active nav item**: 2px left blue border indicator (`#0C8CE9`) + `--bg-tertiary` background, `--text-primary` text

### Token Balance Display

- Prominent placement in sidebar footer and dashboard header
- Visual progress bar showing usage vs. limit
- Color transitions: green (0-60%), yellow (60-80%), red (80-100%)
- Format: `1,234 / 10,000 tokens`

---

## Iconography

**Icon Library**: [Lucide Icons](https://lucide.dev/) — consistent with shadcn/ui ecosystem.

| Context | Icon | Name |
|---------|------|------|
| Dashboard | `LayoutDashboard` | Home/overview |
| Projects | `FolderKanban` | Project list |
| Design System | `Palette` | Colors/tokens |
| AI Generate | `Sparkles` | AI actions |
| GitHub Sync | `GitBranch` | Sync/git |
| Settings | `Settings` | Configuration |
| Billing | `CreditCard` | Payment/tokens |
| Sync Status | `RefreshCw` | Active sync |
| Success | `CheckCircle` | Completed |
| Warning | `AlertTriangle` | Caution |
| Error | `XCircle` | Failed |

**Size scale**: 16px (inline), 20px (nav), 24px (page headers), 32px (empty states)
**Stroke width**: 1.75px (default), 2px for emphasis

---

## Figma Plugin Design Constraints

- Panel width: **320px** fixed
- Use compact spacing (`--space-2` to `--space-4`)
- Match Figma's native dark UI: `#2C2C2C` background family
- Fonts match Figma: 11-12px base, Inter or system UI
- Section dividers: 1px `#3D3D3D` borders
- Scrollable content area with sticky header/footer
- Inputs and buttons should feel native to Figma (low-contrast, flat)

---

## Responsive Breakpoints

| Token | Value | Usage |
|-------|-------|-------|
| `--breakpoint-sm` | 640px | Mobile |
| `--breakpoint-md` | 768px | Tablet |
| `--breakpoint-lg` | 1024px | Desktop |
| `--breakpoint-xl` | 1280px | Large desktop |
| `--breakpoint-2xl` | 1536px | Ultra-wide |

Dashboard sidebar collapses below `--breakpoint-lg`.
Landing page stacks below `--breakpoint-md`.

---

## Dark/Light Mode

- **Default**: Dark theme
- **Toggle**: Available in settings and nav bar
- **Implementation**: CSS custom properties on `:root` / `[data-theme="light"]`
- **Persistence**: localStorage + system preference detection
- **Figma Plugin**: Dark only (matches Figma environment)
