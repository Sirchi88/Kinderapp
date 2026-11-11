// Geräusche & Musik – alles selbst erzeugt (WebAudio), funktioniert offline.
import { state } from './store.js';

let ctx = null, master, sfxBus, musicBus, noiseBuf;

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
    sfxBus = ctx.createGain(); sfxBus.connect(master);
    musicBus = ctx.createGain(); musicBus.connect(master);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    applyVolumes();
  }
  if (ctx.state === 'suspended') ctx.resume();
}

export function applyVolumes() {
  if (!ctx) return;
  sfxBus.gain.value = state.settings.sfx;
  musicBus.gain.value = state.settings.music * duck;
}

let duck = 1;
export function duckMusic(on) {
  duck = on ? 0.35 : 1;
  if (ctx) musicBus.gain.setTargetAtTime(state.settings.music * duck, ctx.currentTime, 0.15);
}

const NOTES = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
export function hz(n) {
  if (typeof n === 'number') return n;
  const m = /^([A-G])(#|b)?(\d)$/.exec(n);
  let semi = NOTES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3]) - 4) * 12;
  return 440 * Math.pow(2, semi / 12);
}

function tone(freq, t, dur, { type = 'triangle', gain = 0.2, bus = sfxBus, attack = 0.005, slideTo = null, filter = null } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(hz(freq), t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(hz(slideTo), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (filter) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filter; o.connect(f); node = f; }
  node.connect(g); g.connect(bus);
  o.start(t); o.stop(t + dur + 0.05);
}

function noise(t, dur, { gain = 0.2, type = 'lowpass', freq = 1000, bus = sfxBus, q = 1 } = {}) {
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true;
  const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + dur + 0.05);
  return { src: s, gain: g };
}

