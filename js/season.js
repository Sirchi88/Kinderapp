// Feste: Weihnachtsmodus, Adventskalender und Geburtstage.
import { state, localDay } from './store.js';

export function isChristmas(d = new Date()) {
  const m = state.settings.xmas;
  if (m === 'on') return true;
  if (m === 'off') return false;
  return d.getMonth() === 11 && d.getDate() <= 26;
}

export function isBirthday(kid, d = new Date()) {
  if (!kid?.birthday) return false;
  const [mm, dd] = kid.birthday.split('-').map(Number);
  return d.getMonth() + 1 === mm && d.getDate() === dd;
}

export const anyBirthday = () => state.kids.find((k) => isBirthday(k));

/** Darf Türchen d heute geöffnet werden? Im Dezember nach Datum, sonst eines pro Tag der Reihe nach. */
export function canOpenDoor(kid, d, now = new Date()) {
  const a = kid.advent;
  if (a.opened[d]) return true;
  if (now.getMonth() === 11) return d <= now.getDate();
  const next = Object.keys(a.opened).length + 1;
  return d === next && a.last !== localDay(now);
}
