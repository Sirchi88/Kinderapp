// Puzzle: Bilder aus Sirchhausen oder eigene Fotos. Teile an die richtige Stelle ziehen.
import { register, session } from '../nav.js';
import { state } from '../store.js';
import { h, onTap, sleep, starRain } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle } from './shell.js';
import { draggable, svgToImage } from './drag.js';
import { sirchHouseScene, roundTree } from '../art/village.js';
import { houseScene } from '../screens/house.js';
import { personSVG, FAMILY } from '../art/person.js';
import { plushSVG } from '../art/plush.js';
import { baileySVG } from '../art/bailey.js';
import { kidPlush } from '../pet.js';
import { listPhotos } from '../media.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const X = 'xmlns="http://www.w3.org/2000/svg"';
const nest = (x, y, w, hh, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${hh}" overflow="visible">${inner}</svg>`;

function familyPicture() {
  const kids = state.kids.filter((k) => k.avatar);
  let figs = nest(80, 230, 230, 336, personSVG(FAMILY.papa)) + nest(260, 250, 220, 320, personSVG(FAMILY.mama));
  kids.forEach((k, i) => (figs += nest(450 + i * 150, 330, 170, 248, personSVG({ ...k.avatar, scale: 0.76 }, { pose: i ? 'stand' : 'wave', mood: 'laugh' }))));
  figs += nest(870, 470, 160, 122, baileySVG('sit'));
  return `<svg ${X} viewBox="0 0 1200 900"><defs><linearGradient id="fsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e8f8ff"/></linearGradient></defs>
    <rect width="1200" height="900" fill="url(#fsky)"/><circle cx="1040" cy="140" r="70" fill="#ffd94a"/>
    <path d="M0 520 L160 380 L300 460 L460 330 L620 470 L780 360 L940 460 L1100 370 L1200 420 V600 H0 Z" fill="#a9c3dc"/>
    <rect y="560" width="1200" height="340" fill="#8fd16a"/>${roundTree(1100, 640, 1.2)}${roundTree(60, 620, 1)}
    ${figs}
    ${[[200, 780, '#ff6f91'], [420, 820, '#ffd23f'], [700, 800, '#b68cff'], [980, 820, '#ff9f1c']].map(([x, y, c]) => `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((r) => `<ellipse cy="-14" rx="10" ry="15" transform="rotate(${r})" fill="${c}"/>`).join('')}<circle r="9" fill="#fff6a8"/></g>`).join('')}
  </svg>`;
}

function plushPicture(kid) {
  const ks = ['baer', 'einhorn', 'tukan', 'kuh', 'affe', 'pinguin', 'schwein', 'loewe'];
  const cols = ['#ff6f6f', '#ffb86b', '#ffe066', '#9be37a', '#7cc4ff', '#b68cff'];
  return `<svg ${X} viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#fff4e3"/>
    ${cols.map((c, i) => `<path d="M${100 + i * 40} 900 A${500 - i * 40} ${500 - i * 40} 0 0 1 ${1100 - i * 40} 900" fill="none" stroke="${c}" stroke-width="40"/>`).join('')}
    ${ks.map((k, i) => nest(60 + (i % 4) * 280, 80 + Math.floor(i / 4) * 330, 260, 270, plushSVG(k))).join('')}
    ${nest(940, 560, 240, 250, kidPlush(kid, { mood: 'happy' }))}</svg>`;
}

const PICS = [
  { id: 'dorf', icon: '🏡', svg: () => `<svg ${X} viewBox="240 40 1120 840">${sirchHouseScene()}</svg>` },
  { id: 'haus', icon: '🪟', svg: (kid) => `<svg ${X} viewBox="200 30 1200 900">${houseScene(kid)}</svg>` },
  { id: 'familie', icon: '👨‍👩‍👧‍👧', svg: familyPicture },
  { id: 'tiere', icon: '🧸', svg: (kid) => plushPicture(kid) },
];

