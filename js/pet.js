// Tamagotchi-Logik: Bedürfnisse des Kuscheltiers sinken langsam mit der echten Zeit.
import { state, save, addStars, localDay } from './store.js';
import { plushSVG } from './art/plush.js';

export const NEEDS = {
  hunger: { icon: '🍎', label: 'Hunger', hours: 10 },
  clean: { icon: '🛁', label: 'Sauber', hours: 20 },
  energy: { icon: '😴', label: 'Müde', hours: 14 },
  fun: { icon: '🎾', label: 'Spaß', hours: 8 },
  love: { icon: '❤️', label: 'Kuscheln', hours: 9 },
};

export function petState(kid) {
  const now = Date.now();
  if (!kid.pet) kid.pet = { hunger: 85, clean: 90, energy: 90, fun: 80, love: 90, t: now };
  const p = kid.pet;
  const dt = Math.max(0, (now - p.t) / 1000);
  if (dt > 1) {
    for (const [k, n] of Object.entries(NEEDS)) p[k] = Math.max(0, p[k] - (100 / (n.hours * 3600)) * dt);
    p.t = now;
  }
  return p;
}

export function petMood(kid) {
  if (!kid.plush) return 'happy';
  const p = petState(kid);
  if (p.energy < 15) return 'sleep';
  if (!state.settings.petSad) return 'happy';
  return Math.min(p.hunger, p.clean, p.fun, p.love) < 25 ? 'sad' : 'happy';
}

export const lowestNeed = (kid) => {
  const p = petState(kid);
  return Object.keys(NEEDS).sort((a, b) => p[a] - p[b])[0];
};

/** Bedürfnis auffüllen. Gibt true zurück, wenn das Kuscheltier jetzt rundum glücklich ist und es dafür (1× am Tag) einen Stern gab. */
export function boost(kid, need, amount) {
  const p = petState(kid);
  p[need] = Math.min(100, p[need] + amount);
  save();
  const happy = Object.keys(NEEDS).every((k) => p[k] >= 80);
  if (happy && kid.lastPetStar !== localDay()) {
    kid.lastPetStar = localDay();
    addStars(kid, 2);
    return true;
  }
  return false;
}

/** Kuscheltier des Kindes inkl. Kleidung und Stimmung */
export const kidPlush = (kid, opt = {}) => plushSVG(kid.plush || 'baer', { outfit: kid.plushOutfit, mood: opt.mood ?? petMood(kid), ...opt });
