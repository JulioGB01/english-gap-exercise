/* =====================================================================
   SETTINGS SHEET
   ===================================================================== */
import { S, save, resetProgress } from './state.js';
import { el, toast } from './dom.js';
import { sfx, buzz } from './audio.js';
import { renderHome } from './home.js';

export function renderSettings() {
  const seg = el('segCount');
  seg.innerHTML = '';
  [5, 10, 15, 25].forEach(n => {
    const b = document.createElement('button');
    b.textContent = n;
    b.className = S.count === n ? 'on' : '';
    b.addEventListener('click', () => { S.count = n; save(); renderSettings(); sfx.tap(); });
    seg.appendChild(b);
  });

  document.querySelectorAll('#segMode button').forEach(b => {
    b.classList.toggle('on', S.mode === b.dataset.mode);
    b.onclick = () => { S.mode = b.dataset.mode; save(); renderSettings(); sfx.tap(); };
  });

  el('modeNote').textContent = S.mode === 'type'
    ? 'Keyboard mode gives you one first-letter hint per line.'
    : 'Word tiles mode has no hints — pick from six options.';

  document.querySelectorAll('.sw').forEach(sw => {
    const on = !!S[sw.dataset.set];
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    sw.onclick = () => { S[sw.dataset.set] = !S[sw.dataset.set]; save(); renderSettings(); buzz(10); };
  });
}

export function wireSettings() {
  const sheet = el('sheetWrap');
  el('openSettings').addEventListener('click', () => { renderSettings(); sheet.classList.add('on'); });
  el('closeSheet').addEventListener('click', () => sheet.classList.remove('on'));
  el('scrim').addEventListener('click', () => sheet.classList.remove('on'));

  el('resetBtn').addEventListener('click', () => {
    const btn = el('resetBtn');
    if (btn.dataset.armed) {
      resetProgress();
      btn.textContent = 'Reset all progress';
      delete btn.dataset.armed;
      sheet.classList.remove('on');
      renderHome();
      toast('Progress cleared');
    } else {
      btn.dataset.armed = '1';
      btn.textContent = 'Tap again to confirm';
    }
  });
}
