// Sirchhausen – Start.
import { state } from './store.js';
import { go, session } from './nav.js';
import { unlockAudio } from './audio.js';
import { onSay } from './speech.js';
import { showBubble } from './ui.js';
import { startTimekeeper } from './breaks.js';
import './screens/profiles.js';
import './screens/editor.js';
import './screens/plushpick.js';
import './screens/village.js';

// Sprechblase zeigt, was gerade gesagt wird – mit dem Kuscheltier des Kindes
onSay((text) => showBubble(text, session.kid?.plush || 'baer'));

// Audio auf iOS beim ersten Berühren freischalten
const unlock = () => { unlockAudio(); window.__audioUnlocked = true; };
window.addEventListener('pointerdown', unlock, { capture: true });

// Doppeltipp-Zoom und Gesten auf iOS verhindern
document.addEventListener('gesturestart', (e) => e.preventDefault());
document.addEventListener('dblclick', (e) => e.preventDefault());

startTimekeeper();
go('profiles');

// Offline-Fähigkeit
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
}

// Für Tests
window.__sirch = { state, go, session };
