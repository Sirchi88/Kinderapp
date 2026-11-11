// Backen & Kochen: Plätzchen, Pizza und Kuchen – Schritt für Schritt mit dem Finger.
import { register, session } from '../nav.js';
import { h, onTap, sleep, starRain } from '../ui.js';
import { gameShell, chooseLevel, getLevel, levelUp, winScreen, startRound, shuffle, pick } from './shell.js';
import { kidPlush, boost } from '../pet.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

const NS = 'http://www.w3.org/2000/svg';
const OUT = '#5a3e2b';
const SW = `stroke="${OUT}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const ING = {
  mehl: { e: '🌾', name: 'Mehl', c: '#fbf6ea' }, zucker: { e: '🍬', name: 'Zucker', c: '#fff' }, butter: { e: '🧈', name: 'Butter', c: '#ffe27a' },
  ei: { e: '🥚', name: 'ein Ei', c: '#ffc93c' }, milch: { e: '🥛', name: 'Milch', c: '#ffffff' }, schoko: { e: '🍫', name: 'Schokolade', c: '#7a4a2c' },
};
const SHAPES = {
  stern: 'M0 -40 L11 -14 L40 -12 L18 6 L25 36 L0 20 L-25 36 L-18 6 L-40 -12 L-11 -14 Z',
  herz: 'M0 34 C-40 6 -40 -26 -18 -32 C-6 -36 0 -26 0 -20 C0 -26 6 -36 18 -32 C40 -26 40 6 0 34 Z',
  mond: 'M10 -38 A38 38 0 1 0 10 38 A28 28 0 1 1 10 -38 Z',
  baum: 'M0 -42 L22 -12 L12 -12 L30 14 L6 14 L6 30 L-6 30 L-6 14 L-30 14 L-12 -12 L-22 -12 Z',
};
const RECIPES = {
  plaetzchen: { icon: '🍪', name: 'Plätzchen', ing: ['mehl', 'zucker', 'butter', 'ei'], dough: '#f3d9a4' },
  pizza: { icon: '🍕', name: 'Pizza' },
  kuchen: { icon: '🎂', name: 'Kuchen', ing: ['mehl', 'zucker', 'ei', 'milch', 'schoko'], dough: '#a8673e' },
};

register('baking', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'baking', back: 'house' });

  function chooser() {
    right.innerHTML = '';
    body.innerHTML = `<div class="bk-pick">${Object.entries(RECIPES).map(([k, r]) => `<button class="bk-r" data-r="${k}"><span>${r.icon}</span></button>`).join('')}</div>`;
    say('Was wollen wir backen? Plätzchen, Pizza oder Kuchen?');
    body.querySelectorAll('.bk-r').forEach((b) => onTap(b, async () => { const d = await chooseLevel(kid, 'baking'); cook(b.dataset.r, d); }, { sound: 'pop' }));
  }

  async function cook(rid, diff) {
    const R = RECIPES[rid];
    const lvl = getLevel(kid, 'baking', diff);
    body.innerHTML = `<div class="bk-ui"><div class="bk-card"></div><svg class="bk-stage" viewBox="0 0 800 600"><g class="work"></g><g class="fx"></g><g class="tool"></g></svg><div class="bk-bar"></div><button class="btn round big go bk-next" aria-label="Weiter">✓</button></div>`;
    const svg = body.querySelector('svg'), work = svg.querySelector('.work'), fx = svg.querySelector('.fx'), tool = svg.querySelector('.tool');
    const bar = body.querySelector('.bk-bar'), card = body.querySelector('.bk-card'), nextBtn = body.querySelector('.bk-next');
    startRound();
    const P = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const el = (tag, attrs, parent = work) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); parent.appendChild(n); return n; };
    const waitNext = () => new Promise((res) => { nextBtn.classList.add('show'); nextBtn.onclick = () => { sfx.pop(); nextBtn.classList.remove('show'); nextBtn.onclick = null; res(); }; });
    // Reiben/Rühren mit dem Finger
    const rub = (onMove, toolSVG) => new Promise((res) => {
      let down = false, last = null, doneFlag = false;
      const finish = () => { doneFlag = true; tool.innerHTML = ''; svg.onpointerdown = svg.onpointermove = svg.onpointerup = null; res(); };
      svg.onpointerdown = (e) => { down = true; svg.setPointerCapture(e.pointerId); last = P(e); };
      svg.onpointerup = () => { down = false; last = null; tool.innerHTML = ''; };
      svg.onpointermove = (e) => {
        if (!down || doneFlag) return;
        const p = P(e);
        tool.innerHTML = `<g transform="translate(${p.x} ${p.y})">${toolSVG}</g>`;
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        last = p;
        if (performance.now() - (rub.t || 0) > 120) { rub.t = performance.now(); sfx.scrub(); }
        if (onMove(p, d)) finish();
      };
    });

    // ---------- Schritte ----------
    const bowl = (level, cols, mix) => {
      work.innerHTML = `<ellipse cx="400" cy="500" rx="230" ry="22" fill="#000" opacity=".1"/>
        <ellipse cx="400" cy="250" rx="200" ry="44" fill="#d9e8f3" ${SW}/>
        <ellipse class="content" cx="400" cy="${270 - level * 10}" rx="${150 + level * 30}" ry="${26 + level * 10}" fill="${mix}" opacity="${level ? 1 : 0}"/>
        <g class="blobs"></g>
        <path d="M200 250 Q206 480 400 486 Q594 480 600 250 Q560 300 400 300 Q240 300 200 250 Z" fill="#7cc4ff" ${SW}/>
        <path d="M250 330 Q270 430 340 456" stroke="#fff" stroke-width="10" fill="none" opacity=".45" stroke-linecap="round"/>
        <path d="M200 250 Q400 310 600 250" fill="none" stroke="${OUT}" stroke-width="5"/>`;
    };
    async function ingredients(list, doughColor) {
      say(diff === 'schwer' ? 'Schau aufs Rezept! Gib die Zutaten der Reihe nach in die Schüssel!' : 'Gib alle Zutaten in die Schüssel!');
      card.innerHTML = diff === 'schwer' ? list.map((k) => `<span data-k="${k}">${ING[k].e}</span>`).join('<b>›</b>') : '';
      card.classList.toggle('show', diff === 'schwer');
      bowl(0, [], doughColor);
      bar.innerHTML = shuffle([...list]).map((k) => `<button class="ing" data-k="${k}">${ING[k].e}</button>`).join('');
      const blobs = work.querySelector('.blobs');
      let idx = 0;
      await new Promise((res) => {
        bar.onclick = async (e) => {
          const b = e.target.closest('.ing');
          if (!b || b.disabled) return;
          const k = b.dataset.k;
          if (diff === 'schwer' && k !== list[idx]) { sfx.wrong(); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); say(`Zuerst ${ING[list[idx]].name}!`); return; }
          b.disabled = true; b.classList.add('used');
          // Zutat fliegt in die Schüssel
          const r = b.getBoundingClientRect(), sr = svg.getBoundingClientRect();
          const fly = h(`<span class="flyfood" style="left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px">${ING[k].e}</span>`);
          document.body.appendChild(fly);
          requestAnimationFrame(() => (fly.style.transform = `translate(${sr.left + sr.width / 2 - r.left - r.width / 2}px, ${sr.top + sr.height * 0.42 - r.top - r.height / 2}px) scale(.7)`));
          await sleep(560); fly.remove();
          sfx.pop();
          el('ellipse', { cx: 300 + Math.random() * 200, cy: 262 + Math.random() * 18, rx: 40 + Math.random() * 20, ry: 14, fill: ING[k].c, stroke: '#00000022', 'stroke-width': 2 }, blobs);
          if (k === 'mehl') for (let i = 0; i < 6; i++) { const c = el('circle', { cx: 340 + Math.random() * 120, cy: 230, r: 6 + Math.random() * 8, fill: '#fff', class: 'puff' }, fx); setTimeout(() => c.remove(), 1000); }
          card.querySelector(`[data-k="${k}"]`)?.classList.add('done');
          say(ING[k].name.replace(/^\w/, (c) => c.toUpperCase()) + '!');
          idx++;
          if (idx === list.length) { bar.onclick = null; await sleep(500); res(); }
        };
      });
      bar.innerHTML = ''; card.classList.remove('show');
      const content = work.querySelector('.content');
      content.setAttribute('opacity', 1);
    }
    async function stir(doughColor) {
      say('Jetzt umrühren! Rühr im Kreis!');
      bar.innerHTML = '<span class="hint">🥄 🔄</span>';
      const blobs = work.querySelector('.blobs'), content = work.querySelector('.content');
      content.setAttribute('fill', doughColor);
      let prog = 0;
      const need = diff === 'leicht' ? 1500 : 2400;
      await rub((p, d) => {
        prog += d;
        blobs.style.opacity = Math.max(0, 1 - prog / need);
        content.setAttribute('transform', `rotate(${(prog / 10) % 4 - 2} 400 270)`);
        return prog >= need;
      }, `<g transform="rotate(30)"><rect x="-8" y="-160" width="16" height="150" rx="8" fill="#c98b55" ${SW}/><ellipse cx="0" cy="0" rx="26" ry="34" fill="#c98b55" ${SW}/></g>`);
      sfx.sparkle(); bar.innerHTML = '';
      say('Ein toller Teig!');
      await sleep(600);
    }
    async function roll(doughColor) {
      work.innerHTML = `<rect x="110" y="190" width="580" height="320" rx="30" fill="#e2b07a" ${SW}/><path d="M140 230 H660 M140 300 H660 M140 380 H660 M140 450 H660" stroke="#c9945e" stroke-width="3"/>
        <ellipse class="dough" cx="400" cy="350" rx="90" ry="60" fill="${doughColor}" ${SW}/>`;
      say('Roll den Teig schön flach aus!');
      bar.innerHTML = '<span class="hint">↔️</span>';
      const d0 = work.querySelector('.dough');
      let prog = 0; const need = diff === 'leicht' ? 1400 : 2200;
      await rub((p, d) => { prog += d; const t = Math.min(1, prog / need); d0.setAttribute('rx', 90 + 170 * t); d0.setAttribute('ry', 60 + 70 * t); return prog >= need; },
        `<g transform="rotate(90)"><rect x="-20" y="-120" width="40" height="240" rx="20" fill="#d9a06c" ${SW}/><rect x="-12" y="-170" width="24" height="56" rx="10" fill="#c98b55" ${SW}/><rect x="-12" y="114" width="24" height="56" rx="10" fill="#c98b55" ${SW}/></g>`);
      sfx.sparkle(); bar.innerHTML = '';
    }
    async function cut(doughColor) {
      const need = diff === 'leicht' ? 4 : 6 + Math.min(lvl, 2);
      let shape = 'stern';
      bar.innerHTML = Object.keys(SHAPES).map((k) => `<button class="ing cutter ${k === shape ? 'on' : ''}" data-s="${k}"><svg viewBox="-46 -46 92 92"><path d="${SHAPES[k]}" fill="none" stroke="#8a8f99" stroke-width="7"/></svg></button>`).join('');
      bar.onclick = (e) => { const b = e.target.closest('.cutter'); if (!b) return; shape = b.dataset.s; sfx.tap(); bar.querySelectorAll('.cutter').forEach((x) => x.classList.toggle('on', x === b)); };
      say(`Such dir eine Form aus und stich ${need} Plätzchen aus!`);
      const cookies = [];
      await new Promise((res) => {
        svg.onclick = (e) => {
          const p = P(e);
          if (((p.x - 400) / 250) ** 2 + ((p.y - 350) / 122) ** 2 > 1) return;
          if (cookies.some((c) => Math.hypot(c.x - p.x, c.y - p.y) < 70)) { sfx.boing(); return; }
          cookies.push({ x: p.x, y: p.y, s: shape });
          el('path', { d: SHAPES[shape], transform: `translate(${p.x} ${p.y}) scale(.8)`, fill: doughColor, stroke: '#c49a5a', 'stroke-width': 5, class: 'cookie-cut' });
          sfx.pop();
          if (cookies.length === need) { svg.onclick = null; res(); }
        };
      });
      bar.onclick = null; bar.innerHTML = '';
      await sleep(400);
      // Aufs Blech legen
      const cols = Math.ceil(need / 2);
      work.innerHTML = `<rect x="150" y="200" width="500" height="300" rx="14" fill="#9aa4b0" ${SW}/><rect x="166" y="216" width="468" height="268" rx="8" fill="#b9c2cc"/>` +
        cookies.map((c, i) => `<path class="ck" d="${SHAPES[c.s]}" transform="translate(${230 + (i % cols) * (340 / Math.max(1, cols - 1))} ${290 + Math.floor(i / cols) * 120})" fill="${doughColor}" ${SW}/>`).join('');
      say('Ab aufs Blech!');
      await sleep(700);
    }
    async function oven(bakedFilter) {
      const content = work.innerHTML;
      work.innerHTML = `<rect x="170" y="90" width="460" height="440" rx="30" fill="#e9eef3" ${SW}/><rect x="190" y="110" width="420" height="50" rx="12" fill="#d3dbe3" ${SW}/>
        ${[260, 330, 470, 540].map((x) => `<circle cx="${x}" cy="135" r="13" fill="#fff" ${SW}/>`).join('')}<circle class="otimer" cx="400" cy="135" r="16" fill="#ffd23f" ${SW}/>
        <rect x="210" y="180" width="380" height="320" rx="20" fill="#3d434c" ${SW}/><rect class="ovenglow" x="226" y="196" width="348" height="288" rx="12" fill="#ff9f43" opacity=".25"/>
        <g class="inoven" transform="translate(400 340) scale(.55) translate(-400 -350)">${content}</g>
        <rect x="300" y="510" width="200" height="16" rx="8" fill="#9aa4b0" ${SW}/>`;
      say('Ab in den Ofen!');
      sfx.door();
      const glow = work.querySelector('.ovenglow'), inov = work.querySelector('.inoven');
      const T = diff === 'leicht' ? 5 : 7;
      for (let i = T; i > 0; i--) {
        bar.innerHTML = `<span class="hint big">${i}</span>`;
        glow.setAttribute('opacity', 0.25 + 0.5 * ((T - i) / T));
        sfx.tick(); await sleep(1000);
      }
      bar.innerHTML = '';
      sfx.bell();
      await say('Pling! Fertig gebacken!');
      inov.removeAttribute('transform');
      let baked = inov.innerHTML;
      for (const [a, b] of Object.entries(bakedFilter)) baked = baked.split(a).join(b);
      work.innerHTML = baked;
      sfx.door();
      await sleep(500);
    }
    async function decorateCookies() {
      const cks = [...work.querySelectorAll('.ck')];
      const icing = ['#ff8fc8', '#ffffff', '#7cc4ff', '#ffd23f', '#9be37a', '#7a4a2c'];
      let col = icing[0];
      bar.innerHTML = icing.map((c, i) => `<button class="ing icing ${i ? '' : 'on'}" data-c="${c}" style="--c:${c}"></button>`).join('');
      bar.onclick = (e) => { const b = e.target.closest('.icing'); if (!b) return; col = b.dataset.c; sfx.tap(); bar.querySelectorAll('.icing').forEach((x) => x.classList.toggle('on', x === b)); };
      say('Jetzt verzieren! Tipp auf die Plätzchen!');
      const done = new Set();
      await new Promise((res) => {
        svg.onclick = (e) => {
          const p = P(e);
          const i = cks.findIndex((c) => { const m = c.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/); return Math.hypot(+m[1] - p.x, +m[2] - p.y) < 50; });
          if (i < 0) return;
          el('circle', { cx: p.x, cy: p.y, r: 14, fill: col, opacity: 0.95 }, fx);
          for (let s = 0; s < 4; s++) el('rect', { x: p.x + Math.random() * 40 - 20, y: p.y + Math.random() * 40 - 20, width: 8, height: 3, rx: 1.5, fill: pick(icing), transform: `rotate(${Math.random() * 180} ${p.x} ${p.y})` }, fx);
          sfx.pop(); done.add(i);
          if (done.size === cks.length) { svg.onclick = null; res(); }
        };
      });
      bar.onclick = null; bar.innerHTML = '';
      sfx.sparkle(); await say('Wunderschön!');
    }
    // Pizza
    async function pizzaBase() {
      work.innerHTML = `<ellipse cx="400" cy="560" rx="260" ry="24" fill="#000" opacity=".1"/><circle cx="400" cy="320" r="230" fill="#d9a06c" ${SW}/><circle cx="400" cy="320" r="200" fill="#f3d9a4"/>
        <defs><clipPath id="pzclip"><circle cx="400" cy="320" r="198"/></clipPath></defs><g class="sauce" clip-path="url(#pzclip)"></g><g class="cheese" clip-path="url(#pzclip)"></g><g class="tops"></g>`;
    }
    const coverRub = async (layerSel, painter, need, toolSVG) => {
      const layer = work.querySelector(layerSel);
      const pts = [];
      for (let x = 230; x <= 570; x += 34) for (let y = 150; y <= 490; y += 34) if (Math.hypot(x - 400, y - 320) < 180) pts.push({ x, y, hit: false });
      let hits = 0;
      await rub((p) => {
        painter(layer, p);
        for (const q of pts) if (!q.hit && Math.hypot(q.x - p.x, q.y - p.y) < 40) { q.hit = true; hits++; }
        return hits / pts.length >= need;
      }, toolSVG);
    };
    async function sauce() {
      say('Verteil die Tomatensoße! Reib mit dem Finger!');
      bar.innerHTML = '<span class="hint">🍅 👆</span>';
      await coverRub('.sauce', (l, p) => el('circle', { cx: p.x, cy: p.y, r: 34, fill: '#e0442f' }, l), diff === 'leicht' ? 0.75 : 0.88, `<ellipse rx="30" ry="22" fill="#c94a2c" ${SW}/><rect x="-6" y="-120" width="12" height="100" rx="6" fill="#c98b55" ${SW}/>`);
      work.querySelector('.sauce').innerHTML = `<circle cx="400" cy="320" r="198" fill="#e0442f"/>`;
      sfx.sparkle(); bar.innerHTML = '';
    }
    async function cheese() {
      say('Jetzt kommt der Käse drauf!');
      bar.innerHTML = '<span class="hint">🧀 👆</span>';
      await coverRub('.cheese', (l, p) => { for (let i = 0; i < 3; i++) el('rect', { x: p.x + Math.random() * 50 - 25, y: p.y + Math.random() * 50 - 25, width: 18, height: 5, rx: 2.5, fill: pick(['#ffe066', '#ffd23f', '#fff1a8']), transform: `rotate(${Math.random() * 180} ${p.x} ${p.y})` }, l); }, diff === 'leicht' ? 0.7 : 0.85, `<path d="M-30 20 L0 -30 L30 20 Z" fill="#ffd23f" ${SW}/>`);
      sfx.sparkle(); bar.innerHTML = '';
    }
    async function toppings(list, region, need, text) {
      let t = list[0];
      bar.innerHTML = list.map((e, i) => `<button class="ing ${i ? '' : 'on'}" data-t="${e}">${e}</button>`).join('');
      bar.onclick = (e) => { const b = e.target.closest('[data-t]'); if (!b) return; t = b.dataset.t; sfx.tap(); bar.querySelectorAll('[data-t]').forEach((x) => x.classList.toggle('on', x === b)); };
      say(text);
      const tops = work.querySelector('.tops') || el('g', { class: 'tops' });
      let n = 0;
      await new Promise((res) => {
        svg.onclick = (e) => {
          const p = P(e);
          if (!region(p)) return;
          const tx = el('text', { x: p.x, y: p.y + 16, 'font-size': 46, 'text-anchor': 'middle', class: 'drop-in' }, tops);
          tx.textContent = t;
          sfx.pop();
          if (++n === need) { say('Super! Noch mehr, oder fertig?'); waitNext().then(() => { svg.onclick = null; res(); }); }
        };
      });
      bar.onclick = null; bar.innerHTML = '';
    }
    // Kuchen
    async function pour() {
      work.innerHTML = `<ellipse cx="400" cy="520" rx="220" ry="22" fill="#000" opacity=".1"/><path d="M220 300 V470 Q400 520 580 470 V300" fill="#d3dbe3" ${SW}/><ellipse cx="400" cy="300" rx="180" ry="40" fill="#b9c2cc" ${SW}/>
        <ellipse class="batter" cx="400" cy="440" rx="0" ry="0" fill="${RECIPES.kuchen.dough}"/>`;
      say('Tipp auf die Form, dann gießen wir den Teig hinein!');
      await new Promise((res) => (svg.onclick = () => { svg.onclick = null; res(); }));
      const b = work.querySelector('.batter');
      for (let i = 1; i <= 10; i++) { b.setAttribute('rx', 18 * i); b.setAttribute('ry', 4 * i); b.setAttribute('cy', 440 - i * 9); sfx.scrub(); await sleep(90); }
      work.innerHTML = cakeSVG(RECIPES.kuchen.dough, false);
    }
    const cakeSVG = (c, baked) => `<ellipse cx="400" cy="520" rx="240" ry="24" fill="#000" opacity=".1"/><ellipse cx="400" cy="480" rx="250" ry="50" fill="#fff" ${SW}/>
      <path d="M210 300 V440 Q400 500 590 440 V300" fill="${c}" ${SW}/><ellipse class="cake-top" cx="400" cy="300" rx="190" ry="44" fill="${baked ? '#b8754a' : c}" ${SW}/>
      <defs><clipPath id="cktop"><ellipse cx="400" cy="300" rx="188" ry="42"/></clipPath></defs><g class="cream" clip-path="url(#cktop)"></g><g class="tops"></g>`;
    async function cream() {
      say('Streich die Sahne auf den Kuchen!');
      bar.innerHTML = '<span class="hint">🍦 👆</span>';
      const layer = work.querySelector('.cream');
      let hits = 0; const pts = [];
      for (let x = 240; x <= 560; x += 32) for (let y = 270; y <= 330; y += 15) if (((x - 400) / 180) ** 2 + ((y - 300) / 40) ** 2 < 1) pts.push({ x, y, hit: false });
      await rub((p) => {
        el('ellipse', { cx: p.x, cy: p.y, rx: 34, ry: 14, fill: '#fffaf2' }, layer);
        for (const q of pts) if (!q.hit && Math.hypot(q.x - p.x, (q.y - p.y) * 2) < 40) { q.hit = true; hits++; }
        return hits / pts.length > (diff === 'leicht' ? 0.7 : 0.85);
      }, `<path d="M-40 0 h80 l-10 -14 h-60 Z" fill="#c9d2dc" ${SW}/><rect x="-6" y="-110" width="12" height="96" rx="6" fill="#c98b55" ${SW}/>`);
      layer.innerHTML = `<ellipse cx="400" cy="300" rx="190" ry="44" fill="#fffaf2"/>`;
      const wave = el('path', { d: 'M212 300 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0 q16 30 32 0', fill: '#fffaf2', stroke: '#eadfcf', 'stroke-width': 2 });
      work.insertBefore(wave, work.querySelector('.tops'));
      sfx.sparkle(); bar.innerHTML = '';
    }
    async function candles() {
      const xs = [330, 400, 470];
      const g = el('g', { class: 'candles' });
      g.innerHTML = xs.map((x, i) => `<g class="cdl" data-i="${i}"><rect x="${x - 8}" y="${210 - (i === 1 ? 10 : 0)}" width="16" height="80" rx="6" fill="${['#ff8fc8', '#7cc4ff', '#ffd23f'][i]}" ${SW}/><path d="M${x - 6} ${230 - (i === 1 ? 10 : 0)} l12 -6 M${x - 6} ${250 - (i === 1 ? 10 : 0)} l12 -6" stroke="#fff" stroke-width="3"/><path class="flame" d="M${x} ${168 - (i === 1 ? 10 : 0)} q14 22 0 36 q-14 -14 0 -36 Z" fill="#ffb703" stroke="#ff6b00" stroke-width="3"/></g>`).join('');
      say('Jetzt die Kerzen auspusten! Tipp auf die Flammen! Hui!');
      let out = 0;
      await new Promise((res) => {
        g.querySelectorAll('.cdl').forEach((c) => c.addEventListener('click', () => {
          const f = c.querySelector('.flame');
          if (!f) return;
          f.remove(); sfx.whoosh();
          const smoke = el('circle', { cx: xs[+c.dataset.i], cy: 160, r: 10, fill: '#ddd', class: 'puff' }, fx); setTimeout(() => smoke.remove(), 1000);
          if (++out === xs.length) res();
        }));
      });
      sfx.tada(); starRain(18, 'confetti');
      await say('Hurra!');
    }
    async function serve(food) {
      fx.innerHTML = '';
      work.innerHTML = `<ellipse cx="300" cy="420" rx="170" ry="40" fill="#fff" ${SW}/><ellipse cx="300" cy="414" rx="130" ry="28" fill="#f2f6fa"/><text x="300" y="430" font-size="110" text-anchor="middle" class="drop-in">${food}</text>`;
      const pl = h(`<div class="bk-pet">${kidPlush(kid, { mood: 'happy' })}</div>`);
      body.querySelector('.bk-ui').appendChild(pl);
      await say(`Probieren wir mal! Tipp auf ${kid.plushName || 'dein Kuscheltier'}!`);
      await new Promise((res) => pl.addEventListener('click', res, { once: true }));
      pl.innerHTML = kidPlush(kid, { mood: 'eat' });
      sfx.chomp(); await sleep(250); sfx.chomp();
      work.querySelector('text').textContent = '😋';
      await sleep(500);
      pl.innerHTML = kidPlush(kid, { mood: 'happy' }); pl.classList.add('jump');
      boost(kid, 'hunger', 30); boost(kid, 'fun', 10);
    }

    // ---------- Ablauf ----------
    // Gebacken = goldbraune Farben
    const bakeF = { '#f3d9a4': '#e5a95e', '#d9a06c': '#b8743c', '#e0442f': '#c9361f', '#ffe066': '#ffb83d', '#fff1a8': '#ffc95a', '#a8673e': '#7f4a2a' };
    if (rid === 'plaetzchen') {
      await ingredients(R.ing, R.dough);
      await stir(R.dough);
      await roll(R.dough);
      await cut(R.dough);
      await oven(bakeF);
      await decorateCookies();
      await serve('🍪');
    } else if (rid === 'pizza') {
      await pizzaBase();
      await sauce();
      await cheese();
      await toppings(['🍅', '🫑', '🍄', '🌽', '🫒', '🍍', '🧅'], (p) => Math.hypot(p.x - 400, p.y - 320) < 195, diff === 'leicht' ? 5 : 8, 'Leg deine Lieblingssachen auf die Pizza!');
      await oven(bakeF);
      await serve('🍕');
    } else {
      await ingredients(R.ing, R.dough);
      await stir(R.dough);
      await pour();
      await oven(bakeF);
      work.innerHTML = cakeSVG('#b8754a', true);
      await cream();
      await toppings(['🍓', '🫐', '🍒', '🍌', '⭐'], (p) => ((p.x - 400) / 190) ** 2 + ((p.y - 300) / 44) ** 2 < 1.3, diff === 'leicht' ? 4 : 7, 'Verzier den Kuchen mit Früchten!');
      await candles();
      await serve('🍰');
    }
    levelUp(kid, 'baking', diff, 5);
    const r = await winScreen(kid, { stars: diff === 'schwer' ? 2 : 1, text: `Lecker! ${R.name} fertig!` });
    if (r === 'again') chooser(); else (await import('../nav.js')).go('house', {});
  }

  chooser();
  return {};
});
