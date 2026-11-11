// Kleine UI-Helfer: Elemente, Icons, Sprechblase, Sterne-Regen, Halte-Knopf.
import { sfx, unlockAudio } from './audio.js';
import { plushSVG } from './art/plush.js';

export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const S = 'fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"';
export const ICON = {
  check: `<svg viewBox="0 0 48 48"><path d="M10 25 L20 35 L38 13" ${S} stroke-width="7"/></svg>`,
  back: `<svg viewBox="0 0 48 48"><path d="M28 10 L14 24 L28 38" ${S} stroke-width="7"/></svg>`,
  next: `<svg viewBox="0 0 48 48"><path d="M20 10 L34 24 L20 38" ${S} stroke-width="7"/></svg>`,
  close: `<svg viewBox="0 0 48 48"><path d="M13 13 L35 35 M35 13 L13 35" ${S} stroke-width="7"/></svg>`,
  lock: `<svg viewBox="0 0 48 48"><rect x="10" y="21" width="28" height="20" rx="5" fill="currentColor"/><path d="M16 21 v-5 a8 8 0 0 1 16 0 v5" ${S}/></svg>`,
  dice: `<svg viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="9" fill="#fff" stroke="currentColor" stroke-width="4"/><g fill="currentColor"><circle cx="17" cy="17" r="3.5"/><circle cx="31" cy="31" r="3.5"/><circle cx="24" cy="24" r="3.5"/><circle cx="31" cy="17" r="3.5"/><circle cx="17" cy="31" r="3.5"/></g></svg>`,
  play: `<svg viewBox="0 0 48 48"><path d="M16 10 L38 24 L16 38 Z" fill="currentColor" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/></svg>`,
  hanger: `<svg viewBox="0 0 48 48"><path d="M24 16 a5 5 0 1 1 5 -5 M24 16 v4 L6 34 h36 L24 20" ${S} stroke-width="4.5"/></svg>`,
  heart: `<svg viewBox="0 0 48 48"><path d="M24 40 C8 28 4 20 8 13 C12 6 21 7 24 14 C27 7 36 6 40 13 C44 20 40 28 24 40 Z" fill="#ff6f91" stroke="#c94a6a" stroke-width="3"/></svg>`,
  star: `<svg viewBox="0 0 48 48"><path d="M24 4 L30 17 L44 18.5 L33.5 28 L36.5 42 L24 34.8 L11.5 42 L14.5 28 L4 18.5 L18 17 Z" fill="#ffd23f" stroke="#e39b12" stroke-width="3" stroke-linejoin="round"/><path d="M18 20 l4 -1" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`,
  home: `<svg viewBox="0 0 48 48"><path d="M8 24 L24 9 L40 24 M13 20 V39 H35 V20" ${S} stroke-width="5"/><rect x="20" y="28" width="8" height="11" fill="currentColor"/></svg>`,
  plush: `<svg viewBox="0 0 48 48"><circle cx="14" cy="13" r="6" fill="currentColor"/><circle cx="34" cy="13" r="6" fill="currentColor"/><circle cx="24" cy="26" r="15" fill="currentColor"/><circle cx="19" cy="24" r="2.4" fill="#fff"/><circle cx="29" cy="24" r="2.4" fill="#fff"/><ellipse cx="24" cy="31" rx="5" ry="3.5" fill="#fff"/></svg>`,
};

// ---------- Sprechblase ----------
let bubbleEl = null, bubbleTimer = null;
export function showBubble(text, who) {
  if (!bubbleEl) {
    bubbleEl = h(`<div class="bubble"><div class="who"></div><div class="tx"></div></div>`);
    document.getElementById('overlay-root').appendChild(bubbleEl);
  }
  bubbleEl.querySelector('.who').innerHTML = who ? (who.startsWith('<svg') ? who : plushSVG(who)) : '';
  bubbleEl.querySelector('.who').style.display = who ? '' : 'none';
  bubbleEl.querySelector('.tx').textContent = text;
  bubbleEl.classList.remove('show');
  void bubbleEl.offsetWidth;
  bubbleEl.classList.add('show');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubbleEl.classList.remove('show'), 2600 + text.length * 55);
}
export function hideBubble() { bubbleEl?.classList.remove('show'); }

