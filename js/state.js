/* =====================================================================
   STATE
   Persistent player state: best accuracy per level + preferences.
   No XP, no coins, no locks — every level is open from the start.
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
  best: {},      // levelId -> best accuracy 0..1
  count: 10,     // questions per run
  mode: null,    // 'tap' | 'type'
  sound: true,
  haptics: true
};

/* Fresh copy every time — `best` must never share a reference with
   DEFAULTS, or playing a run would permanently mutate the defaults and
   "Reset all progress" would leave old scores behind. */
const fresh = () => Object.assign({}, DEFAULTS, { best: {} });

export let S = Object.assign(fresh(), Store.get('wordflow', {}));
S.best = Object.assign({}, S.best);

const isTouch = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
if (S.mode !== 'tap' && S.mode !== 'type') S.mode = isTouch ? 'tap' : 'type';

export function save() { Store.set('wordflow', S); }

export function resetProgress() {
  S = Object.assign(fresh(), { mode: S.mode });
  save();
}
