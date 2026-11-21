// Экраны Tadabbur: «Суры» (первый), «Джуз Амма», «Тропа», «Аят по словам», «Занятие», «Итог», «Настройки».
// Карта: docs/Карта Tadabbur/. Логика повтора: js/srs.js.
import { answer, due, isKnown, pickNew, coverage, today } from "./srs.js?v=6ff2aa58";
import { load, save, fix } from "./store.js?v=6ff2aa58";
import { googleButton, pushLater, pullOnStart, cloudUser, signOut } from "./cloud.js?v=6ff2aa58";
import { icon } from "./icons.js?v=6ff2aa58";
import { APP_VERSION, CHANGELOG } from "./version.js?v=6ff2aa58";

const app = document.getElementById("app");
const audioUrl = (a) => `https://audio.qurancdn.com/wbw/${a}.mp3`;
let P = load();
let D; // данные: top, suras, byKey, counts, total; S: открытая сура, A: её аяты
let S, A;

// Маленький помощник: h("button.btn", {onclick}, "текст", ...)
function h(tag, attrs, ...kids) {
  const [name, ...cls] = tag.split(".");
  const el = document.createElement(name);
  if (cls.length) el.className = cls.join(" ");
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) el.setAttribute(k, v === true ? "" : v);
  }
  el.append(...kids.flat().filter((x) => x != null && x !== false));
  return el;
}
const show = (...nodes) => { app.replaceChildren(...nodes.filter((n) => n != null)); window.scrollTo(0, 0); };
const play = (a) => { try { new Audio(audioUrl(a)).play().catch(() => {}); } catch {} };
const pct = (x) => Math.round(x * 100);
const meter = (x) => h("div.meter", null, h("i", { style: `width:${pct(x)}%` }));
const glossOf = (k) => D.byKey.get(k).g;
const keep = () => { save(P); pushLater(P); };

// Объяснение слова: почему так переводится, и образ для памяти со значком.
function explain(x) {
  if (!x.e) return null;
  const pic = h("div.pic");
  pic.innerHTML = icon(x.i);
  return h("div.explain", null,
    h("p", null, h("b", null, "Почему так: "), x.e),
    x.o ? h("div.obraz", null, x.i ? pic : null, h("p", null, h("b", null, "Образ: "), x.o)) : null);
}

async function start() {
  const [w, f, ...ob] = await Promise.all(["words", "suras", "obyasnenie-1", "obyasnenie-2", "obyasnenie-3", "obyasnenie-4"].map((u) => fetch(`data/app/${u}.json`).then((r) => r.json())));
  const byKey = new Map();
  for (const x of [...f.suras.flatMap((s) => (s.ayat || []).flat()), ...w.words]) if (!byKey.has(x.k)) byKey.set(x.k, x);
  for (const o of ob) for (const [k, x] of Object.entries(o.words)) if (byKey.has(k)) Object.assign(byKey.get(k), x);
  P = fix(await pullOnStart(P)); save(P);
  D = { top: w.words, suras: f.suras, byKey, counts: [...byKey].map(([k, x]) => [k, x.n]), total: w.meta.total };
  setSura(P.sura);
  homeScreen();
}

// Открыть суру: её аяты и номер текущего аята из прогресса.
function setSura(n) {
  S = D.suras.find((s) => s.n === n && s.ayat) || D.suras[0];
  A = S.ayat; P.sura = S.n; P.aya = P.pos[S.n] || 1;
}
const setAya = (i) => { P.aya = P.pos[S.n] = i; keep(); };
const suraPart = (s) => { const ks = [...new Set(s.ayat.flat().map((x) => x.k))]; return ks.filter((k) => isKnown(P, k)).length / ks.length; };
const openSura = (n, back) => { setSura(n); S.back = back; keep(); trailScreen(); };

// Карточка суры: номер, имя, сколько аятов, доля знакомых слов.
function suraBtn(s, back) {
  const n = s.ayat ? s.ayat.length : s.len, part = s.ayat ? suraPart(s) : 0;
  return h(`button.sura${s.ayat ? "" : ".soon"}${part === 1 ? ".done" : ""}`, {
    disabled: !s.ayat, style: `--p:${pct(part)}%`, onclick: () => openSura(s.n, back),
    "aria-label": `${s.n}. ${s.name}, ${s.ayat ? `понятно ${pct(part)}% слов` : "скоро"}`,
  }, h("span.num", null, part === 1 ? "✓" : String(s.n)),
  h("span.nm", null, h("b", null, s.name), h("small", null, `${n} ${ayaWord(n)}${s.ayat ? "" : ", скоро"}`)),
  s.ayat ? h("span.pc", null, `${pct(part)}%`) : null);
}
const ayaWord = (n) => (n % 10 === 1 && n % 100 !== 11 ? "аят" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "аята" : "аятов");

