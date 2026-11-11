// Ausmalbilder: Flächen mit class="rg" lassen sich mit dem Farbeimer füllen, class="ln" sind nur Linien.
// Koordinaten: 800 × 600
const sun = (x, y, r = 50) => `<circle class="rg" cx="${x}" cy="${y}" r="${r}"/>` + Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4; return `<path class="ln" d="M${x + Math.cos(a) * (r + 12)} ${y + Math.sin(a) * (r + 12)} L${x + Math.cos(a) * (r + 32)} ${y + Math.sin(a) * (r + 32)}"/>`; }).join('');
const cloud = (x, y, s = 1) => `<path class="rg" d="M${x} ${y} c${-40 * s} 0 ${-40 * s} ${-50 * s} 0 ${-50 * s} c${10 * s} ${-36 * s} ${70 * s} ${-36 * s} ${80 * s} 0 c${40 * s} 0 ${40 * s} ${50 * s} 0 ${50 * s} Z"/>`;
const flower = (x, y, r = 16) => `<path class="ln" d="M${x} ${y} V${y + 60}"/>` + [0, 72, 144, 216, 288].map((d) => `<ellipse class="rg" cx="${x}" cy="${y - r}" rx="${r * 0.7}" ry="${r}" transform="rotate(${d} ${x} ${y})"/>`).join('') + `<circle class="rg" cx="${x}" cy="${y}" r="${r * 0.6}"/>`;

