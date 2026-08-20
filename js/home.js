/* =====================================================================
   HOME SCREEN
   Switch-style tile grid. Every level is always open and there is
   nothing to clear, so a tile carries just its code and its name —
   topics and practice tally live in the setup sheet instead.
   ===================================================================== */
import { LEVELS } from './data.js';
import { S } from './state.js';
import { el } from './dom.js';
import { sfx } from './audio.js';
import { openSetup } from './setup.js';

/* The home CTA offers the level you practised last, or the first one. */
export function lastLevel() {
  return LEVELS.some(L => L.id === S.last) ? S.last : LEVELS[0].id;
}

export function renderHome() {
  const list = el('levelList');
  list.innerHTML = '';
  LEVELS.forEach(L => {
    const b = document.createElement('button');
    b.className = 'lvl';
    b.style.setProperty('--c', L.c);
    b.innerHTML =
      '<span class="lvl-code">' + L.id + '</span>' +
      '<span class="lvl-name">' + L.name + '</span>';
    b.addEventListener('click', () => { sfx.tap(); openSetup(L.id); });
    list.appendChild(b);
  });

  const lv = lastLevel();
  el('quickPlay').textContent = 'Practise · ' + lv;
  document.documentElement.style.setProperty('--accent', LEVELS.find(l => l.id === lv).c);
}
