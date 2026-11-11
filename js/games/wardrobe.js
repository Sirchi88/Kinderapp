// Kleiderschrank: Figuren anziehen (frei oder passend zum Wetter).
import { register, session } from '../nav.js';
import { state } from '../store.js';
import { h, onTap, sleep, starRain } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle, pick } from './shell.js';
import { personSVG, FAMILY } from '../art/person.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const I = (id, slot, val, extra = {}) => ({ id, slot, val, ...extra });
const ITEMS = [
  I('h0', 'hat', null, { icon: '🚫' }), I('h1', 'hat', 'muetze', { hatColor: '#ff6f6f' }), I('h2', 'hat', 'sonnenhut', { hatColor: '#ff8fc8' }), I('h3', 'hat', 'kappe', { hatColor: '#4fa3ff' }),
  I('h4', 'hat', 'krone', { hatColor: '#ffd23f' }), I('h5', 'hat', 'piratenhut'), I('h6', 'hat', 'feuerwehrhelm'), I('h7', 'hat', 'trachtenhut'), I('h8', 'hat', 'helm', { hatColor: '#ffd23f' }),
  I('t1', 'top', 'tshirt', { topColor: '#7cc4ff' }), I('t2', 'top', 'ringel', { topColor: '#ff6f6f' }), I('t3', 'top', 'kleid', { topColor: '#ff8fc8' }), I('t4', 'top', 'dirndl', { topColor: '#e94e6e' }),
  I('t5', 'top', 'tracht'), I('t6', 'top', 'regenjacke', { topColor: '#ffd23f' }), I('t7', 'top', 'winterjacke', { topColor: '#4fa3ff' }), I('t8', 'top', 'schlafanzug', { topColor: '#9b8cff' }),
  I('t9', 'top', 'hoodie', { topColor: '#e33b3b' }), I('t10', 'top', 'pulli', { topColor: '#8fdc6a' }),
  I('b1', 'bottom', 'jeans', { bottomColor: '#4a6fa5' }), I('b2', 'bottom', 'shorts', { bottomColor: '#ffb86b' }), I('b3', 'bottom', 'rock', { bottomColor: '#b68cff' }), I('b4', 'bottom', 'leggings', { bottomColor: '#ff8fc8' }), I('b5', 'bottom', 'lederhose'),
  I('s1', 'boots', null, { icon: '👟' }), I('s2', 'boots', 'gummistiefel', { bootColor: '#ff5a5a' }), I('s3', 'boots', 'gummistiefel', { bootColor: '#ffd23f' }), I('s4', 'boots', 'winterstiefel'),
  I('e0', 'extra', null, { icon: '🚫' }), I('e1', 'extra', 'schal', { extraColor: '#e94e4e' }), I('e2', 'extra', 'sonnenbrille'), I('e3', 'extra', 'regenschirm', { extraColor: '#4fa3ff' }),
  I('e4', 'extra', 'zauberstab'), I('e5', 'extra', 'fluegel', { extraColor: '#ff8fc8' }), I('e6', 'extra', 'tasche'), I('e7', 'extra', 'brille', { extraColor: '#3a3d44' }),
];
const byId = (id) => ITEMS.find((i) => i.id === id);
const ITEMNAME = { muetze: 'Mütze', sonnenhut: 'Sonnenhut', kappe: 'Kappe', krone: 'Krone', piratenhut: 'Piratenhut', feuerwehrhelm: 'Feuerwehrhelm', trachtenhut: 'Trachtenhut', helm: 'Bauhelm', tshirt: 'T-Shirt', ringel: 'Ringelshirt', kleid: 'Kleid', dirndl: 'Dirndl', tracht: 'Trachtenhemd', regenjacke: 'Regenjacke', winterjacke: 'Winterjacke', schlafanzug: 'Schlafanzug', hoodie: 'Kapuzenpulli', pulli: 'Pulli', jeans: 'Jeans', shorts: 'Kurze Hose', rock: 'Rock', leggings: 'Leggings', lederhose: 'Lederhose', gummistiefel: 'Gummistiefel', winterstiefel: 'Winterstiefel', schal: 'Schal', sonnenbrille: 'Sonnenbrille', regenschirm: 'Regenschirm', zauberstab: 'Zauberstab', fluegel: 'Feenflügel', tasche: 'Tasche', brille: 'Brille' };
const itemName = (it) => (it.val ? ITEMNAME[it.val] || '' : it.slot === 'boots' ? 'Schuhe' : 'Nichts');
const COSNAME = { c1: 'Dirndl', c2: 'Tracht mit Lederhose', c3: 'Prinzessin', c7: 'Fee', c4: 'Pirat', c5: 'Feuerwehr', c6: 'Schlafenszeit' };
const COSTUMES = [
  { id: 'c1', icon: '🏔️', set: ['t4', 'b4', 'h7', 's1', 'e0'] },
  { id: 'c2', icon: '🥨', set: ['t5', 'b5', 'h7', 's1', 'e0'] },
  { id: 'c3', icon: '👸', set: ['t3', 'b4', 'h4', 'e4', 's1'] },
  { id: 'c7', icon: '🧚', set: ['t3', 'b4', 'h0', 'e5', 's1'] },
  { id: 'c4', icon: '🏴‍☠️', set: ['t2', 'b2', 'h5', 's1', 'e0'] },
  { id: 'c5', icon: '🚒', set: ['t9', 'b1', 'h6', 's2', 'e0'] },
  { id: 'c6', icon: '🌙', set: ['t8', 'h1', 's1', 'e0'] },
];
const CATS = [['hat', '🎩'], ['top', '👕'], ['bottom', '👖'], ['boots', '👢'], ['extra', '🕶️'], ['costume', '🎭']];