export const sfx = {
  pop() { if (!ctx) return; const t = ctx.currentTime; tone(520, t, 0.12, { type: 'sine', gain: 0.25, slideTo: 900 }); },
  tap() { if (!ctx) return; tone(880, ctx.currentTime, 0.06, { type: 'sine', gain: 0.12 }); },
  boing() { if (!ctx) return; const t = ctx.currentTime; tone(180, t, 0.35, { type: 'sine', gain: 0.3, slideTo: 520 }); },
  sparkle() { if (!ctx) return; const t = ctx.currentTime; ['E6', 'G6', 'B6', 'E7'].forEach((n, i) => tone(n, t + i * 0.06, 0.25, { type: 'sine', gain: 0.12 })); },
  star() { if (!ctx) return; const t = ctx.currentTime; ['C6', 'E6', 'G6', 'C7'].forEach((n, i) => tone(n, t + i * 0.08, 0.4, { type: 'triangle', gain: 0.14 })); },
  tada() { if (!ctx) return; const t = ctx.currentTime; ['C5', 'E5', 'G5'].forEach((n) => tone(n, t, 0.18, { gain: 0.12 })); ['C5', 'E5', 'G5', 'C6'].forEach((n) => tone(n, t + 0.2, 0.9, { gain: 0.12 })); },
  giggle() { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < 4; i++) tone(700 + i * 60, t + i * 0.09, 0.08, { type: 'sine', gain: 0.15, slideTo: 1000 + i * 60 }); },
  whoosh() { if (!ctx) return; const t = ctx.currentTime; const n = noise(t, 0.5, { gain: 0.15, type: 'bandpass', freq: 600, q: 0.8 }); },
  splash() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.4, { gain: 0.2, type: 'highpass', freq: 1500 }); tone(300, t, 0.2, { type: 'sine', gain: 0.15, slideTo: 900 }); },
  bell() { if (!ctx) return; const t = ctx.currentTime; for (const [f, g] of [[620, 0.12], [930, 0.06], [1460, 0.04]]) { tone(f, t, 1.2, { type: 'sine', gain: g }); tone(f, t + 0.25, 1.0, { type: 'sine', gain: g * 0.8 }); } },
  moo() {
    if (!ctx) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(150, t); o.frequency.linearRampToValueAtTime(175, t + 0.3); o.frequency.linearRampToValueAtTime(120, t + 1.1);
    f.type = 'lowpass'; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(900, t + 0.4); f.frequency.linearRampToValueAtTime(350, t + 1.1);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.15); g.gain.setValueAtTime(0.25, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); o.stop(t + 1.3);
    setTimeout(() => sfx.bell(), 500);
  },
  meow() { if (!ctx) return; const t = ctx.currentTime; tone(600, t, 0.5, { type: 'triangle', gain: 0.15, slideTo: 900, filter: 1800 }); tone(900, t + 0.25, 0.35, { type: 'triangle', gain: 0.1, slideTo: 500, filter: 1800 }); },
  purr() {
    if (!ctx) return; const t = ctx.currentTime;
    const n = noise(t, 1.6, { gain: 0.3, type: 'lowpass', freq: 260 });
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 24; lg.gain.value = 0.25;
    lfo.connect(lg); lg.connect(n.gain.gain); lfo.start(t); lfo.stop(t + 1.6);
  },
  rattle() { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < 6; i++) noise(t + i * 0.07, 0.05, { gain: 0.2, type: 'highpass', freq: 3500 }); },
  yawn() { if (!ctx) return; const t = ctx.currentTime; tone(420, t, 1.0, { type: 'sine', gain: 0.15, slideTo: 200 }); },
  door() { if (!ctx) return; const t = ctx.currentTime; tone(220, t, 0.3, { type: 'square', gain: 0.04, slideTo: 300, filter: 700 }); },
  scrub() { if (!ctx) return; noise(ctx.currentTime, 0.09, { gain: 0.08, type: 'bandpass', freq: 2400 + Math.random() * 1500, q: 2 }); },
  chomp() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.06, { gain: 0.15, type: 'lowpass', freq: 900 }); tone(140, t, 0.08, { type: 'square', gain: 0.05, filter: 500 }); },
  note(n, inst = 'xylo') {
    if (!ctx) return; const t = ctx.currentTime;
    if (inst === 'xylo') { tone(n, t, 0.9, { type: 'sine', gain: 0.22 }); tone(hz(n) * 4, t, 0.12, { type: 'sine', gain: 0.05 }); tone(hz(n) * 2.76, t, 0.2, { type: 'sine', gain: 0.04 }); }
    else tone(n, t, 0.6, { type: 'triangle', gain: 0.16 });
  },
  kick() { if (!ctx) return; tone(160, ctx.currentTime, 0.35, { type: 'sine', gain: 0.6, slideTo: 40 }); },
  snare() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.18, { gain: 0.3, type: 'highpass', freq: 1500 }); tone(220, t, 0.1, { type: 'triangle', gain: 0.12 }); },
  tom(f = 140) { if (!ctx) return; tone(f, ctx.currentTime, 0.4, { type: 'sine', gain: 0.4, slideTo: f * 0.6 }); },
  cymbal() { if (!ctx) return; noise(ctx.currentTime, 1.1, { gain: 0.14, type: 'highpass', freq: 6000 }); },
  cowbell() { if (!ctx) return; const t = ctx.currentTime; tone(560, t, 0.5, { type: 'square', gain: 0.06, filter: 1800 }); tone(845, t, 0.5, { type: 'square', gain: 0.05, filter: 2000 }); },
  shaker() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.08, { gain: 0.15, type: 'highpass', freq: 5000 }); noise(t + 0.12, 0.08, { gain: 0.12, type: 'highpass', freq: 5000 }); },
  peep() { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < 3; i++) tone(2200, t + i * 0.13, 0.09, { type: 'sine', gain: 0.12, slideTo: 3000 }); },
  oink() { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < 2; i++) { tone(180, t + i * 0.22, 0.16, { type: 'sawtooth', gain: 0.12, slideTo: 140, filter: 900 }); noise(t + i * 0.22, 0.12, { gain: 0.08, type: 'bandpass', freq: 500, q: 3 }); } },
  baa() {
    if (!ctx) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(), l = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(380, t); o.frequency.linearRampToValueAtTime(330, t + 0.9);
    l.frequency.value = 9; lg.gain.value = 18; l.connect(lg); lg.connect(o.frequency);
    f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 1.5;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.08); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    o.connect(f); f.connect(g); g.connect(sfxBus); o.start(t); l.start(t); o.stop(t + 1); l.stop(t + 1);
  },
  squawk() { if (!ctx) return; const t = ctx.currentTime; tone(900, t, 0.18, { type: 'sawtooth', gain: 0.1, slideTo: 1400, filter: 2500 }); tone(1300, t + 0.2, 0.2, { type: 'sawtooth', gain: 0.08, slideTo: 800, filter: 2500 }); },
  trumpet() { if (!ctx) return; const t = ctx.currentTime; tone(300, t, 0.7, { type: 'sawtooth', gain: 0.12, slideTo: 520, filter: 1600 }); },
  roar() { if (!ctx) return; const t = ctx.currentTime; noise(t, 0.8, { gain: 0.25, type: 'lowpass', freq: 500 }); tone(110, t, 0.8, { type: 'sawtooth', gain: 0.1, slideTo: 70, filter: 400 }); },
  neigh() { if (!ctx) return; const t = ctx.currentTime; for (let i = 0; i < 5; i++) tone(900 - i * 60, t + i * 0.08, 0.1, { type: 'sawtooth', gain: 0.07, slideTo: 1100 - i * 80, filter: 2200 }); },
  tick() { if (!ctx) return; tone(1200, ctx.currentTime, 0.04, { type: 'sine', gain: 0.08 }); },
  wrong() { if (!ctx) return; const t = ctx.currentTime; tone(330, t, 0.18, { gain: 0.12 }); tone(262, t + 0.16, 0.3, { gain: 0.12 }); },
};

