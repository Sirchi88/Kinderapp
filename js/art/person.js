// Zeichnet Figuren im runden, gemütlichen Dorf-Stil als SVG.
// Alle Figuren (Kinder, Mama, Papa, Großeltern) entstehen aus denselben Bausteinen.

let n = 0;
const nid = (p) => `${p}${++n}`;

export const SKIN = ['#ffe3cc', '#fbd3b3', '#f1c09a', '#dfa47a', '#be8058', '#8c5838'];
export const HAIR = ['#2e1c12', '#5b3820', '#8a5530', '#c98a4b', '#ecc56e', '#f5e3a6', '#c2462c', '#8f8f94', '#e9e6e2', '#ff9ccc', '#9c8cff', '#5ec2d6'];
export const EYES = ['#3b2516', '#6b4527', '#3c74c4', '#4e8a52', '#86978a', '#7b5ca8'];
export const CLOTH = ['#ff8fa3', '#ffb86b', '#ffe066', '#9be37a', '#6fd3c7', '#7cc4ff', '#9b8cff', '#d58cff', '#ffffff', '#f6e7d0', '#5a6b7c', '#2f3238', '#c94f4f', '#4f7cc9'];

export const HAIR_STYLES = ['kurz', 'wuschel', 'lang', 'zoepfe', 'pferdeschwanz', 'dutt', 'bob', 'locken'];
export const TOPS = ['tshirt', 'ringel', 'kleid', 'hoodie', 'steppjacke', 'latzhose', 'pulli'];
export const BOTTOMS = ['hose', 'jeans', 'shorts', 'rock', 'leggings'];
export const ACCESSORIES = ['keins', 'schleife', 'krone', 'blume', 'haarreif', 'muetze', 'kappe', 'fluegel', 'tasche', 'brille'];

export function defaultKidAvatar(i = 0) {
  return i === 0
    ? { skin: SKIN[1], hair: 'lang', hairColor: HAIR[2], eyes: EYES[1], top: 'kleid', topColor: CLOTH[0], bottom: 'leggings', bottomColor: CLOTH[9], shoes: '#ff6f91', accessory: 'schleife', accColor: '#ff6f91', cheeks: true, freckles: false }
    : { skin: SKIN[1], hair: 'zoepfe', hairColor: HAIR[3], eyes: EYES[2], top: 'ringel', topColor: CLOTH[7], bottom: 'rock', bottomColor: CLOTH[6], shoes: '#9b8cff', accessory: 'krone', accColor: '#ffd23f', cheeks: true, freckles: false };
}

export function randomAvatar() {
  const r = (a) => a[Math.floor(Math.random() * a.length)];
  return {
    skin: r(SKIN.slice(0, 5)), hair: r(HAIR_STYLES), hairColor: r(HAIR), eyes: r(EYES),
    top: r(TOPS.filter((t) => t !== 'steppjacke')), topColor: r(CLOTH), bottom: r(BOTTOMS), bottomColor: r(CLOTH),
    shoes: r(CLOTH), accessory: r(ACCESSORIES), accColor: r(CLOTH), cheeks: true, freckles: Math.random() < 0.25,
  };
}

