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

export const RANKS = ["Newcomer", "Learner", "Speaker", "Storyteller", "Wordsmith", "Native-ish"];

export const norm = s => String(s).toLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:]+$/, '').trim().replace(/\s+/g, ' ');
export const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

export const levelMeta = id => LEVELS.find(l => l.id === id);

export function levelInfo(xp) {
  let lv = 1, need = 120, rem = xp;
  while (rem >= need) { rem -= need; lv++; need = Math.round(need * 1.22); }
  return { lv, rem, need };
}

export function multFor(streak) { return streak >= 8 ? 4 : streak >= 5 ? 3 : streak >= 3 ? 2 : 1; }

export function distractors(q, n) {
  const bad = new Set([norm(q.ans), ...q.alts]);
  const uniq = [...new Set(QS[q.lv].map(x => x.ans))].filter(a => !bad.has(norm(a)));
  uniq.sort((a, b) => Math.abs(a.length - q.ans.length) - Math.abs(b.length - q.ans.length));
  return shuffle(uniq.slice(0, Math.min(20, uniq.length))).slice(0, n);
}