const WEATHER = {
  sonne: { icon: '☀️', say: 'Die Sonne scheint! Es ist heiß!', need: ['h2', 'e2', 'b2'], bad: { t7: 'Puh, viel zu warm!', h1: 'Mir ist so heiß!', s4: 'Meine Füße schwitzen!', t6: 'Es regnet doch gar nicht!', e3: 'Es regnet doch gar nicht!', e1: 'Puh, viel zu warm!' } },
  regen: { icon: '🌧️', say: 'Es regnet! Pitsch, patsch!', need: ['t6', 's2', 'e3'], bad: { e2: 'Bei Regen brauche ich keine Sonnenbrille!', h2: 'Der Hut wird ganz nass!', b2: 'Brr, meine Beine werden nass!', t3: 'Brr, da werde ich nass!', s1: 'Meine Schuhe werden nass!' } },
  schnee: { icon: '❄️', say: 'Es schneit! Brrr, ist das kalt!', need: ['t7', 'h1', 'e1', 's4'], bad: { b2: 'Brrr, meine Beine frieren!', e2: 'Brrr, das hilft nicht gegen Kälte!', t1: 'Brrr, mir ist kalt!', h2: 'Brrr, meine Ohren frieren!', s1: 'Brrr, meine Füße frieren!', t3: 'Brrr, mir ist kalt!' } },
};

function people(kid) {
  const list = [{ id: 'me', o: { ...kid.avatar, accessory: 'keins', scale: 1 } }];
  for (const k of state.kids) if (k !== kid && k.avatar) list.push({ id: k.id, o: { ...k.avatar, accessory: 'keins', scale: 1 } });
  for (const [key, f] of Object.entries(FAMILY)) list.push({ id: key, o: { ...f, scale: 1, accessory: f.accessory === 'helm' || f.accessory === 'tasche' ? 'keins' : f.accessory } });
  return list;
}

