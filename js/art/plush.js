// Kuscheltiere – weich, rund, mit Nähten und Knopfaugen-Glanz.
import { shade } from './person.js';

const OUT = '#5a3e2b';
const SW = `stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

export const PLUSH = {
  baer:        { name: 'Bruno',    art: 'Bär',          c: '#b07a48', b: '#ecc9a0', group: 'liebling' },
  tukan:       { name: 'Tuki',     art: 'Tukan',        c: '#33333d', b: '#fff1b8', group: 'liebling' },
  wildschwein: { name: 'Borsti',   art: 'Wildschwein',  c: '#86634b', b: '#c49a78', group: 'liebling' },
  affe:        { name: 'Momo',     art: 'Affe',         c: '#8b5a2b', b: '#f2cfa0', group: 'liebling' },
  pavian:      { name: 'Pauli',    art: 'Pavian',       c: '#a89b7a', b: '#d9cfb3', group: 'liebling' },
  rassel:      { name: 'Rassi',    art: 'Rassel',       c: '#9ad8f5', b: '#ffffff', group: 'liebling' },
  gelbi:       { name: 'Gelbi',    art: 'Brillen-Wesen',c: '#ffd93b', b: '#ffe98a', group: 'liebling' },
  puppe:       { name: 'Puppi',    art: 'Babypuppe',    c: '#ffb3c8', b: '#ffe3cc', group: 'liebling' },
  einhorn:     { name: 'Glitzi',   art: 'Einhorn',      c: '#ffffff', b: '#ffe6f2', group: 'liebling' },
  schaf:       { name: 'Flocke',   art: 'Schaf',        c: '#fbf7ef', b: '#5d5866', group: 'hof' },
  pony:        { name: 'Hufi',     art: 'Pony',         c: '#c98b55', b: '#f0d2ad', group: 'hof' },
  schwein:     { name: 'Rosi',     art: 'Schwein',      c: '#ffb7c5', b: '#ffd6de', group: 'hof' },
  kueken:      { name: 'Piepsi',   art: 'Küken',        c: '#ffe066', b: '#fff2a8', group: 'hof' },
  kuh:         { name: 'Berta',    art: 'Allgäuer Kuh', c: '#9c7558', b: '#eadbc8', group: 'hof' },
  elefant:     { name: 'Trompi',   art: 'Elefant',      c: '#a9b8c9', b: '#d6dfe9', group: 'exotisch' },
  loewe:       { name: 'Leo',      art: 'Löwe',         c: '#f4b950', b: '#fde3b0', group: 'exotisch' },
  panda:       { name: 'Pandi',    art: 'Panda',        c: '#ffffff', b: '#2f2f36', group: 'exotisch' },
  pinguin:     { name: 'Pingo',    art: 'Pinguin',      c: '#33405a', b: '#ffffff', group: 'exotisch' },
  faultier:    { name: 'Schlummi', art: 'Faultier',     c: '#b89a7a', b: '#ead8c0', group: 'exotisch' },
};

export const PLUSH_GROUPS = [
  { id: 'liebling', label: '💛' },
  { id: 'hof', label: '🏡' },
  { id: 'exotisch', label: '🌴' },
];

function eyes(mood, y = 84, dx = 20, cls = '') {
  if (mood === 'sleep') return `<path d="M${100 - dx - 8} ${y} q8 7 16 0 M${100 + dx - 8} ${y} q8 7 16 0" stroke="#2a1d14" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  let s = '';
  for (const x of [100 - dx, 100 + dx]) s += `<g class="eye ${cls}"><ellipse cx="${x}" cy="${y}" rx="6.5" ry="8" fill="#2a1d14"/><circle cx="${x + 2}" cy="${y - 3}" r="2.6" fill="#fff"/></g>`;
  if (mood === 'sad') s += `<path d="M${100 - dx - 9} ${y - 14} l14 4 M${100 + dx + 9} ${y - 14} l-14 4" stroke="#2a1d14" stroke-width="3" stroke-linecap="round"/>`;
  return s;
}

