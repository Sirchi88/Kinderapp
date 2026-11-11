// Adventskalender (24 Türchen) und Geburtstags-Überraschung.
import { save, addStars, localDay } from '../store.js';
import { overlay, ICON, starRain, sleep, h } from '../ui.js';
import { canOpenDoor } from '../season.js';
import { kidPlush } from '../pet.js';
import { personSVG, FAMILY } from '../art/person.js';
import { plushSVG, PLUSH } from '../art/plush.js';
import { baileySVG } from '../art/bailey.js';
import { say } from '../speech.js';
import { sfx, playMelody, BIRTHDAY_SONG, playMusic, stopMusic } from '../audio.js';

const JOKES = [
  'Was ist weiß und hüpft über die Wiese? Ein Schneeball mit Schluckauf!',
  'Was macht der Schneemann im Sommer? Er schmilzt vor Freude!',
  'Warum hat der Weihnachtsmann einen Bart? Damit sein Kinn nicht friert!',
  'Was sagt der große Stern zum kleinen Stern? Du bist ja noch ein Sternchen!',
  'Was macht eine Kuh im Winter? Sie gibt heiße Schokolade! Muuuh!',
];
const MOVES = [
  'Spring fünf Mal wie ein Rentier!', 'Stapf durch den Schnee wie ein Schneemann!', 'Dreh dich wie eine Schneeflocke!',
  'Flieg wie ein Engel durchs Zimmer!', 'Mach dich ganz groß wie ein Tannenbaum!',
];
const STICKERS = Object.keys(PLUSH);
// Feste Reihenfolge der Überraschungen für die 24 Tage
const PLAN = ['star', 'sticker', 'move', 'joke', 'song', 'sticker', 'star', 'move', 'joke', 'outfit', 'sticker', 'move', 'star', 'joke', 'song', 'sticker', 'move', 'star', 'joke', 'sticker', 'move', 'song', 'star', 'big'];
const POS = [7, 15, 2, 21, 11, 18, 4, 23, 9, 13, 1, 20, 6, 16, 3, 24, 10, 14, 5, 22, 12, 17, 8, 19];

export function openAdvent(kid) {
  const a = kid.advent;
  const el = overlay(`<div class="advent card">
    <div class="adv-title">🎄</div>
    <div class="adv-grid">${POS.map((d) => `<button class="door ${a.opened[d] ? 'open' : ''} ${canOpenDoor(kid, d) ? '' : 'locked'}" data-d="${d}"><span class="num">${d}</span><span class="in">${a.opened[d] ? icon(d) : ''}</span></button>`).join('')}</div>
    <button class="btn round go adv-close" aria-label="Schließen">${ICON.close}</button></div>`, 'soft xmas');
  playMusic('weihnacht');
  say('Der Adventskalender! Welches Türchen ist heute dran?');
  el.querySelector('.adv-close').addEventListener('click', () => { sfx.tap(); el.remove(); playMusic('dorf'); });
  el.querySelectorAll('.door').forEach((b) => b.addEventListener('click', async () => {
    const d = +b.dataset.d;
    if (a.opened[d]) { sfx.pop(); surprise(kid, d, false); return; }
    if (!canOpenDoor(kid, d)) {
      sfx.wrong();
      b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
      const now = new Date();
      say(now.getMonth() === 11 ? `Noch ${d - now.getDate()} Mal schlafen!` : 'Morgen darfst du wieder ein Türchen öffnen!');
      return;
    }
    a.opened[d] = true; a.last = localDay(); save(true);
    b.classList.add('open', 'opening'); b.classList.remove('locked');
    b.querySelector('.in').innerHTML = icon(d);
    sfx.sparkle();
    await sleep(500);
    surprise(kid, d, true);
  }));
}

function icon(d) {
  const t = PLAN[d - 1];
  return { star: '⭐', sticker: '🧸', move: '🤸', joke: '😄', song: '🎵', outfit: '🎅', big: '🎁' }[t];
}

async function surprise(kid, d, fresh) {
  const t = PLAN[d - 1];
  const sticker = STICKERS[(d * 7) % STICKERS.length];
  let html = '', speak = '';
  if (t === 'star') { html = `<div class="sp-big">${ICON.star}</div>`; speak = fresh ? 'Zwei Sterne für dich!' : 'Hier waren zwei Sterne drin!'; if (fresh) addStars(kid, 2); }
  else if (t === 'sticker') { html = `<div class="sp-big jump">${plushSVG(sticker, { outfit: { hat: 'muetze' } })}</div>`; speak = `Ein Weihnachts-${PLUSH[sticker].art}! Wie süß!`; }
  else if (t === 'move') { const m = MOVES[d % MOVES.length]; html = `<div class="sp-big emoji">🦌</div><div class="sp-t">${m}</div>`; speak = m; }
  else if (t === 'joke') { const j = JOKES[d % JOKES.length]; html = `<div class="sp-big emoji">😄</div><div class="sp-t small">${j}</div>`; speak = j; }
  else if (t === 'song') { html = `<div class="sp-big dancing">${kidPlush(kid, { mood: 'happy', outfit: { ...kid.plushOutfit, hat: 'muetze' } })}</div>`; speak = 'Ein Weihnachtslied! Tanz mit!'; }
  else if (t === 'outfit') { html = `<div class="sp-big jump">${kidPlush(kid, { mood: 'happy', outfit: { ...kid.plushOutfit, hat: 'muetze', neck: 'schal' } })}</div>`; speak = `${kid.plushName} bekommt eine Weihnachtsmütze und einen Schal!`; if (fresh) { kid.plushOutfit = { ...kid.plushOutfit, hat: 'muetze', neck: 'schal' }; save(); } }
  else { html = `<div class="sp-big emoji">🎁</div>`; speak = `Frohe Weihnachten, ${kid.name}! Fünf Sterne für dich!`; if (fresh) { addStars(kid, 5); starRain(40, 'confetti'); } }
  const el = overlay(`<div class="card surprise">${html}<button class="btn round go" aria-label="Okay">${ICON.check}</button></div>`, 'soft');
  if (fresh) starRain(14, 'snow');
  say(speak);
  el.querySelector('.btn').addEventListener('click', () => { sfx.pop(); el.remove(); });
}