// Суры: первый экран. Аль-Фатиха отдельно, Джуз Амма открывает список сур.
function homeScreen() {
  const juz = D.suras.filter((s) => s.n >= 78), open = juz.filter((s) => s.ayat).length;
  const cov = coverage(P, D.counts, D.total);
  show(
    h("div.top", null, h("h1", null, "Суры"),
      h("button.icon-btn", { "aria-label": "Настройки", onclick: () => settingsScreen() }, "⚙")),
    h("p.hint", null, "Выберите суру"),
    suraBtn(D.suras[0], homeScreen),
    h("button.sura.juz", { onclick: () => juzScreen(), "aria-label": `Джуз Амма, открыто ${open} из ${juz.length} сур` },
      h("span.num", null, "30"), h("span.nm", null, h("b", null, "Джуз Амма"), h("small", null, `суры 78-114, открыто ${open} из ${juz.length}`)),
      h("span.pc", null, "›")),
    h("div.card.tilt", null,
      h("div.lbl", null, h("span", null, "Знакомые слова"), h("span", null, `${pct(cov)}% Корана`)),
      meter(cov)));
}

function juzScreen() {
  show(
    h("div.top", null,
      h("button.icon-btn", { "aria-label": "К сурам", onclick: () => homeScreen() }, "‹"),
      h("h1", null, "Джуз Амма")),
    h("p.hint", null, "Пока открыты три последние суры. Остальные скоро."),
    h("div.suras", null, D.suras.filter((s) => s.n >= 78).map((s) => suraBtn(s, juzScreen))));
  // Открытые суры в конце длинного списка: сразу показать их.
  app.querySelector(".sura:not(.soon)")?.scrollIntoView({ block: "center" });
}

// Ключи на сегодня для аята: незнакомые слова этого аята.
const ayaKeys = (i) => [...new Set(A[i - 1].map((x) => x.k))];

// Доля знакомых слов аята и текущий аят: первый, где есть незнакомые слова.
const ayaPart = (i) => { const ks = ayaKeys(i); return ks.filter((k) => isKnown(P, k)).length / ks.length; };
const nums = () => A.map((_, i) => i + 1);
const currentAya = () => nums().find((i) => ayaPart(i) < 1) || A.length;

// Тропа: аяты суры дорожкой сверху вниз. Кружок: номер, кольцо = доля знакомых слов.
const ROW = 108, DX = [0, 62, 0, -62];
function trailScreen() {
  const N = A.length, cur = currentAya(), done = nums().filter((i) => ayaPart(i) === 1).length;
  const x = (i) => DX[(i - 1) % 4];
  const pts = nums().map((i) => `${300 + x(i)},${(i - 1) * ROW + 44}`).join(" ");
  const svg = `<svg viewBox="0 0 600 ${(N - 1) * ROW + 88}" preserveAspectRatio="xMidYMin slice" aria-hidden="true"><polyline points="${pts}" /></svg>`;
  const road = h("div.trail", { style: `height:${(N - 1) * ROW + 88}px` });
  road.innerHTML = svg;
  for (let i = 1; i <= N; i++) {
    const part = ayaPart(i), st = part === 1 ? ".done" : i === cur ? ".cur" : "";
    road.append(h(`button.node${st}`, {
      style: `--p:${pct(part)}%;top:${(i - 1) * ROW}px;left:calc(50% + ${x(i)}px)`,
      "aria-label": `Аят ${i}, понятно ${pct(part)}% слов`,
      onclick: () => { setAya(i); ayaScreen(); },
    }, h("span", null, part === 1 ? "✓" : String(i)), i === cur ? h("em", null, "сейчас") : h("small", null, `${pct(part)}%`)));
  }
  const cov = coverage(P, D.counts, D.total);
  show(
    h("div.top", null,
      h("button.icon-btn", { "aria-label": "К сурам", onclick: () => (S.back || homeScreen)() }, "‹"),
      h("h1", null, S.name), h("span.pill", null, `${done} из ${N}`)),
    h("p.hint", null, "Нажмите на аят, чтобы открыть его"),
    road,
    h("div.card.tilt", null,
      h("div.lbl", null, h("span", null, "Знакомые слова"), h("span", null, `${pct(cov)}% Корана`)),
      meter(cov)),
    h("div.bottom.stick", null,
      h("button.btn", { onclick: () => { setAya(cur); lesson(); } }, done === N ? "Повторить и учить новые слова" : `Учить аят ${cur}`)));
}

