// Charakter-Editor: jedes Kind gestaltet seine eigene Figur.
import { save } from '../store.js';
import { register, go, session } from '../nav.js';
import { h, ICON, onTap, colorName } from '../ui.js';
import { personSVG, SKIN, HAIR, EYES, CLOTH, HAIR_STYLES, TOPS, BOTTOMS, ACCESSORIES, defaultKidAvatar, randomAvatar } from '../art/person.js';
import { say } from '../speech.js';
import { sfx, playMusic } from '../audio.js';
import { state } from '../store.js';

const NAMES = {
  kurz: 'Kurze Haare', wuschel: 'Wuschelkopf', lang: 'Lange Haare', zoepfe: 'Zöpfe', pferdeschwanz: 'Pferdeschwanz', dutt: 'Dutt', bob: 'Bob', locken: 'Locken',
  tshirt: 'T-Shirt', ringel: 'Ringelshirt', kleid: 'Kleid', hoodie: 'Kapuzenpulli', latzhose: 'Latzhose', pulli: 'Pulli',
  hose: 'Hose', jeans: 'Jeans', shorts: 'Kurze Hose', rock: 'Rock', leggings: 'Leggings',
  keins: 'Nichts', schleife: 'Schleife', krone: 'Krone', blume: 'Blume', haarreif: 'Haarreif', muetze: 'Mütze', kappe: 'Kappe', fluegel: 'Feenflügel', tasche: 'Tasche', brille: 'Brille',
};
const SHOE = ['#ff6f91', '#ffb86b', '#ffe066', '#8fdc6a', '#7cc4ff', '#9b8cff', '#ffffff', '#2f3238', '#c94f4f', '#8a5530'];

const CATS = [
  { id: 'skin', icon: '🙂', say: 'Hautfarbe', type: 'swatch', key: 'skin', values: SKIN, extra: true },
  { id: 'hair', icon: '💇', say: 'Frisur', type: 'variant', key: 'hair', values: HAIR_STYLES, crop: 'head' },
  { id: 'hairColor', icon: '🎨', say: 'Haarfarbe', type: 'swatch', key: 'hairColor', values: HAIR },
  { id: 'eyes', icon: '👀', say: 'Augenfarbe', type: 'swatch', key: 'eyes', values: EYES },
  { id: 'top', icon: '👕', say: 'Oberteil', type: 'variant', key: 'top', values: TOPS.filter((t) => t !== 'steppjacke'), crop: 'body' },
  { id: 'topColor', icon: '🌈', say: 'Farbe vom Oberteil', type: 'swatch', key: 'topColor', values: CLOTH },
  { id: 'bottom', icon: '👖', say: 'Hose oder Rock', type: 'variant', key: 'bottom', values: BOTTOMS, crop: 'legs' },
  { id: 'bottomColor', icon: '🖍️', say: 'Farbe von der Hose', type: 'swatch', key: 'bottomColor', values: CLOTH },
  { id: 'shoes', icon: '👟', say: 'Schuhe', type: 'swatch', key: 'shoes', values: SHOE },
  { id: 'accessory', icon: '🎀', say: 'Schmuck und Extras', type: 'variant', key: 'accessory', values: ACCESSORIES, crop: 'full' },
  { id: 'accColor', icon: '💝', say: 'Farbe vom Schmuck', type: 'swatch', key: 'accColor', values: CLOTH.concat(['#ffd23f']) },
];

register('editor', (app, params) => {
  const kid = session.kid;
  session.paused = false;
  const idx = state.kids.indexOf(kid);
  const av = { ...(kid.avatar || defaultKidAvatar(idx)) };
  let cat = CATS[1];

  const el = h(`<div class="screen editor" style="--kid:${kid.color}">
    <div class="tabs">${CATS.map((c) => `<button class="tab" data-c="${c.id}" aria-label="${c.say}">${c.icon}</button>`).join('')}</div>
    <div class="stage"><div class="mirror"></div><div class="me"></div></div>
    <div class="panel">
      <div class="opts"></div>
      <div class="bottom">
        <button class="btn round sun" data-a="dice" aria-label="Zufall">${ICON.dice}</button>
        <button class="btn round big go" data-a="ok" aria-label="Fertig">${ICON.check}</button>
      </div>
    </div></div>`);
  app.appendChild(el);
  const me = el.querySelector('.me'), opts = el.querySelector('.opts');

  const drawMe = (fx = true) => {
    me.innerHTML = personSVG({ ...av, scale: 1 }, { pose: 'stand', mood: fx ? 'laugh' : 'happy' });
    if (fx) {
      me.classList.remove('jump'); void me.offsetWidth; me.classList.add('jump');
      clearTimeout(drawMe.t); drawMe.t = setTimeout(() => (me.innerHTML = personSVG({ ...av, scale: 1 }, { pose: 'stand' })), 900);
    }
  };

  const drawOpts = () => {
    el.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', t.dataset.c === cat.id));
    let html = '';
    for (const v of cat.values) {
      const on = av[cat.key] === v ? 'on' : '';
      if (cat.type === 'swatch') html += `<button class="opt swatch ${on}" data-v="${v}" data-say="${colorName(v)}" style="--c:${v}"></button>`;
      else html += `<button class="opt ${on}" data-v="${v}" data-say="${NAMES[v] || ''}">${personSVG({ ...av, ...(cat.key === 'bottom' && av.top === 'kleid' ? { top: 'tshirt' } : {}), [cat.key]: v, scale: 1 }, { crop: cat.crop })}</button>`;
    }
    if (cat.extra) {
      html += `<button class="opt ${av.freckles ? 'on' : ''}" data-x="freckles" data-say="Sommersprossen">${personSVG({ ...av, freckles: true, scale: 1 }, { crop: 'head' })}</button>`;
      html += `<button class="opt ${!av.freckles ? 'on' : ''}" data-x="nofreckles" data-say="Keine Sommersprossen">${personSVG({ ...av, freckles: false, scale: 1 }, { crop: 'head' })}</button>`;
    }
    opts.innerHTML = html;
    opts.scrollTop = 0;
  };

  el.querySelectorAll('.tab').forEach((t) => onTap(t, () => {
    cat = CATS.find((c) => c.id === t.dataset.c);
    drawOpts();
    say(cat.say);
  }));

  opts.addEventListener('click', (e) => {
    const b = e.target.closest('.opt');
    if (!b) return;
    if (b.dataset.x) av.freckles = b.dataset.x === 'freckles';
    else av[cat.key] = b.dataset.v;
    // Wer eine Hose oder einen Rock aussucht, soll sie auch sehen: Kleid wird zum T-Shirt
    if (cat.key === 'bottom' && av.top === 'kleid') av.top = 'tshirt';
    if (cat.key === 'accessory' && b.dataset.v === 'fluegel') sfx.sparkle(); else sfx.pop();
    drawMe();
    drawOpts();
  });

  onTap(el.querySelector('[data-a=dice]'), () => {
    Object.assign(av, randomAvatar());
    sfx.boing();
    drawMe();
    drawOpts();
  }, { sound: null });

  onTap(el.querySelector('[data-a=ok]'), () => {
    kid.avatar = { ...av };
    save(true);
    if (params.first || !kid.plush) go('plushpick', { first: true });
    else go('village', {});
  }, { sound: 'tada' });

  drawMe(false);
  drawOpts();
  playMusic('dorf');
  setTimeout(() => say(params.first ? `Hallo ${kid.name}! Wie willst du aussehen? Such dir alles aus!` : 'Willst du dich umziehen?'), 300);
  return {};
});
