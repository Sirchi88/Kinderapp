// Sprachausgabe über die deutsche Stimme des Geräts.
import { state } from './store.js';
import { duckMusic } from './audio.js';

let voice = null;
function pickVoice() {
  const vs = (window.speechSynthesis?.getVoices() || []).filter((v) => v.lang?.toLowerCase().startsWith('de'));
  voice = vs.find((v) => /anna|helena|petra|marlene|katja|vicki/i.test(v.name)) || vs.find((v) => v.lang === 'de-DE') || vs[0] || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

let bubbleCb = null;
export const onSay = (cb) => (bubbleCb = cb);

/** Spricht einen Text. Gibt ein Promise zurück, das nach dem Sprechen erfüllt wird. */
export function say(text, opt = {}) {
  bubbleCb?.(text, opt);
  if (!state.settings.voice || !('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((resolve) => {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ''));
      u.lang = 'de-DE';
      if (voice) u.voice = voice;
      u.rate = state.settings.voiceRate * (opt.rate || 1);
      u.pitch = opt.pitch || 1.12;
      duckMusic(true);
      let fin = false;
      const done = () => { if (fin) return; fin = true; duckMusic(false); resolve(); };
      u.onend = done; u.onerror = done;
      setTimeout(done, 8000 + text.length * 80);
      speechSynthesis.speak(u);
    } catch (e) { resolve(); }
  });
}

export function hush() { try { speechSynthesis.cancel(); } catch (e) {} duckMusic(false); }
