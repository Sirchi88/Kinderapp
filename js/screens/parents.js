// Elternbereich (PIN-geschützt): Pausen, Spielzeit, Belohnungen, Ton, Statistik.
import { state, save, statFor, localDay, addStars, resetAll, uid } from '../store.js';
import { go, session } from '../nav.js';
import { h, esc } from '../ui.js';
import { applyVolumes, sfx, unlockAudio, stopMusic } from '../audio.js';
import { say, hush } from '../speech.js';
import { BREAK_TYPES } from '../activities.js';
import { askPin } from '../pin.js';
import { PLUSH } from '../art/plush.js';
import { listPhotos, addPhoto, deletePhoto, listDrawings, deleteDrawing, fileToSquare } from '../media.js';

const TABS = [
  { id: 'kids', icon: '👧', label: 'Kinder' },
  { id: 'breaks', icon: '🏃', label: 'Bewegungspausen' },
  { id: 'time', icon: '⏱️', label: 'Spielzeit' },
  { id: 'rewards', icon: '🎁', label: 'Belohnungen' },
  { id: 'photos', icon: '📷', label: 'Fotos & Bilder' },
  { id: 'sound', icon: '🔊', label: 'Ton & Stimme' },
  { id: 'stats', icon: '📊', label: 'Übersicht' },
  { id: 'safety', icon: '🔒', label: 'PIN & Daten' },
  { id: 'help', icon: '💡', label: 'Tipps' },
];

const get = (p) => p.split('.').reduce((o, k) => o?.[k], state);
const set = (p, v) => { const ks = p.split('.'); const last = ks.pop(); ks.reduce((o, k) => o[k], state)[last] = v; };

const toggle = (p) => `<button class="toggle ${get(p) ? 'on' : ''}" data-p="${p}" aria-label="umschalten"></button>`;
const seg = (p, opts) => `<div class="seg" data-p="${p}">${opts.map(([v, l]) => `<button data-v='${JSON.stringify(v)}' class="${get(p) === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
const range = (p, min, max, step, fmt) => `<input type="range" min="${min}" max="${max}" step="${step}" value="${get(p)}" data-p="${p}" data-fmt="${fmt}"><span class="val">${fmtVal(get(p), fmt)}</span>`;
function fmtVal(v, fmt) { return fmt === 'pct' ? Math.round(v * 100) + ' %' : fmt === 'min' ? v + ' Min' : v; }
const kidHead = (k) => `<h3 style="--kid:${k.color}"><span class="dot"></span>${esc(k.name)}</h3>`;
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

