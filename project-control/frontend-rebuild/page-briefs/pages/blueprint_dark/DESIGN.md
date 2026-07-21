---
name: Blueprint Dark
colors:
  surface: '#101417'
  surface-dim: '#101417'
  surface-bright: '#363a3d'
  surface-container-lowest: '#0b0f12'
  surface-container-low: '#181c1f'
  surface-container: '#1c2023'
  surface-container-high: '#262a2e'
  surface-container-highest: '#313538'
  on-surface: '#e0e3e7'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e0e3e7'
  inverse-on-surface: '#2d3134'
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
  background: '#101417'
  on-background: '#e0e3e7'
  surface-variant: '#313538'
typography:
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  eyebrow-label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 26px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin: 32px
  container-max: 1440px
---

## Brand & Style

This design system embodies a technical, "blueprint" aesthetic designed for high-density information environments like cloud infrastructure consoles, developer tools, or aerospace telemetry. The personality is precise, structural, and airy, utilizing a deep navy canvas to reduce eye strain while maintaining high legibility through vibrant blue and cyan accents.

The design movement is a hybrid of **Minimalism** and **Technical Brutalism**. It prioritizes structural clarity and "white-blue linework" over decorative flourishes. The emotional response is one of controlled power and engineering reliability. Layouts should feel like a living schematic—intentional, gridded, and expansive.

## Colors

The palette is anchored by a deep navy "Canvas" (#0B1526), providing a high-contrast base for technical data.
- **Primary & Accent:** Primary Blue (#3B82F6) drives action, while Cyan (#22D3EE) is used for highlights and specific data visualization nodes.
- **Surface Hierarchy:** The "Card" color (#16273F) is intentionally lighter than the canvas to create a "lifted" effect without relying on heavy shadows.
- **Linework:** Borders (#33517E) are bright and readable, mimicking the appearance of drafting lines on blue paper.
- **Typography:**
    - **Primary:** #F5F8FC (High contrast for headings/body)
    - **Secondary:** #B4C6E0 (Supporting text)
    - **Muted:** #8AA3C4 (Metadata and hints)
- **Artifacts:** A dedicated spectrum of vibrant colors is reserved for categorical chips (Teal, Violet, Amber, etc.) to ensure rapid visual scanning.

## Typography

This design system uses a tripartite typographic scale:
1. **Space Grotesk (Headlines):** Provides a geometric, futuristic feel. Used for major sections and page titles.
2. **Inter (Body):** Ensures maximum readability for complex data descriptions and interface labels.
3. **JetBrains Mono (Metadata/Technical):** Used for IDs, code snippets, and the signature "Eyebrow Labels."

**Rules:**
- All body text and headings use **Sentence case**.
- **Eyebrow Labels** must be 11px, Uppercase, and have wide letter-spacing to signify category or structural hierarchy.
- **Line Heights** are generous (1.5x - 1.6x) to maintain the "airy" blueprint feel.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with generous whitespace to prevent data density from feeling overwhelming.

- **Grid System:** A 12-column grid is standard for desktop. On mobile, this collapses to a single column with 16px margins.
- **Rhythm:** Spacing is built on a 4px baseline. Standard component padding should be 16px (base * 4) or 24px (base * 6).
- **Drafting Marks:** Layouts should feel aligned to a master grid. Use horizontal and vertical hairline dividers (#33517E) to separate major logical sections, reinforcing the "blueprint" aesthetic.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Visible Linework** rather than realistic shadows.

- **Layer 0 (Canvas):** The deepest level (#0B1526).
- **Layer 1 (Cards/Panels):** Lifted via color shift (#16273F) and a mandatory 1px border (#33517E). This creates a "hard" lift that feels architectural.
- **Interactive States:** When a card or element is hovered, the border color should shift to Primary (#3B82F6) or Cyan (#22D3EE) to indicate focus.
- **Shadows:** If used, they must be extremely subtle, dark, and tight (blur < 4px), functioning more like a slight "glow" or ambient occlusion than a light source.

## Shapes

The design system uses a "Squarer" feel, reminiscent of industrial control panels (e.g., AWS Console). 

- **Radius:** Standard components use a **6px - 10px** corner radius.
- **Title-Block Stamps:** A signature element of the design system is the "Corner Stamp." These are small rectangular areas in the top-right of panels, containing metadata in monospaced font, encased in a 1px hairline border. These should have a 0px or 2px radius to look like physical ink stamps on a blueprint.

## Components

- **Buttons:** Primary buttons use a solid Primary Blue (#3B82F6) fill with white text. Secondary buttons are "Ghost" style with a #33517E border and #F5F8FC text.
- **Artifact Chips:** Small, pill-shaped or slightly rounded containers (4px radius). Text inside should be white or high-contrast against the specific artifact color (e.g., Amber #FBBF24 uses dark text).
- **Input Fields:** Background matches the card color (#16273F). Border is #33517E. On focus, the border transitions to Cyan (#22D3EE).
- **Cards:** Must feature the lifted surface and visible border. Often includes a "Title-Block Stamp" in the corner for ID numbers or status codes.
- **Motion:** Transitions must be "Fast and Decisive." Use a `120ms - 180ms` duration with `ease-out` for all hover states, drawer openings, and tab switches. This reinforces the feeling of a high-performance technical tool.
- **Dividers:** Always 1px. Use sparingly to define the "linework" of the blueprint.