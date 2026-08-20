/* =====================================================================
   RESULTS SCREEN
   Scores a finished run and stores the level's best accuracy.
   ===================================================================== */
import { LEVELS } from './data.js';
import { S, save } from './state.js';
import { el, show } from './dom.js';
import { esc, starsFor, renderSentence } from './questions.js';
import { sfx, buzz } from './audio.js';

export function endRun(R, reason) {
  const served = reason === 'out' ? R.i + 1 : R.qs.length;
  const acc = served ? R.correct / served : 0;
  const stars = reason === 'out' ? 0 : starsFor(acc);

  S.best[R.lv] = Math.max(S.best[R.lv] || 0, acc);
  save();

  el('bigStars').innerHTML = [0, 1, 2]
    .map(n => '<span class="' + (n < stars ? 'on' : '') + '">★</span>')
    .join('');
  el('resTitle').textContent =
    reason === 'out' ? 'Out of hearts' :
    stars === 3 ? 'Perfect run' :
    stars > 0 ? 'Scene complete' : 'Run finished';
  el('resSub').textContent = R.lv + ' · ' + R.correct + ' of ' + served + ' correct';
  el('stAcc').textContent = Math.round(acc * 100) + '%';
  el('stCorrect').textContent = R.correct + '/' + served;
  el('stStreak').textContent = R.best;

  const rev = el('review');
  rev.innerHTML = '';
  el('reviewLabel').hidden = !R.misses.length;
  R.misses.slice(0, 12).forEach(q => {
    const d = document.createElement('div');
    d.className = 'review-item';
    d.innerHTML = renderSentence(q, '<b>' + esc(q.ans) + '</b>');
    rev.appendChild(d);
  });
  if (!R.misses.length) {
    rev.innerHTML = '<div class="review-item clean">Nothing missed. Try a longer run or the next level up.</div>';
  }

  const idx = LEVELS.findIndex(l => l.id === R.lv);
  const nextLv = LEVELS[idx + 1];
  const again = el('againBtn');
  if (nextLv && stars > 0) { again.textContent = 'Try ' + nextLv.id; again.dataset.lv = nextLv.id; }
  else { again.textContent = 'Play again'; again.dataset.lv = R.lv; }

  show('results');
  if (reason === 'out') { sfx.over(); buzz([40, 80, 40]); }
  else { sfx.up(); buzz(20); }
}