// ---------- Musik ----------
// Lieder: Melodie [Note|null, Schläge], Akkorde je Takt, Tempo
const SONGS = {
  dorf: {
    bpm: 96, swing: 0.08, inst: 'pluck',
    chords: ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'F', 'G', 'Em', 'Am', 'F', 'G', 'C', 'C'],
    melody: [
      ['E5', 1], ['G5', 0.5], ['E5', 0.5], ['D5', 1], ['C5', 1],
      ['A4', 1], ['C5', 0.5], ['E5', 0.5], ['A5', 1.5], [null, 0.5],
      ['F5', 1], ['A5', 0.5], ['F5', 0.5], ['E5', 1], ['D5', 1],
      ['D5', 0.5], ['E5', 0.5], ['F5', 0.5], ['G5', 0.5], ['G5', 1.5], [null, 0.5],
      ['E5', 1], ['G5', 0.5], ['E5', 0.5], ['D5', 1], ['C5', 1],
      ['A4', 1], ['C5', 0.5], ['E5', 0.5], ['A5', 1], ['G5', 1],
      ['F5', 0.5], ['E5', 0.5], ['D5', 1], ['A4', 1], ['D5', 1],
      ['B4', 1], ['D5', 1], ['G5', 2],
      ['A5', 1], ['G5', 0.5], ['F5', 0.5], ['C5', 1], ['F5', 1],
      ['G5', 1], ['F5', 0.5], ['E5', 0.5], ['D5', 2],
      ['E5', 1], ['D5', 0.5], ['E5', 0.5], ['G5', 1], ['B4', 1],
      ['C5', 1], ['E5', 1], ['A5', 2],
      ['A5', 1], ['G5', 0.5], ['F5', 0.5], ['E5', 1], ['C5', 1],
      ['D5', 1], ['E5', 0.5], ['D5', 0.5], ['B4', 2],
      ['C5', 1], ['E5', 1], ['G5', 1], ['E5', 1],
      ['C5', 3], [null, 1],
    ],
  },
  tanz: {
    bpm: 124, swing: 0, inst: 'bright', drums: true,
    chords: ['C', 'G', 'Am', 'F', 'C', 'G', 'F', 'G'],
    melody: [
      ['G5', 0.5], ['G5', 0.5], ['E5', 0.5], ['G5', 0.5], ['A5', 1], ['G5', 1],
      ['D5', 0.5], ['D5', 0.5], ['B4', 0.5], ['D5', 0.5], ['G5', 2],
      ['E5', 0.5], ['E5', 0.5], ['C5', 0.5], ['E5', 0.5], ['A5', 1], ['C6', 1],
      ['A5', 0.5], ['G5', 0.5], ['F5', 0.5], ['E5', 0.5], ['F5', 2],
      ['G5', 0.5], ['G5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 1], ['B5', 1],
      ['B5', 0.5], ['A5', 0.5], ['G5', 0.5], ['D5', 0.5], ['G5', 2],
      ['A5', 0.5], ['A5', 0.5], ['F5', 0.5], ['A5', 0.5], ['C6', 1], ['A5', 1],
      ['G5', 0.5], ['A5', 0.5], ['B5', 0.5], ['D6', 0.5], ['C6', 2],
    ],
  },
  weihnacht: {
    bpm: 100, swing: 0.06, inst: 'bell',
    chords: ['C', 'F', 'C', 'G', 'C', 'F', 'G', 'C'],
    melody: [
      ['E5', 1], ['G5', 1], ['C6', 1.5], ['B5', 0.5], ['A5', 1], ['F5', 1], ['A5', 2],
      ['G5', 1], ['E5', 1], ['C5', 1], ['E5', 1], ['D5', 3], [null, 1],
      ['E5', 1], ['G5', 1], ['C6', 1.5], ['B5', 0.5], ['A5', 1], ['C6', 1], ['A5', 2],
      ['G5', 1], ['B4', 1], ['D5', 1], ['F5', 1], ['C5', 3], [null, 1],
    ],
  },
  ruhe: {
    bpm: 70, swing: 0, inst: 'bell',
    chords: ['F', 'C', 'Dm', 'C', 'Bb', 'F', 'G', 'C'],
    melody: [
      ['A5', 2], ['C6', 2], ['G5', 2], ['E5', 2], ['F5', 2], ['A5', 2], ['G5', 4],
      ['F5', 2], ['D5', 2], ['C5', 2], ['F5', 2], ['D5', 2], ['B4', 2], ['C5', 4],
    ],
  },
};

