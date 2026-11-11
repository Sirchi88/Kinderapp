// Fahrrad-Spiel: mit dem Rad durchs Allgäu zu Oma & Opa fahren, Sterne sammeln, über Steine hüpfen, Kühe wegklingeln.
import { register, session } from '../nav.js';
import { h, onTap, sleep } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, pick } from './shell.js';
import { personSVG, FAMILY, shade } from '../art/person.js';
import { roundTree, cypress } from '../art/village.js';
import { kidPlush } from '../pet.js';
import { say } from '../speech.js';
import { sfx, playMusic } from '../audio.js';

const GROUND = 760;
const nest = (x, y, w, hh, inner) => `<svg x="${x}" y="${y}" width="${w}" height="${hh}" overflow="visible">${inner}</svg>`;

function rider(kid) {
  const a = kid.avatar;
  const leg = a.bottom === 'jeans' || a.bottom === 'hose' || a.bottom === 'leggings' ? a.bottomColor : a.skin;
  const bike = kid.color;
  return `<g class="rider">
    <g class="wheel wb" transform="translate(-70 0)"><circle r="46" fill="none" stroke="#2f3238" stroke-width="10"/><g class="spokes"><path d="M-40 0 H40 M0 -40 V40 M-28 -28 L28 28 M28 -28 L-28 28" stroke="#9aa0a8" stroke-width="3"/></g><circle r="7" fill="#9aa0a8"/></g>
    <g class="wheel wf" transform="translate(80 0)"><circle r="46" fill="none" stroke="#2f3238" stroke-width="10"/><g class="spokes"><path d="M-40 0 H40 M0 -40 V40 M-28 -28 L28 28 M28 -28 L-28 28" stroke="#9aa0a8" stroke-width="3"/></g><circle r="7" fill="#9aa0a8"/></g>
    <path d="M-70 0 L-10 -2 L40 -70 L-24 -70 Z M-10 -2 L-30 -90 M40 -70 L80 0 M40 -70 L36 -104" stroke="${bike}" stroke-width="11" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M-48 -94 h40" stroke="#2f3238" stroke-width="12" stroke-linecap="round"/><path d="M20 -108 h30" stroke="#2f3238" stroke-width="9" stroke-linecap="round"/>
    <g transform="translate(52 -98)"><path d="M0 0 h56 l-8 40 h-40 Z" fill="#c98b55" stroke="#5a3e2b" stroke-width="4"/>${nest(-4, -64, 66, 68, kidPlush(kid, { mood: 'happy' }))}<path d="M0 0 h56" stroke="#a96a42" stroke-width="5"/></g>
    <g class="pedal"><path d="M-10 -2 l0 0" /><g class="crank" style="transform-origin:-10px -2px"><path d="M-10 -24 V20" stroke="#5a5f66" stroke-width="7" stroke-linecap="round"/></g></g>
    <g class="legs"><path class="leg1" d="M-30 -96 L0 -50 L-10 -24" stroke="${leg}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path class="leg2" d="M-30 -96 L-14 -44 L-10 20" stroke="${shade(leg, -18)}" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
    ${nest(-112, -262, 150, 219, personSVG({ ...a, scale: 1, accessory: 'keins', hat: 'helm', hatColor: '#4fa3ff' }, { mood: 'laugh' }).replace('viewBox="0 0 200 292"', 'viewBox="0 0 200 236"'))}
  </g>`;
}

const cowSide = `<g><ellipse cy="40" rx="70" ry="10" fill="#000" opacity=".12"/><g stroke="#5a3e2b" stroke-width="4" stroke-linejoin="round"><rect x="-48" y="0" width="16" height="40" rx="6" fill="#8a6548"/><rect x="26" y="0" width="16" height="40" rx="6" fill="#8a6548"/><ellipse cy="-10" rx="62" ry="36" fill="#a57e60"/><ellipse cx="-78" cy="-38" rx="26" ry="22" fill="#a57e60"/><ellipse cx="-96" cy="-30" rx="14" ry="12" fill="#efdcc6"/><path d="M-66 -58 q6 -14 -4 -18 M-86 -58 q-6 -14 4 -18" fill="#f3ead6"/></g><circle cx="-80" cy="-42" r="4" fill="#2a1d14"/><path d="M-62 -18 q-14 10 -28 0" stroke="#c0392b" stroke-width="5" fill="none"/><path d="M-70 -12 h-12 l-3 13 q9 6 18 0 Z" fill="#f5c542" stroke="#5a3e2b" stroke-width="3"/></g>`;

