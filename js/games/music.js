// Musik & Tanzen: Xylophon, Trommeln, Tierorchester, Lieder lernen, Tanz-Party.
import { register, session } from '../nav.js';
import { h, onTap, starRain, sleep } from '../ui.js';
import { gameShell, chooseLevel, winScreen, startRound } from './shell.js';
import { plushSVG, PLUSH } from '../art/plush.js';
import { baileySVG } from '../art/bailey.js';
import { personSVG } from '../art/person.js';
import { kidPlush } from '../pet.js';
import { say } from '../speech.js';
import { sfx, playMusic, stopMusic } from '../audio.js';

const BARS = [
  ['C5', '#ff4d4d'], ['D5', '#ff9f1c'], ['E5', '#ffd23f'], ['F5', '#8fdc4a'],
  ['G5', '#2fb3a0'], ['A5', '#4fa3ff'], ['B5', '#7c5cff'], ['C6', '#ff6fb5'],
];
// Traditionelle Kinderlieder (gemeinfrei) + ein eigenes Sirchhausen-Lied
const SONGS = [
  { name: 'Alle meine Entchen', icon: '🦆', notes: 'C5 D5 E5 F5 G5 G5 A5 A5 A5 A5 G5 A5 A5 A5 A5 G5 F5 F5 F5 F5 E5 E5 D5 D5 D5 D5 C5' },
  { name: 'Hänschen klein', icon: '🎒', notes: 'G5 E5 E5 F5 D5 D5 C5 D5 E5 F5 G5 G5 G5 G5 E5 E5 F5 D5 D5 C5 E5 G5 G5 C5' },
  { name: 'Das Sirchhausen-Lied', icon: '🏡', notes: 'C5 E5 G5 C6 G5 E5 F5 A5 G5 E5 D5 C5' },
];

const drumSVG = (body, top, ring) => `<svg viewBox="0 0 120 110"><ellipse cx="60" cy="88" rx="52" ry="14" fill="#000" opacity=".12"/><path d="M10 34 V78 Q60 102 110 78 V34" fill="${body}" stroke="#5a3e2b" stroke-width="4"/><path d="M10 50 Q60 74 110 50 M10 64 Q60 88 110 64" stroke="${ring}" stroke-width="4" fill="none"/><ellipse cx="60" cy="34" rx="50" ry="18" fill="${top}" stroke="#5a3e2b" stroke-width="4"/></svg>`;
const INSTRNAME = { kick: 'Große Trommel', snare: 'Kleine Trommel', tom1: 'Trommel', tom2: 'Tiefe Trommel', cymbal: 'Becken', cowbell: 'Kuhglocke', shaker: 'Rassel' };
const INSTR = [
  { id: 'kick', snd: () => sfx.kick(), svg: drumSVG('#ff6f6f', '#fff6e8', '#ffd23f'), big: true },
  { id: 'snare', snd: () => sfx.snare(), svg: drumSVG('#4fa3ff', '#fff6e8', '#fff') },
  { id: 'tom1', snd: () => sfx.tom(200), svg: drumSVG('#8fdc4a', '#fff6e8', '#fff') },
  { id: 'tom2', snd: () => sfx.tom(130), svg: drumSVG('#b68cff', '#fff6e8', '#fff') },
  { id: 'cymbal', snd: () => sfx.cymbal(), svg: `<svg viewBox="0 0 120 110"><path d="M60 30 V104" stroke="#8a8f99" stroke-width="5"/><ellipse cx="60" cy="30" rx="54" ry="12" fill="#ffd23f" stroke="#c99a10" stroke-width="4"/><ellipse cx="60" cy="28" rx="10" ry="4" fill="#e7b31e"/></svg>` },
  { id: 'cowbell', snd: () => sfx.bell(), svg: `<svg viewBox="0 0 120 110"><path d="M40 18 h40 v10 h-40 Z" fill="#8a6a3a" stroke="#5a3e2b" stroke-width="4"/><path d="M34 28 h52 l12 60 q-38 14 -76 0 Z" fill="#f5c542" stroke="#5a3e2b" stroke-width="4"/><circle cx="60" cy="92" r="7" fill="#8a6a10"/><path d="M48 40 l-4 36" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/></svg>` },
  { id: 'shaker', snd: () => sfx.shaker(), svg: `<svg viewBox="0 0 120 110"><rect x="54" y="60" width="12" height="44" rx="5" fill="#c98b55" stroke="#5a3e2b" stroke-width="4"/><ellipse cx="60" cy="40" rx="30" ry="36" fill="#ff9f1c" stroke="#5a3e2b" stroke-width="4"/><path d="M38 30 q22 -10 44 0 M36 46 q24 -10 48 0" stroke="#fff" stroke-width="5" fill="none"/></svg>` },
];
const ANIMALS = [
  { k: 'kuh', snd: 'moo', name: 'Muh!' }, { k: 'schaf', snd: 'baa', name: 'Mäh!' }, { k: 'schwein', snd: 'oink', name: 'Oink!' },
  { k: 'kueken', snd: 'peep', name: 'Piep piep!' }, { k: 'bailey', snd: 'meow', name: 'Miau!' }, { k: 'tukan', snd: 'squawk', name: 'Krah!' },
  { k: 'elefant', snd: 'trumpet', name: 'Töröö!' }, { k: 'loewe', snd: 'roar', name: 'Roaar!' },
];

