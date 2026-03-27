# Vantage Method — Marketing Website

Static single-page marketing site built with vanilla HTML, CSS, and JavaScript. Hosted on Netlify.

## Local Development

No dependencies to install. Preview with any static file server:

```bash
python3 -m http.server 3333
```

Then open [http://localhost:3333](http://localhost:3333).

## Build

The site uses a template system. `index.template.html` is the source file — it contains `<!-- @include path/to/file.html -->` directives that pull in each section. Run the build script to assemble the final `index.html`:

```bash
node build.js
```

**Do not edit `index.html` directly.** Edit the template or section files, then rebuild.

Netlify runs `node build.js` automatically on deploy (configured in `netlify.toml`).

## Project Structure

```
shared/              Global styles (base.css) and scripts (global.js)
sections/            Each page section has its own folder with .html, .css, .js
  hero/              Vanta.js animated hero
  mountains/         Decorative parallax mountains
  principles/        Three principle cards
  how-we-work/       Process steps
  what-we-do/        Services
  team/              Interactive orbital team layout
  portfolio/         Horizontal drag-scroll gallery
  pricing/           Partnership & pricing
  cta/               Contact form (posts to GHL)
kenny/               Partner page — Kenny (salesperson landing page)
zach/                Partner page — Zach Gray (salesperson landing page)
zach/diagnostic/     Growth Ceiling Diagnostic (standalone scored quiz)
booking/             Standalone booking page (/booking)
evaluation/          Strategic growth consultation form (multi-step application)
intake/              Password-gated partner intake form
assessment/          Marketing scope & readiness checklist (internal tool)
google-ads/          Service landing page — Google Ads
facebook-ads/        Service landing page — Facebook Ads
google-meta-ads/     Service landing page — Google + Meta Ads
custom-website/      Service landing page — Custom Website
starter-pack/        Service landing page — Starter Pack
assets/images/       Brand, team, portfolio, and mountain images
notes/               Internal reference docs
```

## Forms, Quizzes & Diagnostic Tools

There are several interactive tools that serve different purposes — don't confuse them:

| Tool | URL | What It Is | Audience |
|------|-----|------------|----------|
| **AI Quiz** | Homepage modal (`shared/ai-quiz-modal.*`) | 10-question popup quiz scoring AI maturity (1-4 levels). Triggered by time delay, exit intent, or CTA cards. Email gate before results. | Public visitors |
| **Growth Ceiling Diagnostic** | `/zach/diagnostic/` | 12-question standalone page scoring 4 growth categories (Message Clarity, Funnel Simplicity, Client Retention, Lead Gen). Shows "Fix This First" recommendation. Email gate before results. | Zach's prospects |
| **Evaluation Form** | `/evaluation/` | Multi-step application form (4 steps: about you, goals, budget, timing). No scoring or results — it's a lead qualification form. Linked from service landing pages. | Prospective clients |
| **Intake Form** | `/intake/` | Password-gated long-form partner onboarding questionnaire. Internal use only. | New partners |
| **Assessment** | `/assessment/` | 86-item checklist across 12 marketing categories (A/P/N/X ratings). Real-time scoring dashboard. Not yet connected to GHL. | Internal / partner workflow |
| **CTA Contact Form** | Homepage `#contact` section (`sections/cta/`) | Simple lead capture form (name, email, phone, message). Posts to GHL. | Public visitors |
| **Partner Page Forms** | `/zach/#contact`, `/kenny/#contact` | Contact forms on individual salesperson pages. Post to GHL. | Partner prospects |

All forms that submit to GHL use the same location ID (`1CRkPO5O8TwTWL8msQNK`) and reCAPTCHA v3 key.

## Service Landing Pages

Each service landing page lives in its own folder with an `index.template.html` that gets built into `index.html` via `node build.js`. They share common styles (`shared/service-landing.css`), form logic (`shared/service-landing.js`), and a reusable form partial (`shared/service-form.html`).

### Lead Scoring

After a visitor submits the strategic growth consultation form, a client-side scoring system (`shared/lead-scoring.js`) grades the lead on a 100-point scale:

| Field | Max Points |
|-------|-----------|
| Monthly Revenue | 25 |
| Budget Commitment | 25 |
| Implementation Timeline | 20 |
| Decision Maker | 15 |
| Seriousness (1–10) | 15 |

Leads scoring **60+** are redirected to `/booking/`. Others see a friendly confirmation message. The threshold is a single constant (`SCORE_THRESHOLD`) at the top of `shared/lead-scoring.js`.
