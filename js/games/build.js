// Klötzchen-Bauen in Opas Bau-Schuppen: frei bauen oder nach Bauplan.
import { register, session } from '../nav.js';
import { save } from '../store.js';
import { h, onTap, holdButton, ICON, colorName } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, pick } from './shell.js';
import { personSVG, FAMILY } from '../art/person.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const COLS = 12, ROWS = 9, U = 100;
const COLORS = ['#ff4d4d', '#ffd23f', '#2f6fdf', '#2fb36b', '#ff9f1c', '#9b5de5', '#ffffff', '#8a5530'];
const TYPES = {
  b1: { w: 1, icon: 'brick' }, b2: { w: 2, icon: 'brick' }, b3: { w: 3, icon: 'brick' },
  fenster: { w: 1 }, tuer: { w: 1 }, dach: { w: 3 }, rad: { w: 1 }, stern: { w: 1 },
};
// Baupläne: [Typ, Spalte, Reihe von unten, Farbe]
const PLANS = [
  { name: 'Haus', icon: '🏠', blocks: [['b1', 4, 0, '#ffffff'], ['tuer', 5, 0, '#8a5530'], ['b1', 6, 0, '#ffffff'], ['fenster', 4, 1, '#ffffff'], ['b1', 5, 1, '#ffffff'], ['fenster', 6, 1, '#ffffff'], ['dach', 4, 2, '#ff4d4d']] },
  { name: 'Turm', icon: '🗼', blocks: [['b2', 5, 0, '#2f6fdf'], ['b2', 5, 1, '#ffd23f'], ['b2', 5, 2, '#2f6fdf'], ['b2', 5, 3, '#ffd23f'], ['stern', 5, 4, '#ffd23f']] },
  { name: 'Auto', icon: '🚗', blocks: [['rad', 4, 0, '#2f3238'], ['b1', 5, 0, '#ff4d4d'], ['rad', 6, 0, '#2f3238'], ['b3', 4, 1, '#ff4d4d'], ['fenster', 5, 2, '#ffffff']] },
  { name: 'Brücke', icon: '🌉', blocks: [['b1', 3, 0, '#8a5530'], ['b1', 7, 0, '#8a5530'], ['b1', 3, 1, '#8a5530'], ['b1', 7, 1, '#8a5530'], ['b3', 3, 2, '#2fb36b'], ['b2', 6, 2, '#2fb36b']] },
  { name: 'Burg', icon: '🏰', blocks: [['b3', 3, 0, '#9aa0a8'], ['b3', 6, 0, '#9aa0a8'], ['b1', 3, 1, '#9aa0a8'], ['tuer', 5, 1, '#8a5530'], ['b1', 7, 1, '#9aa0a8'], ['b1', 3, 2, '#9aa0a8'], ['b1', 7, 2, '#9aa0a8'], ['stern', 5, 2, '#ffd23f']] },
];

function blockSVG(type, x, y, color, ghost = false) {
  const w = TYPES[type].w * U;
  const st = ghost ? `fill="none" stroke="#5a3e2b" stroke-width="5" stroke-dasharray="10 10" opacity=".45"` : `fill="${color}" stroke="#5a3e2b" stroke-width="5" stroke-linejoin="round"`;
  const studs = ghost ? '' : Array.from({ length: TYPES[type].w }, (_, i) => `<rect x="${x + i * U + 26}" y="${y - 12}" width="48" height="16" rx="5" fill="${color}" stroke="#5a3e2b" stroke-width="4"/>`).join('');
  const shine = ghost ? '' : `<rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="14" rx="7" fill="#fff" opacity=".3"/>`;
  switch (type) {
    case 'dach': return `<path d="M${x} ${y + U} L${x + w / 2} ${y + 6} L${x + w} ${y + U} Z" ${st}/>`;
    case 'rad': return `<circle cx="${x + 50}" cy="${y + 50}" r="44" ${st}/>${ghost ? '' : `<circle cx="${x + 50}" cy="${y + 50}" r="18" fill="#c9d2dc" stroke="#5a3e2b" stroke-width="4"/>`}`;
    case 'stern': return `<path transform="translate(${x + 50} ${y + 52})" d="M0 -46 L13 -15 L46 -14 L20 7 L28 42 L0 22 L-28 42 L-20 7 L-46 -14 L-13 -15 Z" ${st}/>`;
    case 'fenster': return `${studs}<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${U - 4}" rx="8" ${st}/>${ghost ? '' : `<rect x="${x + 22}" y="${y + 22}" width="56" height="56" rx="6" fill="#bfe8ff" stroke="#5a3e2b" stroke-width="4"/><path d="M${x + 50} ${y + 22} V${y + 78} M${x + 22} ${y + 50} H${x + 78}" stroke="#5a3e2b" stroke-width="4"/>`}`;
    case 'tuer': return `${studs}<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${U - 4}" rx="8" ${st}/>${ghost ? '' : `<path d="M${x + 24} ${y + 98} V${y + 40} a26 26 0 0 1 52 0 V${y + 98}" fill="#c98b55" stroke="#5a3e2b" stroke-width="4"/><circle cx="${x + 66}" cy="${y + 70}" r="4" fill="#ffd23f"/>`}`;
    default: return `${studs}<rect x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${U - 4}" rx="10" ${st}/>${shine}`;
  }
}

