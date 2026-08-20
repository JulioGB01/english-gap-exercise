/* =====================================================================
   ENTRY POINT — wires up the screens and starts the app.
   ===================================================================== */
import { el, show } from './dom.js';
import { sfx, tone } from './audio.js';
import { renderHome, lastLevel } from './home.js';
import { startRun, stopRun, actionPressed } from './game.js';
import { wireSetup, openSetup, closeSetup } from './setup.js';
import { wireSettings } from './settings.js';

wireSettings();
wireSetup();

el('quickPlay').addEventListener('click', () => { sfx.tap(); openSetup(lastLevel()); });
el('quitBtn').addEventListener('click', () => { stopRun(); renderHome(); show('home'); });
el('homeBtn').addEventListener('click', () => { renderHome(); show('home'); });
/* "Play again" repeats the run you just did, same level and same choices. */
el('againBtn').addEventListener('click', e => { startRun(e.currentTarget.dataset.lv || 'A1'); });
el('actionBtn').addEventListener('click', actionPressed);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSetup();
});

document.addEventListener('gesturestart', e => e.preventDefault());
window.addEventListener('touchstart', function once() {
  tone(1, 0.01, 'sine', 0.0001, 0);
  window.removeEventListener('touchstart', once);
}, { passive: true });

renderHome();
