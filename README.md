# TPL Giving Day

Standalone landing page for Trust for Public Land's Giving Day.

**Live:** https://4site-interactive-studios.github.io/tpl-giving-day/

## What this is

A self-contained HTML/CSS/JS page — no build step, no backend, no third-party scripts, no API calls. Open `index.html` in a browser and it works.

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

The donor list is shuffled on each page load and capped at 5 — add more entries to the array and a random five will appear per visit.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page (markup + config block) |
| `style.css` | All styles, fonts, color tokens |
| `script.js` | Thermometer + donor populator |
| `fonts/` | Helvetica Neue + PT Sans (.woff + .woff2) |
| `images/` | Logos, hero photos, thermometer icons, footer badges |
| `index-original.html` | Original Convio CMS preview, kept for reference |

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