register('music', (app) => {
  const kid = session.kid;
  const { el, body, right } = gameShell(app, { cls: 'music', back: 'house', music: null });
  stopMusic();
  right.innerHTML = `<div class="mtabs">${[['xylo', '🎹', 'Xylophon'], ['drums', '🥁', 'Schlagzeug'], ['animals', '🐮', 'Tierorchester'], ['songs', '🎶', 'Lieder lernen'], ['dance', '💃', 'Tanz-Party']].map(([k, i, n]) => `<button class="mtab" data-m="${k}" aria-label="${n}">${i}</button>`).join('')}</div>`;
  let cleanupMode = null;

  const xyloHTML = () => `<div class="xylo">${BARS.map(([n, c], i) => `<button class="bar" data-n="${n}" data-i="${i}" style="--c:${c};--h:${100 - i * 6}%"><i></i><i></i></button>`).join('')}</div>`;
  function bindXylo(root, onNote) {
    let down = false, lastBar = null;
    const hit = (bar) => {
      if (!bar || bar === lastBar) return;
      lastBar = bar;
      sfx.note(bar.dataset.n);
      bar.classList.remove('hit'); void bar.offsetWidth; bar.classList.add('hit');
      const r = bar.getBoundingClientRect();
      const n = h(`<span class="flynote" style="left:${r.left + r.width / 2}px;top:${r.top}px;color:${getComputedStyle(bar).getPropertyValue('--c')}">♪</span>`);
      document.body.appendChild(n); setTimeout(() => n.remove(), 1200);
      onNote?.(bar);
    };
    const x = root.querySelector('.xylo');
    x.addEventListener('pointerdown', (e) => { e.preventDefault(); down = true; lastBar = null; x.setPointerCapture(e.pointerId); hit(document.elementFromPoint(e.clientX, e.clientY)?.closest('.bar')); });
    x.addEventListener('pointermove', (e) => { if (down) hit(document.elementFromPoint(e.clientX, e.clientY)?.closest('.bar')); });
    const up = () => { down = false; lastBar = null; };
    x.addEventListener('pointerup', up); x.addEventListener('pointercancel', up);
  }

  const MODES = {
    xylo() {
      body.innerHTML = `<div class="stage">${xyloHTML()}</div>`;
      bindXylo(body);
      say('Das Xylophon! Tipp auf die bunten Stäbe oder wisch drüber!');
    },
    drums() {
      body.innerHTML = `<div class="stage drums">${INSTR.map((d) => `<button class="drum ${d.big ? 'big' : ''}" data-d="${d.id}" aria-label="${INSTRNAME[d.id]}">${d.svg}</button>`).join('')}</div>`;
      body.querySelectorAll('.drum').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        INSTR.find((d) => d.id === b.dataset.d).snd();
        b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
      }));
      say('Trommeln! Bumm, bumm, bumm!');
    },
    animals() {
      body.innerHTML = `<div class="stage animals">${ANIMALS.map((a) => `<button class="animal" data-k="${a.k}">${a.k === 'bailey' ? baileySVG('sit') : plushSVG(a.k)}</button>`).join('')}</div>`;
      body.querySelectorAll('.animal').forEach((b) => b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const a = ANIMALS.find((x) => x.k === b.dataset.k);
        sfx[a.snd]();
        b.classList.remove('jump'); void b.offsetWidth; b.classList.add('jump');
      }));
      say('Das Tierorchester! Welches Tier macht welches Geräusch?');
    },
    songs() {
      body.innerHTML = `<div class="stage songs">${SONGS.map((s, i) => `<button class="song" data-s="${i}" aria-label="${s.name}"><span>${s.icon}</span></button>`).join('')}</div>`;
      say('Welches Lied möchtest du lernen?');
      body.querySelectorAll('.song').forEach((b) => onTap(b, async () => {
        const song = SONGS[+b.dataset.s];
        const diff = await chooseLevel(kid, 'songs');
        learn(song, diff);
      }, { sound: 'pop' }));
    },
    dance() {
      body.innerHTML = `<div class="disco"><div class="ball"></div><div class="lights">${Array.from({ length: 14 }, (_, i) => `<i style="left:${(i * 37) % 100}%;top:${(i * 53) % 70}%;background:${BARS[i % 8][1]};animation-delay:${i * 0.2}s"></i>`).join('')}</div>
        <div class="dancers"><div class="me dancing">${personSVG({ ...kid.avatar, scale: 1 }, { mood: 'laugh', pose: 'wave' })}</div><div class="pl dancing">${kidPlush(kid, { mood: 'happy' })}</div><div class="cat dancing">${baileySVG('sit')}</div></div></div>`;
      playMusic('tanz');
      say('Tanz-Party! Alle tanzen mit!');
      const disco = body.querySelector('.disco');
      disco.addEventListener('pointerdown', () => { starRain(8, 'confetti'); sfx.pop(); });
      cleanupMode = () => stopMusic();
    },
  };

  async function learn(song, diff) {
    const notes = song.notes.split(' ');
    let idx = 0;
    startRound();
    body.innerHTML = `<div class="stage"><div class="song-title">${song.icon}</div><div class="song-dots">${notes.map(() => '<i></i>').join('')}</div>${xyloHTML()}</div>`;
    const bars = [...body.querySelectorAll('.bar')];
    const dots = [...body.querySelectorAll('.song-dots i')];
    const show = () => {
      bars.forEach((b) => { b.classList.remove('next', 'dim'); if (diff === 'leicht' && b.dataset.n !== notes[idx]) b.classList.add('dim'); });
      const nb = bars.find((b) => b.dataset.n === notes[idx]);
      nb?.classList.add('next');
      if (diff === 'schwer') setTimeout(() => nb?.classList.remove('next'), 700);
      dots.forEach((d, i) => d.classList.toggle('done', i < idx));
    };
    bindXylo(body, async (bar) => {
      if (idx >= notes.length) return;
      if (bar.dataset.n === notes[idx]) {
        idx++;
        if (idx === notes.length) {
          dots.forEach((d) => d.classList.add('done'));
          bars.forEach((b) => b.classList.remove('next', 'dim'));
          await sleep(500);
          // Belohnung: das ganze Lied vorspielen
          for (const n of notes) { sfx.note(n); const b = bars.find((x) => x.dataset.n === n); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit'); await sleep(330); }
          const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: `Du kannst „${song.name}“!` });
          if (r === 'again') learn(song, diff); else MODES.songs();
          return;
        }
        show();
      } else if (diff === 'schwer') {
        setTimeout(show, 300);
      }
    });
    await say(`${song.name}! Tipp immer auf den Stab, der leuchtet.`);
    show();
  }

  const setMode = (m) => {
    cleanupMode?.(); cleanupMode = null;
    right.querySelectorAll('.mtab').forEach((b) => b.classList.toggle('on', b.dataset.m === m));
    MODES[m]();
  };
  right.querySelectorAll('.mtab').forEach((b) => onTap(b, () => setMode(b.dataset.m), { sound: 'pop' }));
  setMode('xylo');
  return { cleanup() { cleanupMode?.(); stopMusic(); } };
});
