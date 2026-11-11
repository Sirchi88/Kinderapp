// Ziehen & Ablegen mit dem Finger (für Puzzle, Sortieren …)
import { scale } from '../viewport.js';
export function draggable(el, { onStart, onMove, onDrop } = {}) {
  let sx = 0, sy = 0, ox = 0, oy = 0, active = false;
  el.style.touchAction = 'none';
  el.addEventListener('pointerdown', (e) => {
    if (el.dataset.locked) return;
    e.preventDefault();
    active = true;
    el.setPointerCapture(e.pointerId);
    sx = e.clientX; sy = e.clientY;
    ox = parseFloat(el.style.left) || 0; oy = parseFloat(el.style.top) || 0;
    el.classList.add('dragging');
    onStart?.(el, e);
  });
  el.addEventListener('pointermove', (e) => {
    if (!active) return;
    el.style.left = ox + (e.clientX - sx) / scale() + 'px';
    el.style.top = oy + (e.clientY - sy) / scale() + 'px';
    onMove?.(el, e);
  });
  const end = (e) => {
    if (!active) return;
    active = false;
    // Letzte Fingerposition sicher übernehmen
    if (e.type === 'pointerup') {
      el.style.left = ox + (e.clientX - sx) / scale() + 'px';
      el.style.top = oy + (e.clientY - sy) / scale() + 'px';
    }
    el.classList.remove('dragging');
    onDrop?.(el, e, { back: () => { el.classList.add('return'); el.style.left = ox + 'px'; el.style.top = oy + 'px'; setTimeout(() => el.classList.remove('return'), 350); } });
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}

/** Mittelpunkt eines Elements */
export function center(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
}

/** SVG-Markup in ein Bild (PNG-Data-URL) umwandeln */
export function svgToImage(svg, w, h) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      try { res(c.toDataURL('image/png')); } catch (e) { res('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)); }
    };
    img.onerror = () => res('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}