register('wardrobe', (app) => {
  const kid = session.kid;
  const { el, body, right } = gameShell(app, { cls: 'wardrobe', back: 'house' });
  let who = null;

  function start() {
    const ppl = people(kid);
    who = who || ppl[0];
    body.innerHTML = `<div class="wr-start">
      <div class="wr-people">${ppl.map((p) => `<button class="wr-p ${p.id === who.id ? 'on' : ''}" data-id="${p.id}" aria-label="${p.id === 'me' ? kid.name : p.o.name || ''}">${personSVG(p.o, { crop: 'head' })}</button>`).join('')}</div>
      <div class="wr-modes"><button class="wr-mode" data-m="free" aria-label="Freies Anziehen"><span>👗</span></button><button class="wr-mode" data-m="weather" aria-label="Wetter-Spiel"><span>⛅</span></button></div></div>`;
    say('Wen möchtest du anziehen? Freies Anziehen, oder das Wetter-Spiel?');
    body.querySelectorAll('.wr-p').forEach((b) => onTap(b, () => { who = ppl.find((p) => p.id === b.dataset.id); body.querySelectorAll('.wr-p').forEach((x) => x.classList.toggle('on', x === b)); }, { sound: 'pop' }));
    body.querySelectorAll('.wr-mode').forEach((b) => onTap(b, async () => {
      if (b.dataset.m === 'free') free();
      else weather(await chooseLevel(kid, 'wardrobe'));
    }, { sound: 'pop' }));
  }

  const apply = (o, it) => {
    const n = { ...o };
    if (it.slot === 'top') { n.top = it.val; if (it.topColor) n.topColor = it.topColor; }
    else if (it.slot === 'bottom') { n.bottom = it.val; if (it.bottomColor) n.bottomColor = it.bottomColor; }
    else if (it.slot === 'hat') { n.hat = it.val; n.hatColor = it.hatColor; }
    else if (it.slot === 'boots') { n.boots = it.val; n.bootColor = it.bootColor; }
    else if (it.slot === 'extra') { n.extra = it.val; n.extraColor = it.extraColor; }
    return n;
  };
  const crop = (slot) => (slot === 'hat' ? 'head' : slot === 'top' || slot === 'bottom' || slot === 'boots' ? 'body' : 'full');
  const tile = (o, it) => (it.icon && !it.val ? `<span class="ic">${it.icon}</span>` : personSVG(apply(o, it), { crop: crop(it.slot) }));

  function layout() {
    body.innerHTML = `<div class="wr-ui"><div class="wr-stage"><div class="closet"><i></i><i></i></div><div class="wr-fig"></div><div class="wr-weather"></div></div><div class="wr-panel"><div class="wr-tabs"></div><div class="wr-items"></div></div></div>`;
    return { fig: body.querySelector('.wr-fig'), items: body.querySelector('.wr-items'), tabs: body.querySelector('.wr-tabs'), wx: body.querySelector('.wr-weather') };
  }
  const drawFig = (fig, o, mood = 'happy') => { fig.innerHTML = personSVG(o, { mood }); };
  const bounce = (fig) => { fig.classList.remove('jump'); void fig.offsetWidth; fig.classList.add('jump'); };

  // ---------- Freies Anziehen ----------
  function free() {
    let o = { ...who.o };
    let cat = 'top';
    const { fig, items, tabs } = layout();
    right.innerHTML = `<button class="btn round ghost" data-a="photo" aria-label="Foto">📸</button>`;
    tabs.innerHTML = CATS.map(([k, i]) => `<button class="tab" data-c="${k}">${i}</button>`).join('');
    const drawItems = () => {
      tabs.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.c === cat));
      if (cat === 'costume') items.innerHTML = COSTUMES.map((c) => `<button class="wr-it costume" data-cos="${c.id}" data-say="${COSNAME[c.id] || ''}"><span class="ic">${c.icon}</span></button>`).join('');
      else items.innerHTML = ITEMS.filter((i) => i.slot === cat).map((i) => `<button class="wr-it" data-i="${i.id}" data-say="${itemName(i)}">${tile(o, i)}</button>`).join('');
    };
    tabs.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (!t) return; cat = t.dataset.c; sfx.tap(); drawItems(); });
    items.addEventListener('click', (e) => {
      const b = e.target.closest('.wr-it');
      if (!b) return;
      if (b.dataset.cos) {
        const c = COSTUMES.find((x) => x.id === b.dataset.cos);
        o = { ...who.o };
        for (const id of c.set) o = apply(o, byId(id));
        sfx.sparkle(); say(pick(['Verkleidet!', 'Wow, was für ein Kostüm!', 'Toll siehst du aus!']));
      } else {
        o = apply(o, byId(b.dataset.i));
        sfx.pop();
      }
      drawFig(fig, o, 'laugh'); bounce(fig);
      clearTimeout(fig._t); fig._t = setTimeout(() => drawFig(fig, o), 900);
      if (cat !== 'costume') drawItems();
    });
    let photoStar = false;
    onTap(right.querySelector('[data-a=photo]'), () => {
      const f = h(`<div class="flash"></div>`); document.body.appendChild(f); setTimeout(() => f.remove(), 600);
      sfx.door(); setTimeout(() => sfx.sparkle(), 200);
      say(pick(['Klick! Schönes Foto!', 'Lächeln! Klick!', 'Das sieht toll aus!']));
      if (!photoStar) { photoStar = true; setTimeout(() => winScreen(kid, { stars: 1, text: 'Was für ein schicker Look!' }).then((r) => { if (r === 'home') start(); }), 900); }
    }, { sound: null });
    drawFig(fig, o); drawItems();
    say(`Was soll ${who.id === 'me' ? 'deine Figur' : who.o.name || 'sie'} anziehen?`);
  }

  // ---------- Wetter-Spiel ----------
  function weather(diff) {
    const lvl = getLevel(kid, 'wardrobe', diff);
    const wKey = pick(Object.keys(WEATHER));
    const w = WEATHER[wKey];
    const need = w.need.slice(0, 3);
    let o = { ...who.o, top: 'tshirt', topColor: '#ffffff', bottom: 'jeans', bottomColor: '#6e7f99', hat: null, extra: null, boots: null };
    const others = shuffle(ITEMS.filter((i) => i.val && !need.includes(i.id) && !(wKey === 'schnee' && i.id === 's4'))).slice(0, diff === 'leicht' ? 3 + Math.min(lvl, 2) : 5 + Math.min(lvl, 3));
    const offer = shuffle([...need.map(byId), ...others]);
    const { fig, items, wx } = layout();
    right.innerHTML = '';
    body.querySelector('.wr-ui').classList.add('wx-' + wKey);
    wx.innerHTML = `<div class="wx-icon">${w.icon}</div>${wKey === 'sonne' ? '' : Array.from({ length: 26 }, (_, i) => `<i class="${wKey === 'regen' ? 'drop' : 'flake'}" style="left:${(i * 37) % 100}%;animation-delay:${(i * 0.17) % 2}s"></i>`).join('')}`;
    body.querySelector('.wr-tabs').innerHTML = `<div class="need-list">${need.map((id) => `<i data-n="${id}"></i>`).join('')}</div>`;
    items.innerHTML = offer.map((i) => `<button class="wr-it" data-i="${i.id}" data-say="${itemName(i)}">${tile(o, i)}</button>`).join('');
    drawFig(fig, o, wKey === 'sonne' ? 'happy' : 'surprised');
    startRound();
    say(`${w.say} Zieh ${who.id === 'me' ? 'dich' : who.o.name || 'sie'} richtig an!`);
    let got = 0;
    items.addEventListener('click', async (e) => {
      const b = e.target.closest('.wr-it');
      if (!b || b.classList.contains('used')) return;
      const it = byId(b.dataset.i);
      if (need.includes(it.id)) {
        o = apply(o, it);
        b.classList.add('used');
        body.querySelector(`.need-list [data-n="${it.id}"]`).classList.add('done');
        sfx.sparkle(); drawFig(fig, o, 'laugh'); bounce(fig);
        say(pick(['Genau richtig!', 'Super!', 'Das passt!']));
        if (++got === need.length) {
          levelUp(kid, 'wardrobe', diff, 5);
          await sleep(900);
          const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: 'Perfekt angezogen!' });
          if (r === 'again') weather(diff); else start();
        }
      } else {
        sfx.wrong();
        fig.classList.remove('shiver'); void fig.offsetWidth; fig.classList.add('shiver');
        drawFig(fig, apply(o, it), 'surprised');
        setTimeout(() => drawFig(fig, o, 'happy'), 1300);
        say(w.bad[it.id] || (wKey === 'schnee' ? 'Hmm, hält das warm?' : wKey === 'regen' ? 'Hmm, hält das trocken?' : 'Hmm, passt das zur Sonne?'));
      }
    });
  }

  start();
  return {};
});
