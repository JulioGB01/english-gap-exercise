/* =====================================================================
   QUESTIONS
   Flattens the sentence bank into per-level question lists, plus the
   small pure helpers used to grade answers and pick distractors.
   ===================================================================== */
import { BANK, LEVELS } from './data.js';

export const QS = {};
for (const lv in BANK) {
  QS[lv] = [];
  for (const cat in BANK[lv]) {
    BANK[lv][cat].forEach(row => {
      const p = row.split('|');
      if (p.length < 3) return;
      QS[lv].push({
        p1: p[0], p2: p[1], ans: p[2].trim(), cat, lv,
        alts: (p[3] || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
      });
    });
  }
}

export const norm = s => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:]+$/, '').trim().replace(/\s+/g, ' ');
export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

export const levelMeta = id => LEVELS.find(l => l.id === id);

/* Stars from best accuracy: 3 = flawless, 2 = 85%+, 1 = 70%+ */
export const starsFor = acc => acc >= 1 ? 3 : acc >= .85 ? 2 : acc >= .7 ? 1 : 0;

/* Wrong-answer tiles: other answers from the same level, biased toward
   similar length so the choice is not given away by shape alone. */
export function distractors(q, n) {
  const bad = new Set([norm(q.ans), ...q.alts]);
  const uniq = [...new Set(QS[q.lv].map(x => x.ans))].filter(a => !bad.has(norm(a)));
  uniq.sort((a, b) => Math.abs(a.length - q.ans.length) - Math.abs(b.length - q.ans.length));
  return shuffle(uniq.slice(0, Math.min(20, uniq.length))).slice(0, n);
}

/* Renders a question into HTML, with `gapHtml` dropped into the blank. */
export function renderSentence(q, gapHtml) {
  const tight = /[-]$/.test(q.p1);
  const left = q.p1 ? esc(q.p1) + (tight ? '' : ' ') : '';
  const right = q.p2 ? (/^[.,!?;:]/.test(q.p2) ? esc(q.p2) : ' ' + esc(q.p2)) : '';
  return left + gapHtml + right;
}
