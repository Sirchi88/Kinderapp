// Bauernhof-Manager: Tiere füttern & tränken, Schweinchen putzen, Kuh melken, Eier sammeln, Gemüse ernten.
import { register, session } from '../nav.js';
import { save } from '../store.js';
import { h, onTap, sleep } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle, pick } from './shell.js';
import { plushSVG } from '../art/plush.js';
import { roundTree } from '../art/village.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const NS = 'http://www.w3.org/2000/svg';
const OUT = '#5a3e2b';
const SW = `stroke="${OUT}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const ZAHL = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht'];

const ANIMALS = {
  kuh: { x: 760, y: 470, s: 210, snd: 'moo', name: 'die Kuh' },
  schaf: { x: 950, y: 520, s: 170, snd: 'baa', name: 'das Schaf' },
  schwein: { x: 1120, y: 560, s: 170, snd: 'oink', name: 'das Schwein' },
  pony: { x: 1300, y: 480, s: 190, snd: 'neigh', name: 'das Pony' },
  kueken: { x: 620, y: 650, s: 110, snd: 'peep', name: 'das Küken' },
};
const TOOLS = [['futter', '🌾'], ['wasser', '💧'], ['buerste', '🧽'], ['streicheln', '❤️'], ['eimer', '🥛'], ['korb', '🧺']];

function farmScene() {
  let s = `<defs><linearGradient id="fsky2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#eaf8ff"/></linearGradient></defs>
  <rect width="1600" height="900" fill="url(#fsky2)"/><circle cx="1400" cy="110" r="60" fill="#ffd94a"/>
  <path d="M-20 330 L150 200 L280 280 L420 160 L560 270 L720 190 L860 300 L1020 180 L1160 270 L1300 190 L1460 260 L1620 220 V380 H-20 Z" fill="#a9c3dc"/>
  <path d="M-20 400 Q300 320 700 370 T1620 360 V900 H-20 Z" fill="#9edb6e"/>`;
  for (const [x, y, sc] of [[60, 420, 0.6], [1560, 420, 0.6], [700, 380, 0.4]]) s += roundTree(x, y, sc);
  // Scheune
  s += `<g ${SW}><path d="M60 600 V380 L250 270 L440 380 V600 Z" fill="#d9534f"/><path d="M40 386 L250 258 L460 386" fill="none" stroke="#fff" stroke-width="16"/>
    <rect x="180" y="460" width="140" height="140" fill="#b8433f"/><path d="M180 460 L320 600 M320 460 L180 600" stroke="#fff" stroke-width="9"/><rect x="180" y="460" width="140" height="140" fill="none" stroke="#fff" stroke-width="9"/>
    <circle cx="250" cy="370" r="30" fill="#fff6c9"/></g>`;
  // Zaun
  s += `<g ${SW} fill="#e2b07a">${Array.from({ length: 14 }, (_, i) => `<rect x="${680 + i * 66}" y="${430 - (i % 2) * 2}" width="14" height="70" rx="4"/>`).join('')}<rect x="670" y="444" width="890" height="12" rx="5"/><rect x="670" y="474" width="890" height="12" rx="5"/></g>`;
  // Hühnerstall
  s += `<g ${SW}><rect x="480" y="520" width="200" height="120" rx="8" fill="#f3d27a"/><path d="M466 524 L580 460 L694 524 Z" fill="#c6643f"/><rect x="560" y="580" width="40" height="60" rx="18" fill="#7a4a2c"/>
    <path d="M600 640 L640 690" stroke-width="8"/></g><g class="nests">${[[505, 620], [655, 620], [520, 700], [690, 700], [600, 735]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="12" fill="#e2b07a" ${SW}/>`).join('')}</g>`;
  // Schlammpfütze & Trog & Feld
  s += `<ellipse cx="1120" cy="660" rx="130" ry="28" fill="#8a6a3a" opacity=".85"/><g ${SW}><rect x="880" y="650" width="160" height="40" rx="10" fill="#a96a42"/><rect x="890" y="656" width="140" height="16" rx="6" fill="#7fd6f5" class="trough"/></g>
    <g ${SW}><rect x="215" y="640" width="250" height="140" rx="20" fill="#8a5a32"/>${[0, 1].map((r) => `<path d="M232 ${695 + r * 56} H448" stroke="#6b4226" stroke-width="10"/>`).join('')}</g><g class="veg"></g>`;
  return s;
}

register('farm', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'farm', back: 'village' });

  async function play() {
    const diff = await chooseLevel(kid, 'farm');
    const lvl = getLevel(kid, 'farm', diff);
    body.innerHTML = `<svg class="fworld" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${farmScene()}<g class="animals"></g><g class="items"></g><g class="fx"></g></svg>
      <div class="jobs"></div><div class="ftools">${TOOLS.map(([k, e]) => `<button class="ftool" data-t="${k}">${e}</button>`).join('')}</div><div class="basket-count">🧺 <b>0</b></div>`;
    const svg = body.querySelector('svg'), aL = svg.querySelector('.animals'), iL = svg.querySelector('.items'), fx = svg.querySelector('.fx');
    const P = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let tool = null, basket = 0;
    const setTool = (t) => { tool = t; body.querySelectorAll('.ftool').forEach((b) => b.classList.toggle('on', b.dataset.t === t)); };
    body.querySelectorAll('.ftool').forEach((b) => onTap(b, () => { setTool(b.dataset.t); say({ futter: 'Futter', wasser: 'Wasser', buerste: 'Bürste', streicheln: 'Streicheln', eimer: 'Milcheimer', korb: 'Korb' }[b.dataset.t]); }, { sound: 'pop' }));

    // Tiere zeichnen
    const an = {};
    for (const [k, a] of Object.entries(ANIMALS)) {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'animal hot');
      g.dataset.a = k;
      g.innerHTML = `<g class="an-in"><svg x="${a.x - a.s / 2}" y="${a.y - a.s}" width="${a.s}" height="${a.s}" overflow="visible">${plushSVG(k)}</svg></g><g class="mud"></g><g class="need"></g>`;
      aL.appendChild(g);
      an[k] = { g, need: null, ...a };
    }

    // Aufgaben
    const pool = ['feed:kuh', 'water:kuh', 'feed:schaf', 'water:schaf', 'feed:pony', 'water:pony', 'feed:kueken', 'love:schaf', 'love:pony', 'love:kuh', 'clean:schwein', 'milk:kuh', 'eggs', 'harvest'];
    const n = diff === 'leicht' ? Math.min(4 + Math.floor(lvl / 2), 5) : Math.min(6 + Math.floor(lvl / 2), 8);
    const jobs = [];
    const usedAnimals = new Set();
    for (const j of shuffle(pool)) {
      const [type, animal] = j.split(':');
      if (animal && usedAnimals.has(animal)) continue;
      if (animal) usedAnimals.add(animal);
      jobs.push({ type, animal, done: false });
      if (jobs.length >= n) break;
    }
    const ICON = { feed: '🌾', water: '💧', love: '❤️', clean: '🧽', milk: '🥛', eggs: '🥚', harvest: '🥕' };
    const TOOLFOR = { feed: 'futter', water: 'wasser', love: 'streicheln', clean: 'buerste', milk: 'eimer', eggs: 'korb', harvest: 'korb' };
    const jobsEl = body.querySelector('.jobs');
    const drawJobs = () => (jobsEl.innerHTML = jobs.map((j) => `<span class="job ${j.done ? 'done' : ''}">${ICON[j.type]}${j.animal ? `<svg viewBox="0 -10 200 210">${plushSVG(j.animal).replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>` : ''}</span>`).join(''));
    drawJobs();
    for (const j of jobs) {
      if (j.animal) {
        an[j.animal].need = j;
        if (j.type !== 'clean') an[j.animal].g.querySelector('.need').innerHTML = `<g transform="translate(${an[j.animal].x + 50} ${an[j.animal].y - an[j.animal].s - 10})"><g class="bubble-need"><ellipse rx="40" ry="34" fill="#fff" ${SW}/><path d="M-20 26 l-14 22 l26 -16" fill="#fff" ${SW}/><text y="14" text-anchor="middle" font-size="40">${ICON[j.type]}</text></g></g>`;
      }
    }
    // Schmutziges Schwein
    const pig = an.schwein;
    const mud = [];
    if (jobs.some((j) => j.type === 'clean')) {
      for (let i = 0; i < 6; i++) {
        const c = document.createElementNS(NS, 'ellipse');
        const mx = pig.x - 50 + Math.random() * 100, my = pig.y - 120 + Math.random() * 90;
        c.setAttribute('cx', mx); c.setAttribute('cy', my); c.setAttribute('rx', 16 + Math.random() * 10); c.setAttribute('ry', 12); c.setAttribute('fill', '#7a5a32'); c.setAttribute('opacity', '.9');
        pig.g.querySelector('.mud').appendChild(c);
        mud.push({ c, x: mx, y: my, hp: 1 });
      }
    }
    // Eier & Gemüse
    const eggs = [], vegs = [];
    if (jobs.some((j) => j.type === 'eggs')) {
      const k = diff === 'leicht' ? 3 : 5;
      [[505, 612], [655, 612], [520, 692], [690, 692], [600, 727]].slice(0, k).forEach(([x, y]) => {
        const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 40); t.textContent = '🥚';
        t.setAttribute('class', 'egg'); iL.appendChild(t); eggs.push({ t, x, y: y - 14 });
      });
    }
    if (jobs.some((j) => j.type === 'harvest')) {
      const k = diff === 'leicht' ? 4 : 6;
      for (let i = 0; i < k; i++) {
        const x = 260 + (i % 3) * 75, y = 695 + Math.floor(i / 3) * 56;
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'carrot');
        g.innerHTML = `<path d="M${x} ${y} q-14 -30 -6 -40 M${x} ${y} q0 -34 6 -44 M${x} ${y} q12 -28 20 -34" stroke="#4f9a3a" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${x - 10} ${y} h20 l-10 34 Z" fill="#ff8a2b" ${SW} class="root" opacity=".0"/>`;
        svg.querySelector('.veg').appendChild(g);
        vegs.push({ g, x, y: y - 20 });
      }
    }
    const basketEl = body.querySelector('.basket-count b');
    const addBasket = () => { basket++; basketEl.textContent = basket; };
    const flyToBasket = (emoji, x, y) => {
      const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('font-size', 46); t.setAttribute('text-anchor', 'middle'); t.textContent = emoji; t.setAttribute('class', 'fly-up');
      fx.appendChild(t); setTimeout(() => t.remove(), 900);
    };
    const finishJob = async (j) => {
      j.done = true; drawJobs();
      if (j.animal) an[j.animal].g.querySelector('.need').innerHTML = '';
      sfx.sparkle();
      if (jobs.every((x) => x.done)) {
        kid.farm.eggs += eggs.length; kid.farm.veg += vegs.length; save();
        levelUp(kid, 'farm', diff, 8);
        await sleep(900);
        const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: 'Alle Tiere sind glücklich!', speak: `Super, ${kid.name}! Alle Tiere sind satt und glücklich! Du bist ein echter Bauer!` });
        if (r === 'again') play(); else (await import('../nav.js')).goBack('village');
      }
    };
    const hearts = (x, y, ch = '❤️') => { for (let i = 0; i < 3; i++) { const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x + i * 20 - 20); t.setAttribute('y', y); t.setAttribute('font-size', 34); t.textContent = ch; t.setAttribute('class', 'heart-fx'); t.style.animationDelay = i * 0.15 + 's'; fx.appendChild(t); setTimeout(() => t.remove(), 1700); } };
    const jump = (g) => { const i = g.querySelector('.an-in'); i.classList.remove('jump'); void i.getBBox(); i.classList.add('jump'); };

    // Melken
    let milk = 0;
    // Tippen
    svg.addEventListener('click', async (e) => {
      const p = P(e);
      // Eier
      if (tool === 'korb') {
        const egg = eggs.find((x) => !x.got && Math.hypot(x.x - p.x, x.y - p.y) < 40);
        if (egg) { egg.got = true; egg.t.remove(); flyToBasket('🥚', egg.x, egg.y); addBasket(); sfx.pop(); const c = eggs.filter((x) => x.got).length; say(ZAHL[c] || String(c), { rate: 1.1 }); if (eggs.every((x) => x.got)) { await sleep(500); say(`${eggs.length} Eier! Super!`); finishJob(jobs.find((j) => j.type === 'eggs')); } return; }
        const veg = vegs.find((x) => !x.got && Math.hypot(x.x - p.x, x.y - p.y) < 44);
        if (veg) { veg.got = true; veg.g.remove(); flyToBasket('🥕', veg.x, veg.y); addBasket(); sfx.boing(); const c = vegs.filter((x) => x.got).length; say(ZAHL[c] || String(c), { rate: 1.1 }); if (vegs.every((x) => x.got)) { await sleep(500); say('Alle Karotten geerntet!'); finishJob(jobs.find((j) => j.type === 'harvest')); } return; }
      }
      const g = e.target.closest('.animal');
      if (!g) return;
      const a = an[g.dataset.a];
      jump(g); sfx[a.snd]();
      const j = a.need;
      if (!tool) { say('Such dir zuerst unten ein Werkzeug aus!'); return; }
      if (!j || j.done) { if (tool === 'streicheln') hearts(a.x, a.y - a.s); say(pick([`${a.name.split(' ')[1]} ist schon glücklich!`, 'Danke!'])); return; }
      if (j.type === 'clean') { if (tool !== 'buerste') say('Ich bin so schmutzig! Hast du eine Bürste?'); return; }
      if (TOOLFOR[j.type] !== tool) { sfx.wrong(); say({ feed: 'Ich hab Hunger!', water: 'Ich hab Durst!', love: 'Ich will gestreichelt werden!', milk: 'Meine Milch muss in den Eimer!' }[j.type]); return; }
      if (j.type === 'milk') {
        milk++;
        hearts(a.x, a.y - 40, '🥛');
        say(milk < 5 ? ZAHL[milk] : 'Voller Eimer!', { rate: 1.1 });
        if (milk >= 5) { kid.farm.milk++; finishJob(j); }
        return;
      }
      hearts(a.x, a.y - a.s, j.type === 'feed' ? '🌾' : j.type === 'water' ? '💧' : '❤️');
      say(j.type === 'feed' ? 'Mmmh, lecker!' : j.type === 'water' ? 'Ahh, das tut gut!' : 'Das ist schön!');
      finishJob(j);
    });
    // Schwein schrubben
    let down = false, last = null;
    svg.addEventListener('pointerdown', (e) => { if (tool === 'buerste') { down = true; last = P(e); svg.setPointerCapture(e.pointerId); } });
    svg.addEventListener('pointerup', () => { down = false; });
    svg.addEventListener('pointermove', (e) => {
      if (!down || tool !== 'buerste') return;
      const p = P(e), d = Math.hypot(p.x - last.x, p.y - last.y); last = p;
      if (performance.now() - (svg._s || 0) > 120) { svg._s = performance.now(); sfx.scrub(); }
      let any = false;
      for (const m of mud) {
        if (m.hp <= 0) continue;
        if (Math.hypot(m.x - p.x, m.y - p.y) < 50) { m.hp -= d * 0.01; m.c.setAttribute('opacity', Math.max(0, m.hp)); if (m.hp <= 0) sfx.pop(); }
        any = true;
      }
      if (mud.length && mud.every((m) => m.hp <= 0)) {
        const j = jobs.find((x) => x.type === 'clean');
        if (j && !j.done) { sfx.oink(); hearts(pig.x, pig.y - pig.s); say('Oink! Blitzsauber!'); finishJob(j); }
      }
    });
    startRound();
    const intro = jobs.slice(0, 3).map((j) => j.type === 'eggs' ? 'Eier sammeln' : j.type === 'harvest' ? 'Karotten ernten' : j.type === 'clean' ? 'das Schwein putzen' : j.type === 'milk' ? 'die Kuh melken' : `${ANIMALS[j.animal].name} ${j.type === 'feed' ? 'füttern' : j.type === 'water' ? 'tränken' : 'streicheln'}`);
    say(`Willkommen auf dem Bauernhof! Heute gibt es viel zu tun: ${intro.join(', ')}${jobs.length > 3 ? ' und mehr' : ''}! Schau oben!`);
  }
  play();
  return {};
});
