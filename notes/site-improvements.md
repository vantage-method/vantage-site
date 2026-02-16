## Performance review (from the codebase)

### 1. **Third‑party / render-blocking**

- **Vanta.js + p5.js** – Two scripts from CDNs (p5 ~1.7.0, vanta trunk). They’re preloaded but still block parsing until they run. They’re the heaviest cost for first load.
- **Google Fonts** – Three families (Barlow, Barlow Condensed, Space Mono) with several weights. The single `<link>` in the template pulls a lot of CSS and can delay first paint.

**Ideas:**  
Load Vanta after first paint (e.g. after `requestIdleCallback` or a short `setTimeout`), or show a static hero and init Vanta only when the hero is in view. For fonts, subset to the weights you use and consider `font-display: swap` (or the equivalent in the Google Fonts URL) so text isn’t invisible while fonts load.

---

### 2. **CSS**

- **Many separate stylesheets** – `base.css` plus 9 section CSS files (hero, mountains, principles, how-we-work, what-we-do, team, portfolio, pricing, cta). Each is a separate request and can delay first paint.

**Ideas:**  
For production, concatenate and minify into one (or a few) CSS file(s) so the critical path has fewer requests. Inline the small “loading splash” block you already have; you could also inline the CSS needed for above-the-fold (hero + header) and load the rest async or later.

---

### 3. **Images**

- **Above-the-fold:**  
  Logo (`Vantage-Method-Dark.png`) appears twice (splash + header). Mountain images (left, right, center back/middle/front) are in the first view.
- **No `loading` / `fetchpriority`:**  
  All `<img>` tags use default loading. The mountains and logos are critical; everything below the fold (e.g. CTA mountains, team photos) is not.

**Ideas:**  
- Preload the logo and the first mountain image (or the single most important one):  
  `<link rel="preload" href="assets/images/brand/Vantage-Method-Dark.png" as="image">`  
  and same for one key mountain if you want.
- Add `fetchpriority="high"` to the logo and the main hero mountain image(s).
- Add `loading="lazy"` to all images that are below the fold (e.g. CTA section mountains, any images in portfolio, team photos that are not in the initial orbit).  
You already use `.webp` in many places; keep that. Consider AVIF for the same images where you want maximum savings.

---

### 4. **Scripts**

- **7 section scripts** – All are blocking and at the bottom of the body. They run in order; hero (and thus Vanta) runs first, which is good, but the rest don’t need to block initial render.

**Ideas:**  
- Give non-critical section scripts `defer` (or load them dynamically) so parsing isn’t blocked.  
- Keep hero (and any script that must run for first paint) as-is; defer the rest (mountains, principles, how-we-work, what-we-do, team, portfolio, cta) so the page can paint sooner.

---

### 5. **Loading splash**

- Splash stays until `window.addEventListener('load', dismiss)` – i.e. until **all** resources (images, fonts, scripts, etc.) are done. That can be a long time, especially with Vanta and many images.

**Ideas:**  
- Dismiss the splash on “first meaningful paint” instead of full `load`: e.g. when the hero is visible and the logo is painted, or after a short timeout (e.g. 1.5–2s) plus checking that the hero element is in the DOM.  
- Or keep the current logic but add a max wait (e.g. 3s) so you never block the user for too long even on slow networks.

---

### 6. **What’s already in good shape**

- **Preconnect** for Google Fonts.
- **Preload** for p5 and Vanta (they still block, but they’re prioritized).
- **Netlify cache headers** for `/assets/images/*`, section CSS/JS, and shared CSS/JS (long cache, immutable-style).
- **WebP** for mountains, team, portfolio, etc.
- **Single `index.html`** with no SPA router overhead.

---

## Summary: high‑impact, low‑effort changes

1. **Preload** the logo image and add `fetchpriority="high"` to the logo and the main hero mountain image(s).  
2. **Lazy-load** all below-the-fold images (`loading="lazy"`).  
3. **Defer** every section script that isn’t needed for the first screen (everything after hero/mountains if those are the only ones needed for first paint).  
4. **Dismiss the splash** on first paint or after a short timeout instead of on full `load`.  
5. **Subset and `font-display: swap`** for Google Fonts.  
6. **Load Vanta after first paint** (or when the hero is in view) so the main thread and first paint aren’t blocked by p5 + Vanta.

---

## Live run analysis (Agent mode)

**What was done:** The site was served locally (Python `http.server` on port 3333) and loaded in the browser.

**Observations:**

1. **Loading splash** – The splash screen (logo + progress bar) is visible for several seconds. It only dismisses on `window.load`, so every image, font, and script (including p5.js and Vanta from CDNs) must finish before the user sees the real page. On a fast local connection this is already noticeable; on 3G/slow networks it would feel long.

2. **First paint vs. “ready”** – The DOM and section content are all present; the main delay to *feeling* fast is the splash gate. The hero (headline, CTAs, Vanta contour background) renders correctly once the splash is gone. So the biggest win is either shortening the splash or gating it on something less than full `load`.

3. **Third-party scripts** – p5.js and Vanta are loaded from cdnjs and jsDelivr. They are preloaded but still block; they’re the heaviest single cost for initial load and main-thread work. Deferring Vanta until after first paint (or when the hero is in view) would improve perceived speed.

4. **Layout and content** – The page is single-column, with clear sections (hero, mountains, principles, how-we-work, what-we-do, team, portfolio, pricing, CTA). No obvious layout shift or missing content once loaded. Nav (desktop and mobile), hero headline “NEW CUSTOMERS. / That actually fit in your operating margins.”, and both CTAs are visible and correct.

**Recommendation for exact numbers:** Run **Lighthouse** (Chrome DevTools → Lighthouse tab) on the production or staging URL with “Performance” and “Best practices” enabled. That will give LCP, TBT, CLS, and a list of render-blocking resources and opportunities (e.g. “Reduce unused JavaScript”, “Preload LCP image”). The suggestions in the sections above align with typical Lighthouse advice for this kind of stack.

**Priority order from the live run:**

1. **Dismiss splash earlier** – e.g. on first meaningful paint or after 1.5–2s max wait.
2. **Defer Vanta (and optionally p5)** – load after first paint or when hero is in view.
3. **Preload + `fetchpriority="high"`** for the logo and main hero mountain image(s).
4. **`loading="lazy"`** for all below-the-fold images (CTA mountains, team, portfolio).
5. **Font subset + `font-display: swap`** in the Google Fonts URL.
6. **Concatenate/minify CSS** for production to reduce request count and first-paint delay.