/** Geburtstagsfeier. firstTime: mit Geschenk */
export async function birthdayParty(kid, firstTime) {
  stopMusic();
  const fam = [FAMILY.papa, FAMILY.mama, FAMILY.omaAuerbach, FAMILY.opaAuerbach, FAMILY.omaMindelheim, FAMILY.opaMindelheim];
  const el = overlay(`<div class="bday">
    <div class="bday-bunting"></div>
    <div class="bday-t">🎉 ${kid.name} 🎉</div>
    <div class="bday-fam">${fam.map((f) => `<div class="f">${personSVG(f, { pose: 'wave', mood: 'laugh' })}</div>`).join('')}<div class="f cat">${baileySVG('sit')}</div></div>
    <div class="bday-mid"><div class="me jump">${personSVG({ ...kid.avatar, scale: 1, hat: 'krone', hatColor: '#ffd23f' }, { mood: 'laugh', pose: 'wave' })}</div>
      <svg class="cake" viewBox="0 0 300 260"><ellipse cx="150" cy="236" rx="140" ry="20" fill="#fff" stroke="#5a3e2b" stroke-width="5"/><path d="M40 140 V220 Q150 250 260 220 V140" fill="#ff9ccc" stroke="#5a3e2b" stroke-width="5"/><ellipse cx="150" cy="140" rx="110" ry="28" fill="#fff4f9" stroke="#5a3e2b" stroke-width="5"/>
        <path d="M40 170 Q150 196 260 170" stroke="#fff" stroke-width="8" fill="none"/>${[100, 150, 200].map((x, i) => `<g class="cdl" data-i="${i}"><rect x="${x - 7}" y="${70 - (i === 1 ? 10 : 0)}" width="14" height="66" rx="5" fill="${['#7cc4ff', '#ffd23f', '#8fdc6a'][i]}" stroke="#5a3e2b" stroke-width="4"/><path class="flame" d="M${x} ${32 - (i === 1 ? 10 : 0)} q12 18 0 32 q-12 -14 0 -32 Z" fill="#ffb703" stroke="#ff6b00" stroke-width="3"/></g>`).join('')}</svg>
      <div class="pl jump">${kidPlush(kid, { mood: 'happy', outfit: { ...kid.plushOutfit, hat: 'party' } })}</div></div>
    <div class="bday-action"></div></div>`, 'bday-ov');
  starRain(40, 'confetti');
  sfx.tada();
  await say(`Alles Gute zum Geburtstag, ${kid.name}! Wir alle singen für dich!`);
  const dur = playMelody(BIRTHDAY_SONG, 110);
  await sleep(dur + 300);
  await say('Jetzt die Kerzen auspusten! Tipp auf die Flammen!');
  let out = 0;
  await new Promise((res) => el.querySelectorAll('.cdl').forEach((c) => c.addEventListener('click', () => {
    const f = c.querySelector('.flame');
    if (!f) return;
    f.remove(); sfx.whoosh();
    if (++out === 3) res();
  })));
  starRain(30, 'confetti'); sfx.tada();
  await say('Hurra! Du darfst dir was wünschen!');
  const act = el.querySelector('.bday-action');
  if (firstTime) {
    act.innerHTML = `<button class="gift">🎁</button>`;
    say('Da ist ein Geschenk für dich! Tipp drauf!');
    await new Promise((res) => act.querySelector('.gift').addEventListener('click', res, { once: true }));
    act.querySelector('.gift').classList.add('opened');
    sfx.sparkle();
    kid.plushOutfit = { ...kid.plushOutfit, hat: 'party' };
    kid.birthdayDone = String(new Date().getFullYear());
    addStars(kid, 10);
    save(true);
    starRain(40);
    await say(`Zehn Sterne! Und ${kid.plushName} bekommt einen Partyhut!`);
  }
  act.innerHTML = `<button class="btn round big go" aria-label="Weiter">${ICON.check}</button>`;
  await new Promise((res) => act.querySelector('.btn').addEventListener('click', res, { once: true }));
  el.remove();
  document.dispatchEvent(new Event('playresume'));
}
