// Sortieren & Zählen: Zählen, Farben sortieren, Größen vergleichen, Formen einsortieren.
import { register, session } from '../nav.js';
import { h, onTap, sleep } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle, pick } from './shell.js';
import { draggable, center } from './drag.js';
import { plushSVG } from '../art/plush.js';
import { kidPlush } from '../pet.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const ZAHL = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];
const FRUIT = [['🍎', 'Äpfel'], ['🍓', 'Erdbeeren'], ['🍌', 'Bananen'], ['🥕', 'Karotten'], ['⭐', 'Sterne'], ['🐞', 'Marienkäfer'], ['🎈', 'Luftballons'], ['🐟', 'Fische'], ['🦆', 'Enten'], ['🌸', 'Blumen']];
const COLORS = [['#ff4d4d', 'rot', 'Rote'], ['#2f6fdf', 'blau', 'Blaue'], ['#ffd23f', 'gelb', 'Gelbe'], ['#2fb36b', 'grün', 'Grüne']];
const SHAPES = {
  kreis: { name: 'Kreis', d: 'M50 10 A40 40 0 1 1 49.9 10 Z', c: '#ff6f6f' },
  quadrat: { name: 'Quadrat', d: 'M14 14 H86 V86 H14 Z', c: '#4fa3ff' },
  dreieck: { name: 'Dreieck', d: 'M50 10 L90 86 H10 Z', c: '#ffd23f' },
  stern: { name: 'Stern', d: 'M50 6 L61 36 L94 37 L68 57 L77 90 L50 71 L23 90 L32 57 L6 37 L39 36 Z', c: '#b68cff' },
  herz: { name: 'Herz', d: 'M50 88 C10 60 6 34 22 22 C36 12 48 22 50 30 C52 22 64 12 78 22 C94 34 90 60 50 88 Z', c: '#ff8fc8' },
};
const shapeSVG = (k, hole) => `<svg viewBox="0 0 100 100"><path d="${SHAPES[k].d}" fill="${hole ? '#5a3e2b' : SHAPES[k].c}" ${hole ? 'opacity=".55"' : 'stroke="#5a3e2b" stroke-width="5" stroke-linejoin="round"'}/></svg>`;
const ballSVG = (c) => `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${c}" stroke="#5a3e2b" stroke-width="5"/><ellipse cx="36" cy="34" rx="12" ry="8" fill="#fff" opacity=".55"/></svg>`;
const basketSVG = (c) => `<svg viewBox="0 0 160 120"><path d="M14 40 H146 L130 112 H30 Z" fill="${c}" stroke="#5a3e2b" stroke-width="5" stroke-linejoin="round"/><path d="M24 64 H136 M28 88 H132" stroke="#fff" stroke-width="5" opacity=".5"/><rect x="8" y="30" width="144" height="18" rx="9" fill="${c}" stroke="#5a3e2b" stroke-width="5"/></svg>`;