const CHORD = {
  C: ['C3', 'C4', 'E4', 'G4'], Am: ['A2', 'A3', 'C4', 'E4'], F: ['F2', 'F3', 'A3', 'C4'], G: ['G2', 'G3', 'B3', 'D4'],
  Dm: ['D3', 'D4', 'F4', 'A4'], Em: ['E3', 'E4', 'G4', 'B4'], Bb: ['Bb2', 'Bb3', 'D4', 'F4'],
};

let current = null, timer = null;

function playNote(inst, f, t, dur, vel = 1) {
  if (inst === 'pluck') { tone(f, t, Math.min(dur, 0.9), { type: 'triangle', gain: 0.11 * vel, attack: 0.004 }); tone(hz(f) * 2, t, 0.25, { type: 'sine', gain: 0.03 * vel }); }
  else if (inst === 'bright') { tone(f, t, Math.min(dur, 0.5), { type: 'square', gain: 0.05 * vel, filter: 2600 }); tone(f, t, 0.3, { type: 'triangle', gain: 0.07 * vel }); }
  else { tone(f, t, 1.6, { type: 'sine', gain: 0.1 * vel }); tone(hz(f) * 3, t, 0.6, { type: 'sine', gain: 0.025 * vel }); tone(hz(f) * 4.2, t, 0.3, { type: 'sine', gain: 0.015 * vel }); }
}