function mouth(mood, y = 106) {
  if (mood === 'sad') return `<path d="M92 ${y + 4} Q100 ${y - 4} 108 ${y + 4}" stroke="#2a1d14" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (mood === 'sleep') return `<ellipse cx="100" cy="${y + 1}" rx="3.5" ry="2.5" fill="#7a2f3a"/>`;
  if (mood === 'eat') return `<ellipse cx="100" cy="${y + 2}" rx="8" ry="7" fill="#7a2f3a" ${SW}/>`;
  return `<path d="M90 ${y} Q95 ${y + 6} 100 ${y} Q105 ${y + 6} 110 ${y}" stroke="#2a1d14" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

const cheeks = (y = 98, dx = 36, op = 0.5) => `<ellipse cx="${100 - dx}" cy="${y}" rx="9" ry="6" fill="#ff8f9e" opacity="${op}"/><ellipse cx="${100 + dx}" cy="${y}" rx="9" ry="6" fill="#ff8f9e" opacity="${op}"/>`;

function stdBody(c, b, opt = {}) {
  const fc = opt.feet || c;
  return `
  <ellipse cx="100" cy="194" rx="58" ry="7" fill="#000" opacity=".12"/>
  <g class="pl-arm-l"><ellipse cx="54" cy="146" rx="13" ry="22" transform="rotate(28 54 146)" fill="${opt.arms || c}" ${SW}/></g>
  <g class="pl-arm-r"><ellipse cx="146" cy="146" rx="13" ry="22" transform="rotate(-28 146 146)" fill="${opt.arms || c}" ${SW}/></g>
  <ellipse cx="100" cy="150" rx="48" ry="42" fill="${c}" ${SW}/>
  <ellipse cx="100" cy="158" rx="29" ry="26" fill="${b}"/>
  <path d="M100 136 v40" stroke="${shade(b, -30)}" stroke-width="2" stroke-dasharray="3 5" opacity=".6"/>
  <ellipse cx="74" cy="186" rx="17" ry="11" fill="${fc}" ${SW}/><ellipse cx="126" cy="186" rx="17" ry="11" fill="${fc}" ${SW}/>
  <ellipse cx="74" cy="187" rx="8" ry="5" fill="${opt.pads || b}"/><ellipse cx="126" cy="187" rx="8" ry="5" fill="${opt.pads || b}"/>`;
}

const head = (c, rx = 54, ry = 48, cy = 84) => `<ellipse cx="100" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c}" ${SW}/><ellipse cx="80" cy="${cy - 26}" rx="16" ry="8" fill="#fff" opacity=".25"/>`;

const DRAW = {
  baer(p, m) {
    return stdBody(p.c, p.b) +
      `<circle cx="56" cy="44" r="18" fill="${p.c}" ${SW}/><circle cx="56" cy="44" r="9" fill="${p.b}"/><circle cx="144" cy="44" r="18" fill="${p.c}" ${SW}/><circle cx="144" cy="44" r="9" fill="${p.b}"/>` +
      head(p.c) + `<ellipse cx="100" cy="104" rx="22" ry="16" fill="${p.b}"/>` + eyes(m) + cheeks() +
      `<ellipse cx="100" cy="97" rx="8" ry="5.5" fill="#3a2416"/>` + mouth(m, 108);
  },
  tukan(p, m) {
    return stdBody(p.c, p.b, { feet: '#ff9f1c', pads: '#ffc46b' }) +
      `<path d="M92 36 q-6 -18 8 -22 q-2 12 6 20" fill="${p.c}" ${SW}/>` + head(p.c) +
      `<ellipse cx="100" cy="98" rx="40" ry="28" fill="${p.b}"/>` +
      `<circle cx="78" cy="80" r="12" fill="#5ec8ff"/><circle cx="122" cy="80" r="12" fill="#5ec8ff"/>` + eyes(m, 80, 22) +
      `<path d="M82 96 C82 88 118 88 118 96 C124 120 110 146 100 152 C90 146 76 120 82 96 Z" fill="#ffae2b" ${SW}/>
       <path d="M86 118 C94 126 106 126 114 118 C110 134 104 146 100 150 C96 146 90 134 86 118 Z" fill="#ee5a3c"/>
       <path d="M84 100 Q100 108 116 100" stroke="#c76a12" stroke-width="2.5" fill="none"/>`;
  },
  wildschwein(p, m) {
    let stripes = '';
    for (const x of [82, 100, 118]) stripes += `<path d="M${x} 116 q-4 30 0 60" stroke="#d6b591" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>`;
    return stdBody(p.c, p.b) + stripes +
      `<path d="M50 52 L46 14 L80 38 Z M150 52 L154 14 L120 38 Z" fill="${p.c}" ${SW}/><path d="M54 44 L52 24 L70 38 Z M146 44 L148 24 L130 38 Z" fill="#e7a99a"/>` +
      head(p.c) + `<path d="M84 34 l6 -14 l6 12 l6 -14 l6 12 l6 -12 l2 16" fill="#4a3426" ${SW}/>` + eyes(m, 80) + cheeks(96) +
      `<ellipse cx="100" cy="106" rx="22" ry="16" fill="#e4a894" ${SW}/><ellipse cx="93" cy="106" rx="4" ry="6" fill="#7a3f33"/><ellipse cx="107" cy="106" rx="4" ry="6" fill="#7a3f33"/>
       <path d="M76 112 q-6 -10 0 -16 M124 112 q6 -10 0 -16" stroke="#fffbea" stroke-width="5" fill="none" stroke-linecap="round"/>` + mouth(m, 124);
  },
  affe(p, m) {
    return stdBody(p.c, p.b) +
      `<circle cx="40" cy="86" r="18" fill="${p.c}" ${SW}/><circle cx="40" cy="86" r="10" fill="${p.b}"/><circle cx="160" cy="86" r="18" fill="${p.c}" ${SW}/><circle cx="160" cy="86" r="10" fill="${p.b}"/>` +
      head(p.c) + `<path d="M96 36 q4 -16 14 -10 q-8 2 -6 12" fill="${p.c}" ${SW}/>` +
      `<path d="M100 66 C90 52 60 56 62 82 C62 96 70 104 70 110 C70 128 130 128 130 110 C130 104 138 96 138 82 C140 56 110 52 100 66 Z" fill="${p.b}"/>` +
      eyes(m, 82, 18) + cheeks(100, 32) + `<ellipse cx="94" cy="100" rx="2.5" ry="2" fill="#5a3e2b"/><ellipse cx="106" cy="100" rx="2.5" ry="2" fill="#5a3e2b"/>` + mouth(m, 110);
  },
  pavian(p, m) {
    let mane = '';
    for (const [x, y] of [[52, 60], [46, 88], [56, 116], [148, 60], [154, 88], [144, 116], [76, 40], [124, 40], [100, 34]]) mane += `<circle cx="${x}" cy="${y}" r="18" fill="${shade(p.c, 18)}" ${SW}/>`;
    return stdBody(p.c, p.b) + mane + head(p.c, 48, 46) +
      `<path d="M66 70 Q100 58 134 70" stroke="${shade(p.c, -30)}" stroke-width="6" fill="none" stroke-linecap="round"/>` + eyes(m, 80, 15) +
      `<ellipse cx="100" cy="108" rx="18" ry="22" fill="#f28b8b" ${SW}/><ellipse cx="94" cy="118" rx="3" ry="2.5" fill="#7a2f3a"/><ellipse cx="106" cy="118" rx="3" ry="2.5" fill="#7a2f3a"/>` +
      `<path d="M90 126 Q100 ${m === 'sad' ? 122 : 132} 110 126" stroke="#7a2f3a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  },
  rassel(p, m) {
    let dots = '';
    for (const [x, y, c] of [[64, 52, '#ffb3c8'], [138, 48, '#ffe066'], [146, 104, '#b6e388'], [58, 110, '#c6b3ff'], [100, 30, '#ffb86b']]) dots += `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`;
    return `<ellipse cx="100" cy="194" rx="34" ry="6" fill="#000" opacity=".12"/>
      <rect x="88" y="128" width="24" height="52" rx="12" fill="#ffe066" ${SW}/><circle cx="100" cy="182" r="14" fill="none" stroke="#ff8fa3" stroke-width="8"/>
      <path d="M78 134 q22 12 44 0 l-6 10 q-16 6 -32 0 Z" fill="#ff8fa3" ${SW}/>` +
      `<circle cx="100" cy="80" r="60" fill="${p.c}" ${SW}/>` + dots + `<ellipse cx="78" cy="48" rx="18" ry="9" fill="#fff" opacity=".45"/>` +
      eyes(m, 84, 20) + cheeks(100, 34, 0.6) + mouth(m, 108);
  },
  gelbi(p, m) {
    return `<ellipse cx="100" cy="194" rx="50" ry="7" fill="#000" opacity=".12"/>
      <ellipse cx="44" cy="132" rx="11" ry="20" transform="rotate(26 44 132)" fill="${p.c}" ${SW}/><ellipse cx="156" cy="132" rx="11" ry="20" transform="rotate(-26 156 132)" fill="${p.c}" ${SW}/>
      <ellipse cx="78" cy="186" rx="16" ry="10" fill="#ff6f91" ${SW}/><ellipse cx="122" cy="186" rx="16" ry="10" fill="#ff6f91" ${SW}/>
      <path d="M100 30 q-4 -14 2 -22" stroke="#6bbf59" stroke-width="4" fill="none"/><ellipse cx="112" cy="12" rx="10" ry="6" transform="rotate(-20 112 12)" fill="#8ad46e" ${SW}/>
      <ellipse cx="100" cy="108" rx="58" ry="78" fill="${p.c}" ${SW}/><ellipse cx="78" cy="58" rx="18" ry="10" fill="#fff" opacity=".35"/>
      <path d="M50 138 Q100 162 150 138 L146 156 Q100 176 54 156 Z" fill="#ff6f91" ${SW}/><path d="M128 150 l14 26 l10 -6 Z" fill="#ff6f91" ${SW}/>
      <g fill="#fff" stroke="#6c7a89" stroke-width="5"><circle cx="78" cy="88" r="20"/><circle cx="122" cy="88" r="20"/></g><path d="M98 86 h4" stroke="#6c7a89" stroke-width="5"/>` +
      eyes(m, 88, 22) + `<ellipse cx="66" cy="114" rx="8" ry="5" fill="#ff8f9e" opacity=".5"/><ellipse cx="134" cy="114" rx="8" ry="5" fill="#ff8f9e" opacity=".5"/>` + mouth(m, 120);
  },
  puppe(p, m) {
    return stdBody(p.c, '#fff0f5', { arms: p.b, feet: '#fff', pads: '#ffd6e2' }) +
      `<circle cx="100" cy="150" r="5" fill="#fff" ${SW}/><circle cx="100" cy="168" r="5" fill="#fff" ${SW}/>` +
      `<ellipse cx="100" cy="84" rx="58" ry="52" fill="${p.c}" ${SW}/><path d="M48 92 Q40 140 60 128 M152 92 Q160 140 140 128" stroke="${shade(p.c, -20)}" stroke-width="4" fill="none"/>` +
      `<ellipse cx="100" cy="90" rx="46" ry="42" fill="${p.b}" ${SW}/><path d="M86 52 q14 -10 28 0 q-14 10 -28 0" fill="#e8b36a"/>` +
      eyes(m, 88, 18) + cheeks(102, 30, 0.6) + `<path d="M58 54 Q100 30 142 54" stroke="#fff" stroke-width="6" fill="none" stroke-dasharray="1 9" stroke-linecap="round"/>` +
      (m === 'sleep' || m === 'sad' ? mouth(m, 112) : `<circle cx="100" cy="114" r="9" fill="#7cc4ff" ${SW}/><rect x="94" y="110" width="12" height="7" rx="3" fill="#bde3ff"/>`);
  },
  einhorn(p, m) {
    let mane = '';
    const cols = ['#ff9ccc', '#ffd166', '#9be37a', '#7cc4ff', '#c6a8ff'];
    [[62, 44], [52, 66], [46, 92], [48, 118], [56, 140]].forEach(([x, y], i) => (mane += `<circle cx="${x}" cy="${y}" r="15" fill="${cols[i]}" ${SW}/>`));
    return stdBody(p.c, p.b, { pads: '#ffd6ea' }) + mane +
      `<path d="M66 50 L58 18 L88 38 Z M134 50 L142 18 L112 38 Z" fill="${p.c}" ${SW}/><path d="M68 42 L64 26 L80 38 Z M132 42 L136 26 L120 38 Z" fill="#ffc2dc"/>` +
      head(p.c) + `<path d="M90 40 L100 -4 L110 40 Z" fill="#ffd23f" ${SW}/><path d="M93 30 l14 -4 M95 20 l10 -3 M97 10 l6 -2" stroke="#e6a800" stroke-width="2.5"/>` +
      `<circle cx="84" cy="44" r="12" fill="#ff9ccc" ${SW}/><circle cx="104" cy="40" r="11" fill="#c6a8ff" ${SW}/>` +
      `<ellipse cx="100" cy="106" rx="24" ry="15" fill="${p.b}"/><ellipse cx="92" cy="106" rx="3" ry="2" fill="#d58ca8"/><ellipse cx="108" cy="106" rx="3" ry="2" fill="#d58ca8"/>` +
      eyes(m, 82) + `<path d="M74 74 l-5 -4 M126 74 l5 -4" stroke="#2a1d14" stroke-width="2.5" stroke-linecap="round"/>` + cheeks(96, 38, 0.6) + mouth(m, 116) +
      `<path d="M150 70 l3 -7 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 Z" fill="#ffd23f"/>`;
  },
  schaf(p, m) {
    let wool = '';
    for (const [x, y] of [[58, 130], [70, 112], [96, 106], [124, 110], [142, 128], [146, 156], [130, 180], [100, 186], [70, 180], [54, 156]]) wool += `<circle cx="${x}" cy="${y}" r="20" fill="${p.c}" ${SW}/>`;
    let top = '';
    for (const [x, y] of [[66, 46], [84, 34], [104, 30], [124, 36], [138, 50]]) top += `<circle cx="${x}" cy="${y}" r="15" fill="${p.c}" ${SW}/>`;
    return `<ellipse cx="100" cy="196" rx="58" ry="6" fill="#000" opacity=".12"/><rect x="70" y="176" width="16" height="18" rx="7" fill="${p.b}" ${SW}/><rect x="114" y="176" width="16" height="18" rx="7" fill="${p.b}" ${SW}/>` + wool +
      `<circle cx="100" cy="150" r="34" fill="${p.c}"/>` +
      `<ellipse cx="44" cy="84" rx="20" ry="10" transform="rotate(-20 44 84)" fill="${p.b}" ${SW}/><ellipse cx="156" cy="84" rx="20" ry="10" transform="rotate(20 156 84)" fill="${p.b}" ${SW}/>` +
      `<ellipse cx="100" cy="88" rx="42" ry="44" fill="${p.b}" ${SW}/>` + top +
      eyes(m, 88, 16).replaceAll('#2a1d14', '#fff').replaceAll('fill="#fff"/></g>', 'fill="#2a1d14"/></g>') + `<ellipse cx="72" cy="102" rx="8" ry="5" fill="#ff8f9e" opacity=".55"/><ellipse cx="128" cy="102" rx="8" ry="5" fill="#ff8f9e" opacity=".55"/>` +
      `<ellipse cx="100" cy="106" rx="5" ry="3.5" fill="#2a1d14"/>` + mouth(m, 116).replaceAll('#2a1d14', '#f2e9ff');
  },
  pony(p, m) {
    let mane = '';
    for (const [x, y] of [[74, 34], [94, 28], [114, 32], [60, 50], [130, 44]]) mane += `<ellipse cx="${x}" cy="${y}" rx="14" ry="18" fill="#6b3f22" ${SW}/>`;
    return stdBody(p.c, p.b, { feet: '#6b4a32', pads: '#8a6a50' }) +
      `<path d="M58 56 L50 16 L84 42 Z M142 56 L150 16 L116 42 Z" fill="${p.c}" ${SW}/><path d="M60 46 L56 26 L74 40 Z M140 46 L144 26 L126 40 Z" fill="${p.b}"/>` +
      head(p.c, 50, 50) + mane + `<ellipse cx="100" cy="110" rx="30" ry="22" fill="${p.b}" ${SW}/><ellipse cx="90" cy="108" rx="3.5" ry="5" fill="#7a5a44"/><ellipse cx="110" cy="108" rx="3.5" ry="5" fill="#7a5a44"/>` +
      eyes(m, 76, 22) + cheeks(92, 40) + mouth(m, 122);
  },
  schwein(p, m) {
    return stdBody(p.c, p.b) +
      `<path d="M52 52 L44 18 L80 38 Z M148 52 L156 18 L120 38 Z" fill="${p.c}" ${SW}/><path d="M54 46 L52 28 L68 38 Z M146 46 L148 28 L132 38 Z" fill="#ff8fa8"/>` +
      head(p.c) + eyes(m, 80) + cheeks(96, 38, 0.65) +
      `<ellipse cx="100" cy="104" rx="20" ry="14" fill="#ff9fb3" ${SW}/><ellipse cx="93" cy="104" rx="3.5" ry="5" fill="#b4576a"/><ellipse cx="107" cy="104" rx="3.5" ry="5" fill="#b4576a"/>` + mouth(m, 122);
  },
  kueken(p, m) {
    return `<ellipse cx="100" cy="194" rx="50" ry="6" fill="#000" opacity=".12"/>
      <path d="M78 182 l-8 10 m8 -10 l0 12 m0 -12 l8 10 M122 182 l-8 10 m8 -10 l0 12 m0 -12 l8 10" stroke="#ff9f1c" stroke-width="5" stroke-linecap="round"/>
      <ellipse cx="44" cy="124" rx="14" ry="24" transform="rotate(30 44 124)" fill="${shade(p.c, -14)}" ${SW}/><ellipse cx="156" cy="124" rx="14" ry="24" transform="rotate(-30 156 124)" fill="${shade(p.c, -14)}" ${SW}/>
      <ellipse cx="100" cy="112" rx="62" ry="72" fill="${p.c}" ${SW}/><ellipse cx="78" cy="62" rx="18" ry="10" fill="#fff" opacity=".4"/><ellipse cx="100" cy="146" rx="34" ry="28" fill="${p.b}"/>
      <path d="M92 42 q4 -20 10 -20 q-2 10 6 4 q0 10 -8 16" fill="${p.c}" ${SW}/>` +
      eyes(m, 92, 22) + cheeks(108, 38, 0.6) + `<path d="M88 104 L112 104 L100 120 Z" fill="#ff9f1c" ${SW}/>`;
  },
  kuh(p, m) {
    return stdBody(p.c, p.b, { feet: '#4a3426', pads: '#6b5040' }) +
      `<path d="M66 52 Q50 30 58 18 Q66 32 78 40 Z M134 52 Q150 30 142 18 Q134 32 122 40 Z" fill="#f3ead6" ${SW}/>` +
      `<ellipse cx="38" cy="74" rx="22" ry="11" transform="rotate(-18 38 74)" fill="${p.c}" ${SW}/><ellipse cx="162" cy="74" rx="22" ry="11" transform="rotate(18 162 74)" fill="${p.c}" ${SW}/>` +
      head(p.c, 52, 48) + `<path d="M84 40 q8 12 16 0 q8 12 16 0" fill="${shade(p.c, 20)}" ${SW}/>` +
      `<ellipse cx="100" cy="108" rx="32" ry="22" fill="${p.b}" ${SW}/><ellipse cx="88" cy="106" rx="4" ry="5.5" fill="#5a3e2b"/><ellipse cx="112" cy="106" rx="4" ry="5.5" fill="#5a3e2b"/>` +
      eyes(m, 76, 22) + cheeks(90, 40) + mouth(m, 120) +
      `<path d="M66 136 Q100 150 134 136" stroke="#c0392b" stroke-width="7" fill="none"/><path d="M90 142 h20 l4 18 q-14 8 -28 0 Z" fill="#f5c542" ${SW}/><circle cx="100" cy="164" r="3.5" fill="#8a6a10"/>`;
  },
  elefant(p, m) {
    return stdBody(p.c, p.b) +
      `<ellipse cx="40" cy="86" rx="32" ry="38" fill="${p.c}" ${SW}/><ellipse cx="42" cy="88" rx="20" ry="26" fill="#f4c6d2"/>` +
      `<ellipse cx="160" cy="86" rx="32" ry="38" fill="${p.c}" ${SW}/><ellipse cx="158" cy="88" rx="20" ry="26" fill="#f4c6d2"/>` +
      head(p.c, 50, 46) + eyes(m, 76, 20) + cheeks(94, 32) +
      `<path d="M88 92 C86 120 92 140 76 146 C70 148 70 140 76 138 C82 132 82 120 80 96" transform="translate(12 0)" fill="${p.c}" ${SW}/><path d="M92 112 h12 M92 124 h10" stroke="${shade(p.c, -25)}" stroke-width="2"/>`;
  },
  loewe(p, m) {
    let mane = '';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      mane += `<circle cx="${100 + Math.cos(a) * 52}" cy="${84 + Math.sin(a) * 48}" r="20" fill="${i % 2 ? '#d9792a' : '#e98f35'}" ${SW}/>`;
    }
    return stdBody(p.c, p.b) + mane + `<circle cx="66" cy="46" r="11" fill="${p.c}" ${SW}/><circle cx="134" cy="46" r="11" fill="${p.c}" ${SW}/>` + head(p.c, 46, 42) +
      `<ellipse cx="100" cy="102" rx="20" ry="14" fill="${p.b}"/>` + eyes(m, 80, 17) + cheeks(96, 30) + `<path d="M93 96 h14 l-7 7 Z" fill="#7a3f33"/>` + mouth(m, 110);
  },
  panda(p, m) {
    return stdBody(p.c, '#ffffff', { arms: p.b, feet: p.b, pads: '#6b6b74' }) +
      `<circle cx="56" cy="42" r="18" fill="${p.b}" ${SW}/><circle cx="144" cy="42" r="18" fill="${p.b}" ${SW}/>` + head(p.c) +
      `<ellipse cx="78" cy="84" rx="13" ry="16" transform="rotate(25 78 84)" fill="${p.b}"/><ellipse cx="122" cy="84" rx="13" ry="16" transform="rotate(-25 122 84)" fill="${p.b}"/>` +
      eyes(m, 84, 21).replaceAll('#2a1d14', '#fff').replaceAll('r="2.6" fill="#fff"', 'r="2.6" fill="#2a1d14"') + cheeks(102, 36, 0.6) +
      `<ellipse cx="100" cy="100" rx="7" ry="5" fill="#2a1d14"/>` + mouth(m, 110);
  },
  pinguin(p, m) {
    return `<ellipse cx="100" cy="194" rx="50" ry="6" fill="#000" opacity=".12"/>
      <ellipse cx="80" cy="186" rx="16" ry="9" fill="#ff9f1c" ${SW}/><ellipse cx="120" cy="186" rx="16" ry="9" fill="#ff9f1c" ${SW}/>
      <ellipse cx="42" cy="128" rx="13" ry="30" transform="rotate(24 42 128)" fill="${p.c}" ${SW}/><ellipse cx="158" cy="128" rx="13" ry="30" transform="rotate(-24 158 128)" fill="${p.c}" ${SW}/>
      <ellipse cx="100" cy="110" rx="60" ry="76" fill="${p.c}" ${SW}/><ellipse cx="78" cy="56" rx="16" ry="8" fill="#fff" opacity=".2"/>
      <path d="M100 60 C76 44 50 60 56 92 C60 120 60 150 100 176 C140 150 140 120 144 92 C150 60 124 44 100 60 Z" fill="${p.b}"/>` +
      eyes(m, 86, 20) + cheeks(104, 34, 0.6) + `<path d="M90 100 L110 100 L100 114 Z" fill="#ff9f1c" ${SW}/>` +
      `<path d="M74 140 Q100 152 126 140 L124 152 Q100 160 76 152 Z" fill="#7cc4ff" ${SW}/>`;
  },
  faultier(p, m) {
    return stdBody(p.c, p.b) + head(p.c, 54, 50) +
      `<path d="M100 56 C80 46 56 54 54 80 C54 104 76 120 100 120 C124 120 146 104 146 80 C144 54 120 46 100 56 Z" fill="${p.b}"/>` +
      `<path d="M62 78 Q74 70 90 82 Q86 94 74 92 Q62 90 62 78 Z M138 78 Q126 70 110 82 Q114 94 126 92 Q138 90 138 78 Z" fill="#6b4a32"/>` +
      eyes(m, 84, 20) + `<ellipse cx="100" cy="98" rx="7" ry="5" fill="#3a2416"/>` + cheeks(104, 34) +
      `<path d="M88 108 Q100 ${m === 'sad' ? 104 : 118} 112 108" stroke="#2a1d14" stroke-width="3" fill="none" stroke-linecap="round"/>` +
      `<path d="M56 132 l-12 6 m12 0 l-10 10 M144 132 l12 6 m-12 0 l10 10" stroke="#f3ead6" stroke-width="4" stroke-linecap="round"/>`;
  },
};

// ---------- Kleidung für Kuscheltiere ----------
// Position von Kopf-Oberkante, Augen und Hals je Tier
const ANCHOR = { gelbi: [30, 88, 140], rassel: [22, 84, 132], kueken: [42, 92, 150], pinguin: [36, 86, 138], schaf: [20, 88, 132], puppe: [32, 88, 132], pavian: [34, 80, 128], loewe: [32, 80, 128], tukan: [34, 80, 128], elefant: [36, 76, 128], pony: [32, 76, 132], kuh: [36, 76, 132] };
export const OUTFIT = {
  hat: ['muetze', 'krone', 'zylinder', 'blume', 'cowboy', 'party'],
  eyes: ['brille', 'sonne', 'herz'],
  neck: ['schal', 'fliege', 'halstuch', 'kette'],
};
function outfitSVG(type, o = {}) {
  const [hy, ey, ny] = ANCHOR[type] || [36, 84, 128];
  let s = '';
  switch (o.neck) {
    case 'schal': s += `<g transform="translate(100 ${ny})"><path d="M-44 -6 Q0 14 44 -6 L42 10 Q0 30 -42 10 Z" fill="#ff6f6f" ${SW}/><path d="M18 8 l10 34 l14 -6 l-8 -30" fill="#ff6f6f" ${SW}/><path d="M-30 4 v12 M-10 10 v12 M10 10 v12" stroke="#fff" stroke-width="4"/></g>`; break;
    case 'fliege': s += `<g transform="translate(100 ${ny})"><path d="M0 0 L-24 -12 L-24 12 Z M0 0 L24 -12 L24 12 Z" fill="#7c5cff" ${SW}/><circle r="7" fill="#9b8cff" ${SW}/></g>`; break;
    case 'halstuch': s += `<g transform="translate(100 ${ny - 4})"><path d="M-40 -4 Q0 8 40 -4 L0 34 Z" fill="#4fa3ff" ${SW}/><circle cx="-12" cy="8" r="3" fill="#fff"/><circle cx="10" cy="10" r="3" fill="#fff"/><circle cx="0" cy="22" r="3" fill="#fff"/></g>`; break;
    case 'kette': s += `<g transform="translate(100 ${ny - 2})"><path d="M-36 -4 Q0 22 36 -4" fill="none" stroke="#ffd23f" stroke-width="4"/>${[-28, -14, 0, 14, 28].map((x, i) => `<circle cx="${x}" cy="${6 + (x === 0 ? 7 : Math.abs(x) < 20 ? 4 : 0)}" r="5" fill="${['#ff9ccc', '#7cc4ff', '#ffd23f', '#9be37a', '#c6a8ff'][i]}" stroke="#5a3e2b" stroke-width="2"/>`).join('')}</g>`; break;
  }
  switch (o.eyes) {
    case 'brille': s += `<g transform="translate(100 ${ey})" fill="#fff" fill-opacity=".25" stroke="#3a3d44" stroke-width="4"><circle cx="-20" r="14"/><circle cx="20" r="14"/><path d="M-6 0 h12" fill="none"/></g>`; break;
    case 'sonne': s += `<g transform="translate(100 ${ey})" ${SW}><path d="M-38 -10 h30 q4 0 4 4 q0 16 -16 16 q-18 0 -18 -16 Z M38 -10 h-30 q-4 0 -4 4 q0 16 16 16 q18 0 18 -16 Z" fill="#2a2b38"/><path d="M-8 -6 h16" fill="none"/><path d="M-30 -4 l8 0" stroke="#fff" stroke-width="3"/><path d="M14 -4 l8 0" stroke="#fff" stroke-width="3"/></g>`; break;
    case 'herz': s += `<g transform="translate(100 ${ey})" ${SW}>${[-20, 20].map((x) => `<path transform="translate(${x} 0)" d="M0 12 C-18 0 -16 -14 -6 -14 C-2 -14 0 -10 0 -8 C0 -10 2 -14 6 -14 C16 -14 18 0 0 12 Z" fill="#ff5a8a" fill-opacity=".85"/>`).join('')}<path d="M-6 -4 h12" fill="none"/></g>`; break;
  }
  switch (o.hat) {
    case 'muetze': s += `<g transform="translate(100 ${hy})"><path d="M-40 10 C-40 -40 40 -40 40 10 Z" fill="#4fa3ff" ${SW}/><rect x="-44" y="2" width="88" height="16" rx="8" fill="#ffd23f" ${SW}/><circle cy="-34" r="12" fill="#fff" ${SW}/></g>`; break;
    case 'krone': s += `<g transform="translate(100 ${hy})"><path d="M-30 10 L-34 -22 L-16 -6 L0 -30 L16 -6 L34 -22 L30 10 Z" fill="#ffd23f" ${SW}/><circle cy="0" r="5" fill="#ff6f91"/><circle cx="-18" cy="3" r="3.5" fill="#6fd3c7"/><circle cx="18" cy="3" r="3.5" fill="#6fd3c7"/></g>`; break;
    case 'zylinder': s += `<g transform="translate(100 ${hy})"><rect x="-44" y="2" width="88" height="12" rx="6" fill="#2f3238" ${SW}/><rect x="-28" y="-44" width="56" height="50" rx="6" fill="#2f3238" ${SW}/><rect x="-28" y="-6" width="56" height="9" fill="#ff6f91"/></g>`; break;
    case 'blume': s += `<g transform="translate(130 ${hy + 6})">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="9" ry="13" cy="-11" transform="rotate(${r})" fill="#ff9ccc" stroke="#5a3e2b" stroke-width="2.5"/>`).join('')}<circle r="8" fill="#ffd23f" stroke="#5a3e2b" stroke-width="2.5"/></g>`; break;
    case 'cowboy': s += `<g transform="translate(100 ${hy})"><path d="M-60 8 Q-40 22 0 18 Q40 22 60 8 Q40 0 0 2 Q-40 0 -60 8 Z" fill="#c98b55" ${SW}/><path d="M-30 6 C-30 -36 -10 -28 0 -22 C10 -28 30 -36 30 6 Z" fill="#c98b55" ${SW}/><path d="M-28 -2 Q0 6 28 -2" stroke="#7a4a2c" stroke-width="5" fill="none"/></g>`; break;
    case 'party': s += `<g transform="translate(100 ${hy})"><path d="M-22 8 L0 -50 L22 8 Z" fill="#9b8cff" ${SW}/><path d="M-14 -12 l10 4 M-6 -32 l8 4 M6 -2 l8 4" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/><circle cy="-52" r="8" fill="#ff6f91" ${SW}/></g>`; break;
  }
  return s;
}

/** SVG eines Kuscheltiers. mood: 'happy' | 'sad' | 'sleep' | 'eat'; outfit: {hat, eyes, neck} */
export function plushSVG(type, opt = {}) {
  const p = PLUSH[type] || PLUSH.baer;
  const m = opt.mood || 'happy';
  const draw = DRAW[type] || DRAW.baer;
  const outfit = opt.outfit ? outfitSVG(type, opt.outfit) : '';
  return `<svg class="plush ${opt.cls || ''}" viewBox="0 -10 200 210" xmlns="http://www.w3.org/2000/svg" overflow="visible"><g class="pl-bob">${draw(p, m)}${outfit}</g>${m === 'sleep' ? '<g class="zzz"><text x="150" y="30">z</text><text x="166" y="10">z</text><text x="182" y="-8">Z</text></g>' : ''}</svg>`;
}

const ARTIKEL = { wildschwein: 'das', rassel: 'die', gelbi: 'das', puppe: 'die', einhorn: 'das', schaf: 'das', pony: 'das', schwein: 'das', kueken: 'das', kuh: 'die', faultier: 'das' };
export const plushLabel = (type, name) => (PLUSH[type] ? `${name || PLUSH[type].name} ${ARTIKEL[type] || 'der'} ${PLUSH[type].art}` : '');