register('puzzle', (app) => {
  const kid = session.kid;
  const { body } = gameShell(app, { cls: 'puzzle', back: 'house' });

  async function chooser() {
    const photos = await listPhotos();
    const thumbs = await Promise.all(PICS.map((p) => svgToImage(p.svg(kid), 240, 180)));
    body.innerHTML = `<div class="pz-pick">${PICS.map((p, i) => `<button class="pz-thumb" data-p="${p.id}"><img src="${thumbs[i]}" alt=""></button>`).join('')}
      ${photos.map((p) => `<button class="pz-thumb sq" data-photo="${p.id}"><img src="${p.data}" alt=""></button>`).join('')}</div>`;
    say('Welches Bild möchtest du puzzeln?');
    body.querySelectorAll('.pz-thumb').forEach((b) => onTap(b, async () => {
      const diff = await chooseLevel(kid, 'puzzle');
      let src, aspect;
      if (b.dataset.photo) { src = photos.find((p) => p.id === b.dataset.photo).data; aspect = 1; }
      else { const pic = PICS.find((p) => p.id === b.dataset.p); src = await svgToImage(pic.svg(kid), 1200, 900); aspect = 4 / 3; }
      play(src, aspect, diff);
    }, { sound: 'pop' }));
  }

  function play(src, aspect, diff) {
    const lvl = getLevel(kid, 'puzzle', diff);
    const sizes = diff === 'leicht' ? [[2, 2], [3, 2], [3, 3]] : [[3, 3], [4, 3], [4, 4], [5, 4]];
    let [cols, rows] = sizes[Math.min(lvl, sizes.length - 1)];
    if (aspect === 1 && cols !== rows) rows = cols;
    const small = innerHeight < 520;
    const H = innerHeight * (small ? 0.78 : 0.74), W = innerWidth * 0.56;
    let bh = H, bw = bh * aspect;
    if (bw > W) { bw = W; bh = bw / aspect; }
    const bx = innerWidth - bw - innerWidth * 0.05, by = (innerHeight - bh) / 2 + (small ? 18 : 24);
    const pw = bw / cols, ph = bh / rows;
    body.innerHTML = `<div class="pz-board" style="left:${bx}px;top:${by}px;width:${bw}px;height:${bh}px">
        <img class="ghost ${diff}" src="${src}" alt="">${Array.from({ length: cols * rows }, (_, i) => `<i style="left:${(i % cols) * pw}px;top:${Math.floor(i / cols) * ph}px;width:${pw}px;height:${ph}px"></i>`).join('')}</div>`;
    const board = body.querySelector('.pz-board');
    const order = shuffle(Array.from({ length: cols * rows }, (_, i) => i));
    const areaW = bx - 30, scale = Math.min(1, (areaW - 10) / pw);
    let placed = 0;
    startRound();
    order.forEach((i, n) => {
      const cx = i % cols, cy = Math.floor(i / cols);
      const pc = h(`<div class="pz-piece" style="width:${pw}px;height:${ph}px;background-image:url('${src}');background-size:${bw}px ${bh}px;background-position:${-cx * pw}px ${-cy * ph}px"></div>`);
      // Startposition links neben dem Brett, leicht verstreut
      const px = 16 + Math.random() * Math.max(10, areaW - pw * scale - 10);
      const py = 80 + Math.random() * Math.max(10, innerHeight - 100 - ph * scale);
      Object.assign(pc.style, { left: px + 'px', top: py + 'px', transform: `scale(${scale}) rotate(${Math.random() * 16 - 8}deg)`, zIndex: 5 + n });
      body.appendChild(pc);
      let z = 100;
      draggable(pc, {
        onStart: () => { pc.style.transform = 'scale(1.04)'; pc.style.zIndex = ++z + n * 2 + 100; sfx.tap(); },
        onDrop: () => {
          const tx = bx + cx * pw, ty = by + cy * ph;
          const dx = parseFloat(pc.style.left) - tx, dy = parseFloat(pc.style.top) - ty;
          if (Math.hypot(dx, dy) < Math.min(pw, ph) * 0.42) {
            pc.classList.add('snap'); pc.style.left = tx + 'px'; pc.style.top = ty + 'px'; pc.style.transform = 'none'; pc.style.zIndex = 2;
            pc.dataset.locked = '1';
            sfx.pop();
            placed++;
            if (placed === cols * rows) done();
          } else {
            pc.style.transform = `scale(${scale})`;
            if (Math.abs(dx) < bw && parseFloat(pc.style.left) > bx - pw / 2) sfx.boing();
          }
        },
      });
    });
    say(diff === 'leicht' ? 'Zieh die Teile auf das Bild!' : 'Wohin gehören die Teile?');
    async function done() {
      board.classList.add('complete');
      body.querySelectorAll('.pz-piece').forEach((p) => p.classList.add('complete'));
      sfx.sparkle();
      starRain(16);
      levelUp(kid, 'puzzle', diff, 6);
      await sleep(1200);
      const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: 'Puzzle geschafft!' });
      if (r === 'again') chooser(); else (await import('../nav.js')).go('house', {});
    }
  }

  chooser();
  return {};
});