function scheduleSong(song, startAt) {
  const beat = 60 / song.bpm;
  const totalBeats = song.chords.length * 4;
  // Melodie
  let b = 0;
  for (const [n, len] of song.melody) {
    if (n) {
      const sw = song.swing && b % 1 === 0.5 ? song.swing * beat : 0;
      playNoteBus(song.inst, n, startAt + b * beat + sw, len * beat);
    }
    b += len;
  }
  // Begleitung
  song.chords.forEach((c, bar) => {
    const notes = CHORD[c];
    const t0 = startAt + bar * 4 * beat;
    toneM(notes[0], t0, beat * 1.6, { type: 'sine', gain: 0.14 });
    toneM(notes[0], t0 + 2 * beat, beat * 1.6, { type: 'sine', gain: 0.12 });
    for (const off of song.drums ? [0.5, 1.5, 2.5, 3.5] : [1, 3]) {
      notes.slice(1).forEach((n, i) => toneM(n, t0 + off * beat + i * 0.012, beat * 0.6, { type: 'triangle', gain: 0.035 }));
    }
    if (song.drums) {
      for (let k = 0; k < 4; k++) {
        const tk = t0 + k * beat;
        toneM(150, tk, 0.18, { type: 'sine', gain: 0.35, slideTo: 45 });
        if (k % 2 === 1) noiseM(tk, 0.12, { gain: 0.12, type: 'bandpass', freq: 1800, q: 0.7 });
        noiseM(tk + beat / 2, 0.04, { gain: 0.05, type: 'highpass', freq: 7000 });
      }
    }
  });
  return startAt + totalBeats * beat;
}
const toneM = (f, t, d, o) => tone(f, t, d, { ...o, bus: musicBus });
const noiseM = (t, d, o) => noise(t, d, { ...o, bus: musicBus });
const playNoteBus = (inst, f, t, d) => {
  const save = sfxBus; sfxBus = musicBus; playNote(inst, f, t, d); sfxBus = save;
};

export function playMusic(name) {
  if (!ctx) return;
  if (current === name) return;
  stopMusic();
  current = name;
  const song = SONGS[name];
  if (!song) return;
  musicBus.gain.cancelScheduledValues(ctx.currentTime);
  musicBus.gain.setValueAtTime(0.0001, ctx.currentTime);
  musicBus.gain.exponentialRampToValueAtTime(Math.max(0.0001, state.settings.music * duck), ctx.currentTime + 1.2);
  let next = ctx.currentTime + 0.1;
  const loop = () => {
    if (current !== name) return;
    if (next - ctx.currentTime < 2) next = scheduleSong(song, next);
    timer = setTimeout(loop, 500);
  };
  loop();
}

export function stopMusic(fade = true) {
  current = null;
  clearTimeout(timer);
  if (!ctx) return;
  // Bereits eingeplante Töne über einen frischen Bus abschneiden
  const old = musicBus;
  if (fade) old.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2); else old.gain.value = 0;
  setTimeout(() => old.disconnect(), 800);
  musicBus = ctx.createGain(); musicBus.gain.value = state.settings.music * duck; musicBus.connect(master);
}

export const musicPlaying = () => current;

/** Einmalige Melodie (z. B. Geburtstagslied). notes: [[Note, Schläge], …] */
export function playMelody(notes, bpm = 100, inst = 'xylo') {
  if (!ctx) return 0;
  const beat = 60 / bpm;
  let t = ctx.currentTime + 0.1;
  for (const [n, len] of notes) {
    if (n) { tone(n, t, Math.min(1.2, len * beat * 1.2), { type: inst === 'xylo' ? 'sine' : 'triangle', gain: 0.2 }); tone(hz(n) * 2, t, 0.25, { type: 'sine', gain: 0.04 }); }
    t += len * beat;
  }
  return (t - ctx.currentTime) * 1000;
}

// Traditionelles Geburtstagslied (gemeinfrei)
export const BIRTHDAY_SONG = [['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2], ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2], ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]];
