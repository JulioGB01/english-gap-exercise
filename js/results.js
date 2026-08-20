/* =====================================================================
   RESULTS SCREEN
   Scores a finished run, updates persistent state, and renders the
   results screen. No level-unlocking here — every level is always open.
   ===================================================================== */
import { LEVELS } from './data.js';
import { S, save } from './state.js';
import { el, show, toast } from './dom.js';
import { esc, levelInfo, RANKS } from './questions.js';
import { sfx, buzz } from './audio.js';

export function endRun(R, reason) {
  const served = reason === 'out' ? R.i + 1 : R.qs.length;
  const acc = served ? R.correct / served : 0;
  const stars = reason === 'out' ? 0 : acc >= 1 ? 3 : acc >= .85 ? 2 : acc >= .7 ? 1 : 0;

  const before = levelInfo(S.xp).lv;
  let bonus = 0;
  if (stars === 3) bonus = 25;
  S.xp += R.xp; S.coins += R.coins + bonus;
  S.best[R.lv] = Math.max(S.best[R.lv] || 0, acc);
  save();

  const after = levelInfo(S.xp).lv;
  el('bigStars').innerHTML = [0, 1, 2].map(n => '<span class="' + (n < stars ? 'on' : '') + '">★</span>').join('');
  el('resTitle').textContent = reason === 'out' ? 'Out of hearts' : stars === 3 ? 'Perfect run' : stars > 0 ? 'Level clear' : 'Run finished';
  el('resSub').textContent = R.lv + ' · ' + R.correct + ' of ' + served + ' correct' + (bonus ? ' · +' + bonus + ' bonus coins' : '');
  el('stAcc').textContent = Math.round(acc * 100) + '%';
  el('stXp').textContent = '+' + R.xp;
  el('stStreak').textContent = R.best;

  const rev = el('review'); rev.innerHTML = '';
  el('reviewLabel').style.display = R.misses.length ? 'block' : 'none';
  R.misses.slice(0, 10).forEach(q => {
    const d = document.createElement('div');
    d.className = 'review-item';
    const tight = /[-]$/.test(q.p1);
    d.innerHTML = esc(q.p1) + (tight ? '' : ' ') + '<b>' + esc(q.ans) + '</b>' + (/^[.,!?;:]/.test(q.p2) ? '' : ' ') + esc(q.p2);
    rev.appendChild(d);
  });
  if (!R.misses.length) {
    rev.innerHTML = '<div class="review-item" style="border-left-color:var(--mint)">Nothing missed. Try the next level or turn the timer on in settings.</div>';
  }

  const idx = LEVELS.findIndex(l => l.id === R.lv);
  const nextLv = LEVELS[idx + 1];
  const again = el('againBtn');
  if (nextLv && stars > 0) { again.textContent = 'Try ' + nextLv.id; again.dataset.lv = nextLv.id; }
  else { again.textContent = 'Play again'; again.dataset.lv = R.lv; }

  show('results');
  if (reason === 'out') { sfx.over(); buzz([40, 80, 40]); }
  else { sfx.up(); buzz(20); }
  if (after > before) setTimeout(() => toast('Level ' + after + ' · ' + RANKS[Math.min(RANKS.length - 1, Math.floor((after - 1) / 3))]), 700);
}
