# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vantage Method marketing website — a static single-page site built with vanilla HTML, CSS, and JavaScript. Hosted on Netlify.

## Build & Development

```bash
# Build index.html from template + section includes
node build.js
```

There is no package.json, no npm dependencies, and no dev server. The build script assembles `index.html` from `index.template.html` by replacing `<!-- @include path/to/file.html -->` directives with file contents. After editing any section HTML, re-run `node build.js` to regenerate `index.html`.

For local preview, use any static server (e.g. `python3 -m http.server 3333`).

Netlify runs `node build.js` on deploy with publish directory `.` (configured in `netlify.toml`).

## Architecture

### Template System

`index.template.html` is the master file containing the full `<head>`, splash screen, header/nav, and `@include` directives for each section. The generated `index.html` should not be edited directly — edit the template or section files instead.

### Section-Based Structure

Each page section is self-contained in `sections/<name>/` with its own HTML, CSS, and JS:

- `sections/hero/` — Full-viewport Vanta.js TRUNK animation, rotating headline text
- `sections/mountains/` — Decorative parallax mountain images
- `sections/principles/` — Three principle cards with scroll-triggered reveal
- `sections/how-we-work/` — Process steps with scroll animations
- `sections/what-we-do/` — Services/offerings
- `sections/team/` — Canvas-based orbital layout with interactive bio panels
- `sections/portfolio/` — Horizontal drag-scroll gallery with filters, counters, Vimeo lightbox
- `sections/pricing/` — Partnership tiers
- `sections/cta/` — Call-to-action with animated question cards

### Shared Code

- `shared/base.css` — CSS custom properties, reset, header/nav, typography, mobile menu
- `shared/global.js` — Header hide-on-scroll, mobile menu toggle, smooth anchor scrolling, back-to-top button

### External Dependencies (CDN)

- **Vanta.js** (v0.5.24) + **p5.js** (v1.7.0) — 3D animated hero background
- **Google Fonts** — Barlow, Barlow Condensed, Space Mono

## Key Patterns

- Section JS files use IIFEs and IntersectionObserver/scroll listeners for reveal animations
- CSS uses custom properties defined in `shared/base.css` (e.g. `--color-*`, `--font-*`)
- Images are WebP with PNG fallbacks; brand assets are in `assets/images/brand/`
- The loading splash screen gates on `window.load` — all resources must finish before dismissal

## Notes

`notes/site-improvements.md` contains a detailed performance analysis and optimization roadmap.
