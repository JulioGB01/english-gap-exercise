/* =====================================================================
   STATE
   Persistent player state: XP, coins, best scores, settings.
   All levels are unlocked by default — there is no lock/progression gate.
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
  xp: 0,
  coins: 60,
  best: {},
  count: 10,
  mode: null,
  timed: false,
  sound: true,
  haptics: true
};

export let S = Object.assign({}, DEFAULTS, Store.get('wordflow', {}));

const isTouch = ('ontouchstart' in window) || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
if (!S.mode) S.mode = isTouch ? 'tap' : 'type';

export function save() { Store.set('wordflow', S); }

export function resetProgress() {
  S = Object.assign({}, DEFAULTS, { mode: S.mode });
  save();
}
