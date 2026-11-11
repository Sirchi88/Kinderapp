// Zähneputzen-Monster: mit dem Finger die Zahnbürste bewegen, Schmutz und Bakterien wegputzen, ausspülen.
import { register, session } from '../nav.js';
import { h, onTap, sleep } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, pick } from './shell.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';
import { shade } from '../art/person.js';

const NS = 'http://www.w3.org/2000/svg';
const OUT = '#4a2e2a';
const SW = `stroke="${OUT}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const MONSTERS = [
  { name: 'Grünling', body: '#8fdc6a', belly: '#c9f2a8', horn: '#ffd94a', eyes: 1 },
  { name: 'Lila Lotti', body: '#b68cff', belly: '#e3d4ff', horn: '#ff9fb2', eyes: 2 },
  { name: 'Blubbo', body: '#6fc3f0', belly: '#d2efff', horn: '#ffb86b', eyes: 3 },
  { name: 'Flauschi', body: '#ff9f7a', belly: '#ffd8c4', horn: '#fff1a8', eyes: 2, fur: true },
];
const DIRT = ['#8a6a3a', '#9bbf4a', '#6b4a2b', '#c9a13a', '#a0522d'];

function monsterSVG(m, teethTop, teethBot) {
  const eyeX = m.eyes === 1 ? [500] : m.eyes === 2 ? [430, 570] : [400, 500, 600];
  const eyeR = m.eyes === 1 ? 62 : m.eyes === 2 ? 50 : 40;
  let s = `<defs><clipPath id="mouthclip"><path d="M290 250 Q500 220 710 250 Q730 380 690 470 Q500 540 310 470 Q270 380 290 250 Z"/></clipPath></defs>`;
  // Körper
  s += `<path d="M150 640 Q120 200 300 110 Q500 20 700 110 Q880 200 850 640 Z" fill="${m.body}" ${SW}/>`;
  if (m.fur) for (let i = 0; i < 14; i++) s += `<path d="M${180 + i * 47} ${i % 2 ? 200 : 214} q10 -24 20 0" fill="${shade(m.body, -20)}" opacity=".5"/>`;
  s += `<path d="M270 130 L230 20 L330 100 Z M730 130 L770 20 L670 100 Z" fill="${m.horn}" ${SW}/>`;
  s += `<ellipse cx="500" cy="600" rx="220" ry="90" fill="${m.belly}"/>`;
  s += `<path d="M150 470 q-90 -10 -100 -90 q30 -10 50 20" fill="${m.body}" ${SW}/><path d="M850 470 q90 -10 100 -90 q-30 -10 -50 20" fill="${m.body}" ${SW}/>`;
  // Augen
  for (const x of eyeX) s += `<g class="m-eye"><circle cx="${x}" cy="170" r="${eyeR}" fill="#fff" ${SW}/><circle class="pupil" cx="${x}" cy="176" r="${eyeR * 0.45}" fill="#2a1d14"/><circle class="glint" cx="${x + eyeR * 0.2}" cy="${170 - eyeR * 0.2}" r="${eyeR * 0.15}" fill="#fff"/></g>`;
  s += `<ellipse cx="300" cy="230" rx="34" ry="20" fill="#ff8f9e" opacity=".5"/><ellipse cx="700" cy="230" rx="34" ry="20" fill="#ff8f9e" opacity=".5"/>`;
  // Mund
  s += `<g class="mouth-open"><path d="M290 250 Q500 220 710 250 Q730 380 690 470 Q500 540 310 470 Q270 380 290 250 Z" fill="#7a2030" ${SW}/>
    <g clip-path="url(#mouthclip)"><ellipse cx="500" cy="470" rx="150" ry="60" fill="#ff7d8e"/><path d="M500 430 V480" stroke="#e05a6e" stroke-width="5"/>
    <rect x="270" y="236" width="460" height="44" fill="#ff9fb2"/><path d="M270 452 Q500 520 730 452 V560 H270 Z" fill="#ff9fb2"/>
    <g class="teeth">${teethTop.map((t) => `<rect class="tooth" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="16" fill="#fff" ${SW}/>`).join('')}${teethBot.map((t) => `<rect class="tooth" x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="16" fill="#fff" ${SW}/>`).join('')}</g>
    <g class="dirt-layer"></g><g class="foam-layer"></g><g class="water"></g></g></g>
    <g class="mouth-closed" style="display:none"><path d="M330 330 Q500 470 670 330" fill="#7a2030" ${SW}/><path d="M360 340 h280 l-20 30 h-240 Z" fill="#fff"/><path d="M360 340 Q500 360 640 340" fill="none" ${SW}/></g>
    <g class="sparkles"></g>`;
  // Zahnbürste
  s += `<g class="brush" style="display:none"><g transform="rotate(-25)"><rect x="-30" y="-14" width="230" height="28" rx="14" fill="#4fc3f7" ${SW}/><rect x="-80" y="-24" width="70" height="30" rx="8" fill="#fff" ${SW}/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${-76 + i * 13}" y="-46" width="9" height="24" rx="3" fill="#e8f6ff" stroke="#9cc" stroke-width="2"/>`).join('')}<ellipse cx="-46" cy="-52" rx="30" ry="12" fill="#c9f6e0" stroke="#7ac" stroke-width="2"/></g></g>`;
  return s;
}

