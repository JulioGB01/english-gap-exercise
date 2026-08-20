/* =====================================================================
   HOME SCREEN
   All levels are always open — no locking/progression gate.
   ===================================================================== */
import { LEVELS } from './data.js';
import { S } from './state.js';
import { el } from './dom.js';
import { levelInfo, levelMeta, RANKS } from './questions.js';
import { sfx } from './audio.js';
import { startRun } from './game.js';

/* "Continue" jumps to the first level the player hasn't cleared yet (70%+),
   purely as a suggestion — every level is playable directly from the list. */
export function highestOpen() {
  let h = LEVELS[0].id;
  for (const L of LEVELS) {
    h = L.id;
    if ((S.best[L.id] || 0) < .7) break;
  }
  return h;
}

export function renderHome() {
  const info = levelInfo(S.xp);
  el('rankLv').textContent = info.lv;
  el('rankName').textContent = RANKS[Math.min(RANKS.length - 1, Math.floor((info.lv - 1) / 3))] + ' · ' + info.rem + '/' + info.need + ' XP';
  el('xpFill').style.width = Math.round(info.rem / info.need * 100) + '%';
  el('coinCount').textContent = S.coins;

  const list = el('levelList');
  list.innerHTML = '';
  LEVELS.forEach(L => {
    const best = S.best[L.id] || 0;
    const stars = best >= 1 ? 3 : best >= .85 ? 2 : best >= .7 ? 1 : 0;
    const b = document.createElement('button');
    b.className = 'lvl';
    b.style.setProperty('--c', L.c);
    b.innerHTML =
      '<div class="lvl-code">' + L.id + '</div>' +
      '<div class="lvl-body">' +
        '<div class="lvl-name">' + L.name + '</div>' +
        '<div class="lvl-sub">' + L.sub + '</div>' +
        '<div class="stars"><span class="' + (stars > 0 ? 'on' : '') + '">★</span><span class="' + (stars > 1 ? 'on' : '') + '">★</span><span class="' + (stars > 2 ? 'on' : '') + '">★</span></div>' +
      '</div>' +
      '<div class="lvl-go">▶</div>';
    b.addEventListener('click', () => { sfx.tap(); startRun(L.id); });
    list.appendChild(b);
  });

  const next = highestOpen();
  el('quickPlay').textContent = 'Continue · ' + next;
  document.documentElement.style.setProperty('--hue', levelMeta(next).c);
}
