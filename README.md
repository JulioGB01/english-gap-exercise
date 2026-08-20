# Wordflow — English Gap Trainer

Fill in the missing word. Six levels, A1 to C2, 648 original sentences grouped by grammar topic. Unlimited practice — there is nothing to unlock and nothing to beat.

**Live:** https://juliogb01.github.io/english-gap-exercise/

## How it plays

- Pick any level — the six levels are difficulty bands, not stages to clear.
- Every time you pick one, you're asked two things before the run starts:
  - **How to answer** — word tiles (pick from six) or the keyboard (type it).
  - **How many lines** — 5 / 10 / 15 / 25, or the level's whole bank.
- Keyboard mode gives you exactly one hint per line: reveal the first letter.
- A wrong answer just shows you the word and moves on. No lives, no failing.
- Settings holds sound, vibration and reset only.

Anything you missed is listed at the end of the run with the answer filled in.

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
index.html          Markup for the home / game / results screens and both sheets
css/
  style.css         All styling — Switch-style dark theme, monospace sentence card
js/
  data.js           The sentence bank (BANK) and the level list (LEVELS)
  state.js          Persistent state (practice tallies, preferences) + localStorage wrapper
  questions.js      Flattens the bank into per-level lists; answer matching, distractors
  audio.js          Sound effects (WebAudio) and haptics
  dom.js            Screen switching and toasts
  home.js           The level tile grid
  setup.js          The pre-run sheet: answer mode and run length
  game.js           The run engine: question flow, hint, scoring
  results.js        Sums up a finished run and renders the results screen
  settings.js       Settings sheet — sound, vibration, reset
  main.js           Entry point
```

Native ES modules (`<script type="module">`) — no bundler, no build tooling.

## Adding your own lines

Open `js/data.js` and add to any topic. The format is:

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

- Practice tallies are stored in `localStorage` under the key `wordflow`, with an in-memory fallback.
- Design is dark-mode only by intent: charcoal surfaces, a neon accent per level, white selection rings.
- Every sentence is original writing.
