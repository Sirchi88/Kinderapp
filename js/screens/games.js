// Spiele-Übersicht: alle Spiele als große, klare Kacheln mit Bild und Namen.
import { register, go, session } from '../nav.js';
import { h, ICON, onTap, esc } from '../ui.js';
import { kidPlush } from '../pet.js';
import { isChristmas } from '../season.js';
import { say } from '../speech.js';
import { playMusic } from '../audio.js';

const TILES = [
  { id: 'tamagotchi', name: 'Kuscheltier pflegen', c: '#ffb3c8', plush: true },
  { id: 'memory', name: 'Memory', e: '🃏', c: '#ffd2a6' },
  { id: 'paint', name: 'Malen', e: '🎨', c: '#ffe58a' },
  { id: 'teeth', name: 'Zähne putzen', e: '🪥', c: '#b8ecff' },
  { id: 'music', name: 'Musik & Tanzen', e: '🎵', c: '#d6c4ff' },
  { id: 'baking', name: 'Backen', e: '🧁', c: '#ffc9e0' },
  { id: 'puzzle', name: 'Puzzle', e: '🧩', c: '#c6f0b5' },
  { id: 'search', name: 'Wo ist Bailey?', e: '🔍', c: '#cfe7ff' },
  { id: 'sorting', name: 'Zählen & Sortieren', e: '🔢', c: '#ffe0b3' },
  { id: 'wardrobe', name: 'Kleiderschrank', e: '👗', c: '#ffd0ea' },
  { id: 'farm', name: 'Bauernhof', e: '🐓', c: '#d9f2b0' },
  { id: 'build', name: 'Bauen', e: '🧱', c: '#ffd6c2' },
  { id: 'bike', name: 'Fahrrad fahren', e: '🚲', c: '#c4ecf2' },
  { id: 'visit-a', name: 'Oma & Opa Auerbach', e: '🏡', c: '#d4ebc8', go: 'visit', params: { who: 'auerbach' } },
  { id: 'visit-m', name: 'Oma & Opa Mindelheim', e: '🏠', c: '#ffdccc', go: 'visit', params: { who: 'mindelheim' } },
  { id: 'move', name: 'Bewegen', e: '🤸', c: '#fff0a8' },
];

register('games', (app) => {
  const kid = session.kid;
  session.paused = false;
  const tiles = [...TILES];
  if (isChristmas()) tiles.push({ id: 'advent', name: 'Adventskalender', e: '🎄', c: '#ffc2c2' });
  const el = h(`<div class="screen games-hub">
    <div class="game-top"><button class="btn round ghost g-back" aria-label="Zurück ins Dorf">${ICON.back}</button><span class="hub-title">Spiele</span><span class="spacer"></span></div>
    <div class="hub-grid">${tiles.map((t) => `<button class="tile" data-id="${t.id}" data-say="${esc(t.name)}" style="--c:${t.c}">
      <span class="tile-pic">${t.plush ? kidPlush(kid) : t.e}</span><span class="tile-name">${esc(t.name)}</span></button>`).join('')}</div>
  </div>`);
  app.appendChild(el);
  onTap(el.querySelector('.g-back'), () => go('village', {}));
  el.querySelectorAll('.tile').forEach((b) => onTap(b, async () => {
    const t = tiles.find((x) => x.id === b.dataset.id);
    b.classList.add('jump');
    if (t.id === 'move') { const m = await import('../breaks.js'); m.startBreak(); return; }
    if (t.id === 'advent') { const m = await import('./festive.js'); m.openAdvent(kid); return; }
    setTimeout(() => go(t.go || t.id, { ...(t.params || {}), fromHub: true }), 250);
  }, { sound: 'pop' }));
  playMusic(isChristmas() ? 'weihnacht' : 'dorf');
  setTimeout(() => say('Was möchtest du spielen?'), 300);
  return {};
});