function makeTeeth(n, top) {
  const left = 320, width = 360, gap = 6, w = (width - gap * (n - 1)) / n;
  return Array.from({ length: n }, (_, i) => ({ x: left + i * (w + gap), y: top ? 262 : 404, w, h: top ? 82 : 76 }));
}

register('teeth', (app) => {
  const kid = session.kid;
  const { body } = gameShell(app, { cls: 'teeth', back: 'house' });

  async function play() {
    const diff = await chooseLevel(kid, 'teeth');
    const lvl = getLevel(kid, 'teeth', diff);
    const m = pick(MONSTERS);
    const nT = diff === 'leicht' ? 3 : 5;
    const top = makeTeeth(nT, true), bot = makeTeeth(nT, false);
    const dirtCount = diff === 'leicht' ? Math.min(4 + lvl, 8) : Math.min(8 + lvl * 2, 16);
    const germs = diff === 'schwer' ? Math.min(2 + lvl, 5) : 0;
    body.innerHTML = `<svg class="monster" viewBox="0 0 1000 620" preserveAspectRatio="xMidYMax meet">${monsterSVG(m, top, bot)}</svg>
      <button class="cup" aria-label="Ausspülen">🥤</button>`;
    const svg = body.querySelector('svg'), dirtL = svg.querySelector('.dirt-layer'), foamL = svg.querySelector('.foam-layer');
    const brush = svg.querySelector('.brush'), cup = body.querySelector('.cup');
    const teeth = [...top, ...bot];
    const items = [];
    const add = (germ) => {
      const t = pick(teeth);
      const x = t.x + 14 + Math.random() * (t.w - 28), y = t.y + 18 + Math.random() * (t.h - 34);
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${x} ${y})`);
      if (germ) {
        g.innerHTML = `<g class="germ"><path d="M-18 0 q-6 -20 10 -22 q8 -12 18 0 q16 0 12 18 q8 12 -6 20 q-10 10 -22 2 q-16 2 -12 -18 Z" fill="#7bd14a" stroke="#3f7a22" stroke-width="3"/><circle cx="-6" cy="-4" r="4" fill="#2a1d14"/><circle cx="7" cy="-4" r="4" fill="#2a1d14"/><path d="M-6 6 q6 5 12 0" stroke="#2a1d14" stroke-width="2.5" fill="none"/></g>`;
      } else {
        const c = pick(DIRT), r = 9 + Math.random() * 8;
        g.innerHTML = `<circle r="${r}" fill="${c}"/><circle cx="${r * 0.6}" cy="${-r * 0.4}" r="${r * 0.55}" fill="${c}"/><circle cx="${-r * 0.3}" cy="${r * 0.3}" r="${r * 0.3}" fill="${shade(c, 30)}"/>`;
      }
      dirtL.appendChild(g);
      items.push({ g, x, y, hp: germ ? 2.2 : 1, germ });
    };
    for (let i = 0; i < dirtCount; i++) add(false);
    for (let i = 0; i < germs; i++) add(true);
    startRound();
    const left = () => items.filter((d) => d.hp > 0).length;
    say(pick([`Aaaah! Ich bin ${m.name}. Ich hab Schokolade gegessen! Putzt du mir die Zähne?`, `Hallo, ich bin ${m.name}! Meine Zähne sind ganz schmutzig. Hilfst du mir?`]) + (germs ? ' Pass auf die Bakterien auf!' : ''));

    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let down = false, last = null, sndT = 0, foamN = 0, done = false;
    const pupils = [...svg.querySelectorAll('.pupil')];
    const look = (p) => pupils.forEach((pu) => { const cx = +pu.getAttribute('cx'); const dx = Math.max(-14, Math.min(14, (p.x - cx) / 20)); const dy = Math.max(-6, Math.min(14, (p.y - 176) / 20)); pu.setAttribute('transform', `translate(${dx} ${dy})`); });
    svg.addEventListener('pointerdown', (e) => { if (done) return; down = true; svg.setPointerCapture(e.pointerId); last = toSvg(e); brush.style.display = ''; move(e); });
    svg.addEventListener('pointermove', (e) => { if (down) move(e); });
    const up = () => { down = false; last = null; brush.style.display = 'none'; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    function move(e) {
      const p = toSvg(e);
      brush.setAttribute('transform', `translate(${p.x + 40} ${p.y + 10})`);
      look(p);
      const d = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
      last = p;
      if (d < 1) return;
      if (performance.now() - sndT > 110) { sndT = performance.now(); sfx.scrub(); }
      if (foamN < 70 && Math.random() < 0.5) {
        foamN++;
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p.x + (Math.random() * 30 - 15)); c.setAttribute('cy', p.y + (Math.random() * 30 - 15)); c.setAttribute('r', 6 + Math.random() * 12);
        c.setAttribute('class', 'foamb');
        foamL.appendChild(c);
        setTimeout(() => { c.remove(); foamN--; }, 2200);
      }
      for (const it of items) {
        if (it.hp <= 0) continue;
        if (Math.hypot(it.x - p.x, it.y - p.y) < 46) {
          it.hp -= d * 0.012;
          it.g.style.opacity = Math.max(0, it.hp / (it.germ ? 2.2 : 1));
          if (it.hp <= 0) {
            it.g.remove();
            sfx.pop();
            if (it.germ) say(pick(['Tschüss, Bakterie!', 'Weg mit dir!']));
            const n = left();
            if (n === Math.floor(items.length / 2)) say('Super! Schon die Hälfte!');
            if (n === 0) cleanDone();
          }
        }
      }
    }
    async function cleanDone() {
      done = true; up();
      sfx.sparkle();
      await say('Jetzt ausspülen! Tipp auf den Becher!');
      cup.classList.add('show');
      cup.addEventListener('click', async () => {
        cup.classList.remove('show');
        sfx.splash();
        svg.querySelector('.water').innerHTML = `<rect class="wave" x="270" y="230" width="460" height="320" fill="#7fd6f5" opacity=".75"/>`;
        await sleep(1300);
        foamL.innerHTML = ''; svg.querySelector('.water').innerHTML = '';
        svg.querySelector('.sparkles').innerHTML = teeth.slice(0, 6).map((t, i) => `<text x="${t.x + t.w / 2}" y="${t.y + 40}" font-size="40" text-anchor="middle" class="spk" style="animation-delay:${i * 0.1}s">✨</text>`).join('');
        sfx.star();
        await sleep(900);
        svg.querySelector('.mouth-open').style.display = 'none';
        svg.querySelector('.mouth-closed').style.display = '';
        levelUp(kid, 'teeth', diff, 8);
        const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: 'Blitzblanke Zähne!', speak: `Danke! Meine Zähne glänzen! Du bist ein Zahnputz-Profi, ${kid.name}!` });
        if (r === 'again') play(); else (await import('../nav.js')).goBack('house');
      }, { once: true });
    }
  }
  play();
  return {};
});
