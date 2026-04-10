# Style Design Guide

## Intent

This product should feel like a language-learning studio for visual learners:

- clean and calm at first glance
- vivid and memorable in focused moments
- structured enough for study workflows
- expressive without becoming noisy

The visual reference direction combines:

- editorial manga-style panel composition
- white paper surfaces with airy negative space
- colorful ink splashes and chromatic highlights
- light scientific diagrams, nodes, and learning-map patterns

The result should feel scholarly, artistic, and highly legible.

## Core Design Principles

1. Use white or near-white as the primary canvas.
2. Use color in deliberate zones, not as full-page saturation.
3. Let sections feel like study cards, boards, and annotated learning panels.
4. Emphasize recognition and scanning over decoration.
5. Keep every learning task visually separable: input, extraction, review, transcription, history.
6. Use visual contrast to teach hierarchy, not just to decorate.

## Brand Mood

- Clean
- intelligent
- artistic
- light
- precise
- multilingual
- memorable

Avoid:

- generic SaaS gradients
- dark-mode-first aesthetics
- heavy glassmorphism
- dense dashboard clutter
- flat gray corporate admin styling
- yellow-heavy palettes

## Color System

## Base Neutrals

Use warm paper tones for the main UI foundation.

```css
:root {
  --paper-0: #fffdf8;
  --paper-1: #fbf6ee;
  --paper-2: #f2e9dc;
  --ink-0: #201a17;
  --ink-1: #4c433d;
  --ink-2: #7a7068;
  --line-soft: rgba(55, 38, 28, 0.10);
  --line-mid: rgba(55, 38, 28, 0.18);
}
```

Rules:

- Default page background should stay in `--paper-0` to `--paper-2`.
- Primary text should use `--ink-0`.
- Secondary text should use `--ink-1`.
- Tertiary metadata should use `--ink-2`.

## Accent Palette

Use accents as memory anchors. Each accent can map to learning states, content types, or modules.

```css
:root {
  --coral: #ef6b57;
  --apricot: #f4a259;
  --gold: #f2c14e;
  --mint: #75c9b7;
  --aqua: #58bcd8;
  --sky: #78a6ff;
  --iris: #8b7fd1;
  --rose: #e87ea1;
  --berry: #c74d7f;
}
```

Rules:

- Never use all accent colors in one component.
- Limit each screen to 1 dominant accent + 1 support accent + neutrals.
- Reserve multi-color treatments for banners, hero areas, section dividers, and learning progress visuals.
- For task-heavy areas, use a single accent family per module.

## Semantic Colors

```css
:root {
  --success: #2f8f6a;
  --warning: #d08b22;
  --danger: #c85a54;
  --info: #4f8ecf;
}
```

Rules:

- Semantic colors should be flatter and calmer than decorative accents.
- Error states must remain readable on light backgrounds.

## Color Usage by Module

- Home and discovery: `--coral` + `--gold`
- Current extraction workflow: `--aqua` + `--sky`
- Saved runs/history: `--mint` + `--berry`
- Backend status/system feedback: `--info`, `--success`, `--warning`, `--danger`

## Typography

The references suggest contrast between elegant display forms and clean study text.

### Typeface Roles

- Display headings: high-contrast serif or refined editorial serif
- UI body: humanist sans or readable transitional serif
- Data and URLs: monospace only where needed

Suggested direction:

- Headings: `"Cormorant Garamond"`, `"Bodoni Moda"`, `"DM Serif Display"`
- Body/UI: `"Source Sans 3"`, `"Nunito Sans"`, `"Work Sans"`
- Code/data: `"IBM Plex Mono"`, `"JetBrains Mono"`

### Typographic Rules

- Page titles should feel editorial, not corporate.
- Body copy must remain simple and highly readable.
- Use sentence case for most UI labels.
- Avoid all-caps except tiny eyebrow labels.
- Use larger line-height in descriptive text blocks.

Example scale:

```css
:root {
  --text-xs: 12px;
  --text-sm: 14px;
  --text-md: 16px;
  --text-lg: 20px;
  --text-xl: 28px;
  --text-2xl: 42px;
}
```

## Layout System

## Global Structure

- Max content width: `1200px` to `1360px`
- Outer padding desktop: `24px` to `40px`
- Outer padding mobile: `16px` to `20px`
- Use generous whitespace

## Grid

- Prefer asymmetrical 12-column thinking
- Use split layouts like `7/5`, `8/4`, `5/7`
- Avoid overly even admin-dashboard symmetry on every screen

## Spacing Rhythm

Use an 8px base grid.

```css
:root {
  --space-1: 8px;
  --space-2: 12px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;
}
```

## Boxing and Containers

Cards should feel like study sheets pinned to a working table.

### Card Rules

- Background: warm white, never pure blue-gray
- Border radius: `18px` to `28px`
- Border: thin, warm, subtle
- Shadow: soft downward shadow, low opacity
- Inner padding: generous

Card recipe:

```css
background: rgba(255, 252, 245, 0.92);
border: 1px solid rgba(55, 38, 28, 0.10);
border-radius: 24px;
box-shadow: 0 18px 40px rgba(77, 52, 28, 0.10);
```

### Panel Hierarchy

- Primary panel: strongest contrast, used for the active task
- Secondary panel: softer, used for supporting info
- Utility panel: compact, used for status, counts, controls

### Section Breaks

Use one of:

- thin colored top border
- corner accent
- faded graph/pattern background
- subtle watercolor wash

Avoid heavy separators and thick dark rules.

## Visual Language

## Backgrounds

The background should stay quiet.

Allowed:

- soft paper gradients
- faint mesh/network line patterns
- low-opacity watercolor or ink bloom overlays
- subtle manga-panel slicing in hero areas

