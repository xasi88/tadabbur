// Значки-образы слов (data/app/obyasnenie-*.json, поле i). Стиль брендбука: толстый тёмный контур, цвета из tokens.css.
// Без людей, без звёзд и без знаков других религий («Штампы ИИ-дизайна», «Общие запреты»).
const L = "var(--lime)", Y = "var(--yellow)", P = "var(--pink)", S = "var(--sky)", M = "var(--mint)", W = "var(--card-2)", A = "var(--peach)";
const arrow = (d, head) => `<path d="${d}" fill="none"/><path d="${head}" fill="none"/>`;

const ICONS = {
  globe: `<circle cx="24" cy="24" r="17" fill="${S}"/><path d="M24 7c-8 9-8 25 0 34M24 7c8 9 8 25 0 34M7 24h34" fill="none"/>`,
  earth: `<path d="M5 34c6-10 12-14 19-14s13 4 19 14v7H5z" fill="${M}"/><path d="M14 30c3-3 6-4 10-4" fill="none"/>`,
  sun: `<circle cx="24" cy="24" r="9" fill="${Y}"/><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.5 10.5l4 4M33.5 33.5l4 4M10.5 37.5l4-4M33.5 14.5l4-4" fill="none"/>`,
  sky: `<path d="M12 36a7 7 0 0 1 1-14 10 10 0 0 1 19-2 8 8 0 0 1 4 16z" fill="${W}"/><path d="M8 12h12M28 9h12" fill="none"/>`,
  flame: `<path d="M24 5c3 8 13 12 13 23a13 13 0 0 1-26 0c0-6 3-9 6-12 0 5 2 7 4 8-1-8 1-13 3-19z" fill="${A}"/><path d="M24 41a6 6 0 0 1-6-6c0-4 3-6 6-9 3 3 6 5 6 9a6 6 0 0 1-6 6z" fill="${Y}"/>`,
  book: `<path d="M24 12c-5-3-11-4-17-3v27c6-1 12 0 17 3 5-3 11-4 17-3V9c-6-1-12 0-17 3z" fill="${W}"/><path d="M24 12v27" fill="none"/><path d="M11 16c3 0 6 .5 9 2M11 22c3 0 6 .5 9 2M28 18c3-1.5 6-2 9-2M28 24c3-1.5 6-2 9-2" fill="none"/>`,
  road: `<path d="M18 6h12l11 36H7z" fill="${Y}"/><path d="M24 10v5M24 21v6M24 33v6" fill="none"/>`,
  straight: arrow("M24 42V8", "M14 18l10-10 10 10"),
  winding: `<path d="M10 42c0-8 26-6 26-14S12 22 12 14s14-8 18-8" fill="none"/><circle cx="34" cy="6" r="3" fill="${P}"/>`,
  signpost: `<path d="M22 44V6h4v38" fill="${W}"/><path d="M26 10h12l5 5-5 5H26z" fill="${L}"/><path d="M22 22H10l-5 5 5 5h12z" fill="${Y}"/>`,
  scales: `<path d="M24 8v32M14 42h20M8 14h32" fill="none"/><path d="M8 14 3 28h10zM40 14l-5 14h10z" fill="${Y}"/><path d="M3 28a5 4 0 0 0 10 0M35 28a5 4 0 0 0 10 0" fill="${Y}"/>`,
  out: `<rect x="6" y="10" width="20" height="28" rx="3" fill="${W}"/>` + arrow("M16 24h26", "M34 16l8 8-8 8"),
  in: `<rect x="8" y="8" width="32" height="32" rx="5" fill="${W}"/><circle cx="24" cy="24" r="6" fill="${P}"/>`,
  on: `<path d="M5 34h38" fill="none"/><rect x="15" y="14" width="18" height="20" rx="4" fill="${L}"/>`,
  to: `<circle cx="36" cy="24" r="9" fill="${P}"/><circle cx="36" cy="24" r="3" fill="${W}"/>` + arrow("M4 24h22", "M19 17l7 7-7 7"),
  speech: `<path d="M8 10h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-9 8v-8H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z" fill="${W}"/><path d="M13 19h22M13 25h14" fill="none"/>`,
  then: `<circle cx="9" cy="24" r="5" fill="${L}"/><circle cx="39" cy="24" r="5" fill="${Y}"/><path d="M16 24h4M24 24h4" fill="none"/><path d="M29 19l4 5-4 5" fill="none"/>`,
  fork: `<path d="M24 44V26L10 8M24 26 38 8" fill="none"/><circle cx="10" cy="8" r="4" fill="${L}"/><circle cx="38" cy="8" r="4" fill="${Y}"/>`,
  all: `<rect x="6" y="6" width="16" height="16" rx="3" fill="${L}"/><rect x="26" y="6" width="16" height="16" rx="3" fill="${L}"/><rect x="6" y="26" width="16" height="16" rx="3" fill="${L}"/><rect x="26" y="26" width="16" height="16" rx="3" fill="${L}"/>`,
  box: `<path d="M24 5 42 14v20L24 43 6 34V14z" fill="${A}"/><path d="M6 14l18 9 18-9M24 23v20" fill="none"/>`,
  down: `<path d="M10 14a6 6 0 0 1 2-10 9 9 0 0 1 17-1 7 7 0 0 1 7 11z" fill="${W}"/>` + arrow("M24 18v24", "M16 34l8 8 8-8"),
};

// Значок строкой SVG для innerHTML. Нет значка: пусто.
export const icon = (name) => ICONS[name]
  ? `<svg viewBox="0 0 48 48" width="56" height="56" aria-hidden="true" stroke="var(--edge)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`
  : "";
export const iconNames = Object.keys(ICONS);