// --- Familie (nach euren Vorlagen) ---
export const FAMILY = {
  papa: { name: 'Papa', scale: 1, build: 1.08, skin: '#f6cba6', hair: 'wuschel', hairColor: '#3a2416', eyes: '#3b2516', beard: 'voll', beardColor: '#4a2e1c', top: 'tshirt', topColor: '#3a3d44', bottom: 'jeans', bottomColor: '#4a5668', shoes: '#2b2b2b', accessory: 'keins', cheeks: true },
  mama: { name: 'Mama', scale: 0.88, build: 0.95, skin: '#fbd6b8', hair: 'lang', hairColor: '#5b3820', eyes: '#86978a', lashes: true, top: 'steppjacke', topColor: '#2a2b30', innerColor: 'ringel', bottom: 'jeans', bottomColor: '#6e7176', shoes: '#ece6dc', accessory: 'tasche', accColor: '#c89b62', cheeks: true },
  opaAuerbach: { name: 'Opa Auerbach', scale: 1.0, build: 0.82, skin: '#f3c9a4', hair: 'kurz', hairColor: '#33241a', eyes: '#3b2516', beard: 'mund', beardColor: '#3a2a20', top: 'pulli', topColor: '#6b8f71', bottom: 'hose', bottomColor: '#5b4a3c', shoes: '#4a3426', accessory: 'keins', cheeks: true },
  omaAuerbach: { name: 'Oma Auerbach', scale: 0.78, build: 1.22, belly: true, skin: '#f7d2b4', hair: 'locken', hairColor: '#b7b3ad', eyes: '#6b4527', glasses: '#8a5a3c', top: 'pulli', topColor: '#e58fa8', bottom: 'rock', bottomColor: '#6c7fb2', shoes: '#7a4b3a', accessory: 'keins', cheeks: true },
  omaMindelheim: { name: 'Oma Mindelheim', scale: 0.9, build: 1.0, skin: '#f8d6bb', hair: 'bob', hairColor: '#c2462c', eyes: '#3c74c4', glasses: '#b23a6b', makeup: true, lashes: true, top: 'pulli', topColor: '#7fc4b8', bottom: 'hose', bottomColor: '#38404d', shoes: '#c2462c', accessory: 'keins', cheeks: true },
  opaMindelheim: { name: 'Opa Mindelheim', scale: 0.92, build: 1.04, skin: '#f0c4a0', hair: 'kurz', hairColor: '#a7a7aa', eyes: '#3b2516', glasses: '#333', beard: 'stoppel', beardColor: '#8e8e92', top: 'warnweste', topColor: '#ff8a2b', bottom: 'hose', bottomColor: '#3d4f6b', shoes: '#5a3c22', accessory: 'helm', accColor: '#ffd23f', cheeks: true },
};

const shade = (hex, amt) => {
  const c = hex.replace('#', '');
  const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
  let r = (num >> 16) + amt, g = ((num >> 8) & 255) + amt, b = (num & 255) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
export { shade };

const OUT = '#5a3e2b'; // weiche, warme Konturfarbe
const SW = 'stroke="' + OUT + '" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';

// ---------- Haare ----------
function hairBack(style, c, id) {
  const d = shade(c, -25);
  switch (style) {
    case 'lang':
      return `<path d="M40 98 C34 26 166 26 160 98 L168 200 C154 212 138 206 133 194 L131 150 L69 150 L67 194 C62 206 46 212 32 200 Z" fill="${c}" ${SW}/>
        <path d="M60 160 L58 196 M142 160 L144 196" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'bob':
      return `<path d="M36 100 C30 28 170 28 164 100 L168 152 C152 164 140 158 136 150 L64 150 C60 158 48 164 32 152 Z" fill="${c}" ${SW}/>`;
    case 'zoepfe':
      return `<g ${SW}><ellipse cx="30" cy="132" rx="17" ry="30" transform="rotate(18 30 132)" fill="${c}"/><ellipse cx="170" cy="132" rx="17" ry="30" transform="rotate(-18 170 132)" fill="${c}"/>
        <path d="M24 120 q6 6 12 2 M24 136 q6 6 12 2 M164 122 q6 6 12 -2 M164 138 q6 6 12 -2" fill="none" stroke="${d}" stroke-width="2.5"/></g>`;
    case 'pferdeschwanz':
      return `<path d="M138 58 C196 52 204 134 172 182 C170 150 168 118 146 96 Z" fill="${c}" ${SW}/><path d="M160 92 C176 112 178 140 172 166" stroke="${d}" stroke-width="3" fill="none"/>`;
    case 'dutt':
      return `<circle cx="100" cy="38" r="25" fill="${c}" ${SW}/><path d="M86 32 q14 -10 28 0" stroke="${d}" stroke-width="3" fill="none"/>`;
    case 'locken': {
      let s = '';
      const pts = [[40, 110], [34, 86], [42, 60], [62, 42], [86, 34], [114, 34], [138, 42], [158, 60], [166, 86], [160, 110]];
      for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="20" fill="${c}" ${SW}/>`;
      return s;
    }
    default:
      return '';
  }
}