Not allowed:

- full-page loud splatter backgrounds behind content
- high-contrast image textures under text

## Illustration and Motif Direction

Borrow from the references in abstraction, not directly in subject matter.

Use:

- vertical panels
- brush-like color sweeps
- molecular/network node structures
- map-like paths
- notebook-style annotations
- layered paper and margin space

Avoid:

- literal anime character art in the app UI
- hyper-detailed illustrations inside task-heavy components

## Component Rules

## Buttons

Buttons should feel crisp and tactile.

Primary button:

- filled with module accent
- dark text only if contrast supports it, otherwise white
- rounded pill or soft rounded rectangle
- no heavy gradients

Secondary button:

- white or transparent
- thin border
- tinted label

Ghost button:

- used for low-priority actions
- can use a watercolor tint background on hover

Interaction:

- hover: slight lift
- active: subtle press-in
- focus: clear ring, not browser default only

## Inputs

Inputs must feel calm and writable.

Rules:

- light background
- soft border
- rounded 14px to 18px
- strong focus ring in module accent
- roomy height for scanning and editing

Focus style:

```css
outline: none;
border-color: var(--aqua);
box-shadow: 0 0 0 4px rgba(88, 188, 216, 0.18);
```

Textareas should look like work surfaces, not terminal boxes.

## Tags and Pills

Use pills for:

- status
- module
- language
- run type
- counts

Rules:

- soft tint background
- subtle border
- tiny but readable
- never overly saturated

## Audio Cards

Each audio item should feel like a lesson tile.

Must include:

- clear numeric order
- title prominence
- compact metadata
- embedded player
- transcript region with strong readability

Visual cues:

- the active or currently transcribing card gets a color halo or top stripe
- completed cards get a calm success-tinted edge
- failed cards get a restrained danger-tinted edge

## Transcript Blocks

Transcript areas should read like annotation paper.

Rules:

- use off-white background
- dashed or pencil-light border
- slightly larger line-height
- allow generous padding

## Navigation

Navigation should feel like moving between study boards.

Rules:

- use clear section labels
- active tab should be visibly anchored with color and weight
- avoid heavy navbar chrome
- mobile nav should stay simple and obvious

## Highlight Strategy

This product is for visual learners, so highlight logic matters.

### Use Highlight for Meaning

- current task
- next recommended action
- recently saved result
- active audio item
- matching filters or categories

### Highlight Methods

- color stripe on the top or left edge
- tinted panel background
- soft glow ring on focus
- icon + label pairing
- patterned backdrop in hero banners only

### Avoid

- too many simultaneous bright callouts
- using red for non-error emphasis
- glowing effects on every component

## Learning-Centered UX Rules

- One major task per screen should dominate visually.
- Show progression in chunks, not walls of controls.
- Use color repetition to help memory.
- Important actions should stay in predictable positions.
- History and previous runs should feel archival and organized.
- Extraction and transcription should feel procedural and guided.

## Motion

Animation should be meaningful and restrained.

Allowed:

- soft fade-up on page or section load
- stagger reveal for audio cards
- status pulse during transcription
- tab underline or pill slide transitions

Not allowed:

- bouncy animations
- constant floating motion
- large parallax

Timing guidance:

- quick interactions: `120ms` to `180ms`
- panel transitions: `220ms` to `320ms`

## Accessibility Rules

- Maintain strong text contrast on paper backgrounds.
- Never rely on color alone for status.
- Focus states must always be visible.
- Body text should remain readable at standard zoom.
- Decorative backgrounds must never compete with task text.

## Responsive Rules

### Desktop

- use editorial asymmetry
- preserve a strong hero
- keep task panel and preview/history panel side by side where useful

### Tablet

- collapse to stacked panels
- preserve section hierarchy through spacing and color

### Mobile

- one main action block per viewport
- keep controls full-width
- minimize decorative pattern density
- transcripts and saved runs should remain easy to scan

## Page-Level Guidance

## Home / Landing

- Use a strong banner with sliced color zones or abstract panel strips.
- Lead with one headline and two clear actions.
- Show system readiness in a compact but elegant utility card.

## Current Run

- Emphasize the paste/extract area as the main work surface.
- Keep backend settings visually secondary but accessible.
- Audio result cards should stack with clear progression.

## Saved JSONs

- Make this feel archival and curated.
- Use filters, counts, and timestamps with clean catalog styling.
- The selected run detail should feel like opening a study notebook.

## Backend Status

- Present status as calm operational feedback.
- Use semantic color plus icon or wording.
- Never make normal healthy state feel alarming.

## Decorative Pattern Guidance

Use these patterns sparingly:

- watercolor splash headers
- node-link scientific diagrams
- honeycomb or network fragments
- panel slicing inspired by illustrated anthology covers

Place them in:

- hero banners
- empty states
- separators
- section headers

Do not place them behind dense tables, transcripts, or form-heavy zones.

## Tone of Voice in UI

- short
- guided
- precise
- supportive
- never robotic

Good:

- Extract audio URLs
- Review saved runs
- Backend ready
- Save this run

Avoid:

- overly technical wording in primary UI
- long admin-style labels

## Implementation Constraints

- Default to light mode first.
- Use CSS variables for every palette token.
- Build module-based accent theming.
- Keep decorative layers separated from content layers.
- Prefer SVG/CSS patterns over heavy bitmap textures.
- Keep performance high; decoration should not slow the workspace.

## Definition of Done for Visual Rebuild

The redesign is successful when:

- the interface feels distinctly educational and memorable
- the app reads as cleaner and more premium than a generic tool
- visual learners can distinguish sections instantly
- the workflow remains calm even with many audio cards
- the UI looks cohesive across home, current run, and saved runs
- the design language is reusable for future language-learning modules
