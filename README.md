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
booking/             Standalone booking page (/booking)
assets/images/       Brand, team, portfolio, and mountain images
notes/               Internal reference docs
```
