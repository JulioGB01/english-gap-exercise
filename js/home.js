/* =====================================================================
   HOME SCREEN
   Switch-style tile grid. Every level is always open and there is
   nothing to clear — the tiles just show how much you have practised.
   ===================================================================== */
import { LEVELS } from './data.js';
import { QS } from './questions.js';
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
    const t = S.stats[L.id];
    const done = t && t.seen
      ? Math.round(t.correct / t.seen * 100) + '% of ' + t.seen
      : 'not yet practised';
    const b = document.createElement('button');
    b.className = 'lvl';
    b.style.setProperty('--c', L.c);
    b.innerHTML =
      '<span class="lvl-code">' + L.id + '</span>' +
      '<span class="lvl-name">' + L.name + '</span>' +
      '<span class="lvl-sub">' + L.sub + '</span>' +
      '<span class="lvl-foot">' +
        '<span class="lvl-done">' + done + '</span>' +
        '<span class="lvl-count">' + QS[L.id].length + ' lines</span>' +
      '</span>';
    b.addEventListener('click', () => { sfx.tap(); openSetup(L.id); });
    list.appendChild(b);
  });

  const lv = lastLevel();
  el('quickPlay').textContent = 'Practise · ' + lv;
  document.documentElement.style.setProperty('--accent', LEVELS.find(l => l.id === lv).c);
}
