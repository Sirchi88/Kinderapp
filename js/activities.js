// Ideen für die Bewegungspausen. Eltern können im Elternbereich eigene ergänzen.
export const BREAK_TYPES = {
  dance: { label: 'Tanzpause mit Musik', emoji: '💃' },
  animal: { label: 'Tierbewegungen', emoji: '🐸' },
  sport: { label: 'Sport-Challenge', emoji: '🤸' },
  search: { label: 'Suchauftrag', emoji: '🔍' },
  custom: { label: 'Eure eigenen Ideen', emoji: '💡' },
};

export const ACTIVITIES = {
  dance: [
    { e: '💃', t: 'Tanz-Party!', say: 'Tanz-Party! Tanz so wild du kannst, bis die Musik aufhört!', sec: 40, music: true },
    { e: '🧊', t: 'Stopptanz!', say: 'Stopptanz! Tanze! Und wenn die Musik stoppt: einfrieren!', sec: 45, music: true, freeze: true },
    { e: '🪩', t: 'Wackel-Tanz!', say: 'Wackel mit dem Popo, wackel mit den Armen, wackel mit dem ganzen Körper!', sec: 35, music: true },
  ],
  animal: [
    { e: '🐸', t: 'Hüpf wie ein Frosch!', say: 'Hüpf wie ein Frosch! Quak, quak!', sec: 25 },
    { e: '🐘', t: 'Stampf wie ein Elefant!', say: 'Stampf ganz fest wie ein großer Elefant!', sec: 25 },
    { e: '🦩', t: 'Steh wie ein Flamingo!', say: 'Steh auf einem Bein wie ein Flamingo!', sec: 20 },
    { e: '🐻', t: 'Krabbel wie ein Bär!', say: 'Geh auf Händen und Füßen wie ein Bär!', sec: 25 },
    { e: '🐇', t: 'Hoppel wie ein Hase!', say: 'Hoppel, hoppel, wie ein kleiner Hase!', sec: 25 },
    { e: '🐍', t: 'Schlängel wie eine Schlange!', say: 'Leg dich auf den Bauch und schlängel dich wie eine Schlange! Ssss!', sec: 25 },
    { e: '🐧', t: 'Watschel wie ein Pinguin!', say: 'Watschel wie ein Pinguin, mit ganz kleinen Schritten!', sec: 25 },
    { e: '🦀', t: 'Lauf wie ein Krebs!', say: 'Lauf seitwärts wie ein Krebs!', sec: 25 },
    { e: '🐄', t: 'Muh wie eine Allgäuer Kuh!', say: 'Lauf auf allen Vieren wie eine Allgäuer Kuh. Muuuh!', sec: 25 },
    { e: '🐱', t: 'Streck dich wie Bailey!', say: 'Streck dich ganz lang wie Bailey, wenn er aufwacht. Miau!', sec: 20 },
    { e: '🦘', t: 'Spring wie ein Känguru!', say: 'Spring mit beiden Beinen wie ein Känguru!', sec: 20 },
    { e: '🦋', t: 'Flieg wie ein Schmetterling!', say: 'Flatter mit den Armen und flieg wie ein Schmetterling durchs Zimmer!', sec: 25 },
  ],
  sport: [
    { e: '🤸', t: '10 Hampelmänner!', say: 'Mach zehn Hampelmänner! Ich zähle mit!', sec: 30, count: 10 },
    { e: '⬆️', t: '5 Mal ganz hoch springen!', say: 'Spring fünf Mal ganz hoch in die Luft!', sec: 20, count: 5 },
    { e: '🏃', t: 'Lauf auf der Stelle!', say: 'Lauf ganz schnell auf der Stelle!', sec: 20 },
    { e: '🙆', t: 'Mach dich ganz groß!', say: 'Streck dich ganz groß bis zur Decke! Und jetzt ganz klein wie eine Maus!', sec: 20 },
    { e: '🌀', t: 'Dreh dich 3 Mal!', say: 'Dreh dich drei Mal im Kreis!', sec: 15 },
    { e: '👏', t: '10 Mal klatschen!', say: 'Klatsch zehn Mal in die Hände!', sec: 15, count: 10 },
    { e: '🦵', t: '5 Kniebeugen!', say: 'Mach fünf Kniebeugen. Runter und hoch!', sec: 25, count: 5 },
    { e: '🚲', t: 'Fahrrad in der Luft!', say: 'Leg dich auf den Rücken und fahr Fahrrad in der Luft!', sec: 25 },
    { e: '🦶', t: 'Auf Zehenspitzen!', say: 'Geh auf Zehenspitzen durchs Zimmer, ganz leise!', sec: 20 },
    { e: '🔄', t: 'Purzelbaum!', say: 'Kannst du einen Purzelbaum? Probier es mal, mit Mama oder Papa!', sec: 25 },
  ],
  search: [
    { e: '🔴', t: 'Etwas Rotes finden!', say: 'Such etwas Rotes und zeig es Mama oder Papa!', sec: 40 },
    { e: '🔵', t: 'Etwas Blaues finden!', say: 'Such etwas Blaues und bring es her!', sec: 40 },
    { e: '🟡', t: 'Etwas Gelbes finden!', say: 'Wo ist etwas Gelbes? Such es!', sec: 40 },
    { e: '🧸', t: 'Hol dein echtes Kuscheltier!', say: 'Hol dein echtes Kuscheltier und gib ihm einen Kuss!', sec: 40 },
    { e: '🧦', t: 'Find eine Socke!', say: 'Find eine Socke! Wo könnte eine sein?', sec: 40 },
    { e: '🥄', t: 'Find einen Löffel!', say: 'Such einen Löffel!', sec: 40 },
    { e: '📚', t: 'Bring ein Buch!', say: 'Bring dein Lieblingsbuch!', sec: 40 },
    { e: '⚽', t: 'Find einen Ball!', say: 'Find einen Ball!', sec: 40 },
    { e: '🤗', t: 'Dicke Umarmung!', say: 'Lauf zu Mama oder Papa und gib eine ganz dicke Umarmung!', sec: 25 },
    { e: '🐱', t: 'Wo ist Bailey?', say: 'Wo ist Bailey gerade? Such ihn und streichel ihn ganz sanft!', sec: 40 },
    { e: '🍎', t: 'Find etwas zum Essen!', say: 'Such etwas, das man essen kann!', sec: 40 },
  ],
};

export function buildBreakPlan(settings, durationSec) {
  const enabled = Object.keys(settings.breakTypes).filter((k) => settings.breakTypes[k]);
  const pool = [];
  for (const k of enabled) {
    if (k === 'custom') for (const c of settings.customIdeas) pool.push({ e: c.emoji || '⭐', t: c.text, say: c.text, sec: c.sec || 30, type: 'custom' });
    else for (const a of ACTIVITIES[k] || []) pool.push({ ...a, type: k });
  }
  if (!pool.length) for (const a of ACTIVITIES.animal) pool.push({ ...a, type: 'animal' });
  // Abwechslungsreich mischen: keine zwei gleichen Typen hintereinander, wenn möglich
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const plan = [];
  let total = 0;
  const used = new Set();
  while (total < durationSec && plan.length < 12) {
    let pick = shuffled.find((a) => !used.has(a) && (!plan.length || plan[plan.length - 1].type !== a.type)) || shuffled.find((a) => !used.has(a));
    if (!pick) { used.clear(); continue; }
    used.add(pick);
    plan.push(pick);
    total += pick.sec;
  }
  return plan;
}
