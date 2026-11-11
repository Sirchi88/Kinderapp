// Besuch bei Oma & Opa Auerbach oder Oma & Opa Mindelheim.
import { register, go, goBack, session } from '../nav.js';
import { save, addStars, localDay } from '../store.js';
import { h, ICON, onTap, svgFloat, starRain, overlay } from '../ui.js';
import { personSVG, FAMILY } from '../art/person.js';
import { baileySVG } from '../art/bailey.js';
import { kidPlush, boost } from '../pet.js';
import { listDrawings, listPhotos } from '../media.js';
import { say } from '../speech.js';
import { sfx, playMusic, unlockAudio } from '../audio.js';
import { pick } from '../games/shell.js';

const OUT = '#5a3e2b';
const SW = `stroke="${OUT}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const nest = (x, y, w, hh, inner, cls = '', hot = '') => `<g class="${cls}" ${hot ? `data-hot="${hot}"` : ''}><svg x="${x}" y="${y}" width="${w}" height="${hh}" overflow="visible">${inner}</svg></g>`;

const HOMES = {
  auerbach: {
    title: 'Oma & Opa Auerbach', wall: '#e8f2df', pat: '#d4e6c6', sofa: '#c96f4a', a: FAMILY.omaAuerbach, b: FAMILY.opaAuerbach,
    linesA: (n) => [`Grüß di, ${n}! Magst du ein Stück Kuchen?`, `Komm her, mein Schatz, lass dich drücken!`, `Du bist aber groß geworden, ${n}!`, 'Soll ich dir eine Geschichte erzählen?'],
    linesB: (n) => [`Servus ${n}! Schön, dass du da bist!`, 'Weißt du, wie die Kuh macht? Muuuh!', 'Komm, wir gehen nachher spazieren!', `Gib mir fünf, ${n}!`],
    extra: { id: 'garden', icon: '🌻', say: 'Opa Auerbachs Blumen! Sie riechen so gut!' },
  },
  mindelheim: {
    title: 'Oma & Opa Mindelheim', wall: '#fbe9dc', pat: '#f3d6c2', sofa: '#5f8fc9', a: FAMILY.omaMindelheim, b: FAMILY.opaMindelheim,
    linesA: (n) => [`Hallo Schätzchen! Du siehst heute aber schick aus!`, `${n}, komm, wir machen uns hübsch!`, 'Ich hab dich sooo lieb!', 'Magst du Kuchen? Den hab ich extra gebacken!'],
    linesB: (n) => [`Grüß di, ${n}! Hilfst du mir auf der Baustelle?`, 'Ich hab einen Helm für dich! Komm, wir bauen was!', `Servus ${n}! Gib mir fünf!`, 'Hammer, Säge, Bohrmaschine! Brumm brumm!'],
    extra: { id: 'tools', icon: '🧰', say: 'Opas Werkzeugkiste! Auf zur Baustelle!', go: 'build' },
  },
};

register('visit', (app, params) => {
  const kid = session.kid;
  session.paused = false;
  const H = HOMES[params.who] || HOMES.auerbach;
  const el = h(`<div class="screen visit">
    <svg class="world" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      <defs><pattern id="vwp" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="${H.wall}"/><circle cx="18" cy="18" r="7" fill="${H.pat}"/><circle cx="52" cy="52" r="7" fill="${H.pat}"/><path d="M18 11 v-6 M52 45 v-6" stroke="${H.pat}" stroke-width="3"/></pattern>
      <pattern id="vfl" width="140" height="40" patternUnits="userSpaceOnUse"><rect width="140" height="40" fill="#d9a06c"/><path d="M0 39 H140 M70 0 V39" stroke="#b97f4c" stroke-width="3"/></pattern></defs>
      <rect width="1600" height="680" fill="url(#vwp)"/><rect y="660" width="1600" height="240" fill="url(#vfl)"/><rect y="650" width="1600" height="16" fill="#fff" stroke="#e0d4c0" stroke-width="3"/>
      <g ${SW}><rect x="120" y="140" width="300" height="240" rx="14" fill="#7a4a2c"/><rect x="136" y="156" width="268" height="208" rx="6" fill="#bfe8ff"/>
        <path d="M136 300 L210 220 L270 270 L330 200 L404 290 V364 H136 Z" fill="#a9c3dc"/><path d="M210 220 l-20 22 l10 -2 l10 8 l10 -8 l10 2 Z M330 200 l-18 22 l10 -2 l8 8 l8 -8 l10 2 Z" fill="#fff" stroke="none"/><path d="M136 330 Q270 300 404 330 V364 H136 Z" fill="#9edb6e"/>
        <path d="M270 156 V364 M136 260 H404" stroke="#7a4a2c" stroke-width="8"/></g>
      <path d="M110 130 q160 50 320 0 v34 q-160 36 -320 0 Z" fill="#ff9fb2" ${SW}/>
      <g class="hot" data-hot="clock" transform="translate(560 160)"><path d="M-70 40 L0 -40 L70 40 Z" fill="#8a5530" ${SW}/><rect x="-56" y="36" width="112" height="120" rx="10" fill="#a96a42" ${SW}/><circle cy="96" r="38" fill="#fff8e7" ${SW}/>
        <path d="M0 96 V70 M0 96 L18 104" stroke="${OUT}" stroke-width="5"/><rect class="cuckoo-door" x="-16" y="4" width="32" height="28" fill="#6b4226" ${SW}/><g class="cuckoo" transform="translate(0 18)"><ellipse rx="14" ry="11" fill="#ffd23f" ${SW}/><path d="M12 -2 l12 3 l-12 4 Z" fill="#ff8a3d"/><circle cx="4" cy="-3" r="2.5" fill="#2a1d14"/></g>
        <path d="M-20 156 V230 M20 156 V250" stroke="#8a8f99" stroke-width="3"/><path d="M-30 230 h20 l-4 30 h-12 Z M10 250 h20 l-4 30 h-12 Z" fill="#7a4a2c"/></g>
      <g class="hot" data-hot="photo" transform="translate(880 150)"><rect width="210" height="170" rx="10" fill="#c98b55" ${SW}/><rect x="16" y="16" width="178" height="138" fill="#fff"/><g class="pic"></g></g>
      <g class="hot" data-hot="radio" transform="translate(1340 520)"><rect x="-80" y="0" width="160" height="110" rx="16" fill="#ff8a3d" ${SW}/><circle cx="-34" cy="54" r="30" fill="#2f3238" ${SW}/><rect x="10" y="26" width="54" height="22" rx="6" fill="#fff6c9" ${SW}/><circle cx="22" cy="78" r="8" fill="#fff" ${SW}/><circle cx="50" cy="78" r="8" fill="#fff" ${SW}/><path d="M-50 0 L-70 -50" stroke="${OUT}" stroke-width="5"/>
        <rect x="-100" y="110" width="200" height="140" rx="10" fill="#a96a42" ${SW}/></g>
      <g ${SW}><rect x="250" y="520" width="520" height="130" rx="40" fill="${H.sofa}"/><rect x="220" y="470" width="80" height="190" rx="34" fill="${H.sofa}"/><rect x="720" y="470" width="80" height="190" rx="34" fill="${H.sofa}"/><rect x="290" y="440" width="440" height="110" rx="34" fill="${H.sofa}"/></g>
      <g class="hot" data-hot="cake" transform="translate(1000 640)"><rect x="-160" y="-20" width="320" height="24" rx="10" fill="#c98b55" ${SW}/><rect x="-140" y="4" width="16" height="120" fill="#a96a42"/><rect x="124" y="4" width="16" height="120" fill="#a96a42"/>
        <ellipse cx="-40" cy="-26" rx="70" ry="14" fill="#fff" ${SW}/><path d="M-90 -30 V-80 Q-40 -100 10 -80 V-30" fill="#e8b36a" ${SW}/><ellipse cx="-40" cy="-82" rx="50" ry="14" fill="#fffaf2" ${SW}/>${[-70, -50, -30, -10].map((x) => `<circle cx="${x}" cy="-90" r="7" fill="#e94e4e"/>`).join('')}
        <g transform="translate(80 -40)"><path d="M-22 -20 h44 l-6 40 h-32 Z" fill="#fff" ${SW}/><path d="M22 -10 q16 0 12 14 q-4 8 -14 6" fill="none" ${SW}/><path d="M-10 -32 q6 -10 0 -18 M6 -34 q6 -10 0 -18" stroke="#ccc" stroke-width="3" fill="none"/></g></g>
      <g class="hot" data-hot="extra" transform="translate(180 560)"><circle r="44" fill="#fffdf7" ${SW}/><text y="16" text-anchor="middle" font-size="48">${H.extra.icon}</text></g>
      <g id="people"></g><g id="vfx"></g>
    </svg>
    <div class="game-top"><button class="btn round ghost g-back" aria-label="Zurück">${ICON.back}</button><span class="spacer"></span><div class="visit-title">${H.title}</div></div>
  </div>`);
  app.appendChild(el);
  const world = el.querySelector('svg'), people = world.querySelector('#people'), vfx = world.querySelector('#vfx');
  const drawPeople = (mood = 'happy', dance = false) => {
    people.innerHTML = nest(330, 300, 190, 278, personSVG(H.a, { mood, pose: mood === 'laugh' ? 'wave' : 'stand' }), `hot ${dance ? 'dancing' : ''}`, 'a') +
      nest(500, 290, 190, 278, personSVG(H.b, { mood, pose: mood === 'laugh' ? 'wave' : 'stand' }), `hot ${dance ? 'dancing' : ''}`, 'b') +
      nest(800, 470, 150, 219, personSVG({ ...kid.avatar, scale: 0.8 }, { mood: 'laugh' }), dance ? 'dancing' : '') +
      nest(930, 560, 110, 112, kidPlush(kid), dance ? 'dancing' : '') +
      (params.who === 'auerbach' ? nest(560, 540, 140, 72, baileySVG('sleep')) : '');
  };
  drawPeople();
  // Bild an der Wand: zuletzt gemaltes Bild oder ein Familienfoto
  Promise.all([listDrawings(), listPhotos()]).then(([dr, ph]) => {
    const mine = dr.filter((d) => d.kid === kid.id).pop();
    const img = mine?.data || (ph.length ? pick(ph).data : null);
    world.querySelector('.pic').innerHTML = img ? `<image href="${img}" x="16" y="16" width="178" height="138" preserveAspectRatio="xMidYMid slice"/>` : `<svg x="16" y="16" width="178" height="138">${personSVG({ ...kid.avatar, scale: 1 }, { crop: 'head' })}</svg>`;
    world.querySelector('[data-hot=photo]').dataset.src = img || '';
    world.querySelector('[data-hot=photo]').dataset.mine = mine ? '1' : '';
  });
  onTap(el.querySelector('.g-back'), () => goBack('village'));
  world.addEventListener('click', (e) => {
    unlockAudio();
    const g = e.target.closest('[data-hot]');
    if (!g) return;
    const pt = world.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; const p = pt.matrixTransform(world.getScreenCTM().inverse());
    switch (g.dataset.hot) {
      case 'a': case 'b':
        sfx.giggle(); drawPeople('laugh'); setTimeout(() => drawPeople(), 2200);
        svgFloat(vfx, p.x, p.y - 80, '❤️', 3);
        say(pick(g.dataset.hot === 'a' ? H.linesA(kid.name) : H.linesB(kid.name)));
        boost(kid, 'love', 10);
        break;
      case 'cake':
        sfx.chomp(); setTimeout(() => sfx.chomp(), 250);
        svgFloat(vfx, p.x, p.y - 40, '😋', 2);
        boost(kid, 'hunger', 20);
        say(pick(['Mmmh, Omas Kuchen ist der beste!', 'Lecker! Noch ein Stück?', 'Und ein Kakao dazu!']));
        break;
      case 'clock': {
        const c = g.querySelector('.cuckoo');
        c.classList.remove('out'); void c.getBBox(); c.classList.add('out');
        sfx.note('E6', 'soft'); setTimeout(() => sfx.note('C6', 'soft'), 350); setTimeout(() => { sfx.note('E6', 'soft'); setTimeout(() => sfx.note('C6', 'soft'), 350); }, 900);
        say('Kuckuck! Kuckuck!');
        break;
      }
      case 'radio':
        sfx.pop();
        if (g.classList.toggle('on')) { playMusic('tanz'); drawPeople('laugh', true); say('Musik! Alle tanzen!'); }
        else { playMusic('dorf'); drawPeople(); }
        break;
      case 'photo': {
        const src = g.dataset.src;
        if (!src) { say('Mal doch ein Bild für Oma und Opa! An der Staffelei!'); break; }
        const o = overlay(`<img class="bigpic" src="${src}" alt="">`);
        o.addEventListener('click', () => o.remove());
        say(g.dataset.mine ? 'Das hast du gemalt! Oma und Opa haben es aufgehängt!' : 'Ein schönes Foto von euch!');
        break;
      }
      case 'extra':
        sfx.sparkle(); say(H.extra.say);
        if (H.extra.go) setTimeout(() => go(H.extra.go, {}), 1400); else svgFloat(vfx, p.x, p.y - 40, '🌸', 3);
        break;
    }
  });
  playMusic('dorf');
  const first = kid.lastVisit?.[params.who] !== localDay();
  kid.lastVisit ??= {};
  kid.lastVisit[params.who] = localDay(); save();
  setTimeout(() => {
    say(pick(H.linesA(kid.name)));
    if (first) setTimeout(() => { addStars(kid, 1); starRain(14, 'heart'); }, 1500);
  }, 400);
  return {};
});
