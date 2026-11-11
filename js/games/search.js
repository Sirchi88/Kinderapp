// Suchbilder: „Wo ist Bailey?“ – versteckte Dinge im Dorf oder im Haus finden.
import { register, session } from '../nav.js';
import { h, onTap, sleep } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle, pick } from './shell.js';
import { sirchHouseScene } from '../art/village.js';
import { houseScene } from '../screens/house.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const NS = 'http://www.w3.org/2000/svg';
const BAILEY_PEEK = `<g><path d="M-26 -6 L-22 -34 L-6 -16 Z M6 -16 L22 -34 L26 -6 Z" fill="#a7a9ab" stroke="#4a3e36" stroke-width="3" stroke-linejoin="round"/><ellipse rx="30" ry="25" fill="#a7a9ab" stroke="#4a3e36" stroke-width="3"/>
  <path d="M-8 -22 l2 7 M0 -24 v8 M8 -22 l-2 7" stroke="#5d6066" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="-11" cy="-2" rx="6" ry="7.5" fill="#c9b53a"/><ellipse cx="-11" cy="-2" rx="2.4" ry="6" fill="#1d1d1d"/><ellipse cx="11" cy="-2" rx="6" ry="7.5" fill="#c9b53a"/><ellipse cx="11" cy="-2" rx="2.4" ry="6" fill="#1d1d1d"/>
  <ellipse cx="0" cy="10" rx="12" ry="7" fill="#e6e3de"/><path d="M-3 7 l3 3 l3 -3 Z" fill="#e58a8a"/></g>`;

const ITEMS = {
  bailey: { name: 'Bailey', say: 'Wo ist Bailey?', svg: BAILEY_PEEK },
  butterfly: { name: 'den Schmetterling', e: '🦋' }, ladybug: { name: 'den Marienkäfer', e: '🐞' }, ball: { name: 'den Ball', e: '⚽' },
  duck: { name: 'die Ente', e: '🦆' }, mouse: { name: 'die Maus', e: '🐭' }, bird: { name: 'den Vogel', e: '🐦' }, balloon: { name: 'den Luftballon', e: '🎈' },
  sock: { name: 'die Socke', e: '🧦' }, key: { name: 'den Schlüssel', e: '🔑' }, frog: { name: 'den Frosch', e: '🐸' }, apple: { name: 'den Apfel', e: '🍎' },
  teddy: { name: 'den Teddy', e: '🧸' }, snail: { name: 'die Schnecke', e: '🐌' }, star: { name: 'den Stern', e: '⭐' }, carrot: { name: 'die Karotte', e: '🥕' },
};

// Verstecke: [x, y, Abdeckung (optional)]
const bushCover = (x, y) => `<g transform="translate(${x} ${y + 18})" stroke="#5a3e2b" stroke-width="2.5"><circle cx="-18" cy="0" r="18" fill="#4fa543"/><circle cx="18" cy="0" r="18" fill="#4fa543"/><circle cx="0" cy="-6" r="20" fill="#5fb84a"/></g>`;
const SCENES = {
  dorf: {
    svg: () => sirchHouseScene(),
    spots: [[300, 640, bushCover], [520, 770, null], [690, 296, null], [1110, 470, bushCover], [990, 552, null], [1350, 682, null], [820, 160, null], [1215, 712, null], [250, 470, bushCover],
      [470, 610, null], [1020, 690, null], [560, 520, bushCover], [1420, 470, bushCover], [380, 880, null], [905, 815, null], [1300, 368, null], [740, 400, null]],
  },
  haus: {
    svg: (kid) => houseScene(kid),
    spots: [[560, 488, null], [395, 440, null], [1225, 300, null], [980, 410, null], [1260, 475, null], [620, 640, null], [360, 735, null], [745, 700, null], [1200, 700, null],
      [920, 590, null], [1060, 600, null], [700, 470, null], [470, 690, null], [1130, 470, null]],
  },
};