const VIEWS = {
  kids() {
    return `<h2>Kinder</h2><p class="hint">Namen, Geburtstage und Kuscheltiere. Am Geburtstag gibt es im Spiel eine kleine Überraschung (kommt in Etappe 4).</p>` +
      state.kids.map((k, i) => {
        const [mm, dd] = (k.birthday || '-').split('-');
        return `<div class="box">${kidHead(k)}
          <div class="field"><label>Name</label><input type="text" maxlength="14" value="${esc(k.name)}" data-p="kids.${i}.name"></div>
          <div class="field"><label>Geburtstag <small>Tag und Monat</small></label>
            <select data-bday="${i}" data-part="d"><option value="">Tag</option>${Array.from({ length: 31 }, (_, d) => `<option ${+dd === d + 1 ? 'selected' : ''} value="${String(d + 1).padStart(2, '0')}">${d + 1}.</option>`).join('')}</select>
            <select data-bday="${i}" data-part="m"><option value="">Monat</option>${MONTHS.map((m, j) => `<option ${+mm === j + 1 ? 'selected' : ''} value="${String(j + 1).padStart(2, '0')}">${m}</option>`).join('')}</select></div>
          <div class="field"><label>Name des Kuscheltiers <small>${k.plush ? PLUSH[k.plush].art : 'noch keins ausgesucht'}</small></label><input type="text" maxlength="14" value="${esc(k.plushName)}" data-p="kids.${i}.plushName" ${k.plush ? '' : 'disabled'}></div>
          <div class="field"><label>Kuscheltier-Pflege zurücksetzen <small>Alle Bedürfnisse wieder auf voll</small></label><button class="pbtn" data-act="petfull" data-i="${i}">Auffüllen</button></div>
          <div class="field"><label>Figur & Kuscheltier neu aussuchen <small>Beim nächsten Start wird neu gestaltet</small></label><button class="pbtn" data-act="redo" data-i="${i}">Neu gestalten</button></div>
        </div>`;
      }).join('') +
      `<div class="box"><h3>🎄 Weihnachten</h3><div class="field"><label>Weihnachtsmodus <small>Schnee, Lichterkette, Christbaum, Weihnachtsmusik und Adventskalender im Dorf. „Automatisch“ = 1. bis 26. Dezember.</small></label>${seg('settings.xmas', [['auto', 'Automatisch'], ['on', 'Immer an'], ['off', 'Aus']])}</div></div>` +
      `<div class="box"><h3>🧸 Tamagotchi</h3><div class="field"><label>Kuscheltier darf traurig werden <small>Wenn es lange nicht gefüttert, gebadet oder geknuddelt wurde. Es wird nie krank.</small></label>${toggle('settings.petSad')}</div></div>`;
  },

  photos() {
    return `<h2>Fotos & Bilder</h2><p class="hint">Eure Fotos erscheinen im Memory (ab 3 Fotos). Sie bleiben nur auf diesem Gerät. Tipp: Gesichter von Oma, Opa, Bailey, Kuscheltieren …</p>
      <div class="box"><h3>📷 Fotos für Memory</h3><div class="thumbs" id="ph-list"><span class="hint">Lädt …</span></div>
        <div class="field"><label>Fotos hinzufügen <small>Werden quadratisch zugeschnitten</small></label><label class="pbtn go" style="cursor:pointer">+ Fotos wählen<input type="file" accept="image/*" multiple id="ph-add" hidden></label></div></div>
      <div class="box"><h3>🎨 Gemalte Bilder</h3><div class="thumbs wide" id="dr-list"><span class="hint">Lädt …</span></div></div>`;
  },

  breaks() {
    const s = state.settings;
    return `<h2>Bewegungspausen</h2><p class="hint">Nach der eingestellten Spielzeit kommt eine Pause: Das Gerät muss abgelegt werden, dann gibt es Tanz-, Tier-, Sport- oder Suchaufgaben. Danach gibt es Sterne.</p>` +
      state.kids.map((k, i) => `<div class="box">${kidHead(k)}
        <div class="field"><label>Bewegungspausen aktiv</label>${toggle(`kids.${i}.breaks.enabled`)}</div>
        <div class="field"><label>Pause nach</label>${range(`kids.${i}.breaks.intervalMin`, 5, 60, 5, 'min')}</div>
        ${session.kid === k ? `<div class="field"><label>Jetzt ausprobieren</label><button class="pbtn go" data-act="testbreak">Pause starten</button></div>` : ''}
      </div>`).join('') +
      `<div class="box"><h3>Ablauf</h3>
        <div class="field"><label>Wenn die Pause mitten im Spiel kommt</label>${seg('settings.breakMode', [['finish', 'Runde fertig spielen'], ['now', 'Sofort unterbrechen']])}</div>
        <div class="field"><label>Dauer der Pause</label>${seg('settings.breakDurationMin', [[1, '1 Min'], [2, '2 Min'], [3, '3 Min'], [5, '5 Min']])}</div>
        <div class="field"><label>Sterne pro Pause</label>${seg('settings.starsPerBreak', [[1, '1'], [2, '2'], [3, '3'], [5, '5']])}</div>
        <div class="field"><label>Prüfen, ob das Gerät liegt <small>Über den Bewegungssensor. Beim ersten Mal fragt das iPhone/iPad nach Erlaubnis.</small></label>${toggle('settings.motionCheck')}</div>
      </div>
      <div class="box"><h3>Arten von Pausen</h3>
        ${Object.entries(BREAK_TYPES).map(([k, t]) => `<div class="field"><label>${t.emoji} ${t.label}</label>${toggle(`settings.breakTypes.${k}`)}</div>`).join('')}
      </div>
      <div class="box"><h3>💡 Eure eigenen Pausen-Ideen</h3>
        ${s.customIdeas.map((c) => `<div class="list-row"><span class="em">${esc(c.emoji)}</span><span class="tx">${esc(c.text)}</span><span>${c.sec || 30} s</span><button class="pbtn warn" data-act="delidea" data-id="${c.id}">Löschen</button></div>`).join('') || '<p class="hint">Noch keine eigenen Ideen. Die Stimme liest den Text vor.</p>'}
        <div class="list-row"><input type="text" id="idea-emoji" maxlength="4" placeholder="🎈" style="width:64px;text-align:center"><input type="text" id="idea-text" maxlength="90" placeholder="z. B. Hüpf 5 Mal wie ein Gummiball!" style="flex:1;min-width:200px">
          <select id="idea-sec"><option value="20">20 s</option><option value="30" selected>30 s</option><option value="45">45 s</option><option value="60">60 s</option></select><button class="pbtn go" data-act="addidea">Hinzufügen</button></div>
      </div>`;
  },

  time() {
    return `<h2>Spielzeit pro Tag</h2><p class="hint">Ist das Limit erreicht, gähnt das Kuscheltier und schläft ein. Mit eurer PIN könnt ihr dort spontan mehr Zeit freigeben.</p>` +
      state.kids.map((k, i) => {
        const used = Math.round(statFor(k.id).sec / 60);
        return `<div class="box">${kidHead(k)}
          <div class="field"><label>Tageslimit</label>${seg(`kids.${i}.dailyLimitMin`, [[0, 'Aus'], [15, '15 Min'], [30, '30 Min'], [45, '45 Min'], [60, '1 Std'], [90, '1,5 Std']])}</div>
          <div class="field"><label>Heute gespielt</label><b>${used} Min</b>${k.extraMinToday.day === localDay() && k.extraMinToday.min ? `<span class="hint" style="margin:0">(+${k.extraMinToday.min >= 9999 ? '∞' : k.extraMinToday.min} Min extra)</span>` : ''}</div>
        </div>`;
      }).join('');
  },

  rewards() {
    return `<h2>Belohnungen</h2><p class="hint">Sterne gibt es für Bewegungspausen (und bald für Spiele). Im Sternenglas sehen die Kinder, wie nah die nächste Belohnung ist. Löst ihr eine ein, werden die Sterne abgezogen.</p>` +
      state.kids.map((k, i) => `<div class="box">${kidHead(k)}
        <div class="field"><label>Sterne</label><button class="pbtn" data-act="star" data-i="${i}" data-n="-1">−1</button><b style="font-size:24px;min-width:50px;text-align:center">⭐ ${k.stars}</b><button class="pbtn" data-act="star" data-i="${i}" data-n="1">+1</button><button class="pbtn" data-act="star" data-i="${i}" data-n="5">+5</button></div>
        ${state.rewards.map((r) => `<div class="list-row"><span class="em">${esc(r.emoji)}</span><span class="tx">${esc(r.name)}</span><button class="pbtn go" data-act="redeem" data-i="${i}" data-id="${r.id}" ${k.stars < r.cost ? 'disabled' : ''}>Einlösen (${r.cost} ⭐)</button></div>`).join('')}
      </div>`).join('') +
      `<div class="box"><h3>Belohnungen bearbeiten</h3>
        ${state.rewards.map((r, j) => `<div class="list-row"><input type="text" maxlength="4" value="${esc(r.emoji)}" data-p="rewards.${j}.emoji" style="width:64px;text-align:center"><input type="text" maxlength="40" value="${esc(r.name)}" data-p="rewards.${j}.name" style="flex:1;min-width:180px"><input type="number" min="1" max="500" value="${r.cost}" data-p="rewards.${j}.cost"> ⭐ <button class="pbtn warn" data-act="delreward" data-id="${r.id}">Löschen</button></div>`).join('')}
        <div class="list-row"><button class="pbtn go" data-act="addreward">+ Neue Belohnung</button></div>
      </div>`;
  },

  sound() {
    return `<h2>Ton & Stimme</h2><p class="hint">Die Anweisungen spricht die deutsche Stimme des Geräts. Schönere Stimmen gibt es auf dem iPhone/iPad unter Einstellungen → Bedienungshilfen → Gesprochene Inhalte → Stimmen → Deutsch (z. B. „Anna (Erweitert)“ laden).</p>
      <div class="box">
        <div class="field"><label>Musik</label>${range('settings.music', 0, 1, 0.05, 'pct')}</div>
        <div class="field"><label>Geräusche</label>${range('settings.sfx', 0, 1, 0.05, 'pct')}</div>
        <div class="field"><label>Sprachanweisungen</label>${toggle('settings.voice')}</div>
        <div class="field"><label>Sprechtempo</label>${seg('settings.voiceRate', [[0.8, 'Langsam'], [0.95, 'Normal'], [1.1, 'Schnell']])}</div>
        <div class="field"><label>Testen</label><button class="pbtn" data-act="testvoice">🗣️ Stimme</button><button class="pbtn" data-act="testsfx">🔔 Geräusch</button></div>
      </div>`;
  },

  stats() {
    const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d; });
    const wd = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    return `<h2>Übersicht</h2><p class="hint">Spielzeit und Bewegungspausen der letzten 7 Tage.</p>` +
      state.kids.map((k) => {
        const vals = days.map((d) => state.stats[k.id]?.[localDay(d)] || { sec: 0, breaks: 0, stars: 0 });
        const max = Math.max(10, ...vals.map((v) => v.sec / 60));
        const today = vals[6], week = vals.reduce((a, v) => ({ sec: a.sec + v.sec, breaks: a.breaks + v.breaks, stars: a.stars + v.stars }), { sec: 0, breaks: 0, stars: 0 });
        return `<div class="box" style="--kid:${k.color}">${kidHead(k)}
          <div class="statline"><div><b>${Math.round(today.sec / 60)} Min</b>heute</div><div><b>${today.breaks}</b>Pausen heute</div><div><b>${Math.round(week.sec / 60)} Min</b>diese Woche</div><div><b>${week.breaks}</b>Pausen Woche</div><div><b>⭐ ${week.stars}</b>Sterne Woche</div></div>
          <div class="chart">${vals.map((v, i) => `<div class="col"><b>${Math.round(v.sec / 60)}</b><i style="height:${(v.sec / 60 / max) * 100}%"></i><span>${wd[days[i].getDay()]}</span></div>`).join('')}</div>
        </div>`;
      }).join('');
  },

  safety() {
    return `<h2>PIN & Daten</h2><p class="hint">Alle Daten bleiben nur auf diesem Gerät. Es gibt keine Werbung, keine Links nach außen und keine Käufe.</p>
      <div class="box"><div class="field"><label>Eltern-PIN ändern</label><button class="pbtn" data-act="pin">PIN ändern</button></div></div>
      <div class="box"><div class="field"><label>Alles zurücksetzen <small>Löscht Figuren, Sterne, Einstellungen und Statistik.</small></label><button class="pbtn warn" data-act="reset">Zurücksetzen</button></div></div>`;
  },

  help() {
    return `<h2>Tipps</h2>
      <div class="box"><h3>📱 Als App auf den Home-Bildschirm</h3><p class="hint">In Safari unten auf das Teilen-Symbol tippen → „Zum Home-Bildschirm“. Dann startet Sirchhausen wie eine richtige App im Vollbild und funktioniert auch ohne Internet.</p></div>
      <div class="box"><h3>🔒 Geführter Zugriff</h3><p class="hint">Damit die Kinder die App nicht verlassen: Einstellungen → Bedienungshilfen → Geführter Zugriff einschalten. In der App dann 3× die Seitentaste drücken.</p></div>
      <div class="box"><h3>👆 Elternbereich öffnen</h3><p class="hint">Das kleine Schloss unten rechts 1,5 Sekunden gedrückt halten, dann die PIN eingeben. So kommen die Kinder nicht aus Versehen hinein.</p></div>
      <div class="box"><h3>🏃 Bewegungspause</h3><p class="hint">Das Gerät muss ruhig liegen, damit die Pause weiterläuft. Wird es hochgenommen, bittet das Kuscheltier, es wieder hinzulegen. Ihr könnt jede Pause über das Schloss beenden.</p></div>`;
  },
};

