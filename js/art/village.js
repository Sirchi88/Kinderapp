// Das Dorf Sirchhausen – euer Grundstück im Allgäu, gezeichnet als große SVG-Szene (1600×900).
import { shade } from './person.js';

const OUT = '#5a3e2b';
const SW = `stroke="${OUT}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;
const SW2 = `stroke="${OUT}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;

export function roundTree(x, y, s = 1, c = '#6cc24a') {
  const d = shade(c, -28), l = shade(c, 30);
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="4" rx="56" ry="12" fill="#000" opacity=".12"/>
    <path d="M-10 0 L-8 -60 Q0 -66 8 -60 L10 0 Q0 6 -10 0 Z" fill="#9a6a44" ${SW}/>
    <path d="M-2 -40 q-14 -8 -22 -20 M4 -46 q12 -6 18 -18" stroke="#9a6a44" stroke-width="6" stroke-linecap="round" fill="none"/>
    <g ${SW}><circle cx="-34" cy="-86" r="34" fill="${d}"/><circle cx="34" cy="-86" r="34" fill="${d}"/><circle cx="0" cy="-118" r="42" fill="${c}"/>
    <circle cx="-32" cy="-96" r="30" fill="${c}"/><circle cx="32" cy="-96" r="30" fill="${c}"/></g>
    <circle cx="-14" cy="-134" r="12" fill="${l}" opacity=".7"/><circle cx="-40" cy="-108" r="7" fill="${l}" opacity=".6"/><circle cx="26" cy="-112" r="8" fill="${l}" opacity=".6"/>
  </g>`;
}

export function cypress(x, y, s = 1, c = '#4fa543') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="2" rx="26" ry="7" fill="#000" opacity=".12"/>
    <rect x="-5" y="-14" width="10" height="16" fill="#8a5c3a"/>
    <path d="M0 -150 C26 -110 30 -40 22 -10 Q0 0 -22 -10 C-30 -40 -26 -110 0 -150 Z" fill="${c}" ${SW}/>
    <path d="M-4 -120 q-10 30 -8 70 M8 -90 q6 30 2 60" stroke="${shade(c, 28)}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
  </g>`;
}

function bush(x, y, s = 1, c = '#5fb84a') {
  return `<g transform="translate(${x} ${y}) scale(${s})" ${SW2}><circle cx="-16" cy="-12" r="16" fill="${shade(c, -15)}"/><circle cx="16" cy="-12" r="16" fill="${shade(c, -15)}"/><circle cx="0" cy="-22" r="20" fill="${c}"/></g>`;
}

function flower(x, y, c) {
  return `<g transform="translate(${x} ${y})"><path d="M0 0 V-14" stroke="#4f9a3a" stroke-width="3"/>${[0, 72, 144, 216, 288].map((r) => `<ellipse cy="-20" rx="4.5" ry="6.5" transform="rotate(${r} 0 -14)" fill="${c}"/>`).join('')}<circle cy="-14" r="3.5" fill="#ffd23f"/></g>`;
}

