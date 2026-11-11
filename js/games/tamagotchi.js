// Tamagotchi: Das eigene Kuscheltier füttern, baden, Zähne putzen, schlafen legen, spielen, anziehen, kuscheln.
import { register, session } from '../nav.js';
import { save, state } from '../store.js';
import { h, ICON, onTap, starRain, sleep } from '../ui.js';
import { gameShell, pick } from './shell.js';
import { kidPlush, petState, petMood, boost, NEEDS, lowestNeed } from '../pet.js';
import { PLUSH, OUTFIT, plushSVG } from '../art/plush.js';
import { say } from '../speech.js';
import { sfx, playMusic, stopMusic } from '../audio.js';
import { roundDone } from '../breaks.js';
import { toLocal, scale } from '../viewport.js';

const FAV = { baer: '🍯', tukan: '🍓', wildschwein: '🥕', affe: '🍌', pavian: '🍌', rassel: '🍪', gelbi: '🍌', puppe: '🍼', einhorn: '🧁', schaf: '🌿', pony: '🥕', schwein: '🍎', kueken: '🌽', kuh: '🌿', elefant: '🥜', loewe: '🍖', panda: '🎋', pinguin: '🐟', faultier: '🍃' };
const FOODS = ['🍎', '🥕', '🍌', '🍓', '🥨', '🧀', '🍕', '🍰', '🥛', '💧'];
const SWEET = ['🍰', '🍪', '🧁', '🍯'];
const FOODNAME = { '🍎': 'Apfel', '🥕': 'Karotte', '🍌': 'Banane', '🍓': 'Erdbeere', '🥨': 'Brezel', '🧀': 'Käse', '🍕': 'Pizza', '🍰': 'Kuchen', '🥛': 'Milch', '💧': 'Wasser', '🍯': 'Honig', '🍪': 'Keks', '🍼': 'Fläschchen', '🧁': 'Muffin', '🌿': 'Gras', '🌽': 'Mais', '🥜': 'Nüsse', '🍖': 'Fleisch', '🎋': 'Bambus', '🐟': 'Fisch', '🍃': 'Blätter' };

const ROOM = `<svg class="room-bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
  <defs><pattern id="tw" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#ffe6ee"/><path d="M20 16 l4 8 l8 1 l-6 6 l2 8 l-8 -4 l-8 4 l2 -8 l-6 -6 l8 -1 Z" fill="#fff"/><circle cx="60" cy="56" r="5" fill="#ffcadb"/></pattern>
  <pattern id="tf" width="120" height="30" patternUnits="userSpaceOnUse"><rect width="120" height="30" fill="#e2a874"/><path d="M0 29 H120 M60 0 V29" stroke="#c48a56" stroke-width="3"/></pattern></defs>
  <rect width="1600" height="680" fill="url(#tw)"/><rect y="660" width="1600" height="240" fill="url(#tf)"/><rect y="650" width="1600" height="16" fill="#fff" stroke="#e8c9d4" stroke-width="3"/>
  <g class="win-day"><rect x="180" y="120" width="260" height="230" rx="16" fill="#3d434c"/><rect x="194" y="134" width="232" height="202" rx="8" fill="#bfe8ff"/>
    <path d="M194 290 q60 -50 120 -20 t112 -10 V336 H194 Z" fill="#9edb6e"/><path d="M194 250 L250 190 L300 240 L350 180 L426 260 V290 H194 Z" fill="#a9c3dc"/><circle cx="380" cy="180" r="22" fill="#ffd94a"/>
    <path d="M310 134 V336 M194 235 H426" stroke="#3d434c" stroke-width="10"/></g>
  <path d="M160 110 q140 40 300 0 v40 q-150 30 -300 0 Z" fill="#ff9fb2" stroke="#5a3e2b" stroke-width="3"/>
  <g stroke="#5a3e2b" stroke-width="3"><rect x="1150" y="470" width="380" height="120" rx="20" fill="#c98b55"/><rect x="1160" y="440" width="360" height="60" rx="26" fill="#ffb3c8"/><rect x="1140" y="380" width="34" height="240" rx="12" fill="#a96a42"/><rect x="1506" y="420" width="34" height="200" rx="12" fill="#a96a42"/><rect x="1190" y="410" width="100" height="44" rx="20" fill="#fff"/></g>
  <g stroke="#5a3e2b" stroke-width="3"><rect x="560" y="200" width="300" height="20" rx="6" fill="#c98b55"/><rect x="580" y="150" width="40" height="50" rx="6" fill="#7cc4ff"/><circle cx="660" cy="176" r="24" fill="#ffd94a"/><path d="M720 200 l20 -50 l20 50 Z" fill="#9be37a"/><rect x="790" y="160" width="46" height="40" rx="8" fill="#c6a8ff"/></g>
  <ellipse cx="800" cy="800" rx="420" ry="60" fill="#c6a8ff" opacity=".55"/>
  <g class="night"><rect width="1600" height="900" fill="#1d2350" opacity=".62"/><circle cx="360" cy="190" r="34" fill="#fff6c9"/><circle cx="374" cy="180" r="30" fill="#2f3a6e"/>${Array.from({ length: 10 }, (_, i) => `<text x="${210 + (i * 23) % 200}" y="${160 + (i * 37) % 150}" font-size="16" fill="#fff8c4">✦</text>`).join('')}</g>
</svg>`;

