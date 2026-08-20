/* =====================================================================
   AUDIO + HAPTICS
   ===================================================================== */
import { S } from './state.js';

let AC = null;
function tone(freq, dur, type, vol, delay) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume();
    const t = AC.currentTime + (delay || 0);
    const o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(AC.destination);
    o.start(t); o.stop(t + dur + 0.03);
  } catch (e) {}
}

export { tone };

export const sfx = {
  good(m) { tone(523, .12, 'triangle', .12, 0); tone(784, .16, 'triangle', .11, .07); if (m > 1) tone(1046, .18, 'triangle', .09, .14); },
  bad() { tone(180, .22, 'sawtooth', .09, 0); tone(120, .26, 'sawtooth', .08, .06); },
  coin() { tone(1200, .07, 'square', .05, 0); },
  up() { [392, 523, 659, 880].forEach((f, i) => tone(f, .18, 'triangle', .1, i * .09)); },
  tap() { tone(440, .05, 'sine', .05, 0); },
  over() { [330, 262, 196].forEach((f, i) => tone(f, .28, 'sine', .1, i * .13)); }
};

export const buzz = p => {
  if (S.haptics && navigator.vibrate) { try { navigator.vibrate(p); } catch (e) {} }
};
