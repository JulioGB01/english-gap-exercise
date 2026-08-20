/* =====================================================================
   SETTINGS SHEET
   ===================================================================== */
import { S, save, resetProgress } from './state.js';
import { el, show, toast } from './dom.js';
import { sfx, buzz } from './audio.js';
import { renderHome } from './home.js';

export function renderSettings() {
  const seg = el('segCount'); seg.innerHTML = '';
  [5, 10, 15, 25].forEach(n => {
    const b = document.createElement('button');
    b.textContent = n; if (S.count === n) b.classList.add('on');
    b.addEventListener('click', () => { S.count = n; save(); renderSettings(); sfx.tap(); });
    seg.appendChild(b);
  });
  document.querySelectorAll('#segMode button').forEach(b => {
    b.classList.toggle('on', S.mode === b.dataset.mode);
    b.onclick = () => { S.mode = b.dataset.mode; save(); renderSettings(); sfx.tap(); };
  });
  document.querySelectorAll('.sw').forEach(sw => {
    sw.classList.toggle('on', !!S[sw.dataset.set]);
    sw.onclick = () => { S[sw.dataset.set] = !S[sw.dataset.set]; save(); renderSettings(); renderHome(); buzz(10); };
  });
}

export function wireSettings() {
  el('openSettings').addEventListener('click', () => { renderSettings(); el('sheetWrap').classList.add('on'); });
  el('closeSheet').addEventListener('click', () => el('sheetWrap').classList.remove('on'));
  el('scrim').addEventListener('click', () => el('sheetWrap').classList.remove('on'));
  el('resetBtn').addEventListener('click', () => {
    const btn = el('resetBtn');
    if (btn.dataset.armed) {
      resetProgress();
      btn.textContent = 'Reset all progress';
      delete btn.dataset.armed;
      el('sheetWrap').classList.remove('on');
      renderHome();
      toast('Progress cleared');
    } else {
      btn.dataset.armed = '1';
      btn.textContent = 'Tap again to confirm';
    }
  });
}
