# TPL Giving Day

Standalone landing page for Trust for Public Land's Giving Day.

**Live:** https://4site-interactive-studios.github.io/tpl-giving-day/

## What this is

A self-contained HTML/CSS/JS page — no build step, no backend, no third-party scripts, no API calls. Open `index.html` in a browser and it works.

## Page sections

1. **Hero** — Giving Day title + intro
2. **Give** — donation thermometer + 5 most recent donors (shuffled & capped per load)
3. **Act** — advocacy thermometer + petition CTA
4. **Pledge** — pledge thermometer + outdoor-pledge CTA
5. **Our Impact** — 2-col headline + horizontal carousel of 5 cards

## Enhancements over the source page

This site was ported from a Convio CMS preview page that depended on TPL's Convio backend to render correctly. The standalone version below removes that dependency and adds capability the original couldn't support.

### Performance — zero third-party requests

Every external script and stylesheet the original page loaded has been removed or bundled locally:

| Removed | What it was |
|---|---|
| YUI 3 loader + 3 Convio JS modules | Dynamic module loader for Convio CMS components |
| jQuery 2.2.0 (CDN) | Used by the legacy Convio scripts |
| Bootstrap 3.3.6 CSS + JS (CDN) | Grid framework, mostly unused |
| Font Awesome 4.5.0 (CDN) | Icon font, not actually used on the page |
| Google Tag Manager | Analytics container script |
| FundraiseUp widget | Persistent donate button overlay |
| 10 Convio-hosted stylesheets | Various CMS theme overrides |
| Live `CRAdvocacyAPI` AJAX calls | Fetched Act/Pledge counts on every page load |
| Convio session keep-alive ping | Kept a hidden Convio session alive every 8 minutes |

**Result:** ~25 external requests removed. Fonts, images, CSS, and JS are all served from the same origin. Preload hints prioritize render-critical assets so first paint is fast.

### Reliability

- **No Convio outage can break the page.** With no API calls or remote scripts, the site renders correctly even if TPL's backend is down.
- **No session timeout.** The original embedded a Convio session-keepalive ping; this version has nothing to time out.
- **Hostable anywhere.** Moved from a Convio admin preview URL to standard static hosting (currently GitHub Pages).

### Maintainability

- **One config block edits everything.** Donation totals, goals, donor list, action counts — all live in a single `window.GIVING_DAY_CONFIG` object at the top of `index.html`. No code changes needed to update numbers.
- **Brand colors tokenized.** Eight named brand colors defined as CSS custom properties in one `:root` block at the top of `style.css`. Edit a hex value once → retheme the whole site.
- **Clean separation.** Markup, styles, and behavior live in `index.html`, `style.css`, and `script.js` respectively. The original mixed all three across ~10 inline blocks scattered through the file.
- **No build step.** Edit a file, save, refresh. No npm install, no compile, no node_modules.
- **The original was ~2,225 lines of HTML** with mountains of vestigial Convio markup and dead JS. **The new `index.html` is ~250 lines.**

### Accessibility (WCAG)

- **Proper heading hierarchy.** Original had 7+ `<h1>` elements per page. New version has exactly one `<h1>` (the page hero), with nested `<h2>` section titles and `<h3>` sub-headings — the structure screen readers expect.
- **Decorative images marked correctly.** Original had conflicting `alt="X"` + `aria-hidden="true"` on photos. New version uses `alt=""` so screen readers skip them cleanly.
- **Keyboard-navigable carousel.** Focus the carousel and press `←` / `→` to scrub between cards. The source-page pattern relied on mouse only.
- **Visible focus indicator** on the carousel arrow buttons for keyboard users.
- **Landmark roles** (`role="region"`, `aria-label`) on the carousel so assistive tech can announce it.

### Security

- **All `target="_blank"` external links** (Act Now, Pledge Time, charity badges) now carry `rel="noopener noreferrer"`. Prevents the destination page from manipulating the originating tab (tabnabbing).
- **Zero third-party tracking scripts loaded.** Original loaded Google Tag Manager + a FundraiseUp widget, both of which can fingerprint and track visitors. The new page sends data to nobody.
- **No external session cookies / auth.** No Convio session, no `jsessionid`, no `keepAlive` pings.

### SEO & social sharing

- **Open Graph + Twitter Card meta tags** with absolute URLs, so when the page URL is pasted into Slack, Facebook, X, etc., the right preview card renders.
- **`og:url`, `og:image`, `twitter:image`** all point at the live deployed URL.
- **Mobile browser theme color** — the mobile address bar tints to TPL evergreen.

### New features

These didn't exist on the source page:

- **"Our Impact" section** — full-width 2-column intro (headline + paragraph + CTA) followed by a horizontal carousel of 5 image cards. Native CSS `scroll-snap` for smooth swipe behavior; prev/next arrow buttons for desktop; keyboard arrow-key support.
- **Donor randomization** — the donor table accepts any number of entries in the config and shows 5 different random donors on every page load. Originally a fixed 5-row table populated by 5 hardcoded function calls.
- **Dynamic copyright year** — `© 2026` updates itself on January 1st without a code change. Static fallback if JavaScript is disabled.
- **Mobile-optimized carousel arrows** — smaller but still tappable and keyboard-focusable on phones (a common pattern hides them on mobile entirely; we kept them visible).

### Hosting & deploy

- **Source code on GitHub** at https://github.com/4site-interactive-studios/tpl-giving-day
- **GitHub Pages auto-deploys** on every push to `main` — no separate build or deploy step. Edit, commit, push, refresh.
- **HTTPS by default**, no certificate management.

## Editing values

The donation total, goal, donor list, etc. live in a single config object near the top of `<head>` in `index.html`. Edit and save:

```js
window.GIVING_DAY_CONFIG = {
  give:   { total: 75590, goal: 100000 },
  act:    { total: 0,     goal: 5000   },
  pledge: { total: 0,     goal: 150    },
  donors: [
    { name: "Rob P.",    state: "MA", amount: 128 },
    { name: "Nicole L.", state: "MI", amount: 213 },
    // ...add more as needed
  ]
};
```

**During Giving Day:** `act.total` and `pledge.total` default to `0`. They were previously fetched from Convio's CRAdvocacyAPI; in this standalone version you hand-edit them as the day progresses. Pull current numbers from Convio admin and update the config.

The donor list is shuffled on each page load and capped at 5 — add more entries to the array and a random five will appear per visit.

## Files

| Path | Purpose |
|---|---|
| `index.html` | The page (markup + config block) |
| `style.css` | All styles, fonts, color tokens |
| `script.js` | Thermometer + donor populator + carousel handlers + dynamic footer year |
| `fonts/` | Helvetica Neue + PT Sans (.woff + .woff2) |
| `images/` | Logos, hero photos, thermometer icons, footer badges, carousel slides |
| `reference/index-original.html` | Original Convio CMS preview, kept for archival reference (not served as the live page) |

## Local preview

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/

## Brand color tokens

Defined in `:root` at the top of `style.css`. Update the hex values to retheme:

```css
:root {
  --evergreen: #006837;
  --fern:      #39B54A;
  --grass:     #8CC63F;
  --sky:       #5DD8D8;
  --sun:       #F7931E;
  --snow:      #F5FAF1;
  --moss:      #CEE4C5;
  --earth:     #362229;
}
```