register('build', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'build', back: 'village' });

  function start() {
    right.innerHTML = '';
    body.innerHTML = `<div class="bd-start"><div class="opa">${personSVG(FAMILY.opaMindelheim, { pose: 'wave', mood: 'laugh' })}</div>
      <div class="bd-modes"><button class="bd-mode" data-m="free" aria-label="Frei bauen">🧱</button>${PLANS.map((p, i) => `<button class="bd-mode" data-p="${i}" aria-label="${p.name}">${p.icon}</button>`).join('')}</div></div>`;
    say('Servus! Ich bin Opa Mindelheim. Willst du frei bauen, oder nach Bauplan?');
    body.querySelector('[data-m=free]').addEventListener('click', () => { sfx.pop(); play(null, 'leicht'); });
    body.querySelectorAll('[data-p]').forEach((b) => onTap(b, async () => play(PLANS[+b.dataset.p], await chooseLevel(kid, 'build')), { sound: 'pop' }));
  }

  function play(plan, diff) {
    let type = 'b2', color = COLORS[0];
    const placed = [];
    const heights = Array(COLS).fill(0);
    body.innerHTML = `<div class="bd-ui">
      <div class="bd-blocks">${Object.keys(TYPES).map((t) => `<button class="bd-b ${t === type ? 'on' : ''}" data-t="${t}"><svg viewBox="-10 -20 ${TYPES[t].w * U + 20} ${U + 30}">${blockSVG(t, 0, 0, '#ffd23f')}</svg></button>`).join('')}</div>
      <div class="bd-area"><svg class="bd-grid" viewBox="0 -40 ${COLS * U} ${ROWS * U + 60}"><defs><pattern id="bdg" width="${U}" height="${U}" patternUnits="userSpaceOnUse"><rect width="${U}" height="${U}" fill="none" stroke="#c9d6e3" stroke-width="2"/></pattern></defs>
        <rect width="${COLS * U}" height="${ROWS * U}" fill="url(#bdg)"/><rect y="${ROWS * U}" width="${COLS * U}" height="30" rx="8" fill="#8fdc6a" stroke="#5a3e2b" stroke-width="4"/>
        <g class="ghost"></g><g class="placed"></g><g class="hover"></g></svg>
        ${plan ? `<div class="bd-plan ${diff}"><svg viewBox="-20 -60 ${COLS * U + 40} ${ROWS * U + 80}">${plan.blocks.map(([t, c, r, col]) => blockSVG(t, c * U, (ROWS - 1 - r) * U, col)).join('')}</svg></div>` : ''}
      </div>
      <div class="bd-colors">${COLORS.map((c) => `<button class="bd-c ${c === color ? 'on' : ''}" data-c="${c}" data-say="${colorName(c)}" style="--c:${c}"></button>`).join('')}</div>
      <div class="bd-opa">${personSVG(FAMILY.opaMindelheim)}</div></div>`;
    right.innerHTML = `<button class="btn round ghost" data-a="undo" aria-label="Rückgängig">↶</button><button class="btn round ghost bd-trash" aria-label="Alles weg">🗑️</button>${plan ? '' : `<button class="btn round go" data-a="done" aria-label="Fertig">${ICON.check}</button>`}`;
    const svg = body.querySelector('.bd-grid'), pl = svg.querySelector('.placed'), gh = svg.querySelector('.ghost'), hov = svg.querySelector('.hover');
    if (plan && diff === 'leicht') gh.innerHTML = plan.blocks.map(([t, c, r]) => blockSVG(t, c * U, (ROWS - 1 - r) * U, '#000', true)).join('');
    const P = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const redraw = () => { pl.innerHTML = placed.map((b) => `<g class="${b.fresh ? 'drop' : ''}">${blockSVG(b.t, b.c * U, (ROWS - 1 - b.r) * U, b.color)}</g>`).join(''); placed.forEach((b) => (b.fresh = false)); };
    const recompute = () => { heights.fill(0); for (const b of placed) for (let i = 0; i < TYPES[b.t].w; i++) heights[b.c + i] = Math.max(heights[b.c + i], b.r + 1); };
    body.querySelectorAll('.bd-b').forEach((b) => onTap(b, () => { type = b.dataset.t; body.querySelectorAll('.bd-b').forEach((x) => x.classList.toggle('on', x === b)); say({ b1: 'Kleiner Stein', b2: 'Doppelstein', b3: 'Langer Stein', fenster: 'Fenster', tuer: 'Tür', dach: 'Dach', rad: 'Rad', stern: 'Stern' }[type]); }));
    body.querySelectorAll('.bd-c').forEach((b) => onTap(b, () => { color = b.dataset.c; body.querySelectorAll('.bd-c').forEach((x) => x.classList.toggle('on', x === b)); }, { sound: 'pop' }));
    const colFor = (p) => Math.max(0, Math.min(COLS - TYPES[type].w, Math.floor(p.x / U - (TYPES[type].w - 1) / 2)));
    svg.addEventListener('pointermove', (e) => {
      const c = colFor(P(e)); const r = Math.max(...heights.slice(c, c + TYPES[type].w));
      hov.innerHTML = r < ROWS ? `<g opacity=".35">${blockSVG(type, c * U, (ROWS - 1 - r) * U, color)}</g>` : '';
    });
    svg.addEventListener('pointerleave', () => (hov.innerHTML = ''));
    svg.addEventListener('click', async (e) => {
      const c = colFor(P(e));
      const r = Math.max(...heights.slice(c, c + TYPES[type].w));
      if (r >= ROWS) { sfx.wrong(); say('Höher geht es nicht!'); return; }
      placed.push({ t: type, c, r, color, fresh: true });
      recompute(); redraw(); hov.innerHTML = '';
      sfx.kick(); setTimeout(() => sfx.tick(), 60);
      if (plan && check()) {
        startRound();
        sfx.tada();
        kid.builds++; save();
        levelUp(kid, 'build', diff, 5);
        say(`Toll! ${plan.name} fertig gebaut!`);
        const res = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: `${plan.name} fertig gebaut!`, speak: `Wunderbar, ${kid.name}! Das hätte ich nicht besser bauen können! Du bekommst ${diff === 'schwer' ? 'zwei Sterne' : 'einen Stern'}!` });
        if (res === 'again') play(plan, diff); else start();
      }
    });
    const check = () => plan.blocks.every(([t, c, r, col]) => placed.some((b) => b.t === t && b.c === c && b.r === r && (diff === 'leicht' || b.color === col)));
    onTap(right.querySelector('[data-a=undo]'), () => { placed.pop(); recompute(); redraw(); }, { sound: 'boing' });
    holdButton(right.querySelector('.bd-trash'), 800, () => { placed.length = 0; recompute(); redraw(); sfx.whoosh(); say('Alles weg! Neu bauen!'); });
    const done = right.querySelector('[data-a=done]');
    if (done) {
      let starGiven = false;
      onTap(done, async () => {
        if (placed.length < 4) { say('Bau noch ein bisschen mehr!'); return; }
        kid.builds++; save();
        if (starGiven) { say(pick(['Toll gebaut!', 'Wunderbar!'])); return; }
        starGiven = true;
        const r = await winScreen(kid, { stars: 1, text: 'Toll gebaut!', speak: `Das ist ja ein tolles Bauwerk, ${kid.name}! Das gefällt mir!` });
        if (r === 'home') start();
      }, { sound: null });
    }
    say(plan ? (diff === 'leicht' ? `Bau ${plan.name === 'Burg' ? 'die' : plan.name === 'Brücke' ? 'die' : plan.name === 'Turm' ? 'den' : 'das'} ${plan.name} nach! Leg die Steine auf die Umrisse.` : `Schau auf den Bauplan und bau nach! Auch die Farben!`) : 'Bau was du willst! Tipp auf einen Stein und dann aufs Feld.');
  }
  start();
  return {};
});
