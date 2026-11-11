// Euer Haus von innen – wie ein Puppenhaus mit vier Zimmern.
import { register, go, session } from '../nav.js';
import { h, ICON, onTap, svgFloat } from '../ui.js';
import { personSVG, shade } from '../art/person.js';
import { baileySVG } from '../art/bailey.js';
import { kidPlush, petMood } from '../pet.js';
import { say } from '../speech.js';
import { sfx, playMusic, unlockAudio } from '../audio.js';

const OUT = '#5a3e2b';
const SW = `stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const nest = (x, y, w, hh, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${hh}" overflow="visible">${inner}</svg>`;

function win(x, y, w, hh) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="8" fill="#3d434c" ${SW}/><rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${hh - 14}" rx="4" fill="#bfe8ff"/>
    <path d="M${x + 7} ${y + hh - 30} q${w / 4} -24 ${w / 2} -6 t${w / 2 - 14} -4 V${y + hh - 7} H${x + 7} Z" fill="#9edb6e"/><circle cx="${x + w - 26}" cy="${y + 24}" r="9" fill="#ffd94a"/>
    <path d="M${x + w / 2} ${y + 7} V${y + hh - 7} M${x + 7} ${y + hh / 2} H${x + w - 7}" stroke="#3d434c" stroke-width="5"/></g>`;
}

function badge(x, y, emoji) {
  return `<g class="room-badge" transform="translate(${x} ${y})"><g class="rb-in"><circle r="40" fill="#fffdf7" ${SW}/><text y="15" text-anchor="middle" font-size="42">${emoji}</text></g></g>`;
}

export function houseScene(kid) {
  let s = `<defs>
    <pattern id="wp-kid" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#ffe3ec"/><path d="M15 12 l3 6 l6 1 l-5 4 l1 6 l-5 -3 l-5 3 l1 -6 l-5 -4 l6 -1 Z" fill="#fff" opacity=".9"/><circle cx="45" cy="42" r="4" fill="#ffc2d4"/></pattern>
    <pattern id="wp-bath" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#dff4ff"/><path d="M0 0 H40 V40" fill="none" stroke="#b9e2f7" stroke-width="3"/></pattern>
    <pattern id="wp-living" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#fff4dc"/><path d="M25 0 V50" stroke="#ffe7b3" stroke-width="10"/></pattern>
    <pattern id="wp-kitchen" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#eefbe6"/><circle cx="22" cy="22" r="5" fill="#d5f2c4"/></pattern>
    <pattern id="floorwood" width="80" height="20" patternUnits="userSpaceOnUse"><rect width="80" height="20" fill="#d9a06c"/><path d="M0 19 H80 M40 0 V19" stroke="#b97f4c" stroke-width="2"/></pattern>
    <linearGradient id="hsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e3f6ff"/></linearGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#hsky)"/>
  <path d="M-20 300 L140 170 L260 250 L400 130 L520 260 L1080 260 L1200 140 L1330 240 L1460 160 L1620 280 V900 H-20 Z" fill="#a9c3dc" opacity=".8"/>
  <rect x="-20" y="780" width="1640" height="140" fill="#8fd16a"/>`;
  // Hausrahmen mit Dachboden
  s += `<path d="M230 250 L800 60 L1370 250 Z" fill="#3e4249" ${SW}/>
    <rect x="260" y="240" width="1080" height="560" fill="#fbfaf6" ${SW}/>
    <path d="M292 242 L800 82 L1308 242 Z" fill="#f4e4c8"/>
    <path d="M330 230 L800 98 M1270 230 L800 98" stroke="#d9c29a" stroke-width="4"/>
    <circle cx="800" cy="140" r="24" fill="#bfe8ff" ${SW}/><path d="M800 116 V164 M776 140 H824" stroke="${OUT}" stroke-width="4"/>`;
  s += `<g class="room hot" data-room="ankleide"><path d="M300 240 L790 86 L790 240 Z" fill="#f7e2ee"/>
      <g ${SW}><rect x="560" y="150" width="150" height="90" rx="8" fill="#c98b55"/><path d="M635 150 V240"/><circle cx="626" cy="196" r="4" fill="#ffd23f"/><circle cx="644" cy="196" r="4" fill="#ffd23f"/>
        <path d="M566 154 L600 154 L600 236 L566 236 Z" fill="#ffd2e4"/><path d="M574 166 h20 l-4 30 h-12 Z" fill="#ff8fc8"/><path d="M578 200 h14 v26 h-14 Z" fill="#7cc4ff"/></g>
      <g transform="translate(470 236)" ${SW}><ellipse cx="0" cy="-40" rx="26" ry="36" fill="#d6f0ff"/><rect x="-4" y="-6" width="8" height="10" fill="#c98b55"/></g>
      ${badge(450, 170, '👗')}</g>`;
  s += `<g class="room hot" data-room="puzzle"><path d="M810 86 L810 240 L1040 240 L1040 159 Z" fill="#e6f4ff"/>
      <g ${SW}><rect x="870" y="196" width="40" height="40" rx="6" fill="#ff8fa3"/><path d="M910 210 a8 8 0 1 1 0 12" fill="#ff8fa3"/><rect x="930" y="206" width="40" height="30" rx="6" fill="#7cc4ff"/><path d="M950 206 a8 8 0 1 1 0 -0.1" fill="#7cc4ff"/></g>
      ${badge(940, 158, '🧩')}</g>`;
  s += `<g class="room hot" data-room="sortieren"><path d="M1040 159 L1040 240 L1300 240 Z" fill="#eefbe6"/>
      <g ${SW}><rect x="1110" y="208" width="100" height="30" rx="6" fill="#c98b55"/>${[0, 1, 2, 3].map((i) => `<rect x="${1116 + i * 24}" y="${190 - i * 0}" width="18" height="18" rx="4" fill="${['#ff6f6f', '#ffd23f', '#8fdc4a', '#7cc4ff'][i]}"/>`).join('')}</g>
      ${badge(1100, 168, '🔢')}</g>`;
  s += `<rect x="270" y="238" width="1060" height="10" fill="#e9e2d2"/><rect x="1036" y="156" width="8" height="84" fill="#e9e2d2"/><rect x="796" y="90" width="8" height="150" fill="#e9e2d2"/>`;
  // Zimmer
  s += `<g class="room hot" data-room="kinderzimmer"><rect x="280" y="260" width="510" height="250" fill="url(#wp-kid)"/><rect x="280" y="490" width="510" height="20" fill="url(#floorwood)"/>
      ${win(330, 290, 120, 110)}
      <g ${SW}><rect x="500" y="420" width="230" height="70" rx="12" fill="#c98b55"/><rect x="506" y="400" width="218" height="36" rx="14" fill="#ffb3c8"/><rect x="500" y="360" width="24" height="130" rx="8" fill="#a96a42"/><rect x="706" y="380" width="24" height="110" rx="8" fill="#a96a42"/><rect x="530" y="388" width="62" height="26" rx="12" fill="#fff"/>
        <path d="M600 410 q30 -14 60 0 q30 14 60 0" fill="none" stroke="#fff" stroke-width="5"/></g>
      <g ${SW}><rect x="330" y="420" width="120" height="70" rx="6" fill="#ffd94a"/><path d="M330 455 h120" /><circle cx="390" cy="438" r="5" fill="#a96a42"/><circle cx="390" cy="472" r="5" fill="#a96a42"/></g>
      <g transform="translate(470 470)"><path d="M0 0 l12 -26 l12 26 Z" fill="#7cc4ff" ${SW}/><circle cx="12" cy="-34" r="9" fill="#ff8fa3" ${SW}/></g>
      <ellipse cx="560" cy="500" rx="100" ry="12" fill="#c6a8ff" opacity=".7"/>
      <g id="pet-spot"></g>
      ${badge(740, 300, '🧸')}</g>`;
  s += `<g class="room hot" data-room="bad"><rect x="810" y="260" width="510" height="250" fill="url(#wp-bath)"/><rect x="810" y="490" width="510" height="20" fill="#e3e8ec"/>
      <g ${SW}><path d="M880 420 h260 v40 q0 34 -40 34 h-180 q-40 0 -40 -34 Z" fill="#fff"/><rect x="870" y="410" width="280" height="18" rx="9" fill="#f2f6f9"/><path d="M1120 410 v-70 q0 -16 16 -16 h14" fill="none" stroke-width="7"/><circle cx="1150" cy="326" r="9" fill="#ccd"/></g>
      <g fill="#fff" ${SW}><circle cx="920" cy="404" r="16"/><circle cx="946" cy="398" r="20"/><circle cx="978" cy="404" r="16"/><circle cx="1010" cy="400" r="18"/></g>
      <g class="tub-monster" transform="translate(1060 380)"><ellipse cx="0" cy="18" rx="38" ry="34" fill="#8fdc6a" ${SW}/><path d="M-24 -10 l-8 -22 l18 12 Z M24 -10 l8 -22 l-18 12 Z" fill="#ffd94a" ${SW}/><circle cx="0" cy="8" r="13" fill="#fff" ${SW}/><circle cx="2" cy="10" r="6" fill="#2a1d14"/><path d="M-14 30 q14 12 28 0" fill="#7a2f3a" ${SW}/><rect x="-6" y="30" width="6" height="7" fill="#fff"/></g>
      <g ${SW}><rect x="1180" y="350" width="90" height="16" rx="6" fill="#fff"/><path d="M1190 366 v124 h70 v-124" fill="#fff"/><ellipse cx="1225" cy="300" rx="38" ry="44" fill="#d6f0ff"/><rect x="1205" y="324" width="16" height="26" rx="4" fill="#7cc4ff"/><path d="M1208 300 l4 -26 M1216 302 l4 -24" stroke="#ff6f91" stroke-width="5"/></g>
      <g transform="translate(980 470)"><ellipse rx="16" ry="11" fill="#ffd23f" ${SW}/><circle cx="-10" cy="-12" r="9" fill="#ffd23f" ${SW}/><path d="M-20 -12 l-8 2 l8 3" fill="#ff9f1c"/></g>
      ${badge(860, 300, '🪥')}</g>`;
  s += `<g class="room hot" data-room="wohnzimmer"><rect x="280" y="530" width="510" height="250" fill="url(#wp-living)"/><rect x="280" y="760" width="510" height="20" fill="url(#floorwood)"/>
      ${win(320, 560, 110, 100)}
      <g ${SW}><rect x="460" y="660" width="250" height="70" rx="22" fill="#6fa8dc"/><rect x="450" y="620" width="40" height="110" rx="18" fill="#5a93c9"/><rect x="680" y="620" width="40" height="110" rx="18" fill="#5a93c9"/><rect x="480" y="600" width="210" height="70" rx="22" fill="#7cb6e8"/><rect x="470" y="728" width="12" height="22" fill="#a96a42"/><rect x="690" y="728" width="12" height="22" fill="#a96a42"/></g>
      <g transform="translate(330 690)">${['#ff6f6f', '#ffb86b', '#ffe066', '#9be37a', '#7cc4ff', '#b68cff'].map((c, i) => `<rect x="${i * 18}" y="${-i * 3}" width="15" height="${46 - i * 4}" rx="5" fill="${c}" ${SW}/>`).join('')}<rect x="-4" y="40" width="114" height="10" rx="4" fill="#a96a42" ${SW}/></g>
      <g transform="translate(740 650)" ${SW}><rect x="-14" y="0" width="40" height="40" rx="8" fill="#ff8a3d"/><circle cx="6" cy="20" r="11" fill="#2f3238"/><path d="M-4 0 l-10 -24" fill="none"/></g>
      <g class="notes">${['♪', '♫', '♪'].map((n, i) => `<text x="${520 + i * 60}" y="${590 - i * 6}" font-size="34" fill="#9b8cff" class="note n${i}">${n}</text>`).join('')}</g>
      <g id="sofa-cat"></g>
      ${badge(740, 570, '🎵')}</g>`;
  s += `<g class="room hot" data-room="kueche"><rect x="810" y="530" width="510" height="250" fill="url(#wp-kitchen)"/><rect x="810" y="760" width="510" height="20" fill="#e9d8bd"/>
      <g ${SW}><rect x="840" y="660" width="300" height="100" rx="8" fill="#fff"/><rect x="840" y="650" width="300" height="16" rx="6" fill="#c98b55"/><rect x="860" y="684" width="80" height="60" rx="8" fill="#3d434c"/><rect x="868" y="692" width="64" height="40" rx="5" fill="#ffb86b" opacity=".85"/><circle cx="1000" cy="700" r="8" fill="#ccc"/><circle cx="1030" cy="700" r="8" fill="#ccc"/>
        <rect x="1180" y="560" width="110" height="200" rx="14" fill="#e9f7ff"/><path d="M1180 640 h110" /><rect x="1270" y="590" width="8" height="30" rx="4" fill="#9aa"/><rect x="1270" y="660" width="8" height="40" rx="4" fill="#9aa"/>
        <rect x="860" y="560" width="120" height="60" rx="8" fill="#ffe7b3"/><path d="M920 560 v60" /></g>
      <g transform="translate(1060 640)" ${SW}><ellipse cx="0" cy="0" rx="44" ry="12" fill="#fff"/><rect x="-34" y="-36" width="68" height="36" rx="8" fill="#ff9ccc"/><path d="M-34 -24 q17 10 34 0 q17 10 34 0" fill="none" stroke="#fff" stroke-width="5"/><rect x="-3" y="-60" width="6" height="22" fill="#7cc4ff"/><path d="M0 -70 q-6 6 0 10 q6 -4 0 -10" fill="#ffb703"/></g>
      ${badge(1270, 600, '🧁')}</g>`;
  // Zwischenwände
  s += `<rect x="790" y="250" width="20" height="540" fill="#e9e2d2" ${SW}/><rect x="270" y="510" width="1060" height="20" fill="#e9e2d2" ${SW}/>`;
  s += `<g id="kid-spot"></g>`;
  return s;
}

const ROOMS = {
  kinderzimmer: { go: 'tamagotchi' },
  bad: { go: 'teeth' },
  wohnzimmer: { go: 'music' },
  kueche: { go: 'baking' },
  ankleide: { go: 'wardrobe' },
  puzzle: { go: 'puzzle' },
  sortieren: { go: 'sorting' },
};

register('house', (app) => {
  const kid = session.kid;
  session.paused = false;
  const el = h(`<div class="screen house">
    <svg class="world" viewBox="0 -50 1600 950" preserveAspectRatio="xMidYMid meet">${houseScene(kid)}</svg>
    <div class="game-top"><button class="btn round ghost g-back" aria-label="Zurück">${ICON.back}</button></div>
  </div>`);
  app.appendChild(el);
  const world = el.querySelector('svg');
  world.querySelector('#pet-spot').innerHTML = nest(560, 300, 120, 124, kidPlush(kid));
  world.querySelector('#sofa-cat').innerHTML = nest(540, 572, 120, 64, baileySVG('sleep'));
  world.querySelector('#kid-spot').innerHTML = nest(600, 580, 130, 190, personSVG({ ...kid.avatar, scale: 0.9 }, { pose: 'wave' }));

  onTap(el.querySelector('.g-back'), () => go('village', {}));
  world.addEventListener('click', (e) => {
    unlockAudio();
    const r = e.target.closest('[data-room]');
    if (!r) return;
    const room = ROOMS[r.dataset.room];
    sfx.pop();
    if (room.go) go(room.go, {});
    else { say(room.soon); svgFloat(world, 1060, 560, '🍪', 3); }
  });
  playMusic('dorf');
  const mood = petMood(kid);
  setTimeout(() => say(mood === 'sad' ? `${kid.plushName} ist traurig. Schau mal im Kinderzimmer nach!` : mood === 'sleep' ? `Psst, ${kid.plushName} ist müde.` : 'Willkommen zu Hause! Wohin möchtest du?'), 300);
  return {};
});
