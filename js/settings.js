/* =====================================================================
   SETTINGS SHEET
   Sound, vibration and reset only. How you answer and how long a run is
   are asked before every run instead — see setup.js.
   ===================================================================== */
import { S, save, resetProgress } from './state.js';
import { el, toast } from './dom.js';
import { buzz } from './audio.js';
import { renderHome } from './home.js';

export function renderSettings() {
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
