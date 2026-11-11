// Memory: Paare finden – mit Kuscheltieren, der Familie oder euren eigenen Fotos. Allein oder zu zweit.
import { register, session } from '../nav.js';
import { state } from '../store.js';
import { h, onTap, esc, sleep } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle } from './shell.js';
import { plushSVG, PLUSH, plushLabel } from '../art/plush.js';
import { personSVG, FAMILY } from '../art/person.js';
import { baileySVG } from '../art/bailey.js';
import { listPhotos } from '../media.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const TURTLE = `<svg viewBox="-60 -50 120 80"><ellipse cx="-24" cy="12" rx="11" ry="7" fill="#9cc96a" stroke="#5a3e2b" stroke-width="3"/><ellipse cx="24" cy="12" rx="11" ry="7" fill="#9cc96a" stroke="#5a3e2b" stroke-width="3"/>
  <ellipse cx="44" cy="-6" rx="16" ry="13" fill="#9cc96a" stroke="#5a3e2b" stroke-width="3"/><circle cx="49" cy="-10" r="6" fill="#ff8a3d"/><circle cx="50" cy="-10" r="3" fill="#2a1d14"/><path d="M40 0 q6 4 10 0" stroke="#5a3e2b" stroke-width="2" fill="none"/>
  <path d="M-40 10 Q-40 -38 0 -38 Q40 -38 40 10 Z" fill="#c4874a" stroke="#5a3e2b" stroke-width="3"/><path d="M-18 0 l10 -20 h18 l10 20 Z M-34 4 l10 -16 M34 4 l-10 -16" fill="#a96a35" stroke="#7a4a22" stroke-width="2"/></svg>`;

function familyFaces() {
  const f = [
    { id: 'papa', name: 'Papa', svg: personSVG(FAMILY.papa, { crop: 'head' }) },
    { id: 'mama', name: 'Mama', svg: personSVG(FAMILY.mama, { crop: 'head' }) },
    { id: 'oa', name: 'Opa Auerbach', svg: personSVG(FAMILY.opaAuerbach, { crop: 'head' }) },
    { id: 'ma', name: 'Oma Auerbach', svg: personSVG(FAMILY.omaAuerbach, { crop: 'head' }) },
    { id: 'mm', name: 'Oma Mindelheim', svg: personSVG(FAMILY.omaMindelheim, { crop: 'head' }) },
    { id: 'om', name: 'Opa Mindelheim', svg: personSVG(FAMILY.opaMindelheim, { crop: 'head' }) },
    { id: 'bailey', name: 'Bailey', svg: baileySVG('sit') },
    { id: 'turtle', name: 'die Schildkröte', svg: TURTLE },
  ];
  for (const k of state.kids) if (k.avatar) f.push({ id: 'kid-' + k.id, name: k.name, svg: personSVG({ ...k.avatar, scale: 1 }, { crop: 'head' }) });
  return f;
}

const plushFaces = () => Object.keys(PLUSH).map((k) => ({ id: k, name: plushLabel(k).split(' ').slice(1).join(' '), svg: plushSVG(k) }));

register('memory', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'memory' });
  let photos = [];
  let partner = null;

  const others = [
    ...state.kids.filter((k) => k !== kid && k.avatar).map((k) => ({ id: k.id, name: k.name, color: k.color, face: personSVG({ ...k.avatar, scale: 1 }, { crop: 'head' }) })),
    { id: 'mama', name: 'Mama', color: '#7fd0b0', face: personSVG(FAMILY.mama, { crop: 'head' }) },
    { id: 'papa', name: 'Papa', color: '#7cb6e8', face: personSVG(FAMILY.papa, { crop: 'head' }) },
  ];

  async function setup() {
    photos = await listPhotos();
    const fam = familyFaces();
    body.innerHTML = `<div class="mem-setup">
      <div class="themes">
        <button class="theme" data-t="tiere"><div class="prev">${['baer', 'einhorn', 'tukan', 'kuh'].map((k) => plushSVG(k)).join('')}</div></button>
        <button class="theme" data-t="familie"><div class="prev">${fam.slice(0, 2).map((f) => f.svg).join('')}${fam[6].svg}${fam[7].svg}</div></button>
        <button class="theme ${photos.length < 3 ? 'off' : ''}" data-t="fotos"><div class="prev photos">${photos.length >= 3 ? photos.slice(0, 4).map((p) => `<img src="${p.data}" alt="">`).join('') : '<span class="cam">📷</span>'}</div></button>
      </div>
      <div class="players"><button class="pl-opt on" data-p="">${personSVG({ ...kid.avatar, scale: 1 }, { crop: 'head' })}</button>
        <span class="plus">+</span>${others.map((o) => `<button class="pl-opt" data-p="${o.id}">${o.face}</button>`).join('')}</div>
    </div>`;
    say(`Mit welchen Bildern willst du spielen? Und spielt jemand mit?`);
    body.querySelectorAll('.pl-opt').forEach((b) => onTap(b, () => {
      const sel = b.dataset.p;
      partner = sel && partner?.id !== sel ? others.find((o) => o.id === sel) : null;
      body.querySelectorAll('.pl-opt').forEach((x) => x.classList.toggle('on', !x.dataset.p || x.dataset.p === partner?.id));
      if (partner) say(`${kid.name} und ${partner.name} spielen zusammen!`);
      else say(`${kid.name} spielt allein.`);
    }, { sound: 'pop' }));
    body.querySelectorAll('.theme').forEach((b) => onTap(b, async () => {
      if (b.classList.contains('off')) { say('Mama oder Papa können im Elternbereich Fotos hinzufügen!'); return; }
      const diff = await chooseLevel(kid, 'memory');
      play(b.dataset.t, diff);
    }, { sound: 'pop' }));
  }

  async function play(theme, diff) {
    const lvl = getLevel(kid, 'memory', diff);
    let pairs = diff === 'leicht' ? Math.min(3 + lvl, 5) : Math.min(5 + lvl, 8);
    let pool = theme === 'tiere' ? plushFaces() : theme === 'familie' ? familyFaces() : photos.map((p, i) => ({ id: p.id, name: '', svg: `<img src="${p.data}" alt="">` }));
    pairs = Math.min(pairs, pool.length);
    const chosen = shuffle(pool).slice(0, pairs);
    const cards = shuffle(chosen.flatMap((c) => [c, c]));
    const n = cards.length;
    const rows = n <= 10 ? 2 : 3;
    const cols = Math.ceil(n / rows);
    const players = [{ id: kid.id, name: kid.name, color: kid.color, face: personSVG({ ...kid.avatar, scale: 1 }, { crop: 'head' }), score: 0 }];
    if (partner) players.push({ ...partner, score: 0 });
    let turn = 0;

    body.innerHTML = `<div class="mem-board" style="--cols:${cols};--rows:${rows}">${cards.map((c, i) => `<button class="mcard" data-i="${i}"><div class="inner"><div class="back"><span>🏡</span></div><div class="front">${c.svg}</div></div></button>`).join('')}</div>`;
    right.innerHTML = players.length > 1 ? players.map((p, i) => `<div class="pchip ${i === 0 ? 'on' : ''}" style="--kid:${p.color}"><span class="f">${p.face}</span><b>0</b></div>`).join('') : '';
    const fit = () => {
      const W = innerWidth * 0.94, H = innerHeight * 0.78;
      const size = Math.floor(Math.min((W - (cols - 1) * 12) / cols, (H - (rows - 1) * 12) / rows));
      body.querySelector('.mem-board').style.setProperty('--size', size + 'px');
    };
    fit();
    addEventListener('resize', fit);
    startRound();
    let open = [], lock = false, found = 0;
    const chips = () => right.querySelectorAll('.pchip').forEach((c, i) => { c.classList.toggle('on', i === turn); c.querySelector('b').textContent = players[i].score; });

    body.querySelector('.mem-board').addEventListener('click', async (e) => {
      const b = e.target.closest('.mcard');
      if (!b || lock || b.classList.contains('flip')) return;
      b.classList.add('flip');
      sfx.tap();
      open.push(b);
      if (open.length < 2) return;
      lock = true;
      const [a, c] = open.map((x) => cards[+x.dataset.i]);
      await sleep(500);
      if (a.id === c.id) {
        open.forEach((x) => x.classList.add('done'));
        sfx.sparkle();
        found++;
        players[turn].score++;
        chips();
        if (a.name) say(a.name.charAt(0).toUpperCase() + a.name.slice(1) + '!');
        else say(['Ein Paar!', 'Super!', 'Gefunden!'][found % 3]);
        open = []; lock = false;
        if (found === pairs) {
          removeEventListener('resize', fit);
          await sleep(900);
          levelUp(kid, 'memory', diff, 6);
          let text = 'Alle Paare gefunden!';
          if (players.length > 1) {
            const [p1, p2] = players;
            text = p1.score === p2.score ? 'Unentschieden! Ihr seid beide super!' : `${(p1.score > p2.score ? p1 : p2).name} hat gewonnen!`;
          }
          const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text });
          if (r === 'again') play(theme, diff); else setup();
        }
      } else {
        await sleep(700);
        sfx.whoosh();
        open.forEach((x) => x.classList.remove('flip'));
        open = []; lock = false;
        if (players.length > 1) { turn = 1 - turn; chips(); say(`Jetzt ist ${players[turn].name} dran!`); }
      }
    });
    say(players.length > 1 ? `${players[0].name} fängt an! Finde die Paare!` : 'Finde die Paare!');
  }

  setup();
  return {};
});
