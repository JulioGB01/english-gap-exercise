/* =====================================================================
   GAME ENGINE
   Runs a single session: question flow, the first-letter hint, scoring.
   No timer, no coins, no skip — get it right or lose a heart.
   ===================================================================== */
import { QS, norm, esc, shuffle, distractors, levelMeta, renderSentence } from './questions.js';
import { S } from './state.js';
import { el, show } from './dom.js';
import { sfx, buzz } from './audio.js';
import { endRun } from './results.js';

export let R = null;

export function startRun(lv) {
  const pool = shuffle(QS[lv].slice());
  R = {
    lv,
    qs: pool.slice(0, Math.min(S.count, pool.length)),
    i: 0,
    hearts: 3,
    streak: 0,
    best: 0,
    correct: 0,
    misses: [],
    answered: false,
    hintUsed: false
  };
  document.documentElement.style.setProperty('--accent', levelMeta(lv).c);
  show('game');
  loadQ();
}

function loadQ() {
  if (R.i >= R.qs.length) return endRun(R, 'clear');
  const q = R.qs[R.i];
  R.answered = false;
  R.hintUsed = false;

  el('qCount').textContent = (R.i + 1) + ' / ' + R.qs.length;
  el('trackFill').style.width = (R.i / R.qs.length * 100) + '%';
  drawHearts();
  el('catTag').textContent = q.lv + ' · ' + q.cat;
  el('feedback').textContent = '';
  el('feedback').className = 'feedback';
  el('sentence').innerHTML = renderSentence(q, '<span class="slot" id="slot">&nbsp;&nbsp;&nbsp;</span>');

  renderStreak();
  renderHint();
  renderAnswerZone();
}

function drawHearts() {
  el('hearts').innerHTML = [0, 1, 2]
    .map(n => '<span class="' + (n < R.hearts ? 'on' : '') + '">♥</span>')
    .join('');
}

function renderStreak() {
  const c = el('streak');
  if (R.streak >= 3) {
    c.textContent = R.streak + ' in a row';
    c.classList.add('on');
  } else {
    c.classList.remove('on');
  }
}

/* ---- the single hint: reveal the first letter, keyboard mode only ---- */
function renderHint() {
  const box = el('hintZone');
  box.innerHTML = '';
  if (S.mode !== 'type') return;
  const b = document.createElement('button');
  b.className = 'hint';
  b.id = 'hintBtn';
  b.textContent = 'Reveal first letter';
  b.addEventListener('click', useHint);
  box.appendChild(b);
}

function useHint() {
  if (R.answered || R.hintUsed) return;
  R.hintUsed = true;
  const q = R.qs[R.i];
  const btn = el('hintBtn');
  if (btn) {
    btn.classList.add('used');
    btn.disabled = true;
    btn.textContent = 'Starts with “' + q.ans[0].toUpperCase() + '”';
  }
  const inp = el('gap');
  if (inp && !inp.value) {
    inp.value = q.ans[0];
    syncSlot(inp);
    inp.focus();
  }
  sfx.tap();
  buzz(10);
}

function syncSlot(inp) {
  const s = el('slot');
  s.textContent = inp.value || '   ';
  s.classList.toggle('filled', !!inp.value);
}

function renderAnswerZone() {
  const zone = el('answerZone'), q = R.qs[R.i];
  zone.innerHTML = '';

  if (S.mode === 'tap') {
    const words = shuffle([q.ans, ...distractors(q, 5)]);
    const wrap = document.createElement('div');
    wrap.className = 'tiles';
    words.forEach(w => {
      const t = document.createElement('button');
      t.className = 'tile';
      t.textContent = w;
      t.dataset.w = w;
      t.addEventListener('click', () => { if (R.answered) return; sfx.tap(); submit(w, t); });
      wrap.appendChild(t);
    });
    zone.appendChild(wrap);
    setAction(null); // no skip: nothing to press until the question is answered
  } else {
    const box = document.createElement('div');
    box.className = 'typebox';
    box.innerHTML = '<input id="gap" type="text" placeholder="type the missing word" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go">';
    zone.appendChild(box);
    const inp = el('gap');
    inp.addEventListener('input', () => syncSlot(inp));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(inp.value); } });
    setTimeout(() => inp.focus(), 120);
    setAction('Check');
  }
}

function setAction(label) {
  const b = el('actionBtn');
  if (!label) { b.hidden = true; b.textContent = ''; return; }
  b.hidden = false;
  b.textContent = label;
}

/* ---- answering ---- */
const PRAISE = ['Nice', 'Exactly', 'Got it', 'Clean', 'Spot on', 'Yes'];

function submit(val, tileEl) {
  if (R.answered) return;
  R.answered = true;
  const q = R.qs[R.i], slot = el('slot'), fb = el('feedback');
  const ok = norm(val) === norm(q.ans) || q.alts.includes(norm(val));

  slot.textContent = q.ans;

  if (ok) {
    R.correct++;
    R.streak++;
    R.best = Math.max(R.best, R.streak);
    slot.className = 'slot filled good';
    if (tileEl) tileEl.classList.add('pick-good');
    fb.textContent = PRAISE[Math.floor(Math.random() * PRAISE.length)];
    fb.className = 'feedback good';
    sfx.good();
    buzz(14);
    renderStreak();
    next(850);
  } else {
    R.hearts--;
    R.streak = 0;
    R.misses.push(q);
    slot.className = 'slot filled bad';
    if (tileEl) tileEl.classList.add('pick-bad');
    fb.className = 'feedback bad';
    fb.innerHTML = 'Answer: <b>' + esc(q.ans) + '</b>';
    sfx.bad();
    buzz([25, 60, 25]);
    drawHearts();
    renderStreak();
    if (R.hearts <= 0) {
      setAction(null);            // no way to keep playing on zero hearts
      setTimeout(() => endRun(R, 'out'), 1400);
      return;
    }
    next(1900);
  }
  setAction('Next');
}

let nextT;
function next(ms) {
  clearTimeout(nextT);
  nextT = setTimeout(() => { R.i++; loadQ(); }, ms);
}

export function stopRun() { clearTimeout(nextT); }

export function actionPressed() {
  if (R.answered) { clearTimeout(nextT); R.i++; loadQ(); return; }
  if (S.mode === 'type') { const i = el('gap'); submit(i ? i.value : ''); }
}
