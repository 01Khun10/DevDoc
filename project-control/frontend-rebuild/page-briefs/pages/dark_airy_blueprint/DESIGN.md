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
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
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
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.5'
  eyebrow-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.15em
  code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  grid-pattern: 24px
---

## Brand & Style
This design system establishes a high-precision engineering workspace for technical documentation, functioning as an "IDE for Documentation." The brand personality is clinical, systematic, and authoritative, evoking the feeling of a sophisticated terminal or a digital blueprint. 

The aesthetic leverages **Technical Minimalism** with a **Blueprint** twist. It utilizes a deep "Canvas" background to reduce eye strain during long-form technical work, contrasted by hairline-thin structural elements that imply architectural rigidity and precision. The emotional response is one of clarity and structured control, where every pixel serves a functional purpose in the documentation lifecycle: Structured docs, Validation, Traceability, and Export.

## Colors
The palette is rooted in a deep navy "Canvas" base, providing a high-contrast environment for technical work. 

- **Structural Colors:** The Canvas and Surface colors create a tiered hierarchy of depth. Borders are explicitly bright and visible to define segments clearly.
- **Accents:** Primary Blue and Cyan are reserved for interactive states and primary actions.
- **Semantic Artifacts:** A specialized spectrum of colors is provided to categorize documentation types (Business Objectives, Use Cases, Functional Requirements, etc.), ensuring instant visual recognition in complex dependency graphs or lists.

## Typography
The typography system balances geometric character with utilitarian legibility. 

- **Headlines:** Space Grotesk provides a technical, slightly futuristic edge. Use bold weights for primary section headers and medium for sub-sections.
- **Body:** Inter is used for all long-form documentation and descriptive text to ensure maximum readability and a neutral tone.
- **Technical/Eyebrows:** JetBrains Mono is the workhorse for metadata, labels, and code blocks. The "Eyebrow" style (11px, uppercase, wide tracking) must be used for small labels above headings to reinforce the engineering aesthetic.

## Layout & Spacing
The layout follows a strict **Fluid Grid** model with a 4px baseline rhythm. 

- **Blueprint Texture:** Main canvas areas should feature a subtle 24px grid pattern background using a low-opacity version of the border color (#33517E at 5-10% opacity).
- **Layout Model:** Use a 12-column grid for desktop views. Content containers should have a maximum width of 1440px to maintain line-length legibility.
- **Mobile Adaption:** At the 768px breakpoint, margins shrink to 16px and multi-column document views reflow into a single vertical stack. 
- **Precision Spacing:** Use tight 4px or 8px increments for internal component spacing to maintain a "packed" technical feel.

## Elevation & Depth
Depth is conveyed through a mix of **Tonal Layering** and **Faux-3D Offsets**.

- **Surfaces:** Level 0 is the Canvas. Level 1 (Cards/Panels) uses the Surface color with a 1px Hairline Border.
- **Special Elevation:** For featured artifacts or active modal states, use a hard-edged isometric offset rather than soft shadows. A 2px or 4px solid offset in a darker shade or a glow-tint (Primary Blue) simulates a physical "lifted" blueprint layer.
- **Hairlines:** Every container must be defined by a 1px border. Do not use border-less containers for content separation.

## Shapes
The design system uses a **Soft-Square** approach. The default 8px (0.5rem) radius provides a precise, engineered appearance that is not as aggressive as sharp corners but far from the playfulness of fully rounded systems. 

Buttons and input fields should strictly adhere to the `rounded-sm` (4px) or `rounded-md` (8px) tokens. Circular shapes are only permitted for status indicators or user avatars.

## Components
- **Buttons:** Primary buttons use a solid Primary Blue fill with white text. Secondary buttons are ghost-style with a 1px border and a subtle hover fill. All buttons use 8px border radius.
- **Artifact Chips:** Small, high-contrast badges using the Artifact Type colors. They should use JetBrains Mono at 11px for the label to signify they are system-categorized data.
- **Input Fields:** Use the Canvas color for the field background with a Hairline border. Focus states must trigger a 1px Cyan glow and display a "Validation" micro-label if the field is part of a structured schema.
- **Cards:** Cards are the primary container. They feature the 1px Hairline border and should optionally include a "Header" section with the 11px Mono Eyebrow label to describe the content type (e.g., "DOC_METADATA").
- **Lists:** Technical lists should feature "Traceability Lines"—thin vertical or horizontal 1px lines that connect related items, mimicking a wiring diagram or logic flow.
- **Checkboxes/Radios:** Square-off checkboxes with sharp corners (2px radius) to maintain the technical precision.