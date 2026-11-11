import { state, save } from '../store.js';
import { register, go, session } from '../nav.js';
import { h, ICON, onTap, holdButton, esc, kidColorDark } from '../ui.js';
import { personSVG } from '../art/person.js';
import { plushSVG } from '../art/plush.js';
import { say } from '../speech.js';
import { playMusic, unlockAudio } from '../audio.js';
import { askPin } from '../pin.js';
import { openParents } from './parents.js';
import { checkLimitNow } from '../breaks.js';
import { sirchHouseScene } from '../art/village.js';
import { kidPlush } from '../pet.js';

function bunting() {
  const cols = ['#ff8fa3', '#ffd23f', '#6fd3c7', '#b68cff', '#8fdc6a', '#ff9f1c'];
  let s = '<svg class="bunting" viewBox="0 0 1000 70" preserveAspectRatio="none"><path d="M0 10 Q500 50 1000 10" stroke="#8a6a52" stroke-width="3" fill="none"/>';
  for (let i = 0; i < 20; i++) {
    const x = 25 + i * 50, y = 10 + 40 * (1 - Math.pow((x - 500) / 500, 2)) * 1;
    s += `<path d="M${x - 16} ${y - 2} L${x + 16} ${y - 2} L${x} ${y + 30} Z" fill="${cols[i % cols.length]}"/>`;
  }
  return s + '</svg>';
}

register('profiles', (app) => {
  session.kid = null;
  session.paused = true;
  const el = h(`<div class="screen profiles"><svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">${sirchHouseScene()}</svg><div class="bg-veil"></div>${bunting()}
    <h1>Wer spielt heute?</h1>
    <div class="profile-row">
      ${state.kids.map((k) => `<button class="profile-card" data-id="${k.id}" style="--kid:${k.color};--kid-d:${kidColorDark(k.color)}">
        ${k.avatar ? `<div class="avatar">${personSVG({ ...k.avatar, scale: 1 }, { pose: 'wave' })}</div>${k.plush ? `<div class="pl">${kidPlush(k)}</div>` : ''}` : `<div class="question">?</div>`}
        <div class="stars">${ICON.star}${k.stars}</div>
        <div class="name">${esc(k.name)}</div></button>`).join('')}
    </div>
    <button class="parent-lock" aria-label="Elternbereich">${ICON.lock}</button>
  </div>`);
  app.appendChild(el);

  el.querySelectorAll('.profile-card').forEach((card) => onTap(card, () => {
    const kid = state.kids.find((k) => k.id === card.dataset.id);
    session.kid = kid;
    card.classList.add('jump');
    if (!kid.avatar) { go('editor', { first: true }); return; }
    if (!kid.plush) { go('plushpick', { first: true }); return; }
    go('village', { greet: true });
    checkLimitNow(kid);
  }, { sound: 'pop' }));

  holdButton(el.querySelector('.parent-lock'), 1500, async () => { if (await askPin()) openParents(); });

  // Begrüßung beim ersten Tippen irgendwo (Audio braucht eine Berührung)
  let greeted = false;
  const greet = () => {
    if (greeted) return;
    greeted = true;
    unlockAudio();
    playMusic('dorf');
    say('Servus! Wer spielt heute?');
  };
  el.addEventListener('pointerdown', greet, { once: true });
  if (window.__audioUnlocked) greet();
  return { cleanup() {} };
});
