# Wordflow — English Gap Trainer

Fill the missing word in a line of film dialogue. Six levels, A1 to C2, 648 lines of original screenplay-style writing.

**Live:** https://juliogb01.github.io/english-gap-exercise/

## How it plays

- Pick any level — all six are open from the start, no unlocking.
- Each run serves a set number of lines (5 / 10 / 15 / 25, in Settings).
- Answer with **word tiles** (pick from six) or the **keyboard** (type it).
- Keyboard mode gives you exactly one hint per line: reveal the first letter.
- Three hearts. A wrong answer costs one. Lose all three and the run ends.
- Stars per level are based on your best accuracy: 3 stars = flawless, 2 = 85%, 1 = 70%.

Anything you missed is listed at the end of the run with the answer filled in.

## Publishing changes

Double-click **`push.bat`**. It stages everything, commits, and pushes to `main`; GitHub Pages redeploys about a minute later. On the very first run it initialises the repo and may open a browser window to sign you in to GitHub.

You can pass a commit message: `push.bat Added more C1 idioms`.

## Play locally

No build step — it's a static site, so it just needs a server (ES modules won't load from `file://`):

```
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:PORT/`.

## Project structure

```
index.html          Markup for the home / game / results screens and settings sheet
push.bat            One-click commit + push to GitHub
css/
  style.css         All styling — Switch-style dark theme, screenplay dialogue card
js/
  data.js           The sentence bank (BANK) and the level list (LEVELS)
  state.js          Persistent state (best accuracy, preferences) + localStorage wrapper
  questions.js      Flattens the bank into per-level lists; answer matching, distractors
  audio.js          Sound effects (WebAudio) and haptics
  dom.js            Screen switching and toasts
  home.js           The level tile grid
  game.js           The run engine: question flow, hint, hearts, scoring
  results.js        Scores a finished run and renders the results screen
  settings.js       Settings sheet
  main.js           Entry point
```

Native ES modules (`<script type="module">`) — no bundler, no build tooling.

## Adding your own lines

Open `js/data.js` and add to any category. The format is:

```
"text before the gap|text after the gap|answer|alt1,alt2"
```

- The answer must be a **single word**.
- Field 4 is optional — a comma-separated list of other words that should also be accepted.
- Leave field 1 empty if the gap starts the sentence (capitalise the answer).
- The text after the gap gets a space in front of it automatically, unless it starts with punctuation — so write `"."` for a gap that ends the sentence.
- Don't use `|` inside the sentence text, and don't let the answer word appear in the visible part of the line.

Examples:

```
"I|from Bolivia.|am"
"|you from Spain?|Are"
"You need to let it|.|go"
"We|dinner at eight.|had|ate"
```

New lines are picked up on reload — nothing else to update. Wrong-answer tiles are generated automatically from the other answers in the same level.

## Notes

- Progress is stored in `localStorage` under the key `wordflow`, with an in-memory fallback.
- Design is dark-mode only by intent: charcoal surfaces, a neon accent per level, white selection rings.
- All dialogue is original writing, not transcribed from real films.
