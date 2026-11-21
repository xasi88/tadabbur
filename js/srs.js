// Повтор по интервалам (коробки Лейтнера). Чистые функции: прогресс передаётся снаружи.
// Прогресс: { words: { [ключ]: { b: коробка 0-5, d: день следующего повтора } } }
export const DAYS = [0, 1, 3, 7, 16, 35]; // через сколько дней повтор для коробки

export const today = (now = Date.now()) => Math.floor(now / 86400000);

// Слово знакомо, если ответ был верным и после него не было ошибки.
export const isKnown = (p, k) => (p.words[k]?.b || 0) >= 1;

export function answer(p, k, ok, day = today()) {
  const cur = p.words[k] || { b: 0, d: day };
  const b = ok ? Math.min(cur.b + 1, DAYS.length - 1) : 0;
  p.words[k] = { b, d: day + DAYS[b] };
  return p.words[k];
}

// Слова, которые пора повторить: уже встречались и срок наступил. Сначала самые просроченные.
export const due = (p, day = today()) => Object.entries(p.words)
  .filter(([, w]) => w.d <= day)
  .sort((a, b) => a[1].d - b[1].d)
  .map(([k]) => k);

// Новые слова для занятия: сначала слова аята, потом частые слова. Без повторов ключей.
export function pickNew(p, ayaKeys, topKeys, n = 5) {
  const out = [];
  for (const k of [...ayaKeys, ...topKeys]) {
    if (out.length >= n) break;
    if (!p.words[k] && !out.includes(k)) out.push(k);
  }
  return out;
}

// Доля текста Корана, которую покрывают знакомые формы слова (по счёту вхождений).
export function coverage(p, counts, total) {
  let sum = 0;
  for (const [k, n] of counts) if (isKnown(p, k)) sum += n;
  return total ? sum / total : 0;
}