function hairFront(style, c) {
  const d = shade(c, -28), l = shade(c, 30);
  const hl = (p) => `<path d="${p}" stroke="${l}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  switch (style) {
    case 'kurz':
      return `<path d="M38 108 C30 38 170 38 162 108 C158 92 152 80 144 74 C128 84 102 82 86 70 C72 82 54 86 46 98 C42 102 40 106 38 108 Z" fill="${c}" ${SW}/>${hl('M70 54 Q90 44 112 46')}`;
    case 'wuschel':
      return `<path d="M38 110 C30 56 50 34 72 34 L74 18 L90 30 L100 12 L112 30 L128 18 L130 36 C152 42 170 62 162 110 C158 94 152 82 142 76 C128 86 106 80 98 70 C86 84 64 84 52 94 C44 100 40 106 38 110 Z" fill="${c}" ${SW}/>
        <path d="M84 52 l6 10 M114 48 l-4 12 M138 62 l-8 8" stroke="${d}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    case 'lang':
      return `<path d="M38 120 C28 34 172 34 162 120 C160 92 144 66 104 60 C108 70 104 80 100 86 C96 76 92 66 98 60 C60 64 42 92 38 120 Z" fill="${c}" ${SW}/>${hl('M60 62 Q74 50 92 48')}`;
    case 'bob':
    case 'zoepfe':
      return `<path d="M38 112 C30 36 170 36 162 112 C160 98 157 88 151 82 C134 88 66 88 49 82 C43 88 40 98 38 112 Z" fill="${c}" ${SW}/>
        <path d="M72 84 l2 -10 M100 86 l0 -10 M128 84 l-2 -10" stroke="${d}" stroke-width="2.5" fill="none" stroke-linecap="round"/>${hl('M66 56 Q86 44 110 46')}`;
    case 'pferdeschwanz':
    case 'dutt':
      return `<path d="M38 110 C30 38 170 38 162 110 C158 90 148 76 132 70 C112 78 84 76 68 70 C52 76 42 90 38 110 Z" fill="${c}" ${SW}/>${hl('M66 54 Q88 42 114 46')}`;
    case 'locken': {
      let s = `<path d="M40 104 C34 40 166 40 160 104 Z" fill="${c}"/>`;
      for (const [x, y] of [[50, 84], [68, 72], [88, 68], [112, 68], [132, 72], [150, 84]]) s += `<circle cx="${x}" cy="${y}" r="13" fill="${c}" ${SW}/>`;
      return s + `<circle cx="80" cy="54" r="8" fill="${l}" opacity=".5"/>`;
    }
    default:
      return '';
  }
}

// ---------- Kleidung ----------
function patternDefs(o, ids) {
  let s = '';
  const tc = o.topColor || '#7cc4ff';
  if (o.top === 'ringel' || o.innerColor === 'ringel') {
    const base = o.top === 'ringel' ? tc : '#ffffff';
    const stripe = o.top === 'ringel' ? '#ffffff' : '#2a2b30';
    s += `<pattern id="${ids.stripe}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${base}"/><rect y="7" width="12" height="4.5" fill="${stripe}"/></pattern>`;
  }
  if (o.top === 'steppjacke') {
    s += `<pattern id="${ids.quilt}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${tc}"/><path d="M0 0H16M0 0V16" stroke="${shade(tc, 40)}" stroke-width="1.6"/></pattern>`;
  }
  if (o.accessory === 'tasche') {
    s += `<pattern id="${ids.leo}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#d9b88f"/><path d="M4 5 q3 -3 6 0 q-1 4 -6 0 M14 14 q3 -3 6 0 q-1 4 -6 0 M15 3 q2 2 0 4 M5 15 q2 2 0 4" fill="none" stroke="#5a3b22" stroke-width="2" stroke-linecap="round"/></pattern>`;
  }
  return s;
}

