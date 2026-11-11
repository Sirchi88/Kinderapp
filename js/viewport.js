// Feste Bühne: Die App wird immer als Ganzes auf den vollen Bildschirm skaliert –
// gleiches Bild auf iPhone, iPad und im Claude-Fenster.
let LW = 1180, LH = 820, S = 1;

export function layoutStage() {
  const st = document.getElementById('stage');
  if (!st) return;
  const W = window.innerWidth, H = window.innerHeight;
  const ar = W / Math.max(1, H);
  // Handys quer (sehr breit): etwas größere Darstellung, damit Knöpfe gut zu treffen sind
  LH = ar > 1.9 ? 680 : 820;
  LW = Math.max(Math.round(LH * Math.max(ar, 1.2)), 980);
  S = Math.min(W / LW, H / LH);
  const ox = (W - LW * S) / 2, oy = (H - LH * S) / 2;
  Object.assign(st.style, { width: LW + 'px', height: LH + 'px', transform: `translate(${ox}px, ${oy}px) scale(${S})` });
  const r = document.documentElement.style;
  r.setProperty('--vw', LW / 100 + 'px');
  r.setProperty('--vh', LH / 100 + 'px');
}

export const stageW = () => LW;
export const stageH = () => LH;
export const scale = () => S;
/** Bildschirm-Koordinaten (clientX/Y) in Bühnen-Koordinaten umrechnen */
export function toLocal(x, y) {
  const r = document.getElementById('stage').getBoundingClientRect();
  return [(x - r.left) / S, (y - r.top) / S];
}
/** getBoundingClientRect in Bühnen-Koordinaten */
export function localRect(el) {
  const r = el.getBoundingClientRect();
  const [left, top] = toLocal(r.left, r.top);
  return { left, top, width: r.width / S, height: r.height / S, right: left + r.width / S, bottom: top + r.height / S };
}

window.addEventListener('resize', layoutStage);
window.addEventListener('orientationchange', () => setTimeout(layoutStage, 200));
document.addEventListener('fullscreenchange', layoutStage);
document.addEventListener('webkitfullscreenchange', layoutStage);

/** Vollbild (wo das Gerät es erlaubt) */
export const canFullscreen = () => !!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen) && !(document.fullscreenElement || document.webkitFullscreenElement);
export function goFullscreen() {
  const d = document.documentElement;
  try {
    const p = (d.requestFullscreen || d.webkitRequestFullscreen).call(d);
    p?.catch?.(() => {});
  } catch (e) { /* nicht erlaubt */ }
}
