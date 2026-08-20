/* =====================================================================
   STATE
   Persistent player state: practice tallies per level + preferences.
   No XP, no coins, no locks, no levels to clear — every level is just a
   difficulty band you can practise as often as you like.
   ===================================================================== */

/* ---- storage: uses localStorage when available, memory otherwise ---- */
const mem = {};
export const Store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(k);
      if (v != null) return JSON.parse(v);
    } catch (e) {}
    return (k in mem) ? mem[k] : d;
  },
  set(k, v) {
    mem[k] = v;
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
};

export const DEFAULTS = {
  stats: {},     // levelId -> { seen, correct } — a running practice tally
  last: null,    // last level practised, so the home CTA can offer it again
  count: 10,     // lines per run — remembered only as the pre-selected default
  mode: null,    // 'tap' | 'type' — likewise, asked again before every run
  sound: true,
  haptics: true
};

/* Fresh copy every time — `stats` must never share a reference with
   DEFAULTS, or playing a run would permanently mutate the defaults and
   "Reset all progress" would leave old tallies behind. */
const fresh = () => Object.assign({}, DEFAULTS, { stats: {} });

export let S = Object.assign(fresh(), Store.get('wordflow', {}));
S.stats = Object.assign({}, S.stats);

const isTouch = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
if (S.mode !== 'tap' && S.mode !== 'type') S.mode = isTouch ? 'tap' : 'type';

export function save() { Store.set('wordflow', S); }

/* Records one finished run against the level's running tally. */
export function tally(lv, seen, correct) {
  const t = S.stats[lv] || { seen: 0, correct: 0 };
  S.stats[lv] = { seen: t.seen + seen, correct: t.correct + correct };
  save();
}

/* Clears the tallies but keeps the sound/vibration preferences, since
   those are settings rather than progress. */
export function resetProgress() {
  S = Object.assign(fresh(), {
    mode: S.mode, count: S.count, sound: S.sound, haptics: S.haptics
  });
  save();
}
