# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vantage Method marketing website — a static site built with vanilla HTML, CSS, and JavaScript. Hosted on Vercel.

## Build & Development

```bash
# Build the home page, the service landing pages, assets/compiled.css and dist/
node build.js
```

There is no package.json, no npm dependencies, and no dev server. `build.js` does four things:

1. **Home page.** Writes `index.html` from `index.template.html` with HTML comments stripped. The template is self-contained (its CSS and JS are inline) and has no `@include` directives, which is why the build reports "0 sections included". The cache-busting step that appends `?v=HASH` to `assets/compiled.css` and to `shared/`/`sections/` JS finds nothing to change, because the home page links none of them.
2. **Service landing pages.** Builds each folder in `LANDING_PAGES` from its `index.template.html`, replacing `<!-- @include path/to/file.html -->` directives (`shared/footer.html`, `shared/service-form.html`) with file contents.
3. **CSS.** Concatenates and minifies `CSS_FILES` into `assets/compiled.css` (gitignored). Only `/legacy/` uses it.
4. **Publish.** Copies `PUBLISH_PATHS` into `dist/`, skipping `PRIVATE_PATTERNS`: templates, build files, and the `.html` fragments in `sections/` and `shared/`, which are build inputs, not pages.

After editing a template or an included fragment, re-run `node build.js`. The generated `index.html` files are committed.

For local preview, use any static server (e.g. `python3 -m http.server 3333`).

Vercel runs `node build.js` on deploy with publish directory `dist` (configured in `vercel.json`, which also holds the security headers and CSP).

## Architecture

### Home Page

`index.template.html` is the whole home page: `<head>`, inline `<style>`, header/nav, the sections (hero, integrations marquee, how it works, capabilities, stat band, connections, pricing, FAQ, final CTA), footer and an inline `<script>`. Edit the template, not the generated `index.html`.

### Legacy Site and `sections/`

The previous agency homepage is archived as a static, noindex page at `legacy/index.html` (and on the `legacy-site-2026-09-30` branch). It is not rebuilt; it links `/assets/compiled.css`, `/shared/*.js` and `/sections/<name>/*.js` directly, so those files still ship. The folders in `sections/<name>/` are that page's sections, each with its own HTML and CSS, and most with JS. The section HTML is already inlined into `legacy/index.html`; nothing includes it any more, and it is not published.

- `sections/hero/` — Full-viewport Vanta.js TRUNK animation, rotating headline text
- `sections/mountains/` — Decorative parallax mountain images
- `sections/principles/` — Three principle cards with scroll-triggered reveal
- `sections/how-we-work/` — Process steps with scroll animations
- `sections/what-we-do/` — Services/offerings
- `sections/team/` — Canvas-based orbital layout with interactive bio panels
- `sections/portfolio/` — Horizontal drag-scroll gallery with filters, counters, Vimeo lightbox
- `sections/social-proof/` — Social proof band
- `sections/pricing/` — Partnership tiers
- `sections/cta/` — Call-to-action with animated question cards

### Shared Code

- `shared/base.css` — CSS custom properties, reset, header/nav, typography, mobile menu
- `shared/global.js` — Header hide-on-scroll, mobile menu toggle, smooth anchor scrolling, back-to-top button
- `shared/service-landing.*`, `shared/footer.*`, `shared/service-form.html` — Service landing page styles, form logic, footer and form partials

### External Dependencies (CDN)

- **Vanta.js** (v0.5.24) + **p5.js** (v1.7.0) — 3D animated hero background on the service landing pages and `/legacy/`, loaded with Subresource Integrity by `shared/service-landing.js` and `sections/hero/hero.js`. If you change a version, recompute its `integrity` hash.
- **Google Fonts** — Barlow, Barlow Condensed, Space Mono

## Key Patterns

- Section JS files use IIFEs and IntersectionObserver/scroll listeners for reveal animations
- CSS uses custom properties defined in `shared/base.css` (e.g. `--color-*`, `--font-*`)
- Images are WebP with PNG fallbacks; brand assets are in `assets/images/brand/`
- On `/legacy/`, the loading splash screen gates on `window.load` — all resources must finish before dismissal

## Forms, Quizzes & Diagnostic Tools

These are distinct tools — don't confuse them:

- **AI Quiz** (`shared/ai-quiz-modal.*`) — Popup on `/legacy/` (the old homepage). 10 questions, scores AI maturity (4 levels). Modal triggered by delay/exit-intent/click.
- **Growth Ceiling Diagnostic** (`zach/diagnostic/`) — Standalone page. 12 questions across 4 growth categories, shows "Fix This First" card. For Zach's prospects.
- **Evaluation Form** (`evaluation/`) — Multi-step application form (4 steps). No scoring — pure lead qualification. Linked from service pages.
- **Intake Form** (`intake/`) — Password-gated partner onboarding questionnaire. Internal only.
- **Assessment** (`assessment/`) — 86-item internal checklist with real-time scoring. Not connected to GHL yet.
- **CTA Contact Form** (`sections/cta/`) — Simple lead capture on `/legacy/`.
- **Partner Page Forms** (`zach/`, `kenny/`) — Contact forms on individual salesperson pages.

All GHL forms use location ID `1CRkPO5O8TwTWL8msQNK` and reCAPTCHA v3 key `6LeDBFwpAAAAAJe8ux9-imrqZ2ueRsEtdiWoDDpX`.

## Notes

`notes/site-improvements.md` contains a detailed performance analysis and optimization roadmap.