// ---------- Effekte ----------
export function starRain(n = 24, kind = 'star') {
  const fx = h(`<div class="fx"></div>`);
  const items = { star: ICON.star, heart: ICON.heart, snow: '❄️', confetti: null };
  const colors = ['#ff6f91', '#ffd23f', '#6fd3c7', '#9b8cff', '#8fdc6a', '#ff9f1c'];
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'p';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
    p.style.animationDelay = Math.random() * 0.9 + 's';
    if (kind === 'confetti') {
      p.innerHTML = `<div style="width:14px;height:22px;border-radius:4px;background:${colors[i % colors.length]}"></div>`;
    } else p.innerHTML = items[kind] || ICON.star;
    fx.appendChild(p);
  }
  document.body.appendChild(fx);
  setTimeout(() => fx.remove(), 4200);
}

export function tapFx(x, y) {
  const el = h(`<div class="tapfx" style="left:${x}px;top:${y}px"></div>`);
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 520);
}

/** Herzchen o. ä. in einer SVG-Ebene an Weltkoordinaten aufsteigen lassen */
export function svgFloat(layer, x, y, char = '❤️', n = 3) {
  for (let i = 0; i < n; i++) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    g.setAttribute('x', x + (Math.random() * 60 - 30));
    g.setAttribute('y', y - i * 10);
    g.setAttribute('font-size', 34);
    g.setAttribute('text-anchor', 'middle');
    g.setAttribute('class', 'heart-fx');
    g.style.animationDelay = i * 0.18 + 's';
    g.style.transformBox = 'fill-box';
    g.textContent = char;
    layer.appendChild(g);
    setTimeout(() => g.remove(), 1800 + i * 200);
  }
}

// ---------- Knöpfe ----------
/** Klick mit Ton & Audio-Freischaltung */
export function onTap(el, fn, { sound = 'tap' } = {}) {
  el.addEventListener('click', (e) => {
    unlockAudio();
    if (sound) sfx[sound]?.();
    fn(e);
  });
}

/** Knopf, der eine Weile gedrückt gehalten werden muss (für Eltern). */
export function holdButton(el, ms, onDone) {
  const ring = h(`<svg class="hold-ring" viewBox="0 0 62 62"><circle cx="31" cy="31" r="27"/></svg>`);
  el.style.position ||= 'absolute';
  el.appendChild(ring);
  const c = ring.querySelector('circle');
  let t0 = 0, raf = 0;
  const reset = () => { cancelAnimationFrame(raf); c.style.strokeDashoffset = 170; };
  const step = () => {
    const p = Math.min(1, (performance.now() - t0) / ms);
    c.style.strokeDashoffset = 170 * (1 - p);
    if (p >= 1) { reset(); onDone(); return; }
    raf = requestAnimationFrame(step);
  };
  el.addEventListener('pointerdown', (e) => { e.preventDefault(); t0 = performance.now(); unlockAudio(); raf = requestAnimationFrame(step); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, reset);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

export function overlay(html, cls = '') {
  const el = h(`<div class="overlay ${cls}">${html}</div>`);
  document.getElementById('overlay-root').appendChild(el);
  return el;
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Sichtbarer Kinder-Kopf für Badges */
export function kidColorDark(hex) {
  return hex === '#ff8fa3' ? '#d9506e' : hex === '#b68cff' ? '#7d55d1' : '#5a3e2b';
}

/** Eigene Sicherheitsabfrage (statt confirm(), das nicht überall funktioniert). Ergebnis: true/false */
export function ask(text, { yes = 'Ja', no = 'Abbrechen', danger = false } = {}) {
  return new Promise((resolve) => {
    const el = h(`<div class="overlay ask-ov"><div class="card ask"><p></p><div class="ask-btns"><button class="pbtn" data-r="0"></button><button class="pbtn ${danger ? 'warn' : 'go'}" data-r="1"></button></div></div></div>`);
    el.querySelector('p').textContent = text;
    el.querySelector('[data-r="0"]').textContent = no;
    el.querySelector('[data-r="1"]').textContent = yes;
    document.getElementById('overlay-root').appendChild(el);
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b && e.target !== el) return;
      el.remove();
      resolve(b ? b.dataset.r === '1' : false);
    });
  });
}