register('sorting', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'sorting', back: 'house' });
  let diff = 'leicht', lvl = 0;

  const TASKS = {
    // ----- Zählen -----
    count: () => new Promise(async (resolve) => {
      const max = diff === 'leicht' ? Math.min(4 + lvl, 6) : Math.min(7 + lvl, 10);
      const n = 1 + Math.floor(Math.random() * max);
      const [e, plural] = pick(FRUIT);
      const opts = shuffle([...new Set([n, Math.max(1, n - 1 - Math.floor(Math.random() * 2)), Math.min(max + 1, n + 1 + Math.floor(Math.random() * 2))])]);
      while (opts.length < 3) opts.push(opts.length + n + 1);
      body.innerHTML = `<div class="count-task"><div class="ctray">${Array.from({ length: n }, () => `<span class="obj">${e}</span>`).join('')}</div>
        <div class="answers">${shuffle(opts).map((o) => `<button class="ans" data-n="${o}"><b>${o}</b><span>${Array.from({ length: o }, () => '<i></i>').join('')}</span></button>`).join('')}</div></div>`;
      say(`Wie viele ${plural} siehst du?`);
      const objs = [...body.querySelectorAll('.obj')];
      const countAlong = async () => { for (let i = 0; i < objs.length; i++) { objs[i].classList.add('counted'); say(ZAHL[i + 1] || String(i + 1), { rate: 1.1 }); sfx.tick(); await sleep(750); } };
      body.querySelectorAll('.ans').forEach((b) => onTap(b, async () => {
        if (+b.dataset.n === n) {
          b.classList.add('right'); sfx.sparkle();
          await countAlong();
          await say(`Richtig! ${ZAHL[n] ? ZAHL[n][0].toUpperCase() + ZAHL[n].slice(1) : n} ${plural}!`);
          resolve();
        } else {
          b.classList.add('wrong'); sfx.wrong();
          await say('Zähl mal mit mir!');
          await countAlong();
          objs.forEach((o) => o.classList.remove('counted'));
        }
      }, { sound: null }));
    }),
    // ----- Farben sortieren -----
    colors: () => new Promise((resolve) => {
      const k = diff === 'leicht' ? 2 : 3;
      const cols = shuffle([...COLORS]).slice(0, k);
      const per = diff === 'leicht' ? 2 : 3;
      const balls = shuffle(cols.flatMap((c) => Array.from({ length: per }, () => c)));
      body.innerHTML = `<div class="color-task"><div class="baskets">${cols.map((c) => `<div class="basket" data-c="${c[0]}">${basketSVG(c[0])}</div>`).join('')}</div></div>`;
      say(`Sortiere die Bälle in den Korb mit der gleichen Farbe!`);
      let left = balls.length;
      const W = innerWidth, top = innerHeight * 0.18;
      balls.forEach((c, i) => {
        const b = h(`<div class="drag-obj ball" data-c="${c[0]}">${ballSVG(c[0])}</div>`);
        const sz = Math.min(90, innerHeight * 0.14);
        Object.assign(b.style, { width: sz + 'px', height: sz + 'px', left: W * 0.12 + (i / balls.length) * W * 0.72 + Math.random() * 20 + 'px', top: top + Math.random() * innerHeight * 0.18 + 'px' });
        body.appendChild(b);
        draggable(b, {
          onDrop: (el, e, { back }) => {
            const bc = center(el);
            const basket = [...body.querySelectorAll('.basket')].find((bk) => { const r = bk.getBoundingClientRect(); return bc.x > r.left && bc.x < r.right && bc.y > r.top - 30 && bc.y < r.bottom; });
            if (!basket) return;
            if (basket.dataset.c === c[0]) {
              el.dataset.locked = '1'; el.classList.add('in');
              const r = basket.getBoundingClientRect();
              el.style.left = r.left + r.width / 2 - el.offsetWidth / 2 + (Math.random() * 40 - 20) + 'px'; el.style.top = r.top + 4 + 'px';
              sfx.pop(); say(c[1]);
              if (--left === 0) setTimeout(resolve, 700);
            } else { sfx.boing(); back(); say(`Das ist ${c[1]}!`); }
          },
        });
      });
    }),
    // ----- Größen -----
    sizes: () => new Promise((resolve) => {
      const n = diff === 'leicht' ? 3 : 4;
      const want = diff === 'leicht' || Math.random() < 0.5 ? 'big' : 'small';
      const type = pick(['baer', 'einhorn', 'kuh', 'pinguin', 'tukan', 'schwein', 'elefant']);
      const sizes = shuffle(Array.from({ length: n }, (_, i) => 0.45 + (i * 0.55) / (n - 1)));
      const target = want === 'big' ? Math.max(...sizes) : Math.min(...sizes);
      body.innerHTML = `<div class="size-task">${sizes.map((s) => `<button class="sz" data-s="${s}" style="--s:${s}">${plushSVG(type)}</button>`).join('')}</div>`;
      say(want === 'big' ? 'Tipp auf das größte Tier!' : 'Tipp auf das kleinste Tier!');
      body.querySelectorAll('.sz').forEach((b) => onTap(b, async () => {
        if (+b.dataset.s === target) { b.classList.add('jump', 'right'); sfx.sparkle(); await say(want === 'big' ? 'Ja! Das ist das größte!' : 'Ja! Das ist das kleinste!'); resolve(); }
        else { sfx.wrong(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); say('Schau nochmal!'); }
      }, { sound: null }));
    }),
    // ----- Formen -----
    shapes: () => new Promise((resolve) => {
      const keys = shuffle(Object.keys(SHAPES)).slice(0, diff === 'leicht' ? 3 : 5);
      body.innerHTML = `<div class="shape-task"><div class="box">${shuffle([...keys]).map((k) => `<div class="hole" data-k="${k}">${shapeSVG(k, true)}</div>`).join('')}</div></div>`;
      say('Steck die Formen in die richtigen Löcher!');
      let left = keys.length;
      const sz = Math.min(110, innerHeight * 0.17);
      keys.forEach((k, i) => {
        const el = h(`<div class="drag-obj shape" data-k="${k}">${shapeSVG(k)}</div>`);
        Object.assign(el.style, { width: sz + 'px', height: sz + 'px', left: innerWidth * 0.1 + i * (innerWidth * 0.8 / keys.length) + 'px', top: innerHeight * 0.16 + Math.random() * 30 + 'px' });
        body.appendChild(el);
        draggable(el, {
          onDrop: (d, e, { back }) => {
            const c = center(d);
            const hole = [...body.querySelectorAll('.hole')].find((ho) => { const r = ho.getBoundingClientRect(); return c.x > r.left && c.x < r.right && c.y > r.top && c.y < r.bottom; });
            if (!hole) return;
            if (hole.dataset.k === k) {
              const r = hole.getBoundingClientRect();
              d.dataset.locked = '1'; d.classList.add('in');
              d.style.left = r.left + (r.width - sz) / 2 + 'px'; d.style.top = r.top + (r.height - sz) / 2 + 'px';
              sfx.pop(); say(SHAPES[k].name);
              if (--left === 0) setTimeout(resolve, 700);
            } else { sfx.boing(); back(); say(`Das ist ein ${SHAPES[k].name}!`); }
          },
        });
      });
    }),
  };

  async function play() {
    diff = await chooseLevel(kid, 'sorting');
    lvl = getLevel(kid, 'sorting', diff);
    const plan = ['count', 'colors', 'sizes', 'shapes', diff === 'leicht' ? 'count' : 'colors'];
    startRound();
    for (let i = 0; i < plan.length; i++) {
      right.innerHTML = `<div class="prog">${plan.map((_, j) => `<i class="${j < i ? 'done' : j === i ? 'cur' : ''}"></i>`).join('')}</div>`;
      body.querySelectorAll('.drag-obj').forEach((d) => d.remove());
      await TASKS[plan[i]]();
      body.querySelectorAll('.drag-obj').forEach((d) => d.remove());
      sfx.star();
      await sleep(300);
    }
    right.innerHTML = '';
    levelUp(kid, 'sorting', diff, 6);
    const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: 'Alles richtig sortiert!' });
    if (r === 'again') play(); else (await import('../nav.js')).go('house', {});
  }
  play();
  return {};
});
