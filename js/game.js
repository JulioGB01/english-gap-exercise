/* =====================================================================
   GAME ENGINE
   Runs a single session: question flow, hints, timer, scoring.
   ===================================================================== */
import { levelMeta } from './questions.js';
import { QS, norm, esc, shuffle, distractors, multFor } from './questions.js';
import { S, save } from './state.js';
import { el, show, toast } from './dom.js';
import { sfx, buzz } from './audio.js';
import { endRun } from './results.js';

export let R = null;

const HINTS = [
  { k: 'len', icon: '▁▁▁', label: 'Length', cost: 4 },
  { k: 'first', icon: 'A_', label: '1st letter', cost: 8 },
  { k: 'half', icon: '½', label: '50/50', cost: 14 }
];

export function startRun(lv) {
  const pool = shuffle(QS[lv].slice());
  R = {
    lv, qs: pool.slice(0, Math.min(S.count, pool.length)), i: 0, hearts: 3,
    streak: 0, best: 0, correct: 0, xp: 0, coins: 0, misses: [], answered: false, hintUsed: false, tid: null
  };
  document.documentElement.style.setProperty('--hue', levelMeta(lv).c);
  show('game');
  loadQ();
}

function loadQ() {
  if (R.i >= R.qs.length) return endRun(R, 'clear');
  const q = R.qs[R.i];
  R.answered = false; R.hintUsed = false;

  el('qCount').textContent = (R.i + 1) + '/' + R.qs.length;
  el('trackFill').style.width = (R.i / R.qs.length * 100) + '%';
  el('hearts').innerHTML = [0, 1, 2].map(n => '<span class="' + (n < R.hearts ? 'on' : '') + '">❤</span>').join('');
  el('catTag').textContent = q.lv + ' · ' + q.cat;
  el('feedback').textContent = ''; el('feedback').className = 'feedback';

  const tight = /[-]$/.test(q.p1);
  const left = q.p1 ? esc(q.p1) + (tight ? '' : ' ') : '';
  const right = q.p2 ? (/^[.,!?;:]/.test(q.p2) ? esc(q.p2) : ' ' + esc(q.p2)) : '';
  el('sentence').innerHTML = left + '<span class="slot" id="slot">&nbsp;&nbsp;&nbsp;</span>' + right;

  renderHints();
  renderAnswerZone();
  updateCombo();
  startTimer();
}

function renderHints() {
  const box = el('hints'); box.innerHTML = '';
  HINTS.forEach(h => {
    const b = document.createElement('button');
    b.className = 'hint' + (S.coins < h.cost ? ' used' : '');
    b.innerHTML = '<b>' + h.icon + '</b>' + h.label + '<br><small>◈ ' + h.cost + '</small>';
    b.addEventListener('click', () => useHint(h, b));
    box.appendChild(b);
  });
}

function useHint(h, btn) {
  if (R.answered) return;
  if (S.coins < h.cost) { buzz(30); toast('Not enough coins'); return; }
  S.coins -= h.cost; save(); R.hintUsed = true;
  btn.classList.add('used'); sfx.coin(); buzz(12);
  const q = R.qs[R.i], slot = el('slot');

  if (h.k === 'len') {
    slot.textContent = '_'.repeat(q.ans.length);
    el('feedback').textContent = q.ans.length + ' letters';
  }
  if (h.k === 'first') {
    slot.textContent = q.ans[0] + '_'.repeat(Math.max(0, q.ans.length - 1));
    el('feedback').textContent = 'Starts with "' + q.ans[0].toUpperCase() + '"';
  }
  if (h.k === 'half') {
    if (S.mode === 'tap') {
      const wrong = [...document.querySelectorAll('.tile')].filter(t => norm(t.dataset.w) !== norm(q.ans));
      shuffle(wrong).slice(0, Math.max(0, wrong.length - 2)).forEach(t => t.classList.add('gone'));
    } else {
      const opts = shuffle([q.ans, ...distractors(q, 2)]);
      el('feedback').innerHTML = 'One of these: <b>' + opts.map(esc).join(' / ') + '</b>';
    }
  }
}

