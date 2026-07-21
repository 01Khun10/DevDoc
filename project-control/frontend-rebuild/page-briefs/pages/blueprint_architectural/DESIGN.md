---
name: Blueprint Architectural
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
  tertiary: '#b6c7e6'
  on-tertiary: '#203149'
  tertiary-container: '#8191ae'
  on-tertiary-container: '#192a42'
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
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#b6c7e6'
  on-tertiary-fixed: '#0a1c33'
  on-tertiary-fixed-variant: '#374761'
  background: '#101417'
  on-background: '#e0e3e7'
  surface-variant: '#313538'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  eyebrow-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

This design system is engineered for high-precision technical documentation, evoking the focused environment of a sophisticated command center or a modern aerospace engineering suite. The brand personality is authoritative, technical, and hyper-organized, designed to provide clarity within complex data structures.

The visual direction follows a **Modern Technical** aesthetic, blending elements of high-end SaaS with "NASA-spec" utility. It utilizes a dark, airy "blueprint" palette to reduce eye strain during long documentation sessions. The interface relies on hairline precision, systematic spacing, and subtle grid textures to reinforce a sense of structural integrity and engineering excellence.

## Colors

The palette is anchored in deep midnight blues to create a "Blueprint" canvas. 

- **Canvas & Surfaces:** The base layer uses a deep navy to provide a high-contrast environment for technical diagrams. Elevated surfaces (cards) use a slightly lighter tint to indicate hierarchy.
- **Accents:** The primary Blue and secondary Cyan are used for interactive states and primary actions, providing a "glowing" digital feel against the dark background.
- **Functional Tokens:** A specific range of high-visibility semantic colors is reserved for system categorization (BO, UC, FR, etc.), ensuring immediate visual recognition of architectural components.
- **Borders:** Hairline strokes in a muted medium blue define structure without adding visual bulk.

## Typography

Typography is used as a tool for structural clarity. 

- **Headlines:** Space Grotesk provides a geometric, technical feel for major landmarks and section titles.
- **Body:** Inter is used for all descriptive text and documentation content to ensure maximum readability and a neutral tone. Use sentence case for all UI labels and body text.
- **Technical Metadata:** JetBrains Mono is utilized for IDs, codes, and "eyebrow" labels. Eyebrows must be set to 11px, uppercase, with 0.1em tracking to distinguish them as metadata identifiers.

## Layout & Spacing

The layout philosophy is based on a **fixed-fluid hybrid grid**. Documentation content is centered within a 1440px max-width container, while administrative panels and sidebars are anchored to the viewport edges.

- **Grid:** A subtle 20px x 20px background grid texture should be visible on the base canvas to reinforce the "Blueprint" theme.
- **Spacing Rhythm:** All spacing follows a 4px baseline. Components use 8px (2 units) or 16px (4 units) for internal padding.
- **Responsive Behavior:** On mobile, margins reduce to 16px and multi-column technical layouts reflow into a single column. Sidebars transition into full-screen overlays.

## Elevation & Depth

This design system uses **Tonal Layering** combined with **Hairline Outlines** to define depth.

- **Base Layer:** The canvas (#0B1526) sits at the lowest level.
- **Lifted Surface:** Cards and modals (#16273F) are visually lifted using a combination of a #33517E hairline border and a soft, large-radius ambient shadow (0px 8px 24px rgba(0, 0, 0, 0.4)).
- **Interactivity:** On hover, cards should transition to a slightly brighter border (#4A6E9B) to indicate focus without changing the background color.

## Shapes

The shape language is "Soft-Technical." Elements use a consistent 8px (0.5rem) corner radius to balance the harshness of the dark technical palette. 

- **Small Components:** Checkboxes and small tags use a 4px radius.
- **Standard Components:** Buttons, inputs, and cards use the default 8px radius.
- **Large Components:** Modals and large containers may use a 12px radius for a more prominent "container" feel.

## Components

- **Buttons:** Primary buttons use a solid Cyan (#22D3EE) background with dark navy text for maximum contrast. Secondary buttons are outlined with a hairline stroke and use the Blue (#3B82F6) accent for text.
- **Chips / Status Badges:** Use the functional color tokens (BO, UC, etc.) with a low-opacity background (15%) and a solid matching border. Text should be 11px Mono.
- **Input Fields:** Use a dark background (#0B1526) with a #33517E border. On focus, the border glows with the Primary Blue accent and a subtle outer shadow.
- **Lists:** Documentation lists use subtle horizontal dividers (#33517E) and 12px vertical padding. Use JetBrains Mono for line numbers or IDs.
- **Cards:** Essential for grouping documentation sections. Cards must feature the hairline border and the "lifted" shadow profile.
- **Technical Diagrams:** Use the Secondary Accent (Cyan) for paths/connections and Primary Accent (Blue) for nodes.