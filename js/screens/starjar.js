// Sternenglas: Kinder sehen ihre Sterne und wie nah die nächste echte Belohnung ist.
import { state } from '../store.js';
import { overlay, ICON, esc } from '../ui.js';
import { say } from '../speech.js';
import { sfx } from '../audio.js';

function jarSVG(stars) {
  const fill = Math.min(1, stars / Math.max(20, ...state.rewards.map((r) => r.cost)));
  const top = 250 - fill * 170;
  let st = '';
  const n = Math.min(stars, 40);
  for (let i = 0; i < n; i++) {
    const x = 50 + ((i * 37) % 100), y = 245 - Math.floor(i / 5) * (170 / 8) - ((i * 13) % 12);
    st += `<path transform="translate(${x} ${y}) rotate(${(i * 47) % 360}) scale(.5)" d="M0 -20 L6 -7 L20 -6 L9 3 L12 17 L0 10 L-12 17 L-9 3 L-20 -6 L-6 -7 Z" fill="#ffd23f" stroke="#e39b12" stroke-width="3"/>`;
  }
  return `<svg viewBox="0 0 200 280">
    <defs><clipPath id="jarclip"><path d="M44 60 Q30 70 30 100 L30 240 Q30 262 52 262 L148 262 Q170 262 170 240 L170 100 Q170 70 156 60 Z"/></clipPath></defs>
    <rect x="52" y="22" width="96" height="30" rx="10" fill="#c98b55" stroke="#5a3e2b" stroke-width="4"/>
    <path d="M58 30 h84" stroke="#e8b37f" stroke-width="4"/>
    <path d="M44 60 Q30 70 30 100 L30 240 Q30 262 52 262 L148 262 Q170 262 170 240 L170 100 Q170 70 156 60 Z" fill="#e9f7ff" fill-opacity=".7" stroke="#5a3e2b" stroke-width="4"/>
    <g clip-path="url(#jarclip)"><rect x="30" y="${top}" width="140" height="${262 - top}" fill="#fff3c4"/>${st}</g>
    <path d="M44 60 Q30 70 30 100 L30 240 Q30 262 52 262 L148 262 Q170 262 170 240 L170 100 Q170 70 156 60 Z" fill="none" stroke="#5a3e2b" stroke-width="4"/>
    <path d="M48 100 Q46 160 50 220" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".8"/>
    <rect x="48" y="50" width="104" height="14" rx="6" fill="#e9f7ff" stroke="#5a3e2b" stroke-width="4"/>
  </svg>`;
}

export function openStarJar(kid) {
  const rewards = [...state.rewards].sort((a, b) => a.cost - b.cost);
  const el = overlay(`<div class="card jar-wrap">
    <div class="jar">${jarSVG(kid.stars)}<div class="cnt">${kid.stars}</div></div>
    <div class="goals">${rewards.map((r) => {
      const p = Math.min(1, kid.stars / r.cost);
      return `<div class="goal ${p >= 1 ? 'ready' : ''}"><div class="em">${esc(r.emoji)}</div><div class="bar"><i style="width:${p * 100}%"></i></div><div class="lbl">${Math.min(kid.stars, r.cost)} / ${r.cost}</div></div>`;
    }).join('') || '<div class="goal"><div class="em">⭐</div></div>'}</div>
    <button class="btn round go" style="position:absolute;top:calc(14px + var(--safe-t));right:calc(14px + var(--safe-r))" aria-label="Zurück">${ICON.close}</button>
  </div>`);
  el.querySelector('.btn').addEventListener('click', () => { sfx.tap(); el.remove(); });
  el.addEventListener('click', (e) => { if (e.target === el) el.remove(); });
  const next = rewards.find((r) => r.cost > kid.stars);
  const ready = rewards.filter((r) => r.cost <= kid.stars).pop();
  if (ready) say(`Wow, ${kid.stars} Sterne! Du kannst dir ${ready.name} wünschen! Sag es Mama oder Papa!`);
  else if (next) say(`Du hast ${kid.stars} Sterne! Noch ${next.cost - kid.stars} Sterne bis ${next.name}!`);
  else say(`Du hast ${kid.stars} Sterne!`);
}