function windowRect(x, y, w, h, frame = '#3d434c', cross = true) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${frame}" ${SW2}/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" rx="2" fill="#bfe3ff"/>
    <path d="M${x + 8} ${y + h - 12} L${x + w * 0.45} ${y + 9}" stroke="#fff" stroke-width="4" opacity=".7"/>
    ${cross ? `<path d="M${x + w / 2} ${y + 5} V${y + h - 5}" stroke="${frame}" stroke-width="4"/>` : ''}
    <rect x="${x - 4}" y="${y + h - 2}" width="${w + 8}" height="7" rx="3" fill="#e9e4da" ${SW2}/></g>`;
}

/**
 * Haus in 3/4-Ansicht: Giebel vorne links, lange Seite rechts.
 */
function house(o) {
  const { x, y, gw, h, gh, d, sl, wall, roof } = o;
  const side = shade(wall, -14);
  const A = [x, y + h], B = [x + gw, y + h], C = [x + gw, y], P = [x + gw / 2, y - gh];
  const Bp = [x + gw + d, y + h - d * sl], Cp = [x + gw + d, y - d * sl], Pp = [x + gw / 2 + d, y - gh - d * sl];
  const skew = `translate(0 ${sl * (x + gw)}) matrix(1 ${-sl} 0 1 0 0)`;
  let s = `<g class="house">`;
  s += `<path d="M${A} L${B} L${Bp} L${Bp[0] + 30},${Bp[1] + 12} L${A[0] - 20},${A[1] + 14} Z" fill="#000" opacity=".1"/>`;
  // Seitenwand
  s += `<path d="M${B} L${Bp} L${Cp} L${C} Z" fill="${side}" ${SW}/>`;
  s += `<g transform="${skew}">${o.sideContent || ''}</g>`;
  // Giebelwand
  s += `<path d="M${A} L${B} L${C} L${P} L${x},${y} Z" fill="${wall}" ${SW}/>`;
  s += o.frontContent || '';
  // Dach
  const rp = [[P[0], P[1] - 8], [C[0] + 16, C[1] + 12], [Cp[0] + 26, Cp[1] + 12], [Pp[0] + 6, Pp[1] - 8]];
  s += `<path d="M${rp.map((p) => p.join(',')).join(' L')} Z" fill="${roof}" ${SW}/>`;
  // Dachziegel-Linien
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    const a = [P[0] + (C[0] + 16 - P[0]) * t, P[1] - 8 + (C[1] + 20 - P[1]) * t];
    const b = [Pp[0] + 6 + (Cp[0] + 26 - Pp[0] - 6) * t, Pp[1] - 8 + (Cp[1] + 20 - Pp[1]) * t];
    s += `<path d="M${a} L${b}" stroke="${shade(roof, -22)}" stroke-width="2.5"/>`;
  }
  s += o.roofContent ? o.roofContent({ P, C, Cp, Pp, rp }) : '';
  s += `<path d="M${x - 14},${y + 12} L${P[0]},${P[1] - 8} L${C[0] + 14},${C[1] + 12}" fill="none" stroke="${shade(roof, -30)}" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M${x - 14},${y + 12} L${P[0]},${P[1] - 8} L${C[0] + 14},${C[1] + 12}" fill="none" stroke="${OUT}" stroke-width="2" stroke-linejoin="round" transform="translate(0 7)"/>`;
  if (o.chimney) s += `<g ${SW}><rect x="${o.chimney[0]}" y="${o.chimney[1]}" width="22" height="40" fill="#b7745a"/><rect x="${o.chimney[0] - 4}" y="${o.chimney[1] - 6}" width="30" height="9" fill="#8f5a46"/></g><g class="smoke"><circle cx="${o.chimney[0] + 11}" cy="${o.chimney[1] - 18}" r="8"/><circle cx="${o.chimney[0] + 18}" cy="${o.chimney[1] - 36}" r="11"/><circle cx="${o.chimney[0] + 8}" cy="${o.chimney[1] - 58}" r="13"/></g>`;
  s += `</g>`;
  return s;
}

function cottage(x, y, s, wall, roof, door) {
  // Gemütliches Großeltern-Häuschen
  return `<g transform="translate(${x} ${y}) scale(${s})">${house({
    x: 0, y: 0, gw: 150, h: 110, gh: 80, d: 150, sl: 0.18, wall, roof, chimney: [210, -90],
    frontContent: `${windowRect(48, -36, 54, 30, '#7a4a2c', false)}<path d="M50 110 V60 a25 25 0 0 1 50 0 V110 Z" fill="${door}" ${SW}/><circle cx="90" cy="86" r="3.5" fill="#ffd23f"/><path d="M60 64 a15 15 0 0 1 30 0" stroke="#fff" stroke-width="3" fill="none" opacity=".5"/>
      <rect x="40" y="108" width="70" height="10" rx="4" fill="#9a9a9a" ${SW2}/>`,
    sideContent: `${windowRect(176, 30, 44, 44, '#7a4a2c')}${windowRect(244, 30, 44, 44, '#7a4a2c')}<rect x="172" y="76" width="52" height="12" rx="4" fill="#c95a5a" ${SW2}/><rect x="240" y="76" width="52" height="12" rx="4" fill="#c95a5a" ${SW2}/>
      ${flower(180, 80, '#ff6f91')}${flower(196, 80, '#ffd23f')}${flower(212, 80, '#fff')}${flower(250, 80, '#ff6f91')}${flower(266, 80, '#ffd23f')}${flower(282, 80, '#fff')}`,
  })}</g>`;
}

