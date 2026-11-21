// Прогресс ученика на телефоне (localStorage). Облако: шаг 6, js/cloud.js.
const KEY = "tadabbur-progress";

export function load() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && typeof p.words === "object") return { aya: 1, ...p };
  } catch {}
  return { words: {}, aya: 1 };
}

export function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