function torso(o, ids) {
  const tc = o.topColor || '#7cc4ff';
  const fill = o.top === 'ringel' ? `url(#${ids.stripe})` : o.top === 'steppjacke' ? `url(#${ids.quilt})` : tc;
  const body = `M66 156 Q100 146 134 156 Q144 196 142 230 Q100 240 58 230 Q56 196 66 156 Z`;
  let s = '';
  if (o.top === 'kleid') {
    s += `<path d="M62 196 L44 254 Q100 270 156 254 L138 196 Z" fill="${tc}" ${SW}/>
      <path d="M50 246 Q100 262 150 246" stroke="#fff" stroke-width="4" fill="none" opacity=".8" stroke-dasharray="2 8"/>`;
  }
  s += `<path d="${body}" fill="${fill}" ${SW}/>`;
  if (o.belly) s += `<ellipse cx="100" cy="206" rx="40" ry="26" fill="${fill}" ${SW}/><path d="M64 200 Q100 190 136 200" fill="none" stroke="${shade(tc, -20)}" stroke-width="2"/>`;
  switch (o.top) {
    case 'tshirt':
    case 'ringel':
    case 'kleid':
      s += `<path d="M86 150 Q100 166 114 150" fill="${o.skin}" ${SW}/>`;
      break;
    case 'hoodie':
      s += `<path d="M76 152 Q100 176 124 152" fill="${shade(tc, -18)}" ${SW}/><path d="M78 206 Q100 214 122 206 L120 222 L80 222 Z" fill="${shade(tc, -12)}" ${SW}/><path d="M94 160 l-2 18 M106 160 l2 18" stroke="#fff" stroke-width="2.5"/>`;
      break;
    case 'pulli':
      s += `<path d="M84 152 Q100 162 116 152" fill="none" ${SW}/><path d="M62 220 Q100 230 138 220" stroke="${shade(tc, -25)}" stroke-width="5" fill="none"/>
        <path d="M74 186 l8 -6 l8 6 l8 -6 l8 6 l8 -6 l8 6" stroke="${shade(tc, 45)}" stroke-width="3" fill="none"/>`;
      break;
    case 'steppjacke':
      s += `<path d="M88 150 L100 232 L112 150 Z" fill="url(#${ids.stripe})" ${SW}/><path d="M100 160 V232" stroke="#888" stroke-width="2"/>
        <path d="M80 150 Q74 160 86 168 M120 150 Q126 160 114 168" fill="${tc}" ${SW}/>`;
      break;
    case 'latzhose':
      s += `<path d="M86 150 Q100 164 114 150" fill="${o.skin}" ${SW}/><path d="M76 190 H124 V232 H76 Z" fill="${o.bottomColor}" ${SW}/>
        <path d="M78 190 L72 156 M122 190 L128 156" stroke="${o.bottomColor}" stroke-width="7"/><circle cx="82" cy="196" r="3" fill="#ffd23f"/><circle cx="118" cy="196" r="3" fill="#ffd23f"/><rect x="90" y="200" width="20" height="14" rx="3" fill="${shade(o.bottomColor, -15)}"/>`;
      break;
    case 'warnweste':
      s += `<path d="M86 150 Q100 164 114 150" fill="${o.skin}" ${SW}/><path d="M64 160 Q76 152 88 154 L94 232 L60 230 Q58 196 64 160 Z M136 160 Q124 152 112 154 L106 232 L140 230 Q142 196 136 160 Z" fill="#ff8a2b" ${SW}/>
        <path d="M60 196 H94 M106 196 H140 M60 212 H94 M106 212 H140" stroke="#f4f6a8" stroke-width="5"/>`;
      break;
  }
  return s;
}

function arms(o, pose) {
  const long = ['hoodie', 'steppjacke', 'pulli'].includes(o.top);
  const tc = o.top === 'warnweste' ? '#7f8a96' : o.top === 'latzhose' ? (o.topColor || '#fff') : o.topColor || '#7cc4ff';
  const sleeveFill = o.top === 'ringel' ? tc : tc;
  const arm = (side) => {
    const x = side === 'l' ? 58 : 122;
    const sleeve = long
      ? `<rect x="${x}" y="156" width="20" height="54" rx="10" fill="${sleeveFill}" ${SW}/>`
      : `<rect x="${x}" y="156" width="20" height="50" rx="10" fill="${o.skin}" ${SW}/><path d="M${x} 166 a10 10 0 0 1 20 0 v14 h-20 Z" fill="${sleeveFill}" ${SW}/>`;
    const hand = `<circle cx="${x + 10}" cy="${long ? 212 : 208}" r="10.5" fill="${o.skin}" ${SW}/>`;
    if (side === 'l') return `<g class="arm-l" style="transform-origin:68px 162px;transform:rotate(14deg)">${sleeve}${hand}</g>`;
    const rot = pose === 'wave' ? -150 : -14;
    return `<g class="arm-r ${pose === 'wave' ? 'waving' : ''}" style="transform-origin:132px 162px;transform:rotate(${rot}deg)">${sleeve}${hand}</g>`;
  };
  return arm('l') + arm('r');
}

