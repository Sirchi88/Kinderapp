// PIN-Schutz für den Elternbereich.
import { state, save } from './store.js';
import { overlay, ICON } from './ui.js';
import { sfx } from './audio.js';

/** Fragt die PIN ab (oder legt sie beim ersten Mal fest). Ergebnis: true/false */
export function askPin(reason = 'Elternbereich') {
  return new Promise((resolve) => {
    let mode = state.pin ? 'enter' : 'create';
    let first = '';
    let val = '';
    const el = overlay(`<div class="card pin">
      <div class="t"></div>
      <div class="dots"><i></i><i></i><i></i><i></i></div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="btn" data-n="${n}">${n}</button>`).join('')}
        <button class="btn" data-x="close" aria-label="Abbrechen">${ICON.close}</button><button class="btn" data-n="0">0</button><button class="btn" data-x="del">⌫</button></div>
    </div>`);
    const card = el.querySelector('.pin');
    const title = el.querySelector('.t');
    const dots = [...el.querySelectorAll('.dots i')];
    const render = () => {
      title.textContent = mode === 'create' ? `🔒 Neue Eltern-PIN festlegen` : mode === 'confirm' ? 'PIN zur Bestätigung wiederholen' : `🔒 ${reason}`;
      dots.forEach((d, i) => d.classList.toggle('f', i < val.length));
    };
    const finish = (ok) => { el.remove(); resolve(ok); };
    const fail = () => { sfx.wrong(); card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); val = ''; render(); };
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) { if (e.target === el) finish(false); return; }
      sfx.tap();
      if (b.dataset.x === 'close') return finish(false);
      if (b.dataset.x === 'del') { val = val.slice(0, -1); return render(); }
      if (val.length >= 4) return;
      val += b.dataset.n;
      render();
      if (val.length < 4) return;
      setTimeout(() => {
        if (mode === 'enter') { if (val === state.pin) finish(true); else fail(); }
        else if (mode === 'create') { first = val; val = ''; mode = 'confirm'; render(); }
        else if (mode === 'confirm') {
          if (val === first) { state.pin = val; save(true); sfx.sparkle(); finish(true); }
          else { mode = 'create'; first = ''; fail(); }
        }
      }, 150);
    });
    render();
  });
}
