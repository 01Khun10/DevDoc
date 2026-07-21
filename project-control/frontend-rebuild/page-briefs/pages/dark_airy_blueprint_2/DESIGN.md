---
name: Dark Airy Blueprint
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  h1:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Space Grotesk
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  h3:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.7'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  container-max: 1280px
---

## Brand & Style
This design system establishes a high-precision, technical aesthetic tailored for engineering documentation. The personality is "Analytical Clarity"—merging the structured discipline of architectural blueprints with the modern expansiveness of dark-mode cloud environments.

The design style utilizes a **Modern-Technical** approach with subtle **Minimalist** influences. It avoids heavy shadows in favor of hairline linework, structured grids, and a sense of "digital draftsmanship." The UI should feel like a living schematic: organized, scalable, and intellectually stimulating. The target audience includes developers, architects, and technical writers who value information density without visual clutter.

## Colors
The palette is rooted in deep naval blues to provide a stable, low-strain background for long-form reading. 

- **Canvas & Surfaces:** The `#0B1526` canvas serves as the base plate, while `#16273F` defines interactive or raised surfaces.
- **Accents:** Primary Blue (`#3B82F6`) and Cyan (`#22D3EE`) are used exclusively for actions, focus states, and highlighting key technical paths.
- **Typography:** Contrast is strictly managed. Primary text (`#F5F8FC`) is reserved for titles and essential content. Secondary and Muted tones reduce the visual noise of metadata and descriptions.
- **Artifacts:** A diverse secondary palette allows for instant categorization of technical entities (Business Objects, Use Cases, etc.) without compromising the professional atmosphere.

## Typography
The typographic hierarchy emphasizes functional distinction:
- **Space Grotesk** (Headings): Captures a geometric, futuristic feel suitable for structural titles.
- **Inter** (Body): Ensures high legibility for dense technical documentation and prose.
- **JetBrains Mono** (Labels & Code): Provides the "Blueprint" aesthetic. Use this for tags, metadata, button labels, and any data that requires precise alignment.

Maintain a vertical rhythm by using the 1.6x line height for body text to ensure the "Airy" feel is maintained even in long documents.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Navigation and sidebars are fixed-width to maintain the schematic look, while the central documentation area is fluid but constrained by a `1280px` maximum width to preserve line length readability.

- **The Grid:** Use an 8px base grid.
- **Blueprint Lines:** Subtle vertical or horizontal lines (`1px` width, color: `#33517E`) may be used to separate major layout sections, mimicking drafting paper.
- **Whitespace:** Prioritize generous padding (minimum `32px`) between major content blocks to prevent the "dense manual" feel.

## Elevation & Depth
Depth is communicated through **Tonal Layering and Hairline Outlines** rather than traditional shadows.

- **Level 0 (Canvas):** `#0B1526`. The infinite drafting board.
- **Level 1 (Cards/Panels):** `#16273F`. Defined by a `1px` solid border of `#33517E`.
- **Level 2 (Popovers/Modals):** `#1C2F4B`. These use a slightly lighter surface and a subtle glow (0px 4px 20px) using the primary blue at 10% opacity.

Avoid heavy blurs. The goal is "Crisp Layers."

## Shapes
A consistent `8px` (0.5rem) corner radius is applied to all primary containers, cards, and buttons. 

- **Exceptions:** Artifact chips and small tags use a `4px` radius to maintain a sharper, more precise technical appearance.
- **Borders:** Always `1px` (hairline). Do not use thick borders unless indicating a focused state.

## Components
- **Buttons:** Primary buttons use a solid `#3B82F6` fill with `JetBrains Mono` bold labels. Ghost buttons use the `#33517E` border.
- **Artifact Chips:** Small, rectangular tags with a subtle background tint (15% opacity of the specific artifact color) and a 1px solid border of the full-strength color.
- **Input Fields:** Darker background than the surface (`#0B1526`), `1px` border, and a Cyan (`#22D3EE`) bottom-border accent on focus.
- **Lists:** Unordered lists use a small `+` symbol or a square bullet in Cyan instead of standard circles to reinforce the technical grid aesthetic.
- **Cards:** Used for grouping related documentation sections. Always outlined with `#33517E`. No shadow.
- **Code Blocks:** Encased in a `#0B1526` container with a subtle horizontal "blueprint" line every 4 lines of code to guide the eye.