/* =====================================================================
   HOME SCREEN
   Switch-style tile grid. All levels are always open.
   ===================================================================== */
import { LEVELS } from './data.js';
import { QS, levelMeta, starsFor } from './questions.js';
import { S } from './state.js';
import { el } from './dom.js';
import { sfx } from './audio.js';
import { startRun } from './game.js';

/* "Continue" suggests the first level not yet cleared at 70%+. */
export function suggestedLevel() {
  for (const L of LEVELS) {
    if ((S.best[L.id] || 0) < .7) return L.id;
  }
  return LEVELS[LEVELS.length - 1].id;
}

export function renderHome() {
  const cleared = LEVELS.filter(L => (S.best[L.id] || 0) >= .7).length;
  el('clearedCount').textContent = cleared + ' / ' + LEVELS.length + ' levels cleared';

  const list = el('levelList');
  list.innerHTML = '';
  LEVELS.forEach(L => {
    const best = S.best[L.id] || 0;
    const stars = starsFor(best);
    const b = document.createElement('button');
    b.className = 'lvl';
    b.style.setProperty('--c', L.c);
    b.innerHTML =
      '<span class="lvl-code">' + L.id + '</span>' +
      '<span class="lvl-name">' + L.name + '</span>' +
      '<span class="lvl-sub">' + L.sub + '</span>' +
      '<span class="lvl-foot">' +
        '<span class="stars">' +
          '<span class="' + (stars > 0 ? 'on' : '') + '">★</span>' +
          '<span class="' + (stars > 1 ? 'on' : '') + '">★</span>' +
          '<span class="' + (stars > 2 ? 'on' : '') + '">★</span>' +
        '</span>' +
        '<span class="lvl-count">' + QS[L.id].length + ' lines</span>' +
      '</span>';
    b.addEventListener('click', () => { sfx.tap(); startRun(L.id); });
    list.appendChild(b);
  });

  const next = suggestedLevel();
  el('quickPlay').textContent = 'Continue · ' + next;
  document.documentElement.style.setProperty('--accent', levelMeta(next).c);
}