register('tamagotchi', (app) => {
  const kid = session.kid;
  const { el, body, right } = gameShell(app, { cls: 'tama', back: 'house' });
  const pname = kid.plushName || PLUSH[kid.plush].name;
  body.innerHTML = `${ROOM}
    <div class="needs">${Object.entries(NEEDS).map(([k, n]) => `<div class="need" data-n="${k}"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" class="bgc"/><circle cx="30" cy="30" r="25" class="fg"/></svg><span>${n.icon}</span></div>`).join('')}</div>
    <div class="pet-wrap"><div class="pet"></div><div class="dirt"></div><div class="fxl"></div></div>
    <div class="tray"></div>
    <div class="actions">
      <button class="act" data-a="feed" aria-label="Füttern">🍎</button><button class="act" data-a="bath" aria-label="Baden">🛁</button><button class="act" data-a="teeth" aria-label="Zähne putzen">🪥</button>
      <button class="act" data-a="sleep" aria-label="Schlafen">😴</button><button class="act" data-a="play" aria-label="Spielen">🎾</button><button class="act" data-a="dress" aria-label="Anziehen">👕</button><button class="act" data-a="hug" aria-label="Kuscheln">❤️</button>
    </div>`;
  const pet = body.querySelector('.pet'), wrap = body.querySelector('.pet-wrap'), tray = body.querySelector('.tray'), fxl = body.querySelector('.fxl'), dirt = body.querySelector('.dirt');
  let mode = null, busy = false, moodOverride = null, rubbing = null;

  const drawPet = () => { pet.innerHTML = kidPlush(kid, moodOverride ? { mood: moodOverride } : {}); };
  const drawNeeds = () => {
    const p = petState(kid);
    body.querySelectorAll('.need').forEach((n) => {
      const v = p[n.dataset.n];
      const fg = n.querySelector('.fg');
      fg.style.strokeDashoffset = 157 * (1 - v / 100);
      fg.style.stroke = v > 60 ? '#7fd05a' : v > 30 ? '#ffc83d' : '#ff6f6f';
      n.classList.toggle('low', v < 30);
    });
    // Schmutzflecken, wenn das Kuscheltier lange nicht gebadet wurde
    const spots = p.clean < 25 ? 4 : p.clean < 50 ? 2 : 0;
    dirt.innerHTML = Array.from({ length: spots }, (_, i) => `<i style="left:${[30, 60, 42, 66][i]}%;top:${[58, 66, 40, 46][i]}%"></i>`).join('');
  };
  const refresh = () => { drawPet(); drawNeeds(); };
  const floatFx = (ch, n = 3) => {
    for (let i = 0; i < n; i++) {
      const f = h(`<span class="pfx" style="left:${35 + Math.random() * 30}%;top:${20 + Math.random() * 30}%;animation-delay:${i * 0.15}s">${ch}</span>`);
      fxl.appendChild(f); setTimeout(() => f.remove(), 1800);
    }
  };
  const bounce = () => { pet.classList.remove('jump'); void pet.offsetWidth; pet.classList.add('jump'); };
  const give = (need, amt) => {
    const happy = boost(kid, need, amt);
    drawNeeds();
    if (happy) {
      starRain(24);
      sfx.tada();
      setTimeout(() => say(`${pname} ist rundum glücklich! Dafür bekommst du zwei Sterne!`), 600);
      setTimeout(() => roundDone(), 3500);
    }
  };
  const closeTray = () => { tray.classList.remove('open'); tray.innerHTML = ''; mode = null; fxl.querySelectorAll('.foam').forEach((f) => f.remove()); rubbing = null; el.classList.remove('bathing', 'brushing'); wrap.querySelector('.tub')?.remove(); };

  // ---------- Füttern ----------
  function feed() {
    const fav = FAV[kid.plush];
    const foods = [fav, ...FOODS.filter((f) => f !== fav)].slice(0, 9);
    tray.innerHTML = foods.map((f) => `<button class="food" data-f="${f}" data-say="${FOODNAME[f] || ''}">${f}</button>`).join('');
    tray.classList.add('open');
    say(pick(['Was möchtest du mir geben?', 'Mmmh, was gibt es zu essen?']));
  }
  tray.addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b || busy) return;
    if (b.dataset.f) {
      busy = true;
      const f = b.dataset.f;
      const r = b.getBoundingClientRect(), pr = pet.getBoundingClientRect();
      const fly = h(`<span class="flyfood" style="left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px">${f}</span>`);
      document.body.appendChild(fly);
      requestAnimationFrame(() => { fly.style.transform = `translate(${pr.left + pr.width / 2 - r.left - r.width / 2}px, ${pr.top + pr.height * 0.48 - r.top - r.height / 2}px) scale(.6)`; });
      await sleep(550);
      fly.remove();
      moodOverride = 'eat'; drawPet();
      sfx.chomp(); await sleep(250); sfx.chomp();
      floatFx('✨', 2);
      await sleep(400);
      moodOverride = null; drawPet(); bounce();
      const drink = f === '🥛' || f === '💧' || f === '🍼';
      if (f === FAV[kid.plush]) { give('hunger', 25); give('love', 10); floatFx('💕', 3); say('Mein Lieblingsessen! Danke!'); }
      else if (SWEET.includes(f)) { give('hunger', 10); give('fun', 8); say('Mmmh, süß! Aber nicht zu viel!'); }
      else { give('hunger', drink ? 8 : 15); say(pick(drink ? ['Ahh, erfrischend!', 'Schlürf!'] : ['Mmmh, lecker!', 'Mampf mampf!', 'Danke!'])); }
      busy = false;
    } else if (b.dataset.o !== undefined) {
      const [slot, val] = b.dataset.o.split(':');
      kid.plushOutfit ??= {};
      kid.plushOutfit[slot] = kid.plushOutfit[slot] === val || val === '' ? undefined : val;
      save();
      sfx.sparkle(); drawPet(); bounce(); dressTray();
      if (kid.plushOutfit[slot]) { give('fun', 5); say(pick(['Schick!', 'Wie sehe ich aus?', 'Das gefällt mir!'])); }
    }
  });

  // ---------- Baden & Zähneputzen (Reiben mit dem Finger) ----------
  function startRub(kind) {
    mode = kind;
    el.classList.add(kind === 'bath' ? 'bathing' : 'brushing');
    if (kind === 'bath') wrap.insertAdjacentHTML('beforeend', `<div class="tub"><span class="duck">🦆</span></div>`);
    rubbing = { amount: 0, need: kind === 'bath' ? 100 : 60, last: null };
    tray.innerHTML = `<div class="tool">${kind === 'bath' ? '🧽' : '🪥'}</div><div class="rub-hint">👆 ↔️</div>`;
    tray.classList.add('open');
    say(kind === 'bath' ? 'Reib mich mit dem Schwamm ganz sauber!' : 'Putz mir die Zähne! Hin und her!');
  }
  const cursor = h(`<span class="rub-cursor"></span>`);
  body.appendChild(cursor);
  wrap.addEventListener('pointerdown', (e) => {
    if (mode === 'bath' || mode === 'teeth') { wrap.setPointerCapture(e.pointerId); rubbing.last = [e.clientX, e.clientY]; cursor.textContent = mode === 'bath' ? '🧽' : '🪥'; cursor.style.display = 'block'; moveCursor(e); return; }
    if (mode === 'play' || mode === 'sleep') return;
    hug();
  });
  const moveCursor = (e) => { const [x, y] = toLocal(e.clientX, e.clientY); cursor.style.left = x + 'px'; cursor.style.top = y + 'px'; };
  wrap.addEventListener('pointermove', (e) => {
    if (!rubbing?.last || !(mode === 'bath' || mode === 'teeth')) return;
    moveCursor(e);
    const d = Math.hypot(e.clientX - rubbing.last[0], e.clientY - rubbing.last[1]);
    rubbing.last = [e.clientX, e.clientY];
    rubbing.amount += d / 40;
    if (Math.random() < 0.35) {
      const r = wrap.getBoundingClientRect();
      const b = h(`<i class="foam" style="left:${(e.clientX - r.left) / scale()}px;top:${(e.clientY - r.top) / scale()}px;width:${14 + Math.random() * 26}px"></i>`);
      fxl.appendChild(b); setTimeout(() => b.remove(), mode === 'bath' ? 6000 : 1400);
    }
    if (performance.now() - (rubbing.snd || 0) > 140) { rubbing.snd = performance.now(); sfx.scrub(); }
    if (rubbing.amount >= rubbing.need && !rubbing.done) finishRub();
  });
  wrap.addEventListener('pointerup', () => { if (rubbing) rubbing.last = null; cursor.style.display = 'none'; });
  async function finishRub() {
    rubbing.done = true;
    cursor.style.display = 'none';
    if (mode === 'bath') {
      tray.innerHTML = `<button class="food shower" data-shower="1">🚿</button>`;
      say('Super! Jetzt abduschen!');
      tray.querySelector('[data-shower]').addEventListener('click', async () => {
        sfx.splash();
        wrap.classList.add('showering');
        await sleep(1400);
        fxl.querySelectorAll('.foam').forEach((f) => f.remove());
        wrap.classList.remove('showering');
        give('clean', 100);
        drawPet(); bounce(); floatFx('✨', 4); sfx.sparkle();
        say(pick(['Blitzsauber! Danke!', 'Ich dufte wie eine Blume!']));
        closeTray();
      }, { once: true });
    } else {
      sfx.sparkle(); floatFx('✨', 4); give('clean', 25); give('love', 5); bounce();
      say('Blitzblanke Zähne! Danke!');
      closeTray();
    }
  }

  // ---------- Schlafen ----------
  let sleepTimer = null;
  function goSleep() {
    mode = 'sleep';
    el.classList.add('nighttime');
    moodOverride = 'sleep'; drawPet();
    stopMusic(); playMusic('ruhe');
    tray.innerHTML = `<button class="food" data-wake="1">☀️</button>`;
    tray.classList.add('open');
    say('Gute Nacht! Schlaf gut!');
    tray.querySelector('[data-wake]').addEventListener('click', wake, { once: true });
    sleepTimer = setInterval(() => {
      give('energy', 5);
      if (petState(kid).energy >= 100) wake();
    }, 1000);
  }
  function wake() {
    clearInterval(sleepTimer);
    el.classList.remove('nighttime');
    moodOverride = null; drawPet(); bounce();
    stopMusic(); playMusic('dorf');
    say(petState(kid).energy > 70 ? 'Guten Morgen! Ich bin wieder fit!' : 'Gähn! Ich bin noch ein bisschen müde.');
    closeTray();
  }

  // ---------- Spielen (Ball fangen) ----------
  function play() {
    mode = 'play';
    let catches = 0;
    const ball = h(`<button class="ball" aria-label="Ball">⚽</button>`);
    body.appendChild(ball);
    const place = () => { ball.style.left = 15 + Math.random() * 70 + '%'; ball.style.top = 25 + Math.random() * 45 + '%'; };
    place();
    say('Fang den Ball! Tipp ihn an!');
    ball.addEventListener('click', () => {
      catches++;
      sfx.boing(); bounce(); give('fun', 9);
      if (catches >= 6) { ball.remove(); floatFx('🎉', 4); say('Das hat Spaß gemacht! Nochmal?'); mode = null; return; }
      ball.classList.remove('hop'); void ball.offsetWidth; ball.classList.add('hop');
      setTimeout(place, 150);
      if (catches % 2 === 0) say(pick(['Hihi!', 'Super gefangen!', 'Nochmal!', 'Juhu!']));
    });
    tray.innerHTML = ''; tray.classList.remove('open');
  }

  // ---------- Anziehen ----------
  function dressTray() {
    const o = kid.plushOutfit || {};
    const row = (slot, items) => items.map((v) => `<button class="food dress ${o[slot] === v ? 'on' : ''}" data-o="${slot}:${v}">${plushSVG(kid.plush, { outfit: { [slot]: v } }).replace('class="plush', `class="plush crop-${slot}`)}</button>`).join('');
    tray.innerHTML = row('hat', OUTFIT.hat) + row('eyes', OUTFIT.eyes) + row('neck', OUTFIT.neck);
    tray.classList.add('open', 'wide');
  }

  // ---------- Kuscheln ----------
  function hug() {
    sfx.giggle(); bounce(); floatFx('❤️', 3);
    give('love', 12);
    if (Math.random() < 0.5) say(pick([`Ich hab dich lieb, ${kid.name}!`, 'Kuschelig!', 'Hihi, das kitzelt!', 'Nochmal drücken!']));
  }

  body.querySelectorAll('.act').forEach((b) => onTap(b, () => {
    if (busy) return;
    const a = b.dataset.a;
    if (mode === 'sleep' && a !== 'sleep') wake();
    body.querySelector('.ball')?.remove();
    closeTray(); tray.classList.remove('wide');
    body.querySelectorAll('.act').forEach((x) => x.classList.toggle('on', x === b));
    if (a === 'feed') { mode = 'feed'; feed(); }
    else if (a === 'bath') startRub('bath');
    else if (a === 'teeth') startRub('teeth');
    else if (a === 'sleep') goSleep();
    else if (a === 'play') play();
    else if (a === 'dress') { mode = 'dress'; dressTray(); say('Was soll ich anziehen?'); }
    else if (a === 'hug') hug();
  }, { sound: 'pop' }));

  refresh();
  const tick = setInterval(drawNeeds, 5000);
  const greet = { hunger: 'Ich hab so einen Hunger!', clean: 'Ich bin ganz schmutzig! Badest du mich?', energy: 'Ich bin sooo müde …', fun: 'Mir ist langweilig! Spielst du mit mir?', love: 'Kuschelst du mit mir?' };
  const p = petState(kid), low = lowestNeed(kid);
  setTimeout(() => say(p[low] < 50 ? greet[low] : `Hallo ${kid.name}! Schön, dass du da bist!`), 300);
  return { cleanup() { clearInterval(tick); clearInterval(sleepTimer); cursor.remove(); save(); } };
});
