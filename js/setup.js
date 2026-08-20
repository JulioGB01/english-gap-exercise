/* =====================================================================
   RUN SETUP SHEET
   Asked every single time a level is picked: how you want to answer
   (word tiles or keyboard) and how many lines this run should be.
   The previous choice is pre-selected, but it is never assumed.
   ===================================================================== */
import { levelMeta, runLength } from './questions.js';
import { S, save } from './state.js';
import { el } from './dom.js';
import { sfx } from './audio.js';
import { startRun } from './game.js';

export const COUNTS = [5, 10, 15, 25, 'all'];

let pending = null;   // level id waiting to be started

const label = n => n === 'all' ? 'All' : String(n);

export function openSetup(lv) {
  pending = lv;
  const L = levelMeta(lv);
  document.documentElement.style.setProperty('--accent', L.c);
  el('setupTitle').textContent = L.id + ' · ' + L.name;
  el('setupSub').textContent = L.sub;
  render();
  el('setupWrap').classList.add('on');
}

export function closeSetup() {
  pending = null;
  el('setupWrap').classList.remove('on');
}

function render() {
  document.querySelectorAll('#pickMode button').forEach(b => {
    const on = S.mode === b.dataset.mode;
    b.classList.toggle('on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.onclick = () => { S.mode = b.dataset.mode; save(); render(); sfx.tap(); };
  });

  el('modeNote').textContent = S.mode === 'type'
    ? 'Type the word yourself. One first-letter hint per line.'
    : 'Pick the word from six options. No hints.';

  const seg = el('segCount');
  seg.innerHTML = '';
  COUNTS.forEach(n => {
    const b = document.createElement('button');
    b.textContent = label(n);
    b.className = S.count === n ? 'on' : '';
    b.addEventListener('click', () => { S.count = n; save(); render(); sfx.tap(); });
    seg.appendChild(b);
  });

  if (pending) {
    el('startRunBtn').textContent = 'Start · ' + runLength(pending, S.count) + ' lines';
  }
}

export function wireSetup() {
  el('startRunBtn').addEventListener('click', () => {
    const lv = pending;
    if (!lv) return;
    S.last = lv;
    save();
    closeSetup();
    sfx.tap();
    startRun(lv);
  });
  el('cancelSetup').addEventListener('click', closeSetup);
  el('setupScrim').addEventListener('click', closeSetup);
}