function cow(x, y, s, id) {
  // Allgäuer Braunvieh, Seitenansicht
  return `<g transform="translate(${x} ${y}) scale(${s})"><g class="hot cow" data-hot="cow">
    <ellipse cx="0" cy="40" rx="70" ry="10" fill="#000" opacity=".12"/>
    <g ${SW}><rect x="-48" y="0" width="16" height="40" rx="6" fill="#8a6548"/><rect x="26" y="0" width="16" height="40" rx="6" fill="#8a6548"/>
    <ellipse cx="0" cy="-10" rx="62" ry="36" fill="#a57e60"/>
    <path d="M58 -12 q30 -6 34 -36" fill="none" stroke="#a57e60" stroke-width="12"/>
    <ellipse cx="78" cy="-38" rx="26" ry="22" fill="#a57e60"/><ellipse cx="96" cy="-30" rx="14" ry="12" fill="#efdcc6"/>
    <path d="M66 -58 q-6 -14 4 -18 M86 -58 q6 -14 -4 -18" fill="#f3ead6"/>
    <ellipse cx="58" cy="-46" rx="12" ry="6" fill="#a57e60" transform="rotate(-20 58 -46)"/>
    <path d="M-60 -10 q-14 20 -8 40" fill="none" stroke-width="4"/></g>
    <circle cx="80" cy="-42" r="3.5" fill="#2a1d14"/><circle cx="81" cy="-43.5" r="1.2" fill="#fff"/>
    <path d="M62 -18 q14 10 28 0" stroke="#c0392b" stroke-width="5" fill="none"/><path d="M70 -12 h12 l3 13 q-9 6 -18 0 Z" fill="#f5c542" ${SW2}/>
    <ellipse cx="-20" cy="-22" rx="16" ry="10" fill="#8a6548" opacity=".5"/>
  </g></g>`;
}

export function gameBadge(x, y, emoji) {
  return `<g class="room-badge" transform="translate(${x} ${y})"><g class="rb-in"><circle r="36" fill="#fffdf7" ${SW}/><text y="14" text-anchor="middle" font-size="38">${emoji}</text></g></g>`;
}

function easel() {
  return `<g transform="translate(450 712)"><g class="hot" data-hot="easel">
    <ellipse cx="0" cy="6" rx="56" ry="10" fill="#000" opacity=".1"/>
    <g ${SW} fill="#b8794c"><path d="M-40 4 L-10 -150 L-2 -150 L-30 4 Z"/><path d="M40 4 L10 -150 L2 -150 L30 4 Z"/><path d="M-3 -150 h6 l4 120 h-14 Z"/></g>
    <rect x="-52" y="-150" width="104" height="84" rx="6" fill="#fff" ${SW}/>
    <path d="M-40 -90 q20 -40 40 -10 t40 -20" stroke="#ff6f91" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="-24" cy="-126" r="12" fill="#ffd23f"/><path d="M10 -120 l12 -14 l12 14 Z" fill="#7cc4ff"/><path d="M-44 -76 h88" stroke="#8fdc4a" stroke-width="7" stroke-linecap="round"/>
    <rect x="-56" y="-70" width="112" height="10" rx="4" fill="#a96a42" ${SW}/>
    <g transform="translate(48 -10)"><ellipse rx="26" ry="18" fill="#f3d6a8" ${SW}/><circle cx="-10" cy="-6" r="5" fill="#ff4d4d"/><circle cx="4" cy="-9" r="5" fill="#4fa3ff"/><circle cx="12" cy="2" r="5" fill="#ffd23f"/><circle cx="-6" cy="6" r="5" fill="#8fdc4a"/></g>
    ${gameBadge(0, -196, '🎨')}
  </g></g>`;
}

