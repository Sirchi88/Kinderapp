// Gemeinsamer Rahmen für alle Spiele: Zurück-Knopf, Schwierigkeit wählen, Siegerbildschirm, Fortschritt.
import { save, addStars, state } from '../store.js';
import { go, session } from '../nav.js';
import { h, ICON, onTap, starRain, overlay, esc } from '../ui.js';
import { say } from '../speech.js';
import { sfx, playMusic } from '../audio.js';
import { roundDone } from '../breaks.js';
import { kidPlush } from '../pet.js';
import { personSVG } from '../art/person.js';

/** Erstellt den Spielbildschirm mit Zurück-Knopf. back: Ziel-Bildschirm */
export function gameShell(app, { cls = '', back = 'village', backParams = {}, music = 'dorf' } = {}) {
  const el = h(`<div class="screen game ${cls}">
    <div class="game-body"></div>
    <div class="game-top"><button class="btn round ghost g-back" aria-label="Zurück">${ICON.back}</button><span class="spacer"></span><div class="g-right"></div></div>
  </div>`);
  app.appendChild(el);
  onTap(el.querySelector('.g-back'), () => go(back, backParams));
  if (music) playMusic(music);
  session.paused = false;
  return { el, body: el.querySelector('.game-body'), right: el.querySelector('.g-right') };
}

/** Kinder wählen selbst: kleiner Stern = leicht, großer Stern = schwer */
export function chooseLevel(kid, game) {
  return new Promise((resolve) => {
    const last = kid.progress?.[game]?.last || 'leicht';
    const el = overlay(`<div class="level-pick">
      <button class="lv ${last === 'leicht' ? 'last' : ''}" data-l="leicht" aria-label="Leicht"><span class="st s1">${ICON.star}</span></button>
      <button class="lv ${last === 'schwer' ? 'last' : ''}" data-l="schwer" aria-label="Schwer"><span class="st s2">${ICON.star}</span><span class="st s2">${ICON.star}</span></button>
    </div>`, 'soft');
    say('Leicht oder schwer?');
    el.querySelectorAll('.lv').forEach((b) => onTap(b, () => {
      const l = b.dataset.l;
      kid.progress ??= {};
      kid.progress[game] ??= {};
      kid.progress[game].last = l;
      save();
      el.remove();
      resolve(l);
    }, { sound: 'pop' }));
  });
}

/** Stufe innerhalb von leicht/schwer (steigt mit jedem gewonnenen Spiel) */
export function getLevel(kid, game, diff) {
  return kid.progress?.[game]?.[diff] || 0;
}
export function levelUp(kid, game, diff, max = 99) {
  kid.progress ??= {};
  kid.progress[game] ??= {};
  kid.progress[game][diff] = Math.min(max, (kid.progress[game][diff] || 0) + 1);
  save();
}

/** Siegerbildschirm. Ergebnis: 'again' | 'home' */
export function winScreen(kid, { stars = 1, text = 'Super gemacht!', speak } = {}) {
  return new Promise((resolve) => {
    if (stars) addStars(kid, stars);
    starRain(26);
    sfx.tada();
    const el = overlay(`<div class="win">
      <div class="win-figs"><div class="me jump">${personSVG({ ...kid.avatar, scale: 1 }, { pose: 'wave', mood: 'laugh' })}</div><div class="pl jump">${kidPlush(kid, { mood: 'happy' })}</div></div>
      <div class="win-t">${esc(text)}</div>
      ${stars ? `<div class="win-stars">${Array.from({ length: stars }, () => `<span>${ICON.star}</span>`).join('')}</div>` : ''}
      <div class="win-btns"><button class="btn round big sun" data-r="again" aria-label="Nochmal">↻</button><button class="btn round big go" data-r="home" aria-label="Fertig">${ICON.check}</button></div>
    </div>`, 'soft');
    say(speak || `${text} ${stars ? `Du bekommst ${stars === 1 ? 'einen Stern' : stars + ' Sterne'}!` : ''}`);
    el.querySelectorAll('[data-r]').forEach((b) => onTap(b, () => { el.remove(); resolve(b.dataset.r); }, { sound: 'pop' }));
    // Eine wartende Bewegungspause darf jetzt kommen
    setTimeout(() => roundDone(), 2500);
  });
}

export const startRound = () => { session.inRound = true; };
export const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