export const TEMPLATES = {
  bailey: {
    name: 'Bailey', svg: `
    ${sun(90, 90)}<path class="rg" d="M0 520 Q400 470 800 520 V600 H0 Z"/>
    <path class="rg" d="M520 470 Q660 470 630 330 Q620 296 596 318 Q616 420 506 432 Z"/>
    <ellipse class="rg" cx="400" cy="420" rx="135" ry="125"/><ellipse class="rg" cx="400" cy="450" rx="72" ry="84"/>
    <path class="rg" d="M290 200 L300 80 L380 160 Z"/><path class="rg" d="M510 200 L500 80 L420 160 Z"/>
    <path class="rg" d="M306 168 L310 112 L352 154 Z"/><path class="rg" d="M494 168 L490 112 L448 154 Z"/>
    <ellipse class="rg" cx="400" cy="225" rx="135" ry="112"/>
    <path class="rg" d="M372 120 L384 168 L400 120 L416 168 L428 120 Q400 112 372 120 Z"/>
    <ellipse class="rg" cx="348" cy="212" rx="24" ry="30"/><ellipse class="rg" cx="452" cy="212" rx="24" ry="30"/>
    <ellipse class="rg" cx="348" cy="216" rx="9" ry="20"/><ellipse class="rg" cx="452" cy="216" rx="9" ry="20"/>
    <circle class="rg" cx="318" cy="262" r="18"/><circle class="rg" cx="482" cy="262" r="18"/>
    <path class="rg" d="M386 254 L414 254 L400 270 Z"/><path class="ln" d="M400 270 Q390 290 372 284 M400 270 Q410 290 428 284 M360 268 L290 260 M360 278 L292 292 M440 268 L510 260 M440 278 L508 292"/>
    <ellipse class="rg" cx="348" cy="540" rx="44" ry="24"/><ellipse class="rg" cx="452" cy="540" rx="44" ry="24"/>
    ${flower(120, 450)}${flower(690, 440)}`,
  },
  haus: {
    name: 'Unser Haus', svg: `
    ${sun(690, 90)}${cloud(150, 120)}<path class="rg" d="M0 500 H800 V600 H0 Z"/>
    <rect class="rg" x="470" y="140" width="44" height="100"/>
    <rect class="rg" x="200" y="290" width="380" height="220"/><path class="rg" d="M170 300 L390 130 L610 300 Z"/>
    <path class="rg" d="M300 230 L340 200 L380 230 L360 250 L320 250 Z"/><path class="rg" d="M420 230 L470 190 L520 230 L500 252 L440 252 Z"/>
    <path class="rg" d="M350 510 V420 Q390 380 430 420 V510 Z"/><circle class="rg" cx="418" cy="468" r="7"/>
    <rect class="rg" x="236" y="330" width="80" height="70" rx="6"/><rect class="rg" x="464" y="330" width="80" height="70" rx="6"/>
    <path class="ln" d="M276 330 V400 M236 365 H316 M504 330 V400 M464 365 H544"/>
    <rect class="rg" x="660" y="380" width="30" height="130"/><circle class="rg" cx="675" cy="330" r="72"/>
    <ellipse class="rg" cx="120" cy="470" rx="46" ry="30"/><path class="rg" d="M80 470 L80 420 L120 380 L160 420 L160 470 Z"/>
    ${flower(250, 470, 12)}${flower(560, 470, 12)}`,
  },
  kuh: {
    name: 'Allgäuer Kuh', svg: `
    ${sun(90, 80)}<path class="rg" d="M0 120 L120 40 L230 110 L360 20 L480 120 L600 50 L800 140 V230 H0 Z"/><path class="rg" d="M0 470 Q400 420 800 470 V600 H0 Z"/>
    <rect class="rg" x="250" y="440" width="40" height="110" rx="14"/><rect class="rg" x="320" y="455" width="40" height="100" rx="14"/><rect class="rg" x="430" y="455" width="40" height="100" rx="14"/><rect class="rg" x="500" y="440" width="40" height="110" rx="14"/>
    <path class="rg" d="M210 360 Q150 380 160 470 Q170 480 180 470 Q180 400 220 390 Z"/>
    <ellipse class="rg" cx="390" cy="380" rx="190" ry="110"/>
    <ellipse class="rg" cx="330" cy="350" rx="56" ry="38"/><ellipse class="rg" cx="460" cy="420" rx="42" ry="30"/>
    <path class="rg" d="M570 230 Q556 190 576 170 Q584 200 596 220 Z"/><path class="rg" d="M660 230 Q676 190 656 170 Q648 200 636 220 Z"/>
    <ellipse class="rg" cx="548" cy="262" rx="34" ry="16" transform="rotate(-20 548 262)"/><ellipse class="rg" cx="690" cy="262" rx="34" ry="16" transform="rotate(20 690 262)"/>
    <ellipse class="rg" cx="616" cy="292" rx="80" ry="72"/><ellipse class="rg" cx="626" cy="330" rx="56" ry="36"/>
    <circle class="rg" cx="586" cy="276" r="12"/><circle class="rg" cx="650" cy="276" r="12"/><ellipse class="rg" cx="608" cy="330" rx="8" ry="11"/><ellipse class="rg" cx="644" cy="330" rx="8" ry="11"/>
    <path class="rg" d="M560 360 Q616 390 676 360 L672 376 Q616 404 562 376 Z"/><path class="rg" d="M600 382 H636 L644 420 Q618 436 592 420 Z"/>
    ${flower(110, 520, 12)}${flower(700, 520, 12)}`,
  },
  einhorn: {
    name: 'Einhorn', svg: `
    ${cloud(140, 150)}${cloud(660, 120, 0.8)}<path class="rg" d="M0 520 Q400 480 800 520 V600 H0 Z"/>
    <path class="rg" d="M80 420 A320 320 0 0 1 720 420 L680 420 A280 280 0 0 0 120 420 Z"/><path class="rg" d="M120 420 A280 280 0 0 1 680 420 L640 420 A240 240 0 0 0 160 420 Z"/><path class="rg" d="M160 420 A240 240 0 0 1 640 420 L600 420 A200 200 0 0 0 200 420 Z"/>
    <ellipse class="rg" cx="400" cy="450" rx="110" ry="90"/>
    <rect class="rg" x="320" y="500" width="40" height="70" rx="16"/><rect class="rg" x="440" y="500" width="40" height="70" rx="16"/>
    <circle class="rg" cx="290" cy="200" r="34"/><circle class="rg" cx="276" cy="260" r="34"/><circle class="rg" cx="284" cy="320" r="32"/><circle class="rg" cx="320" cy="170" r="30"/>
    <path class="rg" d="M320 200 L304 120 L370 170 Z"/><path class="rg" d="M480 200 L496 120 L430 170 Z"/>
    <ellipse class="rg" cx="400" cy="270" rx="115" ry="105"/>
    <path class="rg" d="M380 172 L400 70 L420 172 Z"/><path class="ln" d="M386 150 L414 140 M390 124 L410 116 M394 100 L406 94"/>
    <ellipse class="rg" cx="400" cy="320" rx="56" ry="36"/><circle class="rg" cx="358" cy="256" r="14"/><circle class="rg" cx="442" cy="256" r="14"/>
    <circle class="rg" cx="324" cy="300" r="16"/><circle class="rg" cx="476" cy="300" r="16"/>
    <path class="ln" d="M380 330 Q400 344 420 330"/><circle class="rg" cx="384" cy="314" r="5"/><circle class="rg" cx="416" cy="314" r="5"/>`,
  },
  schmetterling: {
    name: 'Schmetterling', svg: `
    ${sun(700, 80)}<path class="rg" d="M0 520 Q400 490 800 520 V600 H0 Z"/>
    <path class="rg" d="M390 260 C300 80 120 110 160 230 C180 290 300 300 390 290 Z"/><path class="rg" d="M410 260 C500 80 680 110 640 230 C620 290 500 300 410 290 Z"/>
    <path class="rg" d="M390 300 C280 300 200 380 250 440 C300 480 370 420 390 330 Z"/><path class="rg" d="M410 300 C520 300 600 380 550 440 C500 480 430 420 410 330 Z"/>
    <circle class="rg" cx="250" cy="190" r="34"/><circle class="rg" cx="550" cy="190" r="34"/><circle class="rg" cx="300" cy="380" r="24"/><circle class="rg" cx="500" cy="380" r="24"/>
    <circle class="rg" cx="320" cy="250" r="16"/><circle class="rg" cx="480" cy="250" r="16"/>
    <ellipse class="rg" cx="400" cy="320" rx="22" ry="110"/><circle class="rg" cx="400" cy="196" r="28"/>
    <path class="ln" d="M392 172 Q370 120 340 110 M408 172 Q430 120 460 110"/><circle class="rg" cx="338" cy="108" r="10"/><circle class="rg" cx="462" cy="108" r="10"/>
    ${flower(140, 480, 18)}${flower(660, 480, 18)}${flower(240, 500, 12)}${flower(560, 500, 12)}`,
  },
  fisch: {
    name: 'Fisch', svg: `
    <path class="rg" d="M0 520 Q200 490 400 520 T800 520 V600 H0 Z"/>
    <path class="rg" d="M80 520 Q60 440 90 380 Q110 440 100 520 Z"/><path class="rg" d="M700 520 Q690 420 730 360 Q740 440 720 520 Z"/>
    <path class="rg" d="M560 300 L720 200 Q700 300 720 400 Z"/>
    <path class="rg" d="M380 200 Q440 120 500 210 Z"/><path class="rg" d="M380 400 Q430 470 480 395 Z"/>
    <ellipse class="rg" cx="400" cy="300" rx="190" ry="120"/>
    <path class="rg" d="M330 190 Q300 300 330 410 Q350 412 362 410 Q330 300 362 190 Q348 186 330 190 Z"/><path class="rg" d="M440 184 Q410 300 440 416 Q456 416 470 412 Q440 300 470 188 Q456 182 440 184 Z"/>
    <circle class="rg" cx="270" cy="270" r="30"/><circle class="rg" cx="274" cy="272" r="12"/>
    <path class="ln" d="M220 330 Q240 350 262 336"/>
    <circle class="rg" cx="180" cy="160" r="20"/><circle class="rg" cx="150" cy="100" r="14"/><circle class="rg" cx="176" cy="54" r="9"/>`,
  },
};

export function templateSVG(id, cls = '') {
  const t = TEMPLATES[id];
  return `<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">${t ? t.svg : ''}</svg>`;
}
