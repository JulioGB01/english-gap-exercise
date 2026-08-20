# Wordflow — English Gap Trainer

A fast, offline-friendly English gap-fill trainer, from A1 to C2. Fill the blank, hold the streak, level up.

Play it live: enable GitHub Pages for this repo (Settings → Pages → Deploy from branch → `main` / `/ (root)`), then open `https://<username>.github.io/<repo>/`.

## Play locally

No build step — it's a static site. Any static server works, e.g.:

```
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:PORT/index.html`.

## Project structure

```
index.html          Markup for the home / game / results screens and settings sheet
css/
  style.css          All styling
js/
  data.js            The sentence bank (BANK) and the level list (LEVELS)
  state.js           Persistent player state (XP, coins, best scores, settings) + localStorage wrapper
  questions.js        Flattens the bank into per-level question lists; scoring/matching helpers
  audio.js           Sound effects (WebAudio) and haptics
  dom.js             Small DOM helpers: screen switching, toasts
  home.js            Renders the home screen / level list
  game.js            The run engine: question flow, hints, timer, answer submission
  results.js         Scores a finished run and renders the results screen
  settings.js        Settings sheet rendering and wiring
  main.js            Entry point — wires up buttons and boots the app
```

The app is a set of native ES modules (`<script type="module">`), so it needs no bundler or build tooling — just serve the files as-is.

## Adding content

Add new lines to any category in `js/data.js`. Each line follows:

```
"before the gap|after the gap|answer|alt1,alt2"
```

`alt1,alt2` (optional) are accepted alternative answers.

## Notes

- All six levels (A1–C2) are open from the start — there's no progression lock. The "Continue" button on the home screen just jumps to the first level you haven't cleared yet (70%+ accuracy), as a suggestion.
- Progress (XP, coins, best scores, settings) is stored in `localStorage` under the key `wordflow`, with an in-memory fallback if storage is unavailable.