function ayaScreen(sel = null) {
  const i = P.aya, words = A[i - 1], N = A.length;
  const plan = pickNew(P, ayaKeys(i), [], 5);
  const keys = ayaKeys(i), known = keys.filter((k) => isKnown(P, k)).length;
  const go = (d) => { setAya(Math.min(N, Math.max(1, i + d))); ayaScreen(); };
  const pick = (j) => { play(words[j].a); ayaScreen(j); };
  const s = sel == null ? null : words[sel];
  const label = plan.length ? "Выучить слова аята" : due(P, today()).length ? "Повторить слова" : "Новые частые слова";
  show(
    h("div.top", null,
      h("button.icon-btn", { "aria-label": "К тропе", onclick: () => trailScreen() }, "⌂"),
      h("button.icon-btn", { "aria-label": "Прошлый аят", disabled: i === 1, onclick: () => go(-1) }, "‹"),
      h("h1", null, `Аят ${i}`),
      h("button.icon-btn", { "aria-label": "Следующий аят", disabled: i === N, onclick: () => go(1) }, "›")),
    h("p.hint", null, "Нажмите на слово"),
    h("div.card", null,
      h("div.aya.ar", null, words.map((x, j) => h(
        `button.w${isKnown(P, x.k) ? ".k" : plan.includes(x.k) || P.words[x.k] ? ".n" : ""}${sel === j ? ".sel" : ""}`,
        { onclick: () => pick(j), "aria-label": x.g }, x.ar))),
      h("div.gloss", { "aria-live": "polite" }, s ? [h("span.ar", null, s.ar), h("span", null, s.g)] : h("span", null, "Здесь появится перевод слова")),
      s ? explain(s) : null,
      h("div.key", null,
        h("span", null, h("b", { style: "background:var(--lime)" }), "знаю"),
        h("span", null, h("b", { style: "background:var(--yellow)" }), "учу сегодня"),
        h("span", null, h("b", { style: "background:var(--card-2)" }), "позже")),
      h("p.note", null, "Черновой перевод. Его проверит знающий человек.")),
    h("div.card.tilt", null,
      h("div.lbl", null, h("span", null, "Вы понимаете"), h("span", null, `${known} из ${keys.length} слов`)),
      meter(keys.length ? known / keys.length : 0),
      h("p.sub", null, `Знакомые слова: ${pct(coverage(P, D.counts, D.total))}% всего текста Корана`)),
    h("div.bottom", null,
      h("button.btn", { onclick: () => lesson() }, label)));
}

// Вход Google в настройках. Кнопка Google входит в одно нажатие.
function cloudCard() {
  const u = cloudUser();
  if (u) return h("div.card", null,
    h("div.lbl", null, h("span", null, "Прогресс в облаке")),
    h("p.sub", { style: "margin:0 0 12px" }, `Вы вошли через Google${u.name ? ": " + u.name : ""}. Выученные слова сохраняются сами.`),
    h("button.btn.light", { onclick: () => { signOut(); settingsScreen(); } }, "Выйти"));
  const slot = h("div.gbtn"), msg = h("p.sub.center", { "aria-live": "polite" });
  const card = h("div.card", null,
    h("div.lbl", null, h("span", null, "Сохраните прогресс")),
    h("p.sub", { style: "margin:0 0 12px" }, "Войдите через Google, и выученные слова не пропадут при смене телефона."),
    slot, msg);
  googleButton(slot, () => P, (both) => { P = fix(both); setSura(P.sura); save(P); settingsScreen(); }, (t) => { msg.textContent = t; });
  return card;
}

// Настройки: вход и облако, о переводе, версия и что нового.
function settingsScreen() {
  show(
    h("div.top", null,
      h("button.icon-btn", { "aria-label": "К сурам", onclick: () => homeScreen() }, "‹"),
      h("h1", null, "Настройки")),
    cloudCard(),
    h("div.card", null,
      h("div.lbl", null, h("span", null, "О переводе")),
      h("p.sub", { style: "margin:0" }, "Перевод, объяснения и образы слов пока черновые. Их проверит знающий человек. Текст и звук слов: Quran.com.")),
    h("div.card", null,
      h("div.lbl", null, h("span", null, "Версия"), h("span", null, APP_VERSION)),
      CHANGELOG.slice(0, 4).map((c) => h("div.log", null, h("b", null, `${c.v} · ${c.date}`), h("ul", null, c.items.map((t) => h("li", null, t)))))));
}

// Занятие: показ новых слов, потом вопросы по новым и пора повторить.
function lesson() {
  // Как на кнопке: есть новые слова аята, учим их (и частые до 5); нет, только повтор; нечего повторять, частые слова.
  const d = due(P, today()), top = D.top.map((x) => x.k);
  const fresh = pickNew(P, ayaKeys(P.aya), [], 5).length ? pickNew(P, ayaKeys(P.aya), top, 5) : d.length ? [] : pickNew(P, [], top, 5);
  const review = d.filter((k) => !fresh.includes(k)).slice(0, 10);
  const L = { fresh, quiz: [...fresh, ...review], step: 0, wrong: new Set(), retry: [] };
  if (!L.quiz.length) return ayaScreen();
  fresh.length ? learnCard(L, 0) : quizCard(L);
}