function legs(o) {
  const bc = o.bottomColor || '#4a5668';
  const sk = o.skin;
  let s = '';
  const leg = (x) => {
    switch (o.bottom) {
      case 'shorts':
        return `<rect x="${x}" y="222" width="22" height="48" rx="10" fill="${sk}" ${SW}/><rect x="${x - 1}" y="222" width="24" height="20" rx="6" fill="${bc}" ${SW}/>`;
      case 'rock':
        return `<rect x="${x}" y="222" width="22" height="48" rx="10" fill="${sk}" ${SW}/>`;
      case 'leggings':
        return `<rect x="${x}" y="222" width="22" height="48" rx="10" fill="${bc}" ${SW}/>`;
      default:
        return `<rect x="${x}" y="222" width="22" height="48" rx="9" fill="${bc}" ${SW}/>`;
    }
  };
  if (o.top === 'kleid') s += `<rect x="76" y="230" width="22" height="40" rx="10" fill="${o.bottom === 'leggings' ? bc : sk}" ${SW}/><rect x="102" y="230" width="22" height="40" rx="10" fill="${o.bottom === 'leggings' ? bc : sk}" ${SW}/>`;
  else s += leg(76) + leg(102);
  if (o.bottom === 'jeans' && o.top !== 'kleid') s += `<path d="M87 236 v26 M113 236 v26" stroke="${shade(bc, 30)}" stroke-width="2" stroke-dasharray="3 4"/>`;
  if (o.bottom === 'rock' && o.top !== 'kleid') s += `<path d="M62 214 L50 252 Q100 264 150 252 L138 214 Z" fill="${bc}" ${SW}/><path d="M76 222 l-6 30 M100 224 v32 M124 222 l6 30" stroke="${shade(bc, -20)}" stroke-width="2.5"/>`;
  const sh = o.shoes || '#ff6f91';
  s += `<ellipse cx="86" cy="274" rx="17" ry="10" fill="${sh}" ${SW}/><ellipse cx="114" cy="274" rx="17" ry="10" fill="${sh}" ${SW}/>
    <path d="M76 270 q8 -5 16 0 M106 270 q8 -5 16 0" stroke="${shade(sh, 50)}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  return s;
}

// ---------- Gesicht ----------
function face(o, mood) {
  const sk = o.skin;
  let s = `<ellipse cx="38" cy="112" rx="11" ry="13" fill="${sk}" ${SW}/><ellipse cx="162" cy="112" rx="11" ry="13" fill="${sk}" ${SW}/>`;
  s += `<ellipse cx="100" cy="102" rx="62" ry="58" fill="${sk}" ${SW}/>`;
  s += `<ellipse cx="78" cy="78" rx="18" ry="9" fill="#fff" opacity=".22"/>`;
  return s;
}

function features(o, mood) {
  const eye = o.eyes || '#3b2516';
  const brow = o.hairColor ? shade(o.hairColor, -10) : '#3a2416';
  let s = '';
  if (o.makeup) s += `<ellipse cx="78" cy="104" rx="13" ry="8" fill="#7fb7e6" opacity=".7"/><ellipse cx="122" cy="104" rx="13" ry="8" fill="#7fb7e6" opacity=".7"/>`;
  if (mood === 'sleep') {
    s += `<path d="M68 114 Q78 122 88 114 M112 114 Q122 122 132 114" stroke="#3a2416" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  } else {
    for (const x of [78, 122]) {
      s += `<g class="eye"><ellipse cx="${x}" cy="112" rx="9" ry="11.5" fill="${eye}"/><ellipse cx="${x}" cy="113" rx="5" ry="7" fill="#1d130c"/>
        <circle cx="${x + 3}" cy="107" r="3.4" fill="#fff"/><circle cx="${x - 3}" cy="118" r="1.6" fill="#fff" opacity=".8"/></g>`;
    }
    if (o.lashes) s += `<path d="M66 106 l-5 -4 M68 102 l-3 -5 M134 106 l5 -4 M132 102 l3 -5" stroke="#1d130c" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  s += `<path d="M68 92 Q78 86 88 91 M112 91 Q122 86 132 92" stroke="${brow}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (o.cheeks !== false) s += `<ellipse cx="64" cy="132" rx="11" ry="7" fill="#ff8f9e" opacity="${o.makeup ? 0.75 : 0.45}"/><ellipse cx="136" cy="132" rx="11" ry="7" fill="#ff8f9e" opacity="${o.makeup ? 0.75 : 0.45}"/>`;
  if (o.freckles) s += `<g fill="${shade(o.skin, -55)}" opacity=".6"><circle cx="60" cy="124" r="1.6"/><circle cx="66" cy="127" r="1.6"/><circle cx="56" cy="128" r="1.4"/><circle cx="140" cy="124" r="1.6"/><circle cx="134" cy="127" r="1.6"/><circle cx="144" cy="128" r="1.4"/></g>`;
  s += `<ellipse cx="100" cy="125" rx="5" ry="3.8" fill="${shade(o.skin, -35)}"/>`;
  // Bart
  const bc = o.beardColor || '#3a2416';
  if (o.beard === 'voll' || o.beard === 'stoppel') {
    s += `<g opacity="${o.beard === 'stoppel' ? 0.38 : 1}"><path d="M40 102 C40 152 66 172 100 174 C134 172 160 152 160 102 C156 124 146 136 132 138 C122 130 112 128 100 130 C88 128 78 130 68 138 C54 136 44 124 40 102 Z" fill="${bc}" ${o.beard === 'voll' ? SW : ''}/>
      <path d="M78 136 C88 124 112 124 122 136 C112 132 88 132 78 136 Z" fill="${bc}"/></g>`;
  } else if (o.beard === 'mund') {
    s += `<path fill-rule="evenodd" d="M78 134 C86 120 114 120 122 134 C124 152 114 164 100 164 C86 164 76 152 78 134 Z M89 140 a11 7 0 1 0 22 0 a11 7 0 1 0 -22 0 Z" fill="${bc}"/>`;
  }
  // Mund
  const my = o.beard ? 140 : 138;
  const lip = o.makeup ? '#d4344f' : null;
  if (mood === 'surprised') s += `<ellipse cx="100" cy="${my + 2}" rx="6" ry="7" fill="#6b2b2b"/>`;
  else if (mood === 'sleep') s += `<ellipse cx="100" cy="${my + 2}" rx="4" ry="3" fill="#8a3b3b"/>`;
  else if (mood === 'laugh') s += `<path d="M86 ${my - 2} Q100 ${my + 18} 114 ${my - 2} Z" fill="#8a2f3a" ${SW}/><path d="M92 ${my + 6} Q100 ${my + 12} 108 ${my + 6}" fill="#ff7d8e"/>`;
  else s += `<path d="M88 ${my} Q100 ${my + 12} 112 ${my}" stroke="${lip || '#7a3b2b'}" stroke-width="${lip ? 5 : 3.5}" fill="none" stroke-linecap="round"/>`;
  return s;
}

