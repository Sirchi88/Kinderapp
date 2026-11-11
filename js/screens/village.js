// Das Dorf Sirchhausen – Startpunkt für alles.
import { state, save } from '../store.js';
import { register, go, session } from '../nav.js';
import { h, ICON, onTap, holdButton, showBubble, svgFloat, esc, kidColorDark } from '../ui.js';
import { sirchHouseScene } from '../art/village.js';
import { personSVG, FAMILY } from '../art/person.js';
import { plushSVG, PLUSH } from '../art/plush.js';
import { baileySVG } from '../art/bailey.js';
import { say } from '../speech.js';
import { sfx, playMusic, unlockAudio } from '../audio.js';
import { askPin } from '../pin.js';
import { openParents } from './parents.js';
import { openStarJar } from './starjar.js';

const nest = (x, y, w, hgt, inner, cls = '', hot = '') =>
  `<g class="${cls}" ${hot ? `data-hot="${hot}"` : ''}><svg x="${x}" y="${y}" width="${w}" height="${hgt}" overflow="visible">${inner}</svg></g>`;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

register('village', (app, params) => {
  const kid = session.kid;
  session.paused = false;
  const name = kid.name;
  const pname = kid.plushName || PLUSH[kid.plush]?.name || '';

  const el = h(`<div class="screen village" style="--kid:${kid.color}">
    <svg class="world" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${sirchHouseScene()}</svg>
    <div class="hud">
      <button class="kid-badge" style="--kid:${kid.color};color:${kidColorDark(kid.color)}" aria-label="Kind wechseln"><span class="face">${personSVG({ ...kid.avatar, scale: 1 }, { crop: 'head' })}</span>${esc(name)}</button>
      <button class="star-badge" aria-label="Sterne">${ICON.star}<span>${kid.stars}</span></button>
      <span class="spacer"></span>
      <button class="btn round ghost" data-a="plush" aria-label="Kuscheltier">${plushSVG(kid.plush, {})}</button>
      <button class="btn round ghost" data-a="dress" aria-label="Umziehen">${ICON.hanger}</button>
    </div>
    <button class="parent-lock" aria-label="Elternbereich">${ICON.lock}</button>
  </div>`);
  app.appendChild(el);
  const world = el.querySelector('.world');
  const $w = (id) => world.querySelector('#' + id);
  const fx = $w('fx-layer');

  // ---------- Figuren platzieren ----------
  $w('terrace-people').innerHTML =
    nest(872, 446, 120, 175, personSVG(FAMILY.papa), 'hot fam-papa', 'papa') +
    nest(962, 432, 120, 175, personSVG(FAMILY.mama), 'hot fam-mama', 'mama');
  $w('gp-auerbach').innerHTML =
    nest(318, 398, 78, 114, personSVG(FAMILY.opaAuerbach), 'hot gp-oa', 'opaAuerbach') +
    nest(362, 404, 78, 114, personSVG(FAMILY.omaAuerbach), 'hot gp-ma', 'omaAuerbach');
  $w('gp-mindelheim').innerHTML =
    nest(1128, 400, 78, 114, personSVG(FAMILY.omaMindelheim), 'hot gp-mm', 'omaMindelheim') +
    nest(1172, 398, 78, 114, personSVG(FAMILY.opaMindelheim), 'hot gp-om', 'opaMindelheim');
  const drawKid = (mood = 'happy', pose = 'stand') =>
    ($w('kid-layer').innerHTML =
      nest(560, 600, 150, 219, personSVG({ ...kid.avatar, scale: 0.74 }, { mood, pose }), 'hot me', 'kid') +
      nest(668, 716, 104, 108, plushSVG(kid.plush), 'hot my-plush', 'plush'));
  drawKid();

  // ---------- Bailey läuft herum ----------
  const bl = $w('bailey-layer');
  const cat = { x: 900, y: 790, tx: 700, ty: 760, dir: 1, mode: 'walk', wait: 0, petted: 0 };
  bl.innerHTML = `<g class="walker hot" data-hot="bailey"><g class="flip"><svg x="-60" y="-84" width="120" height="92" overflow="visible">${baileySVG('walk')}</svg></g></g>`;
  const walker = bl.firstElementChild, flip = walker.firstElementChild;
  const setPose = (pose) => { flip.innerHTML = pose === 'sleep' ? `<svg x="-66" y="-60" width="132" height="70" overflow="visible">${baileySVG('sleep')}</svg>` : `<svg x="-60" y="-84" width="120" height="92" overflow="visible">${baileySVG(pose)}</svg>`; };
  const newTarget = () => {
    if (Math.random() < 0.18) { cat.tx = 1000 + Math.random() * 60; cat.ty = 640; cat.goSleep = true; }
    else { cat.tx = 420 + Math.random() * 640; cat.ty = 730 + Math.random() * 120; cat.goSleep = false; }
  };
  newTarget();
  let raf, last = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (cat.mode === 'walk') {
      const dx = cat.tx - cat.x, dy = cat.ty - cat.y, d = Math.hypot(dx, dy);
      if (d < 4) {
        cat.mode = cat.goSleep ? 'sleep' : 'sit';
        cat.wait = cat.goSleep ? 14 + Math.random() * 10 : 2 + Math.random() * 4;
        setPose(cat.mode);
        walker.classList.add('idle');
      } else {
        const sp = 70 * dt;
        cat.x += (dx / d) * sp; cat.y += (dy / d) * sp;
        cat.dir = dx >= 0 ? 1 : -1;
      }
    } else if ((cat.wait -= dt) <= 0) {
      cat.mode = 'walk'; newTarget(); setPose('walk'); walker.classList.remove('idle');
    }
    walker.setAttribute('transform', `translate(${cat.x.toFixed(1)} ${cat.y.toFixed(1)})`);
    flip.setAttribute('transform', `scale(${cat.dir} 1)`);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // ---------- Antippen ----------
  const wiggle = (g) => { if (!g || g.hasAttribute('transform')) return; g.classList.remove('wiggle'); void g.getBBox; requestAnimationFrame(() => g.classList.add('wiggle')); setTimeout(() => g.classList.remove('wiggle'), 600); };
  const toWorld = (e) => {
    const pt = world.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(world.getScreenCTM().inverse());
  };
  const greetFamily = (fig, line) => {
    const g = world.querySelector('.' + fig);
    const key = { 'fam-papa': 'papa', 'fam-mama': 'mama', 'gp-oa': 'opaAuerbach', 'gp-ma': 'omaAuerbach', 'gp-mm': 'omaMindelheim', 'gp-om': 'opaMindelheim' }[fig];
    const svg = g.querySelector('svg');
    svg.innerHTML = personSVG(FAMILY[key], { pose: 'wave', mood: 'laugh' });
    clearTimeout(g._t); g._t = setTimeout(() => (svg.innerHTML = personSVG(FAMILY[key])), 2600);
    say(line);
  };

  const ACTIONS = {
    kid(g) { sfx.giggle(); drawKid('laugh', 'wave'); world.querySelector('.me')?.classList.add('jump'); setTimeout(() => drawKid(), 1400); },
    plush(g, p) {
      const sounds = { rassel: 'rattle', kuh: 'moo', einhorn: 'sparkle' };
      sfx[sounds[kid.plush] || 'giggle']();
      g.classList.remove('jump'); void g.getBBox(); g.classList.add('jump');
      svgFloat(fx, p.x, p.y - 60, '💕', 2);
      say(pick([`Ich hab dich lieb, ${name}!`, 'Hihi, das kitzelt!', 'Spielen wir was zusammen?', `Ich bin ${pname}! Und du bist mein bester Freund!`, 'Nochmal, nochmal!']));
    },
    papa() { sfx.pop(); greetFamily('fam-papa', pick([`Hallo ${name}! Gib mir fünf!`, `Servus ${name}! Ich hab dich lieb!`, 'Na, du kleiner Wirbelwind!'])); },
    mama() { sfx.pop(); greetFamily('fam-mama', pick([`Hallo mein Schatz! Ich hab dich lieb!`, `${name}, komm her, du bekommst ein Bussi!`, 'Schön, dass du da bist!'])); },
    opaAuerbach() { sfx.pop(); greetFamily('gp-oa', pick([`Servus ${name}! Schön, dass du mich besuchst!`, `Grüß di, ${name}! Komm, wir gehen spazieren!`])); },
    omaAuerbach() { sfx.pop(); greetFamily('gp-ma', pick([`Grüß di, ${name}! Magst du ein Stück Kuchen?`, `Hallo mein Schatz! Komm, ich drück dich!`])); },
    omaMindelheim() { sfx.pop(); greetFamily('gp-mm', pick([`Servus ${name}! Du bist aber schick heute!`, `Hallo Schätzchen! Kommst du mich besuchen?`])); },
    opaMindelheim() { sfx.pop(); greetFamily('gp-om', pick([`Grüß di, ${name}! Ich bau gerade was ganz Tolles!`, `Servus! Hilfst du mir auf der Baustelle?`])); },
    auerbach() { sfx.door(); greetFamily(pick(['gp-oa', 'gp-ma']), `Hier wohnen Oma und Opa Auerbach!`); },
    mindelheim() { sfx.door(); greetFamily(pick(['gp-mm', 'gp-om']), `Hier wohnen Oma und Opa Mindelheim!`); },
    bailey(g, p) {
      sfx.purr(); setTimeout(() => sfx.meow(), 900);
      svgFloat(fx, cat.x, cat.y - 90, '❤️', 3);
      if (cat.mode === 'walk') { cat.mode = 'sit'; cat.wait = 4; setPose('sit'); walker.classList.add('idle'); }
      else if (cat.mode === 'sleep') { cat.mode = 'sit'; cat.wait = 3; setPose('sit'); }
      say(pick(['Miau! Bailey schnurrt!', 'Bailey mag gestreichelt werden!', 'Prrrr, miau!']));
    },
    turtle(g) {
      g.classList.add('hide'); sfx.boing();
      say('Die Schildkröte versteckt sich! Wo ist sie?');
      setTimeout(() => { g.classList.remove('hide'); sfx.pop(); say('Kuckuck!'); }, 2400);
    },
    pond(g) { const r = g.querySelector('.ripple'); r.classList.remove('go'); void r.getBBox(); r.classList.add('go'); sfx.splash(); svgFloat(fx, 1210, 690, '💧', 3); },
    swing(g) { const s = g.querySelector('.swing-seat'); s.classList.remove('go'); void s.getBBox(); s.classList.add('go'); sfx.whoosh(); setTimeout(() => sfx.whoosh(), 1100); say('Juhuu! Schaukeln!'); },
    flowers(g, p) { g.classList.remove('bloom'); void g.getBBox(); g.classList.add('bloom'); sfx.sparkle(); svgFloat(fx, p.x, p.y - 20, pick(['🦋', '🐝', '🌸']), 2); },
    cow(g) { g.classList.remove('moo'); void g.getBBox(); g.classList.add('moo'); sfx.moo(); say('Muuuh! Die Allgäuer Kuh sagt Servus!'); },
    sun(g) { g.classList.add('laugh'); sfx.giggle(); say('Die Sonne lacht!'); setTimeout(() => g.classList.remove('laugh'), 1200); },
    garage(g) {
      const d = g.querySelector('.garage-door'); const open = !d.classList.contains('open');
      d.classList.toggle('open', open); sfx.door();
      if (open) say('Da ist dein Fahrrad! Bald machen wir eine Fahrradtour durchs Dorf.');
    },
    shed(g) { const d = g.querySelector('.shed-door'); d.classList.toggle('open'); sfx.door(); if (d.classList.contains('open')) say('Im Schuppen wohnen die Gartensachen. Bald gibt es hier was zu entdecken!'); },
    house() { sfx.door(); say(`Das ist euer Haus! Bald kannst du hier drinnen mit ${pname} spielen.`); },
    terrace() { sfx.pop(); say('Auf der Terrasse ist es so gemütlich!'); },
  };

  world.addEventListener('click', (e) => {
    unlockAudio();
    const g = e.target.closest('[data-hot]');
    if (!g) return;
    const p = toWorld(e);
    const act = ACTIONS[g.dataset.hot];
    if (!act) return;
    if (!['plush', 'kid', 'bailey'].includes(g.dataset.hot)) wiggle(g);
    act(g, p);
  });

  // ---------- HUD ----------
  onTap(el.querySelector('.kid-badge'), () => go('profiles'));
  onTap(el.querySelector('.star-badge'), () => openStarJar(kid), { sound: 'sparkle' });
  onTap(el.querySelector('[data-a=dress]'), () => go('editor', {}));
  onTap(el.querySelector('[data-a=plush]'), () => go('plushpick', {}));
  holdButton(el.querySelector('.parent-lock'), 1500, async () => { session.paused = true; if (await askPin()) openParents(); else session.paused = false; });

  const onStars = () => {
    const b = el.querySelector('.star-badge');
    b.querySelector('span').textContent = kid.stars;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
  };
  const onResume = () => { onStars(); session.paused = false; playMusic('dorf'); };
  document.addEventListener('stars', onStars);
  document.addEventListener('playresume', onResume);

  playMusic('dorf');
  if (params.greet) {
    setTimeout(() => {
      if (params.newPlush) say(`Juhu! ${pname} wohnt jetzt bei dir, ${name}! Willkommen in Sirchhausen!`);
      else say(pick([`Servus ${name}! Willkommen in Sirchhausen!`, `Grüß di, ${name}! Schön, dass du da bist!`, `Hallo ${name}! ${pname} hat dich schon vermisst!`]));
    }, 400);
  }

  return {
    cleanup() {
      cancelAnimationFrame(raf);
      document.removeEventListener('stars', onStars);
      document.removeEventListener('playresume', onResume);
    },
  };
});
