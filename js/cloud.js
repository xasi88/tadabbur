// Облако прогресса: Firebase tanwin, папка tadabbur/<uid> (решение автора 2026-11-21).
// Вход Google: кнопка Google Identity Services даёт пропуск Google, Firebase меняет его на свой (REST).
// Без библиотеки Firebase: как в TanWin, прямые запросы (из России без VPN так надёжнее).
// Документ: data (прогресс строкой JSON), at (время записи), v (версия). Правила: TanWin/firestore.rules.
import { mergeProgress } from "./merge.js?v=d6384452";
import { APP_VERSION } from "./version.js?v=d6384452";

const KEY = "AIzaSyD5Vosjj70_ahkb48dYhfgfBMcvJugKx4E"; // открытый ключ веб-приложения Firebase: доступ решают правила базы
const CLIENT = "107026046305-jf7qh4g5uhoinefdncfgg3r6flr4si0t.apps.googleusercontent.com";
const DOC = "https://firestore.googleapis.com/v1/projects/tanwin/databases/(default)/documents/tadabbur/";
const META = "tadabbur.cloud"; // { uid, refresh, name }
const PAUZA = 4000;

let meta = {};
try { meta = JSON.parse(localStorage.getItem(META)) || {}; } catch {}
const saveMeta = () => { try { localStorage.setItem(META, JSON.stringify(meta)); } catch {} };
export const cloudUser = () => (meta.refresh ? { name: meta.name || "" } : null);

async function post(url, body, form = false) {
  const r = await fetch(url, form
    ? { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body }
    : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("облако: " + (j.error?.message || r.status));
  return j;
}

let idToken = "", idExp = 0;
async function token() {
  if (idToken && Date.now() < idExp - 60000) return idToken;
  const j = await post("https://securetoken.googleapis.com/v1/token?key=" + KEY,
    "grant_type=refresh_token&refresh_token=" + encodeURIComponent(meta.refresh), true);
  idToken = j.id_token; idExp = Date.now() + Number(j.expires_in) * 1000;
  return idToken;
}

async function readCloud() {
  const r = await fetch(DOC + meta.uid, { headers: { authorization: "Bearer " + (await token()) } });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("облако: " + r.status);
  const j = await r.json();
  try { return JSON.parse(j.fields?.data?.stringValue || "null"); } catch { return null; }
}

async function writeCloud(p) {
  const body = { fields: { data: { stringValue: JSON.stringify(p) }, at: { integerValue: String(Date.now()) }, v: { stringValue: APP_VERSION } } };
  const r = await fetch(DOC + meta.uid, { method: "PATCH", headers: { authorization: "Bearer " + (await token()), "content-type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error("облако: " + r.status);
}

// Пропуск Google -> вход Firebase -> слияние с облаком. Возвращает общий прогресс.
async function signIn(credential, local) {
  const j = await post("https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=" + KEY, {
    postBody: "id_token=" + credential + "&providerId=google.com", requestUri: location.origin, returnSecureToken: true,
  });
  meta = { uid: j.localId, refresh: j.refreshToken, name: j.firstName || j.displayName || "" };
  idToken = j.idToken; idExp = Date.now() + Number(j.expiresIn) * 1000;
  saveMeta();
  const both = mergeProgress(local, await readCloud());
  await writeCloud(both);
  return both;
}

// Кнопка Google в контейнере el. onDone(прогресс) после входа, onError(текст) при сбое.
export function googleButton(el, getLocal, onDone, onError) {
  const draw = () => {
    google.accounts.id.initialize({
      client_id: CLIENT,
      callback: (r) => signIn(r.credential, getLocal()).then(onDone).catch(() => onError("Не удалось войти. Попробуйте ещё раз.")),
    });
    google.accounts.id.renderButton(el, { theme: "outline", size: "large", shape: "pill", text: "continue_with", locale: "ru", width: 280 });
  };
  if (window.google?.accounts?.id) return draw();
  const s = document.createElement("script");
  s.src = "https://accounts.google.com/gsi/client";
  s.onload = draw;
  s.onerror = () => onError("Google не отвечает. Проверьте интернет.");
  document.head.append(s);
}

// Запись в облако не чаще раза в 4 секунды. Без входа ничего не делает.
let timer = 0;
export function pushLater(p) {
  if (!meta.refresh) return;
  clearTimeout(timer);
  timer = setTimeout(() => writeCloud(p).catch(() => {}), PAUZA);
}

// При запуске: взять облако и слить с телефоном.
export async function pullOnStart(local) {
  if (!meta.refresh) return local;
  try { return mergeProgress(local, await readCloud()); } catch { return local; }
}

export function signOut() { meta = {}; idToken = ""; saveMeta(); }