function accessory(o, ids, layer) {
  const ac = o.accColor || '#ff6f91';
  const a = o.accessory;
  if (layer === 'back') {
    if (a === 'fluegel') return `<g class="wings" opacity=".9"><path d="M70 170 C20 120 6 170 30 196 C10 220 46 236 72 196 Z" fill="#e6f4ff" stroke="#9fc8ee" stroke-width="3"/><path d="M130 170 C180 120 194 170 170 196 C190 220 154 236 128 196 Z" fill="#e6f4ff" stroke="#9fc8ee" stroke-width="3"/>
      <circle cx="34" cy="170" r="4" fill="${ac}"/><circle cx="166" cy="170" r="4" fill="${ac}"/></g>`;
    if (a === 'tasche') return `<path d="M76 150 L130 214" stroke="#3a2a20" stroke-width="5"/>`;
    return '';
  }
  if (layer === 'body') {
    if (a === 'tasche') return `<path d="M120 204 h34 a6 6 0 0 1 6 6 v18 a12 12 0 0 1 -12 12 h-22 a12 12 0 0 1 -12 -12 v-18 a6 6 0 0 1 6 -6 Z" fill="url(#${ids.leo})" ${SW}/><path d="M76 150 L130 206" stroke="#3a2a20" stroke-width="4"/>`;
    return '';
  }
  // Kopf
  let s = '';
  if (o.glasses) s += `<g fill="none" stroke="${o.glasses}" stroke-width="3.5"><circle cx="78" cy="112" r="15"/><circle cx="122" cy="112" r="15"/><path d="M93 110 Q100 105 107 110 M63 108 L44 104 M137 108 L156 104"/></g><circle cx="73" cy="106" r="4" fill="#fff" opacity=".5"/><circle cx="117" cy="106" r="4" fill="#fff" opacity=".5"/>`;
  switch (a) {
    case 'brille': s += `<g fill="${ac}" fill-opacity=".18" stroke="${ac}" stroke-width="4"><circle cx="78" cy="112" r="16"/><circle cx="122" cy="112" r="16"/><path d="M94 110 Q100 104 106 110" fill="none"/></g>`; break;
    case 'schleife': s += `<g transform="translate(140 56) rotate(20)" ${SW}><path d="M0 0 L-24 -14 Q-30 0 -24 14 Z M0 0 L24 -14 Q30 0 24 14 Z" fill="${ac}"/><circle r="7" fill="${shade(ac, -20)}"/></g>`; break;
    case 'krone': s += `<g transform="translate(100 40)"><path d="M-30 12 L-34 -18 L-16 -2 L0 -26 L16 -2 L34 -18 L30 12 Z" fill="${ac}" ${SW}/><circle cx="0" cy="2" r="5" fill="#ff6f91"/><circle cx="-18" cy="6" r="3.5" fill="#6fd3c7"/><circle cx="18" cy="6" r="3.5" fill="#6fd3c7"/></g>`; break;
    case 'blume': s += `<g transform="translate(144 62)">${[0, 72, 144, 216, 288].map((r) => `<ellipse rx="8" ry="12" cy="-10" transform="rotate(${r})" fill="${ac}" stroke="${OUT}" stroke-width="2"/>`).join('')}<circle r="7" fill="#ffd23f" stroke="${OUT}" stroke-width="2"/></g>`; break;
    case 'haarreif': s += `<path d="M44 84 Q100 20 156 84" stroke="${ac}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="66" cy="54" r="5" fill="#fff"/><circle cx="100" cy="42" r="5" fill="#fff"/><circle cx="134" cy="54" r="5" fill="#fff"/>`; break;
    case 'muetze': s += `<path d="M36 92 C36 26 164 26 164 92 Z" fill="${ac}" ${SW}/><rect x="32" y="82" width="136" height="18" rx="9" fill="${shade(ac, -22)}" ${SW}/><circle cx="100" cy="28" r="14" fill="#fff" ${SW}/>`; break;
    case 'kappe': s += `<path d="M40 88 C40 30 160 30 160 88 Z" fill="${ac}" ${SW}/><path d="M100 86 Q150 78 186 92 Q160 100 100 94 Z" fill="${shade(ac, -22)}" ${SW}/><circle cx="100" cy="36" r="5" fill="${shade(ac, -30)}"/>`; break;
    case 'helm': s += `<path d="M38 90 C38 22 162 22 162 90 Z" fill="${ac}" ${SW}/><rect x="30" y="84" width="140" height="14" rx="7" fill="${shade(ac, -25)}" ${SW}/><path d="M100 30 V86" stroke="${shade(ac, -25)}" stroke-width="8"/>`; break;
  }
  return s;
}

