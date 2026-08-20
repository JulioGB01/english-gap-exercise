/* =====================================================================
   DOM HELPERS
   ===================================================================== */
export const $ = s => document.querySelector(s);
export const el = id => document.getElementById(id);

export function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  el(id).classList.add('on');
}

let toastT;
export function toast(msg) {
  const t = el('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 1900);
}
