---
name: Celestial Blueprint
colors:
  surface: '#091324'
  surface-dim: '#091324'
  surface-bright: '#30394c'
  surface-container-lowest: '#050e1f'
  surface-container-low: '#121c2d'
  surface-container: '#162031'
  surface-container-high: '#212a3c'
  surface-container-highest: '#2b3547'
  on-surface: '#d9e2fb'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#d9e2fb'
  inverse-on-surface: '#273143'
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
  background: '#091324'
  on-background: '#d9e2fb'
  surface-variant: '#2b3547'
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
    fontWeight: '500'
    lineHeight: '1.3'
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
    letterSpacing: 0.1em
  code-snippet:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  headline-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
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
  margin-desktop: 48px
  margin-mobile: 16px
  container-max: 1440px
---

## Brand & Style
The design system is a high-fidelity technical interface inspired by aerospace blueprints and tactical command consoles. It targets engineers, researchers, and operators who require a sophisticated, information-dense environment that remains legible and "airy."

The aesthetic combines **Minimalism** with **Modern Corporate** precision, utilizing a "Blue Paper" metaphor. The emotional response is one of controlled authority, technical clarity, and futuristic innovation. Key stylistic hallmarks include hairline linework, generous negative space to prevent visual fatigue in dark mode, and "title-block" stamps that anchor layouts with architectural metadata.

## Colors
The palette is rooted in a deep navy "Canvas" to reduce eye strain. UI surfaces are "lifted" using a lighter navy to create a clear stack order. 

- **Primary & Accent:** A vibrant blue and cyan represent active states and "linework" highlights.
- **Typography:** Three tiers of blue-tinted whites ensure hierarchy without the harshness of pure #FFFFFF.
- **Functional Artifacts:** A specific range of high-chroma colors is reserved for "Artifact Codes" (e.g., Teal for BO, Amber for SEC), ensuring these metadata chips are instantly recognizable against the dark blueprint background.

## Typography
The typographic system emphasizes technical precision. 
- **Headings:** Space Grotesk provides a geometric, futuristic character for primary titles.
- **Body:** Inter is used for all long-form reading and interface labels to ensure maximum accessibility and clarity.
- **Metadata:** JetBrains Mono is strictly applied to ID numbers, status chips, and "eyebrow" labels to reinforce the system's technical, data-driven nature.
- **Eyebrow Labels:** Always 11px, Uppercase, and tracked out to +10% for a "stamped" blueprint feel.

## Layout & Spacing
The design system utilizes a **Fluid Grid** with an 8px base scaling unit. 

- **Density:** Despite the technical nature, the system mandates generous whitespace (increments of 24px or 32px) between major sections to maintain the "Airy" feel.
- **Title Blocks:** Layouts should be bookended by corner stamps (Top-Right or Bottom-Right) containing version numbers and timestamps in 11px Mono, enclosed in hairline boxes.
- **Breakpoints:**
  - **Mobile (<768px):** 4-column grid, 16px margins.
  - **Tablet (768px - 1200px):** 8-column grid, 24px margins.
  - **Desktop (>1200px):** 12-column grid, 48px margins.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and **Hairline Outlines** rather than heavy shadows.

- **Level 0 (Canvas):** The base layer (#0B1526).
- **Level 1 (Cards/Panels):** Raised surfaces (#16273F) using a 1px solid border (#33517E).
- **Interactive States:** Hovering over a card should trigger a "glow" effect where the border color shifts to Primary Blue (#3B82F6) and a very subtle 8px blur shadow of the same color is applied.
- **Motion:** Transitions (opacity, transform, color shifts) must be "Fast" (150ms - 200ms) with an `ease-out` or `cubic-bezier(0.4, 0, 0.2, 1)` curve to feel responsive and high-tech.

## Shapes
The shape language is disciplined. Standard UI components (Buttons, Cards, Inputs) use an **8px (0.5rem)** corner radius to soften the technical aesthetic. 

- **Small Components:** Tags and Artifact Chips use a 4px radius.
- **Decorative Elements:** Any "blueprint" lines or separators should be 1px (hairline) thick.
- **Corner Stamps:** These are the exception, often using 0px (sharp) corners for their internal divisions to mimic industrial data plates.

## Components
- **Buttons:** Primary buttons are solid Blue (#3B82F6) with white text. Secondary buttons use a hairline border (#33517E) with no fill.
- **Artifact Chips:** Small, 13px JetBrains Mono text. Each chip type has a subtle 10% opacity background of its assigned color and a 1px solid border at 100% opacity of that color.
- **Title-Block Stamps:** A structural component located in page corners. It features 1px borders, 11px uppercase mono text, and contains metadata like `PROJECT_ID`, `SYS_STATUS`, and `COORD_REF`.
- **Inputs:** Darker than the card background (#0B1526), featuring the standard 1px border. On focus, the border glows Cyan (#22D3EE).
- **Lists:** Data rows are separated by 1px horizontal lines (#33517E). Hovering a row should change the background to #1C2E4A.
- **Cards:** Visibly lifted with #16273F and a consistent 8px radius. Titles within cards use Space Grotesk.