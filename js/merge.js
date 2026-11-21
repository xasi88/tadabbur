// Слияние прогресса телефона и облака. По каждому слову берём то, где больше успеха:
// коробка выше, при равной коробке более поздний повтор. Номер аята берём с телефона.
export function mergeProgress(local, cloud) {
  const words = { ...(cloud?.words || {}) };
  for (const [k, w] of Object.entries(local?.words || {})) {
    const c = words[k];
    if (!c || w.b > c.b || (w.b === c.b && w.d > c.d)) words[k] = w;
  }
  return { ...(cloud || {}), ...(local || {}), words };
}