export function openParents() {
  session.paused = true;
  hush();
  stopMusic();
  let tab = 'kids';
  const el = h(`<div class="parents">
    <nav><div class="logo">🏡 Elternbereich</div>${TABS.map((t) => `<button data-tab="${t.id}">${t.icon} <span>${t.label}</span></button>`).join('')}
      <button class="close" data-act="close">✓ <span>Fertig</span></button></nav>
    <main></main></div>`);
  document.getElementById('overlay-root').appendChild(el);
  const main = el.querySelector('main');
  const render = () => {
    el.querySelectorAll('nav [data-tab]').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
    const st = main.scrollTop;
    main.innerHTML = VIEWS[tab]();
    main.scrollTop = st;
    if (tab === 'photos') loadMedia();
  };
  const changed = (rerender = false) => { save(); applyVolumes(); if (rerender) render(); };

  el.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-tab]');
    if (t) { tab = t.dataset.tab; main.scrollTop = 0; render(); return; }
    const tg = e.target.closest('.toggle[data-p]');
    if (tg) { set(tg.dataset.p, !get(tg.dataset.p)); tg.classList.toggle('on'); changed(); return; }
    const sb = e.target.closest('.seg[data-p] button');
    if (sb) { set(sb.parentElement.dataset.p, JSON.parse(sb.dataset.v)); changed(true); return; }
    const a = e.target.closest('[data-act]');
    if (!a) return;
    const i = +a.dataset.i;
    switch (a.dataset.act) {
      case 'close': close(); break;
      case 'redo': {
        const k = state.kids[i];
        if (confirm(`Figur und Kuscheltier von ${k.name} neu gestalten?`)) { k.avatar = null; k.plush = null; changed(true); }
        break;
      }
      case 'testbreak': close(true); break;
      case 'petfull': { const k = state.kids[i]; k.pet = { hunger: 100, clean: 100, energy: 100, fun: 100, love: 100, t: Date.now() }; changed(); sfx.sparkle(); break; }
      case 'delphoto': if (confirm('Foto löschen?')) { await deletePhoto(a.dataset.id); loadMedia(); } break;
      case 'deldrawing': if (confirm('Bild löschen?')) { await deleteDrawing(a.dataset.id); loadMedia(); } break;
      case 'addidea': {
        const text = main.querySelector('#idea-text').value.trim();
        if (!text) return;
        state.settings.customIdeas.push({ id: uid(), emoji: main.querySelector('#idea-emoji').value.trim() || '⭐', text, sec: +main.querySelector('#idea-sec').value });
        changed(true); break;
      }
      case 'delidea': state.settings.customIdeas = state.settings.customIdeas.filter((c) => c.id !== a.dataset.id); changed(true); break;
      case 'star': addStars(state.kids[i], +a.dataset.n); changed(true); break;
      case 'redeem': {
        const r = state.rewards.find((x) => x.id === a.dataset.id), k = state.kids[i];
        if (k.stars >= r.cost && confirm(`${r.name} für ${k.name} einlösen? (${r.cost} Sterne)`)) { addStars(k, -r.cost); unlockAudio(); sfx.tada(); changed(true); }
        break;
      }
      case 'delreward': state.rewards = state.rewards.filter((r) => r.id !== a.dataset.id); changed(true); break;
      case 'addreward': state.rewards.push({ id: uid(), emoji: '🎈', name: 'Neue Belohnung', cost: 10 }); changed(true); break;
      case 'testvoice': unlockAudio(); say('Servus! So klinge ich. Zeit für eine Bewegungspause!'); break;
      case 'testsfx': unlockAudio(); sfx.moo(); break;
      case 'pin': {
        const old = state.pin; state.pin = null;
        if (!(await askPin())) state.pin = old;
        save(true); break;
      }
      case 'reset': if (confirm('Wirklich ALLES löschen? Das kann nicht rückgängig gemacht werden.') && confirm('Ganz sicher?')) resetAll(); break;
    }
  });

  el.addEventListener('input', (e) => {
    const t = e.target;
    if (t.matches('input[type=range][data-p]')) {
      set(t.dataset.p, +t.value);
      t.nextElementSibling.textContent = fmtVal(+t.value, t.dataset.fmt);
      changed();
    }
  });
  async function loadMedia() {
    const pl = main.querySelector('#ph-list'), dl = main.querySelector('#dr-list');
    if (!pl) return;
    const [ph, dr] = await Promise.all([listPhotos(), listDrawings()]);
    pl.innerHTML = ph.map((p) => `<div class="th"><img src="${p.data}" alt=""><button class="x" data-act="delphoto" data-id="${p.id}">✕</button></div>`).join('') || '<span class="hint">Noch keine Fotos.</span>';
    dl.innerHTML = dr.slice().reverse().map((d) => `<div class="th"><img src="${d.data}" alt=""><small>${esc(state.kids.find((k) => k.id === d.kid)?.name || '')}</small><button class="x" data-act="deldrawing" data-id="${d.id}">✕</button></div>`).join('') || '<span class="hint">Noch keine gemalten Bilder.</span>';
  }
  el.addEventListener('change', async (e) => {
    const t = e.target;
    if (t.id === 'ph-add') {
      for (const f of t.files) { try { await addPhoto(await fileToSquare(f)); } catch (err) { console.warn(err); } }
      t.value = '';
      loadMedia();
      return;
    }
    if (t.matches('input[type=text][data-p]')) { set(t.dataset.p, t.value.trim() || get(t.dataset.p)); changed(); }
    else if (t.matches('input[type=number][data-p]')) { set(t.dataset.p, Math.max(1, Math.round(+t.value) || 1)); changed(); }
    else if (t.matches('select[data-bday]')) {
      const k = state.kids[+t.dataset.bday];
      const box = t.closest('.field');
      const d = box.querySelector('[data-part=d]').value, m = box.querySelector('[data-part=m]').value;
      k.birthday = d && m ? `${m}-${d}` : '';
      changed();
    }
  });

  function close(testBreak = false) {
    save(true);
    el.remove();
    if (session.kid && session.kid.avatar && session.kid.plush) {
      go('village', {});
      if (testBreak) import('../breaks.js').then((m) => m.startBreak());
    } else go('profiles');
  }
  render();
}
