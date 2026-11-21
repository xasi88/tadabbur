// Прогресс ученика на телефоне (localStorage). Облако: js/cloud.js.
// pos: текущий аят каждой суры, sura: последняя открытая сура. Старый прогресс (только aya) это Аль-Фатиха.
const KEY = "tadabbur-progress";

export function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && typeof p.words === "object") return fix(p);
  } catch {}
  return fix({ words: {} });
}

export function fix(p) {
  const pos = p.pos && typeof p.pos === "object" ? p.pos : { 1: p.aya || 1 };
  return { ...p, pos, sura: p.sura || 1, aya: p.aya || 1 };
}

export function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