register('search', (app, params) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'search', back: params.back || 'village' });

  async function play() {
    const diff = await chooseLevel(kid, 'search');
    const lvl = getLevel(kid, 'search', diff);
    const sceneId = pick(['dorf', 'dorf', 'haus']);
    const sc = SCENES[sceneId];
    const n = diff === 'leicht' ? Math.min(3 + Math.floor(lvl / 2), 4) : Math.min(5 + Math.floor(lvl / 2), 7);
    const size = diff === 'leicht' ? 1.35 : 0.95;
    const spots = shuffle([...sc.spots]).slice(0, n);
    const keys = ['bailey', ...shuffle(Object.keys(ITEMS).filter((k) => k !== 'bailey')).slice(0, n - 1)];
    body.innerHTML = `<svg class="sworld" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid ${sceneId === 'haus' ? 'meet' : 'slice'}">${sc.svg(kid)}<g class="hidden-items"></g><g class="found-fx"></g></svg>
      <div class="find-list">${keys.map((k) => `<div class="fi" data-k="${k}">${ITEMS[k].svg ? `<svg viewBox="-34 -38 68 66">${ITEMS[k].svg}</svg>` : ITEMS[k].e}</div>`).join('')}</div>`;
    right.innerHTML = `<button class="btn round ghost" data-a="hint" aria-label="Tipp">🔍</button>`;
    const svg = body.querySelector('svg'), layer = svg.querySelector('.hidden-items'), fx = svg.querySelector('.found-fx');
    const items = keys.map((k, i) => {
      const [x, y, cover] = spots[i];
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${x} ${y}) scale(${size})`);
      g.setAttribute('class', 'hid');
      const it = ITEMS[k];
      g.innerHTML = `<g class="hid-in">${it.svg || `<text text-anchor="middle" y="14" font-size="40">${it.e}</text>`}</g>${cover ? cover(0, 0) : ''}`;
      layer.appendChild(g);
      return { k, x, y, g, found: false };
    });
    startRound();
    const tStart = performance.now();
    say(`Wo ist Bailey? Und such ${keys.slice(1).map((k) => ITEMS[k].name).join(', ').replace(/, ([^,]*)$/, ' und $1')}!`);

    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    svg.addEventListener('click', async (e) => {
      const p = toSvg(e);
      const hit = items.find((it) => !it.found && Math.hypot(it.x - p.x, it.y - p.y) < 58 * size);
      if (!hit) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 20); c.setAttribute('class', 'miss');
        fx.appendChild(c); setTimeout(() => c.remove(), 500);
        return;
      }
      hit.found = true;
      sfx.sparkle();
      hit.g.classList.add('found');
      const ring = document.createElementNS(NS, 'circle');
      ring.setAttribute('cx', hit.x); ring.setAttribute('cy', hit.y); ring.setAttribute('r', 52 * size); ring.setAttribute('class', 'ring');
      fx.appendChild(ring);
      body.querySelector(`.fi[data-k="${hit.k}"]`).classList.add('done');
      say(hit.k === 'bailey' ? pick(['Da ist ja Bailey! Miau!', 'Gefunden! Bailey hat sich versteckt!']) : pick(['Gefunden!', 'Super!', 'Da ist es!']));
      if (hit.k === 'bailey') sfx.meow();
      if (items.every((it) => it.found)) {
        levelUp(kid, 'search', diff, 8);
        await sleep(900);
        const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: 'Alles gefunden!', speak: `Du hast alles gefunden! Du bist ein richtiger Detektiv!` });
        if (r === 'again') play(); else (await import('../nav.js')).goBack(params.back || 'village');
      }
    });
    onTap(right.querySelector('[data-a=hint]'), () => {
      const it = items.find((x) => !x.found);
      if (!it) return;
      if (performance.now() - tStart < 8000) { say('Schau genau hin!'); return; }
      it.g.classList.remove('hint'); void it.g.getBBox(); it.g.classList.add('hint');
      say(`Schau mal hier! ${ITEMS[it.k].name.replace(/^\w/, (c) => c.toUpperCase())}!`);
    });
  }
  play();
  return {};
});
