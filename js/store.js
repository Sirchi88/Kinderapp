// Zentrale Datenhaltung – alles wird automatisch lokal auf dem Gerät gespeichert.
const KEY = 'sirchhausen-v1';

export function localDay(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function defaultKid(id, name, color) {
  return {
    id, name, color,
    birthday: '',          // "MM-TT"
    avatar: null,          // Aussehen der Spielfigur
    plush: null,           // Kuscheltier-Art
    plushName: '',
    stars: 0,
    sinceBreakSec: 0,      // gespielte Sekunden seit der letzten Bewegungspause
    breaks: { enabled: true, intervalMin: 15 },
    dailyLimitMin: 0,      // 0 = kein Limit
    extraMinToday: { day: '', min: 0 },
  };
}

const DEFAULTS = {
  version: 1,
  pin: null,
  kids: [defaultKid('malia', 'Malia', '#ff8fa3'), defaultKid('nele', 'Nele', '#b68cff')],
  settings: {
    breakMode: 'finish',        // 'finish' = Runde fertig spielen, 'now' = sofort
    breakDurationMin: 2,
    breakTypes: { dance: true, animal: true, sport: true, search: true, custom: true },
    customIdeas: [],            // {id, emoji, text}
    starsPerBreak: 3,
    music: 0.45,
    sfx: 0.8,
    voice: true,
    voiceRate: 0.95,
    motionCheck: true,
  },
  rewards: [
    { id: 'r1', emoji: '🍦', name: 'Eis essen mit Papa', cost: 20 },
    { id: 'r2', emoji: '🛝', name: 'Spielplatz mit Mama', cost: 15 },
    { id: 'r3', emoji: '📖', name: 'Extra Gute-Nacht-Geschichte', cost: 5 },
  ],
  stats: {},                    // stats[kidId][tag] = { sec, breaks, stars }
};

function deepMerge(base, over) {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    if (over && typeof over === 'object') {
      for (const k of Object.keys(over)) out[k] = k in base ? deepMerge(base[k], over[k]) : over[k];
    }
    return out;
  }
  return over === undefined ? base : over;
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const data = deepMerge(structuredClone(DEFAULTS), JSON.parse(raw));
    // Kinder einzeln mit Standardwerten auffüllen (für spätere Erweiterungen)
    data.kids = data.kids.map((k, i) => deepMerge(defaultKid(k.id, k.name, k.color || DEFAULTS.kids[i % 2].color), k));
    return data;
  } catch (e) {
    console.warn('Speicher konnte nicht gelesen werden', e);
    return structuredClone(DEFAULTS);
  }
}

export const state = load();

let saveTimer = null;
export function save(now = false) {
  clearTimeout(saveTimer);
  const doSave = () => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Speichern fehlgeschlagen', e); }
  };
  if (now) doSave(); else saveTimer = setTimeout(doSave, 400);
}
window.addEventListener('pagehide', () => save(true));
document.addEventListener('visibilitychange', () => { if (document.hidden) save(true); });

export const getKid = (id) => state.kids.find((k) => k.id === id);

export function statFor(kidId, day = localDay()) {
  state.stats[kidId] ??= {};
  state.stats[kidId][day] ??= { sec: 0, breaks: 0, stars: 0 };
  return state.stats[kidId][day];
}

export function addStars(kid, n) {
  kid.stars = Math.max(0, kid.stars + n);
  if (n > 0) statFor(kid.id).stars += n;
  save();
  document.dispatchEvent(new Event('stars'));
}

export function limitMinToday(kid) {
  if (!kid.dailyLimitMin) return 0;
  const extra = kid.extraMinToday.day === localDay() ? kid.extraMinToday.min : 0;
  return extra === Infinity || extra >= 9999 ? 0 : kid.dailyLimitMin + extra;
}

export function resetAll() {
  localStorage.removeItem(KEY);
  location.reload();
}

export const uid = () => Math.random().toString(36).slice(2, 9);
