// Fotos (für Memory & Puzzle) und gemalte Bilder – gespeichert in der lokalen Datenbank des Geräts.
const DB = 'sirchhausen-media';
let dbp = null;

function db() {
  dbp ??= new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos', { keyPath: 'id' });
      if (!d.objectStoreNames.contains('drawings')) d.createObjectStore('drawings', { keyPath: 'id' });
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  return dbp;
}

async function tx(store, mode, fn) {
  const d = await db();
  return new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const s = t.objectStore(store);
    const out = fn(s);
    t.oncomplete = () => res(out?.result ?? out);
    t.onerror = () => rej(t.error);
  });
}

const all = (store) => tx(store, 'readonly', (s) => s.getAll()).then((r) => (r || []).sort((a, b) => a.t - b.t));
const id = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export const listPhotos = () => all('photos').catch(() => []);
export const addPhoto = (data, kid = '') => tx('photos', 'readwrite', (s) => s.put({ id: id(), t: Date.now(), data, kid }));
export const deletePhoto = (pid) => tx('photos', 'readwrite', (s) => s.delete(pid));

export const listDrawings = () => all('drawings').catch(() => []);
export const addDrawing = (data, kid) => tx('drawings', 'readwrite', (s) => s.put({ id: id(), t: Date.now(), data, kid }));
export const deleteDrawing = (pid) => tx('drawings', 'readwrite', (s) => s.delete(pid));

/** Bild einlesen, quadratisch zuschneiden und verkleinern */
export function fileToSquare(file, size = 420) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const m = Math.min(img.naturalWidth, img.naturalHeight);
      c.getContext('2d').drawImage(img, (img.naturalWidth - m) / 2, (img.naturalHeight - m) / 2, m, m, 0, 0, size, size);
      URL.revokeObjectURL(url);
      res(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = rej;
    img.src = url;
  });
}