const head = (L, done, all) => h("div.top", null,
  h("button.icon-btn", { "aria-label": "Закрыть занятие", onclick: () => ayaScreen() }, "×"),
  h("div", { style: "flex:1" }, meter(all ? done / all : 0)));

function learnCard(L, n) {
  const x = D.byKey.get(L.fresh[n]);
  play(x.a);
  show(
    head(L, n, L.fresh.length + L.quiz.length),
    h("div.card.tilt", null,
      h("span.pill", null, `Новое слово ${n + 1} из ${L.fresh.length}`),
      h("div.ar.big", null, x.ar),
      h("p.tr", null, x.g),
      h("p.note", null, `В Коране ${x.n} раз`),
      h("button.icon-btn.play", { "aria-label": "Послушать", onclick: () => play(x.a) }, "▶"),
      explain(x)),
    h("div.bottom", null,
      h("button.btn", { onclick: () => (n + 1 < L.fresh.length ? learnCard(L, n + 1) : quizCard(L)) }, "Дальше")));
}

function options(k) {
  const right = glossOf(k), pool = [...new Set([...D.byKey.values()].map((x) => x.g))].filter((g) => g !== right);
  const out = [right];
  while (out.length < 4 && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out.sort(() => Math.random() - 0.5);
}

function quizCard(L) {
  if (L.step >= L.quiz.length) {
    if (!L.retry.length) return doneScreen(L);
    L.quiz.push(...L.retry); L.retry = [];
  }
  const k = L.quiz[L.step], x = D.byKey.get(k), right = glossOf(k);
  const done = L.fresh.length + L.step;
  const pickOpt = (g, btn, all) => {
    const ok = g === right;
    all.forEach((b) => { b.disabled = true; if (b.textContent === right) b.classList.add("ok"); });
    if (!ok) btn.classList.add("bad");
    if (!L.wrong.has(k)) answer(P, k, ok);
    if (!ok && !L.wrong.has(k)) { L.wrong.add(k); L.retry.push(k); }
    keep();
    play(x.a);
    const ex = explain(x);
    if (ex) hintBox.replaceChildren(ex);
    next.hidden = false;
    next.focus();
  };
  const hintBox = h("div", { "aria-live": "polite" });
  const next = h("button.btn", { hidden: true, onclick: () => { L.step++; quizCard(L); } }, "Дальше");
  const btns = options(k).map((g) => h("button.opt", { onclick: (e) => pickOpt(g, e.currentTarget, btns) }, g));
  show(
    head(L, done, L.fresh.length + L.quiz.length),
    h("div.card", null,
      h("span.pill.pink", { hidden: L.fresh.includes(k) }, "Повтор"),
      h("div.ar.big", null, x.ar),
      h("button.icon-btn.play", { "aria-label": "Послушать", onclick: () => play(x.a) }, "▶")),
    h("div.opts", null, btns),
    hintBox,
    h("div.bottom", null, next));
}

function doneScreen(L) {
  const all = new Set(L.quiz).size, ok = all - L.wrong.size;
  show(
    h("h1", null, "Занятие пройдено"),
    h("p.result", null, `${ok} из ${all}`),
    h("p.hint.center", null, "верных ответов с первого раза"),
    h("div.card.tilt", null,
      h("div.lbl", null, h("span", null, "Знакомые слова"), h("span", null, `${pct(coverage(P, D.counts, D.total))}% Корана`)),
      meter(coverage(P, D.counts, D.total)),
      h("p.sub", null, L.wrong.size ? "Слова с ошибкой придут на повтор сегодня. Одна ошибка ничего не решает." : "Слова придут на повтор через день.")),
    h("div.bottom", null, h("button.btn", { onclick: () => trailScreen() }, "К тропе"),
      h("button.btn.light", { onclick: () => ayaScreen() }, `К аяту ${P.aya}`)));
}

// Работа без интернета только на сайте: на своём компьютере кэш мешает проверять правки.
if ("serviceWorker" in navigator && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
  // Новая версия скачалась: сразу показать её, а не старую из памяти (жалоба автора 2026-11-21).
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (had) location.reload(); });
  navigator.serviceWorker.register("sw.js").then((r) => r.update()).catch(() => {});
}

start().catch(() => show(h("div.card", null, "Не удалось загрузить слова. Проверьте интернет и обновите страницу.")));
