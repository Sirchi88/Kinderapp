// Malen & Ausmalen: Pinsel, Regenbogen-Pinsel, Farbeimer, Stempel, Radierer. Bilder kommen in die Galerie.
import { register, session } from '../nav.js';
import { h, onTap, ICON, esc, colorName } from '../ui.js';
import { gameShell, winScreen, startRound } from './shell.js';
import { TEMPLATES, templateSVG } from '../art/coloring.js';
import { listDrawings, addDrawing } from '../media.js';
import { say } from '../speech.js';
import { stageW, stageH } from '../viewport.js';
import { sfx } from '../audio.js';

const COLORS = ['#ff4d4d', '#ff9f1c', '#ffd23f', '#8fdc4a', '#2fb36b', '#4fc3f7', '#2f6fdf', '#9b5de5', '#ff8fc8', '#8a5530', '#f1c09a', '#2f3238', '#9aa0a8', '#ffffff'];
const STAMPS = ['⭐', '❤️', '🌸', '🦋', '🐱', '🐞', '🌈', '☀️', '🎈', '🍎', '🐄', '🦄'];
const SIZES = [8, 18, 34];

register('paint', (app) => {
  const kid = session.kid;
  const { body, right } = gameShell(app, { cls: 'paint' });
  let tpl = null, color = COLORS[0], tool = 'brush', size = 1, stamp = STAMPS[0], hue = 0, bg = '#ffffff', dirty = false;

  async function chooser() {
    right.innerHTML = '';
    const drawings = (await listDrawings()).filter((d) => d.kid === kid.id).slice(-8).reverse();
    body.innerHTML = `<div class="paint-pick">
      <div class="tpl-grid">
        <button class="tpl" data-t="" data-say="Freies Malen"><div class="blank">✏️</div></button>
        ${Object.keys(TEMPLATES).map((k) => `<button class="tpl" data-t="${k}" data-say="${TEMPLATES[k].name}">${templateSVG(k, 'thumb')}</button>`).join('')}
      </div>
      ${drawings.length ? `<div class="gallery"><span>🖼️</span>${drawings.map((d) => `<img src="${d.data}" alt="">`).join('')}</div>` : ''}
    </div>`;
    say('Was möchtest du malen?');
    body.querySelectorAll('.tpl').forEach((b) => onTap(b, () => start(b.dataset.t || null), { sound: 'pop' }));
    body.querySelectorAll('.gallery img').forEach((img) => img.addEventListener('click', () => {
      const v = h(`<div class="overlay"><img class="bigpic" src="${img.src}" alt=""></div>`);
      document.getElementById('overlay-root').appendChild(v);
      v.addEventListener('click', () => v.remove());
    }));
  }

  function start(t) {
    tpl = t; bg = '#ffffff'; dirty = false;
    startRound();
    body.innerHTML = `<div class="paint-ui">
      <div class="tools">
        <button class="tool on" data-tool="brush">🖌️</button><button class="tool" data-tool="rainbow">🌈</button>
        <button class="tool" data-tool="fill">🪣</button><button class="tool" data-tool="stamp">⭐</button><button class="tool" data-tool="eraser">🧽</button>
        <div class="sizes">${SIZES.map((s, i) => `<button class="size ${i === size ? 'on' : ''}" data-s="${i}"><i style="width:${8 + i * 8}px;height:${8 + i * 8}px"></i></button>`).join('')}</div>
      </div>
      <div class="paper"><div class="paper-bg"></div>
        ${tpl ? templateSVG(tpl, 'fill-layer') : ''}
        <canvas width="1600" height="1200"></canvas>
        ${tpl ? templateSVG(tpl, 'outline-layer') : ''}
      </div>
      <div class="palette">${COLORS.map((c) => `<button class="col ${c === color ? 'on' : ''}" data-c="${c}" data-say="${colorName(c)}" style="--c:${c}"></button>`).join('')}</div>
      <div class="stamps">${STAMPS.map((s) => `<button class="stp ${s === stamp ? 'on' : ''}" data-st="${s}">${s}</button>`).join('')}</div>
    </div>`;
    right.innerHTML = `<button class="btn round ghost" data-a="new" aria-label="Neues Bild">📄</button><button class="btn round go" data-a="done" aria-label="Fertig">${ICON.check}</button>`;
    onTap(right.querySelector('[data-a=new]'), chooser);
    onTap(right.querySelector('[data-a=done]'), finish, { sound: null });

    const paper = body.querySelector('.paper'), cv = body.querySelector('canvas'), ctx = cv.getContext('2d');
    const fillLayer = body.querySelector('.fill-layer'), paperBg = body.querySelector('.paper-bg');
    ctx.scale(2, 2);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const fit = () => {
      const W = stageW() - 300, H = stageH() - 40;
      const w = Math.min(W, (H * 4) / 3);
      paper.style.width = w + 'px'; paper.style.height = (w * 3) / 4 + 'px';
    };
    fit(); addEventListener('resize', fit);
    const setTool = (t) => {
      tool = t;
      body.querySelectorAll('.tool').forEach((b) => b.classList.toggle('on', b.dataset.tool === t));
      body.querySelector('.stamps').classList.toggle('open', t === 'stamp');
      cv.style.pointerEvents = t === 'fill' && tpl ? 'none' : 'auto';
      say({ brush: 'Pinsel', rainbow: 'Regenbogen-Pinsel', fill: 'Farbeimer', stamp: 'Stempel', eraser: 'Radiergummi' }[t]);
    };
    body.querySelectorAll('.tool').forEach((b) => onTap(b, () => setTool(b.dataset.tool)));
    body.querySelectorAll('.size').forEach((b) => onTap(b, () => { size = +b.dataset.s; body.querySelectorAll('.size').forEach((x) => x.classList.toggle('on', x === b)); }));
    body.querySelectorAll('.col').forEach((b) => onTap(b, () => {
      color = b.dataset.c;
      body.querySelectorAll('.col').forEach((x) => x.classList.toggle('on', x === b));
      if (tool === 'eraser' || tool === 'rainbow') setTool('brush');
    }, { sound: 'pop' }));
    body.querySelectorAll('.stp').forEach((b) => onTap(b, () => { stamp = b.dataset.st; body.querySelectorAll('.stp').forEach((x) => x.classList.toggle('on', x === b)); }, { sound: 'pop' }));

    // Farbeimer auf Ausmalbild-Flächen
    fillLayer?.addEventListener('click', (e) => {
      const r = e.target.closest('.rg');
      if (!r || tool !== 'fill') return;
      r.style.fill = color; dirty = true; sfx.pop();
    });

    const pts = new Map();
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * 800, ((e.clientY - r.top) / r.height) * 600]; };
    const strokeColor = () => (tool === 'rainbow' ? `hsl(${(hue = (hue + 4) % 360)},90%,58%)` : color);
    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      const [x, y] = pos(e);
      dirty = true;
      if (tool === 'fill') { bg = color; paperBg.style.background = color; sfx.pop(); return; }
      if (tool === 'stamp') {
        ctx.save(); ctx.globalCompositeOperation = 'source-over';
        ctx.font = `${30 + size * 26}px system-ui, "Apple Color Emoji"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(stamp, x, y); ctx.restore(); sfx.pop(); return;
      }
      pts.set(e.pointerId, [x, y]);
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.fillStyle = strokeColor();
      ctx.beginPath(); ctx.arc(x, y, SIZES[size] / 2, 0, Math.PI * 2); ctx.fill();
    });
    cv.addEventListener('pointermove', (e) => {
      const last = pts.get(e.pointerId);
      if (!last) return;
      const [x, y] = pos(e);
      ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = strokeColor();
      ctx.lineWidth = SIZES[size] * (tool === 'eraser' ? 1.6 : 1);
      ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(x, y); ctx.stroke();
      pts.set(e.pointerId, [x, y]);
      if (Math.random() < 0.08) sfx.scrub();
    });
    const end = (e) => pts.delete(e.pointerId);
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);

    async function finish() {
      if (!dirty) { say('Mal erst etwas Schönes!'); return; }
      removeEventListener('resize', fit);
      const data = await compose(paper, tpl, bg);
      await addDrawing(data, kid.id);
      sfx.sparkle();
      const r = await winScreen(kid, { stars: 1, text: 'Was für ein schönes Bild!', speak: 'Was für ein schönes Bild! Ich hänge es in deine Galerie. Du bekommst einen Stern!' });
      if (r === 'again') chooser(); else chooser();
    }
    say(tpl ? 'Nimm den Farbeimer und tipp auf die Flächen! Oder mal mit dem Pinsel.' : 'Mal, was du willst!');
  }

  chooser();
  return {};
});

/** Ebenen zu einem Bild zusammensetzen */
async function compose(paper, tpl, bg) {
  const c = document.createElement('canvas');
  c.width = 800; c.height = 600;
  const x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, 800, 600);
  const drawSvg = (svgEl, outline) => new Promise((res) => {
    if (!svgEl) return res();
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('width', 800); clone.setAttribute('height', 600);
    clone.querySelectorAll('.rg').forEach((r) => {
      if (outline) { r.setAttribute('fill', 'none'); r.setAttribute('stroke', '#3a2a20'); r.setAttribute('stroke-width', '6'); r.setAttribute('stroke-linejoin', 'round'); }
      else { r.setAttribute('fill', r.style.fill || '#ffffff'); r.removeAttribute('style'); }
    });
    clone.querySelectorAll('.ln').forEach((r) => { if (outline) { r.setAttribute('fill', 'none'); r.setAttribute('stroke', '#3a2a20'); r.setAttribute('stroke-width', '6'); r.setAttribute('stroke-linecap', 'round'); } else r.remove(); });
    const img = new Image();
    img.onload = () => { x.drawImage(img, 0, 0, 800, 600); res(); };
    img.onerror = () => res();
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  });
  await drawSvg(paper.querySelector('.fill-layer'), false);
  x.drawImage(paper.querySelector('canvas'), 0, 0, 800, 600);
  await drawSvg(paper.querySelector('.outline-layer'), true);
  return c.toDataURL('image/jpeg', 0.85);
}