export function sirchHouseScene() {
  // ---------- Hintergrund ----------
  let s = `<defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset=".55" stop-color="#cdeeff"/><stop offset="1" stop-color="#f1fbff"/></linearGradient>
    <linearGradient id="lawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9edb6e"/><stop offset="1" stop-color="#7cc957"/></linearGradient>
    <linearGradient id="pond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd6f5"/><stop offset="1" stop-color="#3fa8d6"/></linearGradient>
    <pattern id="grass" width="60" height="40" patternUnits="userSpaceOnUse"><path d="M10 30 l3 -8 l3 8 M40 14 l3 -7 l3 7" stroke="#6ab84a" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="30" cy="34" r="1.6" fill="#fff" opacity=".6"/></pattern>
  </defs>`;
  s += `<rect width="1600" height="900" fill="url(#sky)"/>`;
  s += `<g transform="translate(300 120)"><g class="hot sun" data-hot="sun"><g class="sun-rays">${Array.from({ length: 12 }, (_, i) => `<rect x="-6" y="-92" width="12" height="26" rx="6" fill="#ffd23f" transform="rotate(${i * 30})"/>`).join('')}</g>
    <circle r="58" fill="#ffd94a" stroke="#f0a92a" stroke-width="4"/><circle cx="-18" cy="-8" r="6" fill="#7a4a1c"/><circle cx="18" cy="-8" r="6" fill="#7a4a1c" class="sun-eye"/><path d="M-18 14 Q0 30 18 14" stroke="#7a4a1c" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="-32" cy="12" rx="9" ry="6" fill="#ff9e7a" opacity=".6"/><ellipse cx="32" cy="12" rx="9" ry="6" fill="#ff9e7a" opacity=".6"/></g></g>`;
  const cloud = (x, y, sc, cls) => `<g class="cloud ${cls}" transform="translate(${x} ${y}) scale(${sc})"><g fill="#fff"><ellipse cx="0" cy="0" rx="70" ry="28"/><circle cx="-30" cy="-16" r="30"/><circle cx="20" cy="-24" r="38"/><circle cx="56" cy="-6" r="24"/></g></g>`;
  s += cloud(620, 110, 0.9, 'c1') + cloud(1150, 80, 1.1, 'c2') + cloud(1450, 160, 0.7, 'c3');
  // Allgäuer Berge
  s += `<path d="M-20 360 L120 230 L210 280 L360 150 L470 250 L560 190 L700 300 L820 170 L960 290 L1080 160 L1200 260 L1320 180 L1450 270 L1620 200 L1620 380 L-20 380 Z" fill="#a9c3dc" stroke="#7f9cba" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M360 150 L330 178 L352 172 L366 190 L384 168 L400 176 Z M820 170 L792 196 L812 192 L826 208 L842 190 L856 196 Z M1080 160 L1050 188 L1072 184 L1086 200 L1102 182 L1118 188 Z M1320 180 L1296 204 L1316 200 L1328 214 L1342 198 L1356 202 Z M120 230 L98 252 L116 248 L128 262 L142 248 Z" fill="#fff"/>`;
  s += `<path d="M-20 380 L80 300 L200 350 L300 290 L420 340 L560 280 L700 350 L860 300 L1000 360 L1140 290 L1280 340 L1400 300 L1620 350 L1620 400 L-20 400 Z" fill="#8fb3cf" opacity=".85"/>`;
  // Hügel mit Kühen
  s += `<path d="M-20 420 Q200 330 460 380 T900 370 T1340 360 T1620 380 L1620 470 L-20 470 Z" fill="#a8dc7c" stroke="#7fbf5a" stroke-width="3"/>`;
  s += `<path d="M80 392 l600 -20" stroke="#c49a6c" stroke-width="3" stroke-dasharray="2 18" stroke-linecap="round"/>`;
  s += cow(500, 372, 0.42) + cow(1300, 366, 0.38) + cow(1430, 380, 0.34);
  for (const [x, y, sc] of [[60, 410, 0.45], [160, 400, 0.4], [1500, 400, 0.45], [1560, 410, 0.4], [700, 386, 0.35], [760, 390, 0.32]]) s += roundTree(x, y, sc, '#5fb84a');
  // Wiese
  s += `<rect x="-20" y="430" width="1640" height="490" fill="url(#lawn)"/><rect x="-20" y="430" width="1640" height="490" fill="url(#grass)"/>`;
  // Dorfweg
  s += `<path d="M-20 500 Q400 470 800 488 T1620 480 L1620 528 Q1200 520 800 534 T-20 548 Z" fill="#e8d3a8" stroke="#cdb183" stroke-width="3"/>`;

  // ---------- Großeltern ----------
  s += `<g class="hot" data-hot="auerbach">${roundTree(170, 470, 0.7)}${cottage(200, 360, 0.62, '#fff4e2', '#5a8f5c', '#c96f4a')}
     <g transform="translate(250 488)"><rect x="-3" y="-30" width="6" height="34" fill="#8a5c3a"/><rect x="-40" y="-48" width="80" height="26" rx="6" fill="#c98b55" ${SW2}/><text x="0" y="-30" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Auerbach</text></g>
     <g id="gp-auerbach"></g></g>`;
  s += `<g class="hot" data-hot="mindelheim">${roundTree(1420, 476, 0.7, '#72c64f')}${cottage(1150, 352, 0.62, '#fff8ee', '#c6643f', '#5f8fc9')}
     <g transform="translate(1292 488)"><rect x="-3" y="-30" width="6" height="34" fill="#8a5c3a"/><rect x="-46" y="-48" width="92" height="26" rx="6" fill="#c98b55" ${SW2}/><text x="0" y="-30" text-anchor="middle" font-size="14" font-weight="800" fill="#fff">Mindelheim</text></g>
     <g id="gp-mindelheim"></g></g>`;

  // ---------- Euer Grundstück ----------
  s += `<path d="M380 560 L1180 520 L1260 600 L1240 820 L360 840 Z" fill="#000" opacity=".02"/>`;
  // Hecke hinten
  for (let x = 400; x < 1130; x += 34) s += bush(x, 566 - (x - 400) * 0.04, 0.9, '#58b043');
  s += `<g class="hot" data-hot="search">${cypress(1150, 590, 1.0)}${cypress(1185, 600, 0.85)}${roundTree(1110, 560, 0.7)}<g transform="translate(1138 498)"><circle r="16" fill="#a7a9ab" stroke="#4a3e36" stroke-width="3"/><path d="M-14 -8 L-10 -24 L-2 -14 Z M2 -14 L10 -24 L14 -8 Z" fill="#a7a9ab" stroke="#4a3e36" stroke-width="3"/><circle cx="-5" cy="-2" r="3" fill="#2a1d14"/><circle cx="5" cy="-2" r="3" fill="#2a1d14"/></g>${gameBadge(1168, 420, '🔍')}</g>`;

  // Garage
  s += `<g class="hot" data-hot="garage">
    <path d="M440 470 L600 470 L600 610 L440 610 Z" fill="#f6f4ef" ${SW}/>
    <path d="M430 462 L612 462 L612 476 L430 476 Z" fill="#3d4148" ${SW}/>
    <g class="garage-door-wrap"><rect x="462" y="506" width="116" height="104" fill="#5d5f63" ${SW2}/>
      <g class="bike" transform="translate(520 586) scale(.9)"><circle cx="-24" cy="0" r="16" fill="none" stroke="#333" stroke-width="5"/><circle cx="24" cy="0" r="16" fill="none" stroke="#333" stroke-width="5"/><path d="M-24 0 L-4 -24 L18 -24 L24 0 M-4 -24 L-10 -34 M18 -24 L16 -36 L26 -38" stroke="#ff6f91" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M-16 -36 h12" stroke="#333" stroke-width="5" stroke-linecap="round"/></g>
      <g class="garage-door"><rect x="462" y="506" width="116" height="104" fill="#d9d6d0" ${SW2}/>${[0, 1, 2, 3, 4].map((i) => `<path d="M466 ${524 + i * 18} H574" stroke="#b7b3ab" stroke-width="3"/>`).join('')}<rect x="504" y="596" width="32" height="5" rx="2" fill="#8d8a84"/></g></g>
  </g>`;

  // Haupthaus
  const solar = ({ P, C, Cp, Pp }) => {
    // Solarmodule auf der Dachfläche
    let o = '';
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    for (let col = 0; col < 5; col++) {
      for (let row = 0; row < 2; row++) {
        const u0 = 0.12 + col * 0.15, u1 = u0 + 0.13;
        const v0 = 0.2 + row * 0.34, v1 = v0 + 0.3;
        const q = (u, v) => lerp(lerp(P, Pp, u), lerp(C, Cp, u), v);
        const pts = [q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)];
        o += `<path d="M${pts.map((p) => p.join(',')).join(' L')} Z" fill="#2f4f8f" stroke="#c9d4e6" stroke-width="2.5"/>`;
        const m1 = lerp(pts[0], pts[3], 0.5), m2 = lerp(pts[1], pts[2], 0.5);
        o += `<path d="M${m1} L${m2}" stroke="#5f80c0" stroke-width="1.5"/>`;
      }
    }
    o += `<path d="M${lerp(P, Pp, 0.14)} L${lerp(P, Pp, 0.24)}" stroke="#fff" stroke-width="5" opacity=".5" stroke-linecap="round"/>`;
    return o;
  };
  s += `<g class="hot" data-hot="house">${house({
    x: 600, y: 420, gw: 180, h: 190, gh: 110, d: 340, sl: 0.18, wall: '#fbfaf6', roof: '#3e4249', roofContent: solar,
    frontContent: `${windowRect(660, 350, 60, 44)}${windowRect(626, 460, 50, 70)}${windowRect(706, 460, 50, 70)}
      <path d="M600 600 h180" stroke="#d8d2c6" stroke-width="10"/>`,
    sideContent: `${windowRect(812, 452, 60, 72)}${windowRect(996, 452, 60, 72)}
      <rect x="896" y="470" width="78" height="140" rx="4" fill="#3d434c" ${SW2}/><rect x="903" y="477" width="64" height="133" fill="#9fd0f2"/><path d="M935 477 V610" stroke="#3d434c" stroke-width="4"/>
      <path d="M908 600 L930 490" stroke="#fff" stroke-width="5" opacity=".6"/>`,
  })}${gameBadge(690, 262, '🧸')}</g>`;

  // Terrasse mit Pergola (vor der langen Seite)
  const sl = 0.18;
  const tx = (x) => 600 + 180 + x; // ab Hausecke
  const ty = (x, y) => 610 - x * sl + y;
  const deck = [[tx(20), ty(20, 0)], [tx(330), ty(330, 0)], [tx(330) + 20, ty(330, 70)], [tx(20) + 20, ty(20, 70)]];
  s += `<g class="hot" data-hot="terrace">
    <path d="M${deck.map((p) => p.join(',')).join(' L')} Z" fill="#c9875a" ${SW}/>
    ${[1, 2, 3, 4, 5, 6].map((i) => `<path d="M${tx(20) + i * 2.8},${ty(20, i * 10)} L${tx(330) + i * 2.8},${ty(330, i * 10)}" stroke="#a96a42" stroke-width="2"/>`).join('')}
    <path d="M${deck[3]} L${deck[2]} L${deck[2][0]},${deck[2][1] + 14} L${deck[3][0]},${deck[3][1] + 14} Z" fill="#a96a42" ${SW2}/>
    <g ${SW2} fill="#b8794c">
      <rect x="${tx(30) + 16}" y="${ty(30, 62) - 190}" width="10" height="190"/><rect x="${tx(320) + 16}" y="${ty(320, 62) - 190}" width="10" height="190"/>
      <rect x="${tx(175) + 16}" y="${ty(175, 62) - 190}" width="10" height="190"/>
    </g>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const xx = 30 + i * 40; return `<path d="M${tx(xx) + 21},${ty(xx, 62) - 188} L${tx(xx) - 4},${ty(xx, 0) - 178}" stroke="#a96a42" stroke-width="8" stroke-linecap="round"/>`; }).join('')}
    <path d="M${tx(20) + 21},${ty(20, 62) - 192} L${tx(335) + 21},${ty(335, 62) - 192}" stroke="#b8794c" stroke-width="12" stroke-linecap="round"/>
    <path d="M${tx(20) + 21},${ty(20, 62) - 192} L${tx(335) + 21},${ty(335, 62) - 192}" stroke="${OUT}" stroke-width="2" transform="translate(0 7)"/>
    <!-- Tisch & Stühle -->
    <g transform="translate(${tx(210)} ${ty(210, 40)})"><rect x="-50" y="-44" width="100" height="10" rx="3" fill="#c98b55" ${SW2}/><rect x="-44" y="-34" width="7" height="34" fill="#a96a42"/><rect x="37" y="-34" width="7" height="34" fill="#a96a42"/>
      <rect x="-80" y="-48" width="8" height="48" fill="#a96a42"/><rect x="-80" y="-22" width="28" height="7" fill="#c98b55"/><rect x="72" y="-48" width="8" height="48" fill="#a96a42"/><rect x="52" y="-22" width="28" height="7" fill="#c98b55"/>
      <g ${SW2}><rect x="-40" y="-56" width="18" height="13" rx="3" fill="#ff9fb2"/><rect x="-18" y="-58" width="18" height="13" rx="3" fill="#ff9fb2"/><rect x="4" y="-56" width="18" height="13" rx="3" fill="#fff"/><rect x="26" y="-58" width="18" height="13" rx="3" fill="#ff9fb2"/></g></g>
    <g transform="translate(${tx(305)} ${ty(305, 30)})"><path d="M-14 0 L-18 -26 H18 L14 0 Z" fill="#d9744a" ${SW2}/><circle cx="-8" cy="-40" r="14" fill="#5fb84a" ${SW2}/><circle cx="8" cy="-46" r="14" fill="#6cc24a" ${SW2}/><circle cx="0" cy="-58" r="12" fill="#7fd05a" ${SW2}/></g>
    <g id="terrace-people"></g>
    ${gameBadge(tx(210), ty(210, 40) - 110, '🃏')}
  </g>`;

  // Schaukel
  s += `<g transform="translate(300 700)"><g class="hot" data-hot="swing">
    <ellipse cx="0" cy="8" rx="90" ry="14" fill="#000" opacity=".1"/>
    <g ${SW} fill="#b8794c"><path d="M-80 6 L-56 -170 L-44 -170 L-66 6 Z"/><path d="M80 6 L56 -170 L44 -170 L66 6 Z"/><rect x="-68" y="-182" width="136" height="16" rx="6"/></g>
    <g class="swing-seat" style="transform-origin:0px -168px"><path d="M-26 -166 V-46 M26 -166 V-46" stroke="#6b4a32" stroke-width="4"/><rect x="-36" y="-50" width="72" height="12" rx="5" fill="#c98b55" ${SW}/></g>
  </g></g>`;

  s += easel();

  // Trittsteine
  for (const [x, y] of [[760, 880], [720, 840], [700, 798], [720, 760], [770, 728], [820, 700]]) s += `<ellipse cx="${x}" cy="${y}" rx="30" ry="12" fill="#d2c3a8" ${SW2}/>`;

  // Blumenbeete
  const bed = (x, y, w, cols) => {
    let f = '';
    for (let i = 0; i < Math.floor(w / 24); i++) f += flower(x + 16 + i * 24, y + 4 - (i % 2) * 6, cols[i % cols.length]);
    return `<g class="hot flowerbed" data-hot="flowers"><rect x="${x}" y="${y}" width="${w}" height="30" rx="6" fill="#7a4a2c" ${SW2}/><rect x="${x}" y="${y + 18}" width="${w}" height="14" rx="4" fill="#b85a3c" ${SW2}/>${f}</g>`;
  };
  s += bed(470, 770, 150, ['#ff5a6e', '#ffd23f', '#ffffff']) + bed(880, 800, 170, ['#c78bff', '#ff8fc8', '#ff5a6e']) + bed(1000, 690, 120, ['#ffd23f', '#ff9f1c']);

  // Teich
  s += `<g class="hot" data-hot="pond">
    <ellipse cx="1210" cy="712" rx="104" ry="44" fill="#b9b2a4" ${SW}/>
    <ellipse cx="1210" cy="708" rx="86" ry="33" fill="url(#pond)"/>
    <ellipse class="ripple" cx="1190" cy="708" rx="20" ry="7" fill="none" stroke="#fff" stroke-width="3" opacity="0"/>
    <path d="M1170 700 q20 -8 40 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>
    <ellipse cx="1246" cy="714" rx="16" ry="7" fill="#5fb84a"/><path d="M1246 714 l14 -4" stroke="#3fa8d6" stroke-width="3"/>
    ${[[1110, 700], [1126, 736], [1170, 754], [1236, 756], [1290, 740], [1312, 706], [1284, 676], [1140, 678]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="11" fill="#c9c2b4" ${SW2}/>`).join('')}
    <g ${SW2}><path d="M1300 690 q-4 -40 4 -54" stroke="#4f9a3a" stroke-width="4" fill="none"/><path d="M1312 692 q2 -32 12 -44" stroke="#4f9a3a" stroke-width="4" fill="none"/><ellipse cx="1305" cy="634" rx="5" ry="12" fill="#8a5c3a"/><ellipse cx="1325" cy="646" rx="5" ry="12" fill="#8a5c3a"/></g>
  </g>`;
  // Schildkröte
  s += `<g transform="translate(1110 760)"><g class="hot turtle" data-hot="turtle">
    <g class="turtle-legs"><ellipse cx="-20" cy="8" rx="9" ry="6" fill="#9cc96a" ${SW2}/><ellipse cx="20" cy="8" rx="9" ry="6" fill="#9cc96a" ${SW2}/>
    <g class="turtle-head"><ellipse cx="38" cy="-6" rx="14" ry="11" fill="#9cc96a" ${SW2}/><circle cx="43" cy="-9" r="5" fill="#ff8a3d"/><circle cx="44" cy="-9" r="2.5" fill="#2a1d14"/></g></g>
    <path d="M-34 6 Q-34 -32 0 -32 Q34 -32 34 6 Z" fill="#c4874a" ${SW}/><path d="M-16 -2 l8 -16 h16 l8 16 Z M-30 2 l8 -14 M30 2 l-8 -14" fill="#a96a35" stroke="#7a4a22" stroke-width="2"/>
  </g></g>`;

  // Schuppen
  s += `<g transform="translate(1290 690)"><g class="hot" data-hot="shed">
    <path d="M0 140 L150 140 L150 30 L0 30 Z" fill="#e9e2d2" ${SW}/>${[1, 2, 3, 4, 5, 6].map((i) => `<path d="M${i * 21} 32 V138" stroke="#cfc6b2" stroke-width="2.5"/>`).join('')}
    <path d="M-12 36 L162 36 L150 0 L0 0 Z" fill="#5d6168" ${SW}/>
    <rect x="22" y="56" width="58" height="84" fill="#7a6a58" ${SW2}/><g class="shed-door"><rect x="22" y="56" width="58" height="84" fill="#d6ccb6" ${SW2}/><path d="M26 60 L76 136 M76 60 L26 136" stroke="#b9ad94" stroke-width="3"/><circle cx="70" cy="98" r="3.5" fill="#6b5a48"/></g>
    <circle cx="118" cy="66" r="11" fill="#fff6c9" stroke="#8a8a8a" stroke-width="3" class="lamp"/>
  </g></g>`;

  // Vordere Bäume & Büsche
  s += roundTree(80, 860, 1.2) + roundTree(1560, 860, 1.25, '#72c64f') + cypress(200, 830, 1.1) + bush(1080, 880, 1.6) + bush(390, 890, 1.4, '#6cc24a');
  s += `<g id="bailey-layer"></g><g id="kid-layer"></g><g id="fx-layer"></g>`;
  return s;
}