register('bike', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'bikegame', back: 'village', music: null });

  async function play() {
    const diff = await chooseLevel(kid, 'bike');
    const lvl = getLevel(kid, 'bike', diff);
    const L = diff === 'leicht' ? 6000 + lvl * 600 : 8000 + lvl * 700;
    const dest = diff === 'leicht' ? 'auerbach' : 'mindelheim';
    const gp = dest === 'auerbach' ? [FAMILY.omaAuerbach, FAMILY.opaAuerbach] : [FAMILY.omaMindelheim, FAMILY.opaMindelheim];
    // Strecke
    const objs = [];
    for (let x = 900; x < L - 900; x += 260 + Math.random() * 220) {
      const r = Math.random();
      if (r < 0.5) objs.push({ k: 'star', x, air: Math.random() < (diff === 'leicht' ? 0.25 : 0.45) });
      else if (r < 0.72) objs.push({ k: 'stone', x });
      else if (r < 0.86) objs.push({ k: 'puddle', x });
      else if (r < 0.95 && !objs.some((o) => o.k === 'cow' && x - o.x < 1400)) objs.push({ k: 'cow', x });
      else objs.push({ k: 'apple', x, air: true });
    }
    let deco = '';
    for (let x = 200; x < L; x += 300 + Math.random() * 260) deco += Math.random() < 0.7 ? roundTree(x, GROUND - 90, 0.6 + Math.random() * 0.3) : cypress(x, GROUND - 90, 0.8);
    for (let x = 1200; x < L - 1200; x += 1500) deco += `<g transform="translate(${x} ${GROUND - 110})"><rect x="-4" y="-80" width="8" height="80" fill="#8a5c3a"/><rect x="-60" y="-110" width="120" height="40" rx="8" fill="#c98b55" stroke="#5a3e2b" stroke-width="4"/><text y="-82" text-anchor="middle" font-size="26">${pick(['🏔️', '🐄', '🌻', '🍎'])} ➜</text></g>`;
    const hills = Array.from({ length: Math.ceil(L / 0.5 / 800) + 2 }, (_, i) => `<path d="M${i * 800 - 100} 640 Q${i * 800 + 300} ${480 + (i % 3) * 30} ${i * 800 + 700} 640 Z" fill="${i % 2 ? '#a8dc7c' : '#9cd36f'}"/>`).join('');
    const mountains = Array.from({ length: Math.ceil(L / 0.2 / 700) + 2 }, (_, i) => `<path d="M${i * 700 - 100} 560 L${i * 700 + 200} ${300 + (i % 3) * 50} L${i * 700 + 500} 560 Z" fill="#a9c3dc" stroke="#8fb0c9" stroke-width="3"/><path d="M${i * 700 + 200} ${300 + (i % 3) * 50} l-40 50 l20 -6 l20 16 l20 -16 l20 6 Z" fill="#fff"/>`).join('');
    body.innerHTML = `<svg class="ride" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs><linearGradient id="bsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e8f8ff"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#bsky)"/><circle cx="1350" cy="120" r="60" fill="#ffd94a"/>
      <g class="l-mount">${mountains}</g><g class="l-hills">${hills}</g>
      <g class="l-world">
        <rect x="-400" y="${GROUND - 20}" width="${L + 1600}" height="300" fill="#8fd16a"/>
        <rect x="-400" y="${GROUND + 6}" width="${L + 1600}" height="60" fill="#e8d3a8" stroke="#cdb183" stroke-width="4"/><path d="M-400 ${GROUND + 36} H${L + 1200}" stroke="#fff" stroke-width="5" stroke-dasharray="40 40"/>
        ${deco}
        <g transform="translate(60 ${GROUND - 300}) scale(.55)"><rect width="360" height="300" fill="#fbfaf6" stroke="#5a3e2b" stroke-width="5"/><path d="M-20 10 L180 -110 L380 10 Z" fill="#3e4249" stroke="#5a3e2b" stroke-width="5"/><rect x="150" y="170" width="70" height="130" fill="#8a5530"/></g>
        <g class="objs"></g>
        <g transform="translate(${L} ${GROUND + 6})"><rect x="-6" y="-170" width="12" height="170" fill="#5a3e2b"/><path d="M6 -170 h80 v50 h-80 Z" fill="#ff6f91" stroke="#5a3e2b" stroke-width="4"/><text x="46" y="-136" text-anchor="middle" font-size="30">🏁</text></g>
        <g transform="translate(${L + 160} ${GROUND - 330}) scale(.7)"><rect width="300" height="260" fill="#fff4e2" stroke="#5a3e2b" stroke-width="5"/><path d="M-20 10 L150 -100 L320 10 Z" fill="${dest === 'auerbach' ? '#5a8f5c' : '#c6643f'}" stroke="#5a3e2b" stroke-width="5"/><rect x="120" y="140" width="64" height="120" rx="30" fill="#c96f4a"/></g>
        ${nest(L + 60, GROUND - 230, 150, 219, personSVG(gp[0], { pose: 'wave', mood: 'laugh' }))}${nest(L + 400, GROUND - 230, 150, 219, personSVG(gp[1], { pose: 'wave', mood: 'laugh' }))}
        <g class="bikeg">${rider(kid)}</g><g class="bfx"></g>
      </g></svg>
      <div class="ride-ui"><div class="ride-prog"><i></i><span>🏡</span><b>👵👴</b></div><div class="ride-stars">⭐ <b>0</b></div></div>
      <div class="ride-btns">${diff === 'schwer' ? '<button class="rbtn pedal" aria-label="Treten">🚲</button>' : ''}<button class="rbtn bell" aria-label="Klingeln">🔔</button><button class="rbtn jump" aria-label="Springen">⬆️</button></div>`;
    const svg = body.querySelector('svg'), world = svg.querySelector('.l-world'), mount = svg.querySelector('.l-mount'), hillsL = svg.querySelector('.l-hills');
    const og = svg.querySelector('.objs'), bike = svg.querySelector('.bikeg'), bfx = svg.querySelector('.bfx');
    const prog = body.querySelector('.ride-prog i'), starEl = body.querySelector('.ride-stars b');
    const NSU = 'http://www.w3.org/2000/svg';
    for (const o of objs) {
      const g = document.createElementNS(NSU, 'g');
      g.setAttribute('transform', `translate(${o.x} ${GROUND + (o.k === 'star' || o.k === 'apple' ? (o.air ? -230 : -60) : 10)})`);
      g.innerHTML = o.k === 'star' ? `<text text-anchor="middle" font-size="56" class="spinme">⭐</text>` : o.k === 'apple' ? `<text text-anchor="middle" font-size="52">🍎</text>`
        : o.k === 'stone' ? `<path d="M-38 6 Q-40 -30 -6 -36 Q30 -38 38 6 Z" fill="#a9a39a" stroke="#5a3e2b" stroke-width="4"/><path d="M-20 -18 q10 -8 22 -6" stroke="#fff" stroke-width="4" opacity=".5" fill="none"/>`
        : o.k === 'puddle' ? `<ellipse rx="70" ry="14" cy="14" fill="#7fb7e6" stroke="#5f97c6" stroke-width="3"/>` : `<g class="cowg" transform="translate(0 -40) scale(-1 1)">${cowSide}</g>`;
      og.appendChild(g);
      o.g = g;
    }
    // Zustand
    let x = 200, y = 0, vy = 0, speed = diff === 'leicht' ? 260 : 0, stars = 0, rot = 0, pedaling = false, bumped = 0, blockedBy = null, ended = false;
    const maxSpeed = diff === 'leicht' ? 270 + lvl * 15 : 380;
    const jump = () => { if (y === 0 && !ended) { vy = -900; sfx.boing(); } };
    body.querySelector('.jump').addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
    svg.addEventListener('pointerdown', jump);
    body.querySelector('.bell').addEventListener('pointerdown', (e) => {
      e.preventDefault(); sfx.cowbell(); setTimeout(() => sfx.cowbell(), 160);
      if (blockedBy) { const c = blockedBy; blockedBy = null; c.leaving = true; sfx.moo(); say('Muh! Entschuldigung!'); }
    });
    const ped = body.querySelector('.pedal');
    if (ped) { ped.addEventListener('pointerdown', (e) => { e.preventDefault(); pedaling = true; }); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) ped.addEventListener(ev, () => (pedaling = false)); }
    playMusic('tanz');
    startRound();
    say(diff === 'leicht' ? `Los geht's zu Oma und Opa Auerbach! Tipp, um über Steine zu springen!` : `Los geht's zu Oma und Opa Mindelheim! Halt das Fahrrad gedrückt zum Treten. Spring über Steine und klingel, wenn eine Kuh im Weg steht!`);
    let last = performance.now(), raf;
    const loop = async (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!ended) {
        // Geschwindigkeit
        if (diff === 'schwer') speed = pedaling ? Math.min(maxSpeed, speed + 420 * dt) : Math.max(0, speed - 160 * dt);
        else speed = Math.min(maxSpeed, speed + 200 * dt);
        if (bumped > 0) { bumped -= dt; speed = Math.min(speed, 120); }
        // Kuh im Weg?
        const cow = objs.find((o) => o.k === 'cow' && !o.leaving && o.x - x > 0 && o.x - x < 230);
        if (cow) {
          if (diff === 'leicht' && !cow.mooed) { cow.mooed = true; blockedBy = cow; sfx.moo(); say('Oh, eine Kuh! Klingel mal!'); setTimeout(() => { if (!cow.leaving) { cow.leaving = true; blockedBy = null; } }, 3500); }
          else if (!cow.mooed) { cow.mooed = true; blockedBy = cow; sfx.moo(); say('Eine Kuh steht im Weg! Klingel mit der Glocke!'); }
          if (!cow.leaving) speed = 0;
        }
        for (const o of objs) if (o.k === 'cow' && o.leaving && !o.gone) { o.cy = (o.cy || 0) - 220 * dt; o.g.setAttribute('transform', `translate(${o.x} ${GROUND - 30 + o.cy})`); if (o.cy < -260) { o.gone = true; o.g.remove(); } }
        x += speed * dt;
        // Springen
        vy += 2400 * dt; y = Math.min(0, y + vy * dt); if (y === 0) vy = 0;
        rot += speed * dt / 46;
        // Begegnungen
        for (const o of objs) {
          if (o.done || o.k === 'cow') continue;
          const dx = o.x - (x + 20);
          if (Math.abs(dx) < 50) {
            if ((o.k === 'star' || o.k === 'apple') && (o.air ? y < -110 : y > -110)) { o.done = true; o.g.remove(); stars++; starEl.textContent = stars; sfx.star(); }
            else if (o.k === 'stone' && y > -40) { o.done = true; bumped = 0.8; sfx.boing(); bike.classList.remove('wobble'); void bike.getBBox(); bike.classList.add('wobble'); say(pick(['Hoppla!', 'Huch, ein Stein!', 'Ui!'])); }
            else if (o.k === 'puddle' && y > -20) { o.done = true; sfx.splash(); for (let i = 0; i < 4; i++) { const t = document.createElementNS(NSU, 'text'); t.setAttribute('x', o.x + i * 20 - 30); t.setAttribute('y', GROUND - 10); t.setAttribute('font-size', 30); t.textContent = '💧'; t.setAttribute('class', 'heart-fx'); bfx.appendChild(t); setTimeout(() => t.remove(), 1500); } say(pick(['Platsch!', 'Pitsch patsch!'])); }
          }
        }
        if (x >= L) { ended = true; finish(); }
      }
      // Kamera & Zeichnen
      const cam = x - 420;
      world.setAttribute('transform', `translate(${-cam} 0)`);
      mount.setAttribute('transform', `translate(${-cam * 0.2} 0)`);
      hillsL.setAttribute('transform', `translate(${-cam * 0.5} 0)`);
      bike.setAttribute('transform', `translate(${x} ${GROUND - 40 + y}) rotate(${y < 0 ? -6 : 0})`);
      bike.querySelectorAll('.spokes').forEach((s) => s.setAttribute('transform', `rotate(${(rot * 57) % 360})`));
      const ph = Math.sin(rot * 2);
      bike.querySelector('.leg1').setAttribute('d', `M-30 -96 L${-4 + ph * 12} -54 L${-10 + ph * 16} ${-6 - ph * 18}`);
      bike.querySelector('.leg2').setAttribute('d', `M-30 -96 L${-12 - ph * 12} -50 L${-10 - ph * 16} ${-6 + ph * 18}`);
      prog.style.width = Math.min(100, (x / L) * 100) + '%';
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    async function finish() {
      speed = 0;
      sfx.tada();
      await say(`Du bist da! Oma und Opa freuen sich! Du hast ${stars} Sterne gesammelt!`);
      cancelAnimationFrame(raf);
      levelUp(kid, 'bike', diff, 6);
      const bonus = stars >= 8 ? 1 : 0;
      const r = await winScreen(kid, { stars: (diff === 'schwer' ? 2 : 1) + bonus, text: 'Angekommen!' });
      if (r === 'again') play(); else (await import('../nav.js')).go('visit', { who: dest });
    }
    cleanupFn = () => cancelAnimationFrame(raf);
  }
  let cleanupFn = null;
  play();
  return { cleanup() { cleanupFn?.(); } };
});