/**
 * Erzeugt das SVG einer Figur.
 * @param {object} o Aussehen
 * @param {object} opt { pose:'stand'|'wave', mood:'happy'|'laugh'|'sleep'|'surprised', crop:'full'|'head'|'body', cls }
 */
export function personSVG(o, opt = {}) {
  const ids = { stripe: nid('st'), quilt: nid('qu'), leo: nid('leo') };
  const pose = opt.pose || 'stand';
  const mood = opt.mood || 'happy';
  const build = o.build || 1;
  const sc = opt.ignoreScale ? 1 : o.scale || 1;
  const vb = opt.crop === 'head' ? '18 8 164 176' : opt.crop === 'body' ? '30 136 140 150' : '0 0 200 292';
  const bodyT = `translate(100 0) scale(${build} 1) translate(-100 0)`;
  return `<svg class="person ${opt.cls || ''}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>${patternDefs(o, ids)}</defs>
  <g transform="translate(100 284) scale(${sc}) translate(-100 -284)">
    <ellipse cx="100" cy="282" rx="${46 * build}" ry="8" fill="#000" opacity=".12"/>
    <g class="body-bob">
    ${accessory(o, ids, 'back')}
    ${hairBack(o.hair, o.hairColor)}
    <g transform="${bodyT}">${legs(o)}${torso(o, ids)}${arms(o, pose)}</g>
    ${accessory(o, ids, 'body')}
    <g class="head">${face(o, mood)}${features(o, mood)}${hairFront(o.hair, o.hairColor)}${accessory(o, ids, 'head')}</g>
    </g>
  </g></svg>`;
}
