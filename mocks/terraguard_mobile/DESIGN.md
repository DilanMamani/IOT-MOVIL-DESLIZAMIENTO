---
name: TerraGuard Mobile
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#e2bfb0'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#a98a7d'
  outline-variant: '#5a4136'
  surface-tint: '#ffb693'
  primary: '#ffb693'
  on-primary: '#561f00'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#a04100'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb3ad'
  on-tertiary: '#68000a'
  tertiary-container: '#ff6762'
  on-tertiary-container: '#6a000b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ad'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#930013'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  display-lg:
    fontFamily: DM Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: DM Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  body-bold:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: '0'
  label-caps:
    fontFamily: DM Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  stat-lg:
    fontFamily: DM Mono
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin-mobile: 16px
---

## Brand & Style

The design system for this mobile IoT application is rooted in **Modern Minimalism with a High-Contrast Tech overlay**. It is engineered for critical-response environments where legibility and immediate data recognition are paramount. The brand personality is precise, clinical, and authoritative, moving away from the rustic earthiness of the web platform toward a high-performance "Control Room" aesthetic.

The UI utilizes a **Deep Tech Dark Mode** (OLED-optimized) to ensure that vibrant status indicators for hazards (oranges, reds) and safety (emerald greens) remain visually dominant. The style focuses on "glanceable" telemetry, using thin borders and subtle depth to organize complex sensor data into a clean, military-grade dashboard experience.

**Key visual principles:**
- **High-Intensity Contrast:** Neon status colors against deep navy backgrounds.
- **Precision Engineering:** Use of monospaced fonts for raw data and coordinates.
- **Tactile Reliability:** Large, clear touch targets designed for high-stress field use.

## Colors

The color palette is functionally driven, prioritizing status communication over decoration.

- **Primary (Vibrant IoT Orange):** Reserved for interactive elements, primary CTAs, and active navigation states.
- **Secondary (Emerald Green):** Indicates "All Clear" or safe sensor thresholds.
- **Tertiary (Hazard Red):** Reserved strictly for critical threshold breaches and emergency alerts.
- **Neutral (Deep Tech Navy):** The foundational canvas. Use the base navy (`#090d16`) for backgrounds and the lighter surface navy (`#121926`) for cards and containers.
- **Warning (Saturated Gold):** Used for elevated risk states that have not yet reached critical levels.

**Color Roles:**
- Use **Translucent Tints** (15% opacity) of functional colors for background fills in badges and alerts to maintain readability while providing a clear color-coded context.
- **Border Slate (`#1f2d44`)** should be used for all structural dividers to keep the UI clean without introducing high-contrast lines that distract from data.

## Typography

This design system uses a dual-font approach to separate human-readable content from machine-generated telemetry.

- **DM Sans (Human/Interface):** Used for all headlines, labels, and body copy. It provides a modern, geometric clarity that remains legible at small sizes.
- **DM Mono (Data/Technical):** Used exclusively for sensor readings, coordinates, timestamps, and node IDs. The fixed-width character set ensures that rapidly updating numbers don't cause layout jitter.

**Implementation Notes:**
- **Stat-lg:** Use this for primary live metrics inside sensor cards.
- **Label-caps:** Use for secondary metadata categories (e.g., "LAST SYNC", "NODE ID").
- **Mobile scaling:** For screens narrower than 360px, reduce `display-lg` to 28px.

## Layout & Spacing

The layout follows a **Fluid Grid** model optimized for single-handed mobile use. 

- **Spacing Rhythm:** Based on a 4px increments. Use `16px (md)` for standard padding inside containers and `8px (sm)` for grouping related elements like an icon and its label.
- **Margins:** Standardize on a **16px side margin** for all mobile screens. Cards should stretch to fill the horizontal width.
- **Safe Areas:** Ensure a 24px vertical buffer at the bottom of the screen to account for modern mobile gesture bars, keeping primary buttons above this zone.
- **Data Density:** Maintain tight vertical spacing between sensor metrics to allow the user to see at least 4-5 sensor cards without scrolling.

## Elevation & Depth

In this dark-themed system, depth is conveyed through **Tonal Layering** rather than heavy shadows.

- **Level 0 (Background):** Deep Tech Navy (`#090d16`). 
- **Level 1 (Cards/Surfaces):** Container Navy (`#121926`). Use this for sensor cards, list items, and modal containers.
- **Level 2 (Interactive/Inputs):** Surface Soft (`#1a2436`). Used for input fields, toggle tracks, and secondary button backgrounds.
- **Outlines:** Use low-contrast outlines (`#1f2d44`) for all Level 1 surfaces.
- **Glow Effects:** Critical alerts (Red) and Active Focus states (Orange) may use a subtle, tinted outer glow (8px blur, 20% opacity) to simulate a "lit" LED indicator on the hardware.

## Shapes

The shape language is modern and balanced, using rounded corners to soften the technical nature of the data.

- **Standard (8px):** Used for input fields and secondary interface elements.
- **Rounded-lg (16px):** Used for primary sensor cards and modals.
- **Pill (Full):** Reserved for primary buttons and status badges/chips. This distinct shape signals "Status" or "Action" clearly versus "Information" (rectangular cards).

## Components

### Buttons
- **Primary:** Pill-shaped, 52px height, solid IoT Orange fill. Text is white, bold.
- **Secondary:** Pill-shaped, 52px height, outline style with `#1a2436` background and slate-gray text.

### Notification Cards
- **Alert Card:** 16px padding, Level 1 surface. Must include a 4px wide vertical "Threat Ribbon" on the left edge (Green, Gold, or Red). 
- **Header:** Title on left, DM Mono timestamp on right.

### Status Indicators
- **Telemetry Badges:** Small pill shapes with 15% tinted backgrounds. Always pair with a status icon (Check, Warning, or Hazard) for accessibility.
- **Live Gauges:** 6px tall horizontal tracks. The fill color must dynamically transition between Green, Gold, and Red based on preset sensor thresholds.

### Input Fields
- **Dashboard Toggles:** 30px height pill track. Inactive is `#1a2436`. Active is `#ff6b00`. Thumb is always white.
- **Text Inputs:** Background `#1a2436` with a 1px border. Focus state triggers an Orange border and a subtle glow.

### Urgency Selector
- A segmented control (4 units) where selected states use functional colors (Low: Green, Med: Gold, High: Orange, Critical: Red).