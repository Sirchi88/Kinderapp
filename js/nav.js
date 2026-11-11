// Einfache Bildschirm-Navigation.
const screens = {};
let current = null;
export const session = {
  kid: null,          // aktuell spielendes Kind
  paused: true,       // Spielzeit läuft nicht (Pause, Elternbereich, Auswahl …)
  inRound: false,     // ein Spiel ist gerade mitten in einer Runde
  breakPending: false,
  screen: null,
};

export function register(name, fn) { screens[name] = fn; }

export function go(name, params = {}) {
  try { current?.cleanup?.(); } catch (e) { console.warn(e); }
  const app = document.getElementById('app');
  app.innerHTML = '';
  session.screen = name;
  document.body.dataset.bubble = ['editor', 'plushpick'].includes(name) ? 'low' : '';
  session.inRound = false;
  current = screens[name](app, params) || {};
  document.dispatchEvent(new CustomEvent('screen', { detail: name }));
}

export const currentScreen = () => current;
