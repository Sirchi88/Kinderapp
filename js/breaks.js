// Bewegungspausen, Spielzeit-Messung und Tageslimit.
import { state, save, statFor, addStars, limitMinToday, localDay } from './store.js';
import { session } from './nav.js';
import { h, ICON, starRain, holdButton, sleep, esc } from './ui.js';
import { plushSVG } from './art/plush.js';
import { say, hush } from './speech.js';
import { sfx, playMusic, stopMusic, unlockAudio } from './audio.js';
import { requestMotion, sensorWorks, isStill, isMoving } from './motion.js';
import { buildBreakPlan } from './activities.js';
import { kidPlush } from './pet.js';
import { askPin } from './pin.js';
import { go } from './nav.js';

let active = null; // laufende Pause / Schlaf-Bildschirm

export const breakActive = () => !!active;

// ---------- Spielzeit ----------
export function startTimekeeper() {
  setInterval(() => {
    const k = session.kid;
    if (!k || session.paused || document.hidden || active) return;
    const st = statFor(k.id);
    st.sec++;
    k.sinceBreakSec++;
    save();
    const lim = limitMinToday(k);
    if (lim && st.sec >= lim * 60) { showSleep(k); return; }
    if (k.breaks.enabled && k.sinceBreakSec >= k.breaks.intervalMin * 60) {
      if (state.settings.breakMode === 'now' || !session.inRound) startBreak();
      else session.breakPending = true;
    }
  }, 1000);
}

/** Spiele melden hier das Ende einer Runde – dann darf eine wartende Pause starten. */
export function roundDone() {
  session.inRound = false;
  if (session.breakPending && !active) { session.breakPending = false; startBreak(); }
}

export function checkLimitNow(k) {
  const lim = limitMinToday(k);
  if (lim && statFor(k.id).sec >= lim * 60) { showSleep(k); return true; }
  return false;
}

const ZAHL = ['eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn'];

function parentSkip(root, onOk) {
  const lock = h(`<button class="parent-lock" aria-label="Eltern">${ICON.lock}</button>`);
  root.appendChild(lock);
  holdButton(lock, 1500, async () => { if (await askPin('Pause beenden?')) onOk(); });
}

