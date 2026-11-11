// Erkennt über den Bewegungssensor, ob das Gerät ruhig abgelegt wurde.
let smoothed = 1, last = null, lastEvent = 0, listening = false, permission = 'unknown';

function onMotion(e) {
  const a = e.accelerationIncludingGravity;
  if (!a || a.x == null) return;
  lastEvent = performance.now();
  const v = [a.x, a.y, a.z];
  if (last) {
    const d = Math.abs(v[0] - last[0]) + Math.abs(v[1] - last[1]) + Math.abs(v[2] - last[2]);
    smoothed = smoothed * 0.88 + d * 0.12;
  }
  last = v;
}

function start() {
  if (listening) return;
  window.addEventListener('devicemotion', onMotion);
  listening = true;
}

/** Muss bei iOS aus einem Tipp heraus aufgerufen werden. */
export async function requestMotion() {
  try {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      if (permission !== 'granted') permission = await DeviceMotionEvent.requestPermission();
    } else {
      permission = 'DeviceMotionEvent' in window ? 'granted' : 'denied';
    }
  } catch (e) {
    permission = 'denied';
  }
  if (permission === 'granted') start();
  return permission === 'granted';
}

/** Liefert der Sensor wirklich Werte? (Am Computer meist nicht.) */
export const sensorWorks = () => listening && performance.now() - lastEvent < 1500;
export const isStill = () => smoothed < 0.18;
export const isMoving = () => smoothed > 0.55;
export const motionLevel = () => smoothed;