function renderAnswerZone() {
  const zone = el('answerZone'), q = R.qs[R.i];
  zone.innerHTML = '';
  if (S.mode === 'tap') {
    const words = shuffle([q.ans, ...distractors(q, 5)]);
    const wrap = document.createElement('div'); wrap.className = 'tiles';
    words.forEach(w => {
      const t = document.createElement('button');
      t.className = 'tile'; t.textContent = w; t.dataset.w = w;
      t.addEventListener('click', () => { if (R.answered) return; sfx.tap(); submit(w, t); });
      wrap.appendChild(t);
    });
    zone.appendChild(wrap);
    el('actionBtn').textContent = 'Skip · costs a heart';
  } else {
    const box = document.createElement('div'); box.className = 'typebox';
    box.innerHTML = '<input id="gap" type="text" placeholder="type the missing word" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" enterkeyhint="go">';
    zone.appendChild(box);
    const inp = el('gap');
    inp.addEventListener('input', () => { const s = el('slot'); s.textContent = inp.value || '   '; s.classList.toggle('filled', !!inp.value); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(inp.value); } });
    setTimeout(() => inp.focus(), 120);
    el('actionBtn').textContent = 'Check';
  }
}

/* ---- timer ---- */
function startTimer() {
  stopTimer();
  if (!S.timed) return;
  R.tleft = 15;
  el('combo').classList.add('on');
  R.tid = setInterval(() => {
    R.tleft -= 0.1;
    el('comboBar').style.width = Math.max(0, R.tleft / 15 * 100) + '%';
    el('comboBar').style.background = R.tleft < 5 ? 'var(--rose)' : 'var(--gold)';
    if (R.tleft <= 0) { stopTimer(); if (!R.answered) submit(' '); }
  }, 100);
}
function stopTimer() { if (R && R.tid) { clearInterval(R.tid); R.tid = null; } }

function updateCombo() {
  const c = el('combo'), m = multFor(R.streak);
  if (S.timed) { c.classList.add('on'); el('comboX').textContent = '⚡ x' + m; return; }
  if (R.streak >= 2) {
    c.classList.add('on');
    el('comboX').textContent = '⚡ x' + m + ' · ' + R.streak;
    const nextAt = m === 1 ? 3 : m === 2 ? 5 : m === 3 ? 8 : R.streak;
    el('comboBar').style.background = 'var(--gold)';
    el('comboBar').style.width = Math.min(100, R.streak / nextAt * 100) + '%';
  } else c.classList.remove('on');
}

/* ---- answering ---- */
const PRAISE = ['Nice', 'Exactly', 'Got it', 'Clean', 'Spot on', 'Yes'];
function submit(val, tileEl) {
  if (R.answered) return;
  R.answered = true; stopTimer();
  const q = R.qs[R.i], slot = el('slot');
  const ok = norm(val) === norm(q.ans) || q.alts.includes(norm(val));
  const fb = el('feedback');

  if (ok) {
    R.correct++; R.streak++; R.best = Math.max(R.best, R.streak);
    const m = multFor(R.streak);
    const gain = Math.round(10 * m * (R.hintUsed ? .5 : 1));
    R.xp += gain; R.coins += 3;
    slot.textContent = q.ans; slot.className = 'slot filled good';
    if (tileEl) tileEl.classList.add('pick-good');
    fb.innerHTML = PRAISE[Math.floor(Math.random() * PRAISE.length)] + ' · <b>+' + gain + ' XP</b>' + (m > 1 ? ' ⚡x' + m : '');
    sfx.good(m); buzz(14);
    updateCombo();
    next(900);
  } else {
    R.hearts--; R.streak = 0;
    R.misses.push(q);
    slot.textContent = q.ans; slot.className = 'slot filled bad';
    if (tileEl) tileEl.classList.add('pick-bad');
    fb.className = 'feedback bad';
    fb.innerHTML = (val === ' ' ? 'Time. ' : '') + 'Answer: <b>' + esc(q.ans) + '</b>';
    sfx.bad(); buzz([25, 60, 25]);
    el('hearts').innerHTML = [0, 1, 2].map(n => '<span class="' + (n < R.hearts ? 'on' : '') + '">❤</span>').join('');
    updateCombo();
    if (R.hearts <= 0) { setTimeout(() => endRun(R, 'out'), 1400); return; }
    next(1900);
  }
  el('actionBtn').textContent = 'Next';
}

let nextT;
function next(ms) {
  clearTimeout(nextT);
  nextT = setTimeout(() => { R.i++; loadQ(); }, ms);
}

export function stopRun() { stopTimer(); clearTimeout(nextT); }

export function advanceOrSubmit() {
  if (R.answered) { clearTimeout(nextT); R.i++; loadQ(); return; }
  if (S.mode === 'type') { const i = el('gap'); submit(i ? i.value : ''); }
  else submit(' ');
}
