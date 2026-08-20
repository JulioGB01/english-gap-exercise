/* =====================================================================
   RESULTS SCREEN
   Sums up a finished run and adds it to the level's practice tally.
   Nothing is won or cleared here — it is just a read-out.
   ===================================================================== */
import { tally } from './state.js';
import { el, show } from './dom.js';
import { esc, renderSentence } from './questions.js';
import { sfx, buzz } from './audio.js';

export function endRun(R) {
  const served = R.qs.length;
  const acc = served ? R.correct / served : 0;

  tally(R.lv, served, R.correct);

  el('resTitle').textContent = acc === 1 ? 'Every line correct' : 'Run complete';
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
    rev.innerHTML = '<div class="review-item clean">Nothing missed this run.</div>';
  }

  el('againBtn').dataset.lv = R.lv;

  show('results');
  sfx.up();
  buzz(20);
}
