// Sirchhausen – Start.
import { state } from './store.js';
import { go, session } from './nav.js';
import { unlockAudio } from './audio.js';
import { onSay } from './speech.js';
import { showBubble } from './ui.js';
import { startTimekeeper } from './breaks.js';
import { layoutStage } from './viewport.js';
import './screens/profiles.js';
import './screens/editor.js';
import './screens/plushpick.js';
import './screens/village.js';
import './screens/house.js';
import './games/tamagotchi.js';
import './games/memory.js';
import './games/paint.js';
import './games/teeth.js';
import './games/music.js';
import './games/baking.js';
import './games/puzzle.js';
import './games/search.js';
import './games/sorting.js';
import './games/wardrobe.js';
import './games/farm.js';
import './games/build.js';
import './games/bike.js';
import './screens/visit.js';
import './screens/games.js';
import { say } from './speech.js';

// Sprechblase zeigt, was gerade gesagt wird – mit dem Kuscheltier des Kindes
onSay((text) => showBubble(text, session.kid?.plush || 'baer'));

// Audio auf iOS beim ersten Berühren freischalten
const unlock = () => { unlockAudio(); window.__audioUnlocked = true; };
for (const ev of ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown']) window.addEventListener(ev, unlock, { capture: true });

// Jeder Tastendruck wird vorgelesen (Kinder können noch nicht lesen).
// Das Spiel selbst darf danach sprechen – das ersetzt dann die Beschriftung.
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, [data-say]');
  if (!b || b.closest('.parents, .pin, .ask')) return;
  let t = b.dataset.say || b.getAttribute('aria-label') || '';
  if (!t) {
    const txt = b.textContent.replace(/[^\p{L}\p{N}\s+&?!.,-]/gu, '').trim();
    if (txt && !/^\d+$/.test(txt)) t = txt;
  }
  if (t) say(t);
}, { capture: true });

// Doppeltipp-Zoom und Gesten auf iOS verhindern
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

layoutStage();
startTimekeeper();
go('profiles');

// Offline-Fähigkeit
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
}

// Für Tests
window.__sirch = { state, go, session };