// ---------- Bewegungspause ----------
export async function startBreak(opts = {}) {
  const kid = session.kid;
  if (!kid || active) return;
  hush();
  stopMusic();
  const root = h(`<div class="brk"><div class="rays"></div><div class="body"></div></div>`);
  document.getElementById('overlay-root').appendChild(root);
  const body = root.querySelector('.body');
  Object.assign(body.style, { position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' });
  let cancelled = false;
  const ctl = { cancel: () => (cancelled = true) };
  active = ctl;
  session.breakPending = false;
  const plush = kid.plush || 'baer';
  const pname = kid.plushName || '';

  const finish = (withStars) => {
    cancelled = true;
    stopMusic(); hush();
    kid.sinceBreakSec = 0;
    if (withStars) statFor(kid.id).breaks++;
    save(true);
    root.remove();
    active = null;
    document.dispatchEvent(new Event('playresume'));
  };
  parentSkip(root, () => finish(false));

  // 1) Ankündigung
  sfx.tada();
  body.innerHTML = `<div class="title">Bewegungspause!</div>
    <div class="hero"><div class="pl jump">${kidPlush(kid, { mood: 'happy' })}</div></div>
    <div class="sub">Leg mich ganz vorsichtig hin.</div>
    <div class="row"><button class="btn go big" aria-label="Okay">${ICON.check}</button></div>`;
  say(`${kid.name}, Zeit für eine Bewegungspause! Leg mich ganz vorsichtig hin.`);
  await new Promise((r) => body.querySelector('.btn').addEventListener('click', r, { once: true }));
  if (cancelled) return;
  unlockAudio();
  sfx.pop();
  let useSensor = false;
  if (state.settings.motionCheck) useSensor = await requestMotion();

  // 2) Gerät ablegen
  root.classList.add('still');
  body.innerHTML = `<div class="title">Leg mich hin!</div>
    <div class="hero"><div class="device"><div class="tbl"></div><div class="tab"></div></div><div class="pl">${kidPlush(kid, { mood: 'happy' })}</div></div>
    <div class="sub msg">Ganz still liegen lassen …</div>`;
  say('Leg mich auf den Tisch oder den Boden.');
  await sleep(1600);
  if (useSensor && sensorWorks()) {
    let stillFor = 0;
    while (!cancelled && stillFor < 2000) { await sleep(200); stillFor = isStill() ? stillFor + 200 : 0; }
  } else {
    for (let i = 3; i > 0 && !cancelled; i--) { body.querySelector('.msg').textContent = String(i); sfx.tick(); await sleep(1000); }
  }
  if (cancelled) return;
  root.classList.remove('still');
  sfx.sparkle();
  await say('Danke! Jetzt geht es los!');

  // 3) Aufgaben
  const plan = buildBreakPlan(state.settings, Math.max(30, state.settings.breakDurationMin * 60));
  const dots = plan.map(() => '<i></i>').join('');
  for (let idx = 0; idx < plan.length && !cancelled; idx++) {
    const a = plan[idx];
    root.classList.toggle('dance', !!a.music);
    body.innerHTML = `<div class="progress">${dots}</div>
      <div class="title">${esc(a.t)}</div>
      <div class="hero"><div class="emoji ${a.freeze ? '' : a.music ? 'spin' : ''}">${a.e}</div><div class="pl ${a.music ? 'dancing' : ''}">${kidPlush(kid, { mood: 'happy' })}</div></div>
      <div class="row"><div class="timer"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#fff" fill-opacity=".6" stroke="rgba(90,62,43,.15)" stroke-width="10"/><circle class="arc" cx="50" cy="50" r="42" fill="none" stroke="#ff9f1c" stroke-width="10" stroke-linecap="round" stroke-dasharray="264" stroke-dashoffset="0"/></svg><div class="n"></div></div>
      <div class="count"></div></div>`;
    [...body.querySelectorAll('.progress i')].forEach((d, i) => d.classList.add(i < idx ? 'done' : i === idx ? 'cur' : 'x'));
    const arc = body.querySelector('.arc'), num = body.querySelector('.n'), cnt = body.querySelector('.count'), plEl = body.querySelector('.pl'), title = body.querySelector('.title');
    await say(a.say);
    if (cancelled) return;
    if (a.music) playMusic('tanz');
    const total = a.count ? Math.max(a.sec, a.count * 1.8 + 3) : a.sec;
    let left = total;
    let nextFreeze = 5 + Math.random() * 4, frozen = 0, counted = 0, nextCount = 2;
    let lastT = performance.now();
    let liftedEl = null;
    while (left > 0 && !cancelled) {
      await sleep(100);
      const now = performance.now();
      const dt = Math.min(0.5, (now - lastT) / 1000);
      lastT = now;
      // Gerät hochgenommen?
      if (useSensor && sensorWorks() && isMoving() && !liftedEl) {
        stopMusic(false);
        liftedEl = h(`<div class="lifted"><div class="pl">${kidPlush(kid, { mood: 'sad' })}</div><div class="sub">Leg mich wieder hin!</div></div>`);
        root.appendChild(liftedEl);
        say(`Hey${pname ? '' : ''}! Leg mich wieder hin, ich will dir zuschauen!`);
      }
      if (liftedEl) {
        if (isStill()) { liftedEl.remove(); liftedEl = null; sfx.pop(); if (a.music && !frozen) playMusic('tanz'); }
        continue;
      }
      left -= dt;
      arc.style.strokeDashoffset = 264 * (1 - left / total);
      num.textContent = Math.max(0, Math.ceil(left));
      // Stopptanz
      if (a.freeze) {
        if (frozen > 0) {
          frozen -= dt;
          if (frozen <= 0) { title.textContent = 'Weiter tanzen!'; plEl.classList.add('dancing'); playMusic('tanz'); nextFreeze = 4 + Math.random() * 5; }
        } else if ((nextFreeze -= dt) <= 0 && left > 4) {
          stopMusic(false); frozen = 3; title.textContent = 'Einfrieren! 🧊'; plEl.classList.remove('dancing'); sfx.boing(); say('Einfrieren!');
        }
      }
      // Mitzählen
      if (a.count && counted < a.count && (nextCount -= dt) <= 0) {
        counted++; nextCount = 1.7;
        cnt.textContent = counted;
        sfx.tick();
        say(ZAHL[counted - 1] || String(counted), { rate: 1.1 });
      }
    }
    if (cancelled) return;
    stopMusic();
    sfx.star();
    if (idx < plan.length - 1) { const lob = ['Super!', 'Toll gemacht!', 'Klasse!', 'Wow!', 'Spitze!']; await say(lob[idx % lob.length]); }
  }
  if (cancelled) return;

  // 4) Geschafft
  root.classList.remove('dance');
  const n = state.settings.starsPerBreak;
  addStars(kid, n);
  starRain(30);
  sfx.tada();
  body.innerHTML = `<div class="title">Super gemacht, ${esc(kid.name)}!</div>
    <div class="hero"><div class="pl jump">${kidPlush(kid, { mood: 'happy' })}</div><div class="emoji">⭐</div></div>
    <div class="sub">+${n} Sterne</div>
    <div class="row"><button class="btn go big" aria-label="Weiterspielen">${ICON.play}</button></div>`;
  say(`Super gemacht, ${kid.name}! Du bekommst ${n} Sterne!`);
  await new Promise((r) => body.querySelector('.btn').addEventListener('click', r, { once: true }));
  finish(true);
}

// ---------- Tageslimit: Kuscheltier geht schlafen ----------
export function showSleep(kid) {
  if (active) return;
  hush();
  stopMusic();
  const stars = Array.from({ length: 14 }, () => `<span class="star" style="left:${Math.random() * 96}%;top:${Math.random() * 40}%;animation-delay:${Math.random() * 2}s">✦</span>`).join('');
  const root = h(`<div class="sleepy">${stars}
    <div class="bed"><div class="pl">${kidPlush(kid, { mood: 'sleep' })}</div><div class="frame"></div></div>
    <h2>Gute Nacht! Morgen spielen wir weiter.</h2></div>`);
  document.getElementById('overlay-root').appendChild(root);
  active = { cancel() {} };
  sfx.yawn();
  setTimeout(() => say(`${kid.plushName || 'Dein Kuscheltier'} ist müde und schläft jetzt. Morgen spielen wir weiter, ${kid.name}!`), 900);
  playMusic('ruhe');
  const lock = h(`<button class="parent-lock" aria-label="Eltern">${ICON.lock}</button>`);
  root.appendChild(lock);
  // Zurück zur Kinder-Auswahl (z. B. damit die Schwester spielen kann)
  const home = h(`<button class="btn round ghost" style="position:absolute;left:calc(16px + var(--safe-l));top:calc(14px + var(--safe-t))" aria-label="Kinder-Auswahl">${ICON.home}</button>`);
  root.appendChild(home);
  home.addEventListener('click', () => { sfx.tap(); stopMusic(); hush(); root.remove(); active = null; go('profiles'); });
  holdButton(lock, 1500, async () => {
    if (!(await askPin('Mehr Spielzeit freigeben?'))) return;
    const pick = h(`<div class="overlay"><div class="card" style="display:flex;flex-direction:column;gap:14px;align-items:center;font-weight:900;font-size:22px">
      Mehr Spielzeit für ${esc(kid.name)}:
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">
        <button class="btn" data-m="15">+15 Min</button><button class="btn" data-m="30">+30 Min</button><button class="btn sun" data-m="9999">Heute ohne Limit</button><button class="btn" data-m="0">Abbrechen</button>
      </div></div></div>`);
    document.getElementById('overlay-root').appendChild(pick);
    pick.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-m]');
      if (!b) return;
      const m = +b.dataset.m;
      pick.remove();
      if (!m) return;
      const today = localDay();
      if (kid.extraMinToday.day !== today) kid.extraMinToday = { day: today, min: 0 };
      kid.extraMinToday.min += m;
      save(true);
      stopMusic();
      root.remove();
      active = null;
      document.dispatchEvent(new Event('playresume'));
    });
  });
}
