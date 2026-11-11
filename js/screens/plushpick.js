// Kuscheltier aussuchen – es begleitet das Kind und wird sein Tamagotchi.
import { save } from '../store.js';
import { register, go, session } from '../nav.js';
import { h, ICON, onTap, starRain } from '../ui.js';
import { plushSVG, PLUSH, PLUSH_GROUPS, plushLabel } from '../art/plush.js';
import { say } from '../speech.js';
import { sfx, playMusic } from '../audio.js';

const SOUND = { rassel: 'rattle', kuh: 'moo', tukan: 'giggle', kueken: 'giggle', einhorn: 'sparkle', gelbi: 'boing' };

register('plushpick', (app, params) => {
  const kid = session.kid;
  session.paused = false;
  let sel = kid.plush || 'baer';
  const el = h(`<div class="screen plushpick">
    <div class="top">${params.first ? '' : `<button class="btn round" data-a="back" aria-label="Zurück">${ICON.back}</button>`}<div class="title">🧸</div></div>
    <div class="main">
      <div class="hero"><div class="big"></div><div class="nm"></div></div>
      <div class="grid">${PLUSH_GROUPS.map((g) => `<div class="grp">${g.label}</div>` + Object.entries(PLUSH).filter(([, p]) => p.group === g.id).map(([k]) => `<button class="cell" data-k="${k}" aria-label="${PLUSH[k].art}">${plushSVG(k)}</button>`).join('')).join('')}</div>
    </div>
    <div style="position:absolute;right:calc(18px + var(--safe-r));bottom:calc(16px + var(--safe-b))"><button class="btn round big go" data-a="ok" aria-label="Fertig">${ICON.check}</button></div>
  </div>`);
  app.appendChild(el);
  const big = el.querySelector('.big'), nm = el.querySelector('.nm');

  const show = (speak) => {
    el.querySelectorAll('.cell').forEach((c) => c.classList.toggle('on', c.dataset.k === sel));
    big.innerHTML = plushSVG(sel);
    big.classList.remove('jump'); void big.offsetWidth; big.classList.add('jump');
    const name = kid.plush === sel && kid.plushName ? kid.plushName : PLUSH[sel].name;
    nm.textContent = name;
    if (speak) say(plushLabel(sel, name) + '!');
  };

  el.querySelector('.grid').addEventListener('click', (e) => {
    const c = e.target.closest('.cell');
    if (!c) return;
    sel = c.dataset.k;
    sfx[SOUND[sel] || 'pop']();
    show(true);
  });
  big.addEventListener('click', () => { sfx.giggle(); show(false); say('Hihi, das kitzelt!'); });

  onTap(el.querySelector('[data-a=ok]'), () => {
    if (kid.plush !== sel) kid.plushName = PLUSH[sel].name;
    kid.plush = sel;
    save(true);
    starRain(18, 'heart');
    go('village', { greet: true, newPlush: params.first });
  }, { sound: 'tada' });
  const back = el.querySelector('[data-a=back]');
  if (back) onTap(back, () => go('village', {}));

  show(false);
  playMusic('dorf');
  setTimeout(() => say(params.first ? 'Jetzt such dir ein Kuscheltier aus! Es begleitet dich überall hin.' : 'Welches Kuscheltier soll dich begleiten?'), 300);
  return {};
});
