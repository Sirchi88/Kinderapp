// Einfache Bildschirm-Navigation.
const screens = {};
let current = null;
export const session = {
  kid: null,          // aktuell spielendes Kind
  paused: true,       // Spielzeit läuft nicht (Pause, Elternbereich, Auswahl …)
  inRound: false,     // ein Spiel ist gerade mitten in einer Runde
  breakPending: false,
  screen: null,
  fromHub: false,     // Spiel wurde aus der Spiele-Übersicht gestartet
};

export function register(name, fn) { screens[name] = fn; }

export function go(name, params = {}) {
  try { current?.cleanup?.(); } catch (e) { console.warn(e); }
  const app = document.getElementById('app');
  app.innerHTML = '';
  if (params.fromHub) session.fromHub = true;
  else if (['village', 'house', 'profiles', 'games'].includes(name)) session.fromHub = false;
  session.screen = name;
  document.body.dataset.bubble = name === 'plushpick' ? 'low' : '';
  session.inRound = false;
  current = screens[name](app, params) || {};
  document.dispatchEvent(new CustomEvent('screen', { detail: name }));
}

export const currentScreen = () => current;

/** Zurück: in die Spiele-Übersicht, wenn das Spiel von dort kam, sonst zum angegebenen Ort */
export function goBack(def = 'village', params = {}) {
  if (session.fromHub) go('games', {});
  else go(def, params);
}
