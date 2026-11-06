import { initializeApp } from "firebase/app";
import {
  getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider, signOut,
} from "firebase/auth";
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, getDoc, onSnapshot,
} from "firebase/firestore";

// ---------- constants ----------
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const TYPES = ["brunch", "dinner", "other"];
const TYPE_LABEL = { dinner: "Dinner", brunch: "Brunch", other: "Other meal" };
const COST_KEY = { dinner: "dinnerCost", brunch: "brunchCost", other: "otherCost" };
// Schedule used before setup existed: Sunday brunch, Tue/Wed/Thu dinner.
const LEGACY_SCHEDULE = { 0: ["brunch"], 1: [], 2: ["dinner"], 3: ["dinner"], 4: ["dinner"], 5: [], 6: [] };
const DEFAULTS = {
  dinnerCost: 25, brunchCost: 15, otherCost: 15,
  defaultEaters: 2, defaultAllowance: null,
  schedule: LEGACY_SCHEDULE, multiMeals: false, setupDone: false,
};
const MAX_PER_DAY = 3;
const MAX_PEOPLE = 30;

const $ = (id) => document.getElementById(id);

// ---------- Firebase ----------
const cfg = window.MEAL_FUND_FIREBASE;
if (!cfg || !cfg.apiKey || String(cfg.apiKey).startsWith("PASTE")) {
  $("bootView").innerHTML = "<p class='note err'>Firebase is not configured. Fill in config.js with your Firebase project settings.</p>";
  throw new Error("Missing Firebase config");
}
const fbApp = initializeApp(cfg);
const auth = getAuth(fbApp);
let db;
try {
  db = initializeFirestore(fbApp, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
} catch {
  db = initializeFirestore(fbApp, {});
}

// ---------- state ----------
let uid = null;
let settings = { ...DEFAULTS };
let settingsLoaded = false;   // confirmed from server (or cache with data)
let monthKey = ymKey(new Date());
let monthData = {};
let monthLoaded = false;
let unsubMonth = null;
let unsubSettings = null;
let loadTimer = null;
let lastMonthAllowance = null;
let setupOpen = false;
let setupFirstTime = false;
let frozenFor = null;          // month key where the default allowance was copied in
let viewReady = false;         // main or setup screen has replaced the loading screen
let bootTimer = null;
let daysOpen = false;          // day-by-day list expanded

// ---------- helpers ----------
function pad(n) { return String(n).padStart(2, "0"); }
function ymKey(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1); }
function ymdKey(d) { return ymKey(d) + "-" + pad(d.getDate()); }
function todayKey() { return ymdKey(new Date()); }
function shiftMonth(key, n) { const [y, m] = key.split("-").map(Number); return ymKey(new Date(y, m - 1 + n, 1)); }
function r2(x) { return Math.round(x * 100) / 100; }
function money(v, cents) {
  if (v == null || isNaN(v)) return "—";
  const neg = v < -0.004;
  const s = Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: 2 });
  return (neg ? "−$" : "$") + s;
}
function parseMoney(v) {
  if (v == null) return null;
  const s = String(v).replace(/[$,\s]/g, "");
  if (s === "") return null;
  const n = Number(s);
  return isFinite(n) ? r2(n) : NaN;
}
function num(v, fallback) { return typeof v === "number" && isFinite(v) ? v : fallback; }
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch {} }
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }
function plural(n, word) { return n + " " + (n === 1 ? word : word === "person" ? "people" : /(ch|sh|s|x)$/.test(word) ? word + "es" : word + "s"); }
function setNote(msg, isErr) { const el = $("syncNote"); el.textContent = msg || ""; el.classList.toggle("err", !!isErr); }

function cleanSchedule(raw) {
  const out = {};
  for (let d = 0; d < 7; d++) {
    const list = raw && Array.isArray(raw[d]) ? raw[d] : raw && Array.isArray(raw[String(d)]) ? raw[String(d)] : null;
    out[d] = (list || []).filter((t) => TYPES.includes(t)).slice(0, MAX_PER_DAY);
  }
  return out;
}
function readSettings(data) {
  return {
    dinnerCost: num(data.dinnerCost, DEFAULTS.dinnerCost),
    brunchCost: num(data.brunchCost, DEFAULTS.brunchCost),
    otherCost: num(data.otherCost, DEFAULTS.otherCost),
    defaultEaters: num(data.defaultEaters, DEFAULTS.defaultEaters),
    defaultAllowance: num(data.defaultAllowance, null),
    schedule: data.schedule ? cleanSchedule(data.schedule) : cleanSchedule(LEGACY_SCHEDULE),
    multiMeals: !!data.multiMeals,
    setupDone: !!data.setupDone,
  };
}

// ---------- Firestore I/O ----------
function monthRef(key) { return doc(db, "users", uid, "months", key); }
function settingsRef() { return doc(db, "users", uid, "settings", "main"); }
function saveError(e) {
  console.error(e);
  setNote(e && e.code === "permission-denied" ? "Not allowed to save. Sign out and back in." : "A change could not be saved. Check your connection.", true);
}
function deepMerge(target, patch) {
  for (const k in patch) {
    const v = patch[k];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      if (!target[k] || typeof target[k] !== "object") target[k] = {};
      deepMerge(target[k], v);
    } else target[k] = v;
  }
  return target;
}
function saveMonth(patch, key = monthKey) {
  if (key === monthKey) { monthData = deepMerge(structuredClone(monthData), patch); render(); }
  return setDoc(monthRef(key), patch, { merge: true }).catch(saveError);
}
function saveSettings(patch) {
  settings = { ...settings, ...patch };
  render();
  // schedule is written whole (all 7 days) so removed days are overwritten
  return setDoc(settingsRef(), patch, { merge: true }).catch(saveError);
}

function listenSettings() {
  if (unsubSettings) unsubSettings();
  unsubSettings = onSnapshot(settingsRef(), { includeMetadataChanges: true }, (snap) => {
    const data = snap.exists() ? snap.data() : {};
    settings = readSettings(data);
    // Decide on first-time setup only from a confirmed answer: server data, or cached data that says setup is done.
    if (!snap.metadata.fromCache || settings.setupDone) settingsLoaded = true;
    maybeFirstSetup();
    revealMain();
    maybeFreezeAllowance();
    render();
    if (setupOpen && !setupDirty) fillSetup();
  }, saveError);
}

function listenMonth() {
  if (unsubMonth) { unsubMonth(); unsubMonth = null; }
  clearTimeout(loadTimer);
  monthLoaded = false; monthData = {}; lastMonthAllowance = null;
  render();
  const key = monthKey;
  loadTimer = setTimeout(() => { if (!monthLoaded) setNote("Can't reach saved data yet. Check your connection.", true); }, 10000);
  unsubMonth = onSnapshot(monthRef(key), { includeMetadataChanges: true }, (snap) => {
    if (key !== monthKey) return;
    if (snap.metadata.fromCache) { if (!navigator.onLine) setNote("Offline. Changes will sync when you reconnect."); }
    else { clearTimeout(loadTimer); setNote(""); }
    const first = !monthLoaded;
    monthLoaded = true;
    monthData = snap.exists() ? snap.data() : {};
    maybeFirstSetup();
    revealMain();
    maybeFreezeAllowance();
    render();
    if (first) loadLastMonthAllowance(key);
  }, (e) => { clearTimeout(loadTimer); monthLoaded = true; saveError(e); revealMain(); render(); });
}

// Keep the loading screen up until it is known whether setup is needed, so the
// main screen and the setup screen never show one after the other on sign-in.
function revealMain(force) {
  if (!uid || viewReady) return;
  if (!force && !(settingsLoaded && monthLoaded)) return;
  viewReady = true; clearTimeout(bootTimer);
  $("bootView").hidden = true;
  if (!setupOpen) $("appView").hidden = false;
}

function setDaysOpen(open) {
  daysOpen = open;
  $("daysWrap").hidden = !open;
  $("daysToggle").setAttribute("aria-expanded", String(open));
  render();
}

async function loadLastMonthAllowance(key) {
  if (typeof monthData.allowance === "number") return;
  try {
    const snap = await getDoc(monthRef(shiftMonth(key, -1)));
    if (key !== monthKey) return;
    const a = snap.exists() ? snap.data().allowance : null;
    if (typeof a === "number") { lastMonthAllowance = a; render(); }
  } catch {}
}
window.addEventListener("online", () => setNote(""));

// The current month keeps its own copy of the default allowance, so a later
// change to the default does not rewrite months already under way.
function maybeFreezeAllowance() {
  if (!settingsLoaded || !monthLoaded || !settings.setupDone) return;
  const current = ymKey(new Date());
  if (monthKey !== current || frozenFor === current) return;
  if (typeof monthData.allowance !== "number" && typeof settings.defaultAllowance === "number") {
    frozenFor = current;
    saveMonth({ allowance: settings.defaultAllowance });
  }
}

// ---------- model ----------
function usualPeople() { return typeof monthData.usual === "number" ? monthData.usual : settings.defaultEaters; }
function costFor(type) { return settings[COST_KEY[type] || "otherCost"]; }
function effectiveAllowance() {
  if (typeof monthData.allowance === "number") return monthData.allowance;
  if (typeof settings.defaultAllowance === "number") return settings.defaultAllowance;
  return null;
}
function slotKey(dateKey, i) { return i === 0 ? dateKey : dateKey + "_" + i; }

function buildMeals() {
  const [y, m] = monthKey.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();
  const today = todayKey();
  const recs = monthData.meals || {};
  const out = [];
  for (let d = 1; d <= days; d++) {
    const dt = new Date(y, m - 1, d);
    const dow = dt.getDay();
    const dateKey = ymdKey(dt);
    const planned = settings.schedule[dow] || [];
    const slots = planned.map((type, i) => ({ i, type }));
    // Keep logged meals that no longer fit the schedule, so their spending still counts.
    for (const k in recs) {
      if (k !== dateKey && !k.startsWith(dateKey + "_")) continue;
      const i = k === dateKey ? 0 : Number(k.slice(dateKey.length + 1));
      if (!Number.isInteger(i) || i < planned.length) continue;
      if (recs[k] && recs[k].status === "eaten") slots.push({ i, type: null });
    }
    slots.sort((a, b) => a.i - b.i);
    for (const s of slots) {
      const key = slotKey(dateKey, s.i);
      const rec = recs[key] || {};
      const type = TYPES.includes(rec.type) && rec.status === "eaten" ? rec.type
        : s.type || (TYPES.includes(rec.type) ? rec.type : (LEGACY_SCHEDULE[dow][0] || "other"));
      const status = rec.status === "eaten" || rec.status === "skipped" ? rec.status : "planned";
      const people = typeof rec.people === "number" ? rec.people : usualPeople();
      const est = r2(people * costFor(type));
      const spent = typeof rec.spent === "number" ? rec.spent : 0;
      const cost = status === "eaten" ? spent : status === "skipped" ? 0 : est;
      out.push({ key, dt, type, status, people, est, spent, cost, past: dateKey < today, today: dateKey === today, slot: s.i });
    }
  }
  return out;
}

function totals(meals) {
  const A = effectiveAllowance();
  let spent = 0, plannedEst = 0, left = 0, unlogged = 0;
  for (const ml of meals) {
    if (ml.status === "eaten") spent += ml.spent;
    else if (ml.status === "planned") {
      plannedEst += ml.est;
      if (ml.people > 0) left++;
      if (ml.past) unlogged++;
    }
  }
  spent = r2(spent); plannedEst = r2(plannedEst);
  return {
    A, spent, plannedEst, left, unlogged,
    balance: A == null ? null : r2(A - spent),
    end: A == null ? null : r2(A - spent - plannedEst),
  };
}

// ---------- main render ----------
function render() {
  if (!uid) return;
  const [y, m] = monthKey.split("-").map(Number);
  $("monthTitle").textContent = MONTHS[m - 1] + " " + y;
  const meals = buildMeals();
  const t = totals(meals);

  const hero = $("hero");
  hero.classList.remove("state-pos", "state-neg", "state-zero", "state-none");
  if (t.end == null) {
    hero.classList.add("state-none");
    $("endVal").textContent = "—";
    $("endNote").textContent = monthLoaded ? "Set the allowance" : " ";
  } else if (Math.abs(t.end) < 0.5) {
    hero.classList.add("state-zero"); $("endVal").textContent = "$0"; $("endNote").textContent = "On target";
  } else if (t.end > 0) {
    hero.classList.add("state-pos"); $("endVal").textContent = "+" + money(t.end, true); $("endNote").textContent = "Left for Opus";
  } else {
    hero.classList.add("state-neg"); $("endVal").textContent = money(t.end, true); $("endNote").textContent = "Over allowance";
  }
  $("sAllow").textContent = money(t.A, true);
  $("sSpent").textContent = money(t.spent, true);
  $("sBal").textContent = money(t.balance, true);
  $("sLeft").textContent = String(t.left);

  const allowIn = $("allowIn");
  if (document.activeElement !== allowIn) allowIn.value = t.A == null ? "" : t.A.toFixed(2);
  $("usualOut").textContent = usualPeople();
  $("allowPrompt").hidden = !(monthLoaded && t.A == null);
  const sug = $("suggestRow");
  if (monthLoaded && t.A == null && lastMonthAllowance != null) {
    sug.hidden = false; $("suggestBtn").textContent = "Use last month's " + money(lastMonthAllowance, true);
  } else sug.hidden = true;

  renderGuide(meals, t);

  const count = monthLoaded ? " (" + plural(meals.length, "meal") + ")" : "";
  $("daysToggle").innerHTML = (daysOpen ? "Hide days" : "Show all days" + esc(count)) + " <span class='chev' aria-hidden='true'>&#9662;</span>";

  const next = meals.find((x) => x.status === "planned" && (x.past || x.today)) || meals.find((x) => x.status === "planned" && !x.past);
  const ql = $("quickLog");
  if (next && monthLoaded && monthKey === ymKey(new Date())) {
    ql.hidden = false;
    ql.textContent = "Log Meal";
    ql.dataset.key = next.key;
  } else ql.hidden = true;

  if (document.activeElement !== $("dinIn")) $("dinIn").value = settings.dinnerCost.toFixed(2);
  if (document.activeElement !== $("brIn")) $("brIn").value = settings.brunchCost.toFixed(2);
  if (document.activeElement !== $("otIn")) $("otIn").value = settings.otherCost.toFixed(2);
  $("avgSummary").textContent = "Average cost per person: dinner " + money(settings.dinnerCost) + ", brunch " + money(settings.brunchCost) + ", other " + money(settings.otherCost);

  const list = $("meals");
  if (!monthLoaded) { list.innerHTML = "<li class='note' style='padding:16px'>Loading…</li>"; return; }
  if (!meals.length) { list.innerHTML = "<li class='note' style='padding:16px'>No meals scheduled this month. Open Setup to choose meal days.</li>"; return; }
  const upcoming = meals.find((x) => x.status === "planned" && !x.past);
  list.innerHTML = "";
  for (const ml of meals) {
    const li = document.createElement("li");
    const b = document.createElement("button");
    b.className = "meal " + ml.status; b.type = "button"; b.dataset.key = ml.key;
    let tag = "";
    if (ml.status === "planned" && ml.past) tag = "<span class='tag todo'>Log it</span>";
    else if (upcoming && ml.key === upcoming.key) tag = "<span class='tag next'>" + (ml.today ? "Today" : "Next") + "</span>";
    const ppl = ml.people === 1 ? "1 person" : ml.people + " people";
    let sub, amt, small;
    if (ml.status === "eaten") { sub = ppl + " · logged"; amt = money(ml.spent, true); small = ml.people > 0 ? money(ml.spent / ml.people, true) + "/person" : ""; }
    else if (ml.status === "skipped") { sub = "Nobody ate"; amt = money(ml.est, true); small = "skipped"; }
    else { sub = ppl + " · " + money(costFor(ml.type)) + " avg"; amt = money(ml.est, true); small = "estimate"; }
    b.innerHTML = "<div class='dt'><div class='dow'>" + DOW[ml.dt.getDay()] + "</div><div class='dom num'>" + ml.dt.getDate() + "</div></div>"
      + "<div class='mid'><div class='t'>" + TYPE_LABEL[ml.type] + tag + "</div><div class='d'>" + sub + "</div></div>"
      + "<div class='amt num'><div class='a'>" + amt + "</div><div class='s'>" + small + "</div></div>";
    li.appendChild(b); list.appendChild(li);
  }
}

function renderGuide(meals, t) {
  const el = $("guide");
  if (t.A == null || !monthLoaded) { el.hidden = true; return; }
  let html = "";
  const bal = t.balance;
  if (t.left === 0) {
    html = bal >= 0 ? "No meals left this month. <strong>" + money(bal, true) + "</strong> left for Opus."
      : "No meals left this month. <strong>" + money(-bal, true) + "</strong> over allowance.";
  } else if (bal <= 0) {
    html = "Balance is already <strong>" + money(bal, true) + "</strong> with " + plural(t.left, "meal") + " to go.";
  }
  if (t.unlogged > 0) html += "<div class='warnline'>" + plural(t.unlogged, "past meal") + " not logged yet — counted at the average.</div>";
  el.hidden = !html;
  el.innerHTML = html;
}

// ---------- meal sheet ----------
let sheet = null;
function openSheet(key) {
  const list = buildMeals();
  const idx = list.findIndex((x) => x.key === key);
  if (idx < 0) return;
  const ml = list[idx];
  $("shPrev").disabled = idx <= 0;
  $("shNext").disabled = idx >= list.length - 1;
  sheet = { key, type: ml.type, people: ml.people, mode: lsGet("mealfund:mode") === "left" ? "left" : "spent" };
  $("shTitle").textContent = DOW[ml.dt.getDay()] + " " + MONTHS[ml.dt.getMonth()].slice(0, 3) + " " + ml.dt.getDate() + " · " + TYPE_LABEL[ml.type];
  $("shSub").textContent = ml.status === "eaten" ? "Logged: " + money(ml.spent, true) : ml.status === "skipped" ? "Marked as nobody ate" : "Not logged yet";
  $("amtIn").value = ml.status === "eaten" && sheet.mode === "spent" ? ml.spent.toFixed(2) : "";
  $("resetBtn").disabled = ml.status === "planned" && ml.people === usualPeople();
  $("amtErr").textContent = "";
  $("backdrop").hidden = false;
  renderSheet();
  setTimeout(() => $("amtIn").focus(), 50);
}
function closeSheet() { $("backdrop").hidden = true; sheet = null; }
function sheetCalc() {
  const meals = buildMeals();
  const t = totals(meals);
  const ml = meals.find((x) => x.key === sheet.key);
  const before = t.A == null ? null : r2(t.A - (t.spent - (ml.status === "eaten" ? ml.spent : 0)));
  const v = parseMoney($("amtIn").value);
  let spent = null, err = "";
  if (v != null) {
    if (isNaN(v) || v < 0) err = "Enter a valid amount.";
    else if (sheet.mode === "spent") spent = v;
    else if (before == null) err = "Set the month's allowance first.";
    else { spent = r2(before - v); if (spent < 0) err = "That is more than the balance before this meal (" + money(before, true) + ")."; }
  }
  const est = r2(sheet.people * costFor(sheet.type));
  const used = spent != null && !err ? spent : est;
  const end = t.end == null ? null : r2(t.end - ml.cost + used);
  return { ml, before, spent, err, est, end, hasAmt: v != null };
}
function renderSheet() {
  if (!sheet) return;
  $("pOut").textContent = sheet.people;
  $("modeSpent").classList.toggle("on", sheet.mode === "spent");
  $("modeLeft").classList.toggle("on", sheet.mode === "left");
  const c = sheetCalc();
  $("shEst").textContent = "Average for " + sheet.people + ": " + money(c.est, true);
  $("amtErr").textContent = c.err;
  let html = "";
  if (c.before != null) html += "<div><span>Balance before this meal</span><span>" + money(c.before, true) + "</span></div>";
  if (c.spent != null && !c.err) {
    html += "<div><span>Spent</span><span>" + money(c.spent, true) + (sheet.people > 0 ? " (" + money(c.spent / sheet.people, true) + "/person)" : "") + "</span></div>";
    const d = c.spent - c.est;
    html += "<div><span>vs. average</span><span>" + (d > 0.004 ? "+" : d < -0.004 ? "−" : "") + money(Math.abs(d), true) + "</span></div>";
  }
  if (c.end != null) {
    const w = Math.abs(c.end) < 0.5 ? "on target" : c.end > 0 ? "for Opus" : "over";
    html += "<div class='big'><span>End of month</span><span>" + (c.end > 0.004 ? "+" : "") + money(c.end, true) + " " + w + "</span></div>";
  }
  $("preview").innerHTML = html || "<div><span>Set the allowance to see the projection.</span></div>";
  $("saveBtn").textContent = c.hasAmt ? "Log meal" : "Save";
  $("saveBtn").disabled = !!c.err;
}
function saveSheet() {
  const c = sheetCalc();
  if (c.err) return;
  const rec = { people: sheet.people, type: sheet.type };
  if (c.hasAmt) { rec.status = "eaten"; rec.spent = c.spent; }
  else if (c.ml.status === "skipped" && sheet.people > 0) rec.status = "planned";
  saveMonth({ meals: { [sheet.key]: rec } });
  closeSheet();
}

// ---------- main view events ----------
$("prev").onclick = () => { monthKey = shiftMonth(monthKey, -1); listenMonth(); };
$("next").onclick = () => { monthKey = shiftMonth(monthKey, 1); listenMonth(); };
$("allowIn").addEventListener("change", () => {
  const v = parseMoney($("allowIn").value);
  if (v == null || isNaN(v) || v < 0) { render(); return; }
  if (v !== monthData.allowance) saveMonth({ allowance: v });
});
$("allowIn").addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.blur(); });
$("suggestBtn").onclick = () => { if (lastMonthAllowance != null) saveMonth({ allowance: lastMonthAllowance }); };
$("usualMinus").onclick = () => { const n = usualPeople(); if (n > 0) saveMonth({ usual: n - 1 }); };
$("usualPlus").onclick = () => { const n = usualPeople(); if (n < MAX_PEOPLE) saveMonth({ usual: n + 1 }); };
function costChanged(inputId, field) {
  const v = parseMoney($(inputId).value);
  if (v == null || isNaN(v) || v < 0) { render(); return; }
  if (v !== settings[field]) saveSettings({ [field]: v });
}
$("dinIn").addEventListener("change", () => costChanged("dinIn", "dinnerCost"));
$("brIn").addEventListener("change", () => costChanged("brIn", "brunchCost"));
$("otIn").addEventListener("change", () => costChanged("otIn", "otherCost"));
$("meals").addEventListener("click", (e) => { const b = e.target.closest(".meal"); if (b) openSheet(b.dataset.key); });
$("quickLog").onclick = (e) => openSheet(e.currentTarget.dataset.key);
$("pMinus").onclick = () => { if (sheet && sheet.people > 0) { sheet.people--; renderSheet(); } };
$("pPlus").onclick = () => { if (sheet && sheet.people < MAX_PEOPLE) { sheet.people++; renderSheet(); } };
function setMode(mode) {
  if (!sheet) return;
  sheet.mode = mode; lsSet("mealfund:mode", mode);
  $("amtIn").value = ""; renderSheet(); $("amtIn").focus();
}
$("modeSpent").onclick = () => setMode("spent");
$("modeLeft").onclick = () => setMode("left");
$("amtIn").addEventListener("input", renderSheet);
$("amtIn").addEventListener("keydown", (e) => { if (e.key === "Enter" && !$("saveBtn").disabled) saveSheet(); });
$("saveBtn").onclick = saveSheet;
$("skipBtn").onclick = () => { saveMonth({ meals: { [sheet.key]: { status: "skipped", people: 0, spent: 0, type: sheet.type } } }); closeSheet(); };
$("resetBtn").onclick = () => { saveMonth({ meals: { [sheet.key]: { status: "planned", spent: 0, people: usualPeople(), type: sheet.type } } }); closeSheet(); };
$("cancelBtn").onclick = closeSheet;
function stepSheet(d) {
  if (!sheet) return;
  const list = buildMeals();
  const t = list[list.findIndex((x) => x.key === sheet.key) + d];
  if (t) openSheet(t.key);
}
$("shPrev").onclick = () => stepSheet(-1);
$("shNext").onclick = () => stepSheet(1);
$("backdrop").addEventListener("click", (e) => { if (e.target.id === "backdrop") closeSheet(); });
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (sheet) closeSheet();
  else if (setupOpen && !setupFirstTime) closeSetup();
});
$("daysToggle").onclick = () => setDaysOpen(!daysOpen);
$("signOutBtn").onclick = () => signOut(auth);
$("setupLink").onclick = () => openSetup(false);

// ---------- setup ----------
let draft = null;
let setupDirty = false;

function maybeFirstSetup() {
  if (!uid || setupOpen || !settingsLoaded || !monthLoaded || settings.setupDone) return;
  if (monthKey !== ymKey(new Date())) return;
  openSetup(true);
}

function openSetup(first) {
  closeSheet();
  setupOpen = true; setupFirstTime = first; setupDirty = false;
  viewReady = true; clearTimeout(bootTimer);
  $("bootView").hidden = true;
  $("authView").hidden = true;
  $("appView").hidden = true;
  $("setupView").hidden = false;
  $("suTitle").textContent = first ? "Set up Meal Fund" : "Setup";
  $("suLead").textContent = first
    ? "These defaults fill in every month. Any single month or meal can still be changed later."
    : "Changes apply to meals not yet logged. Logged meals keep their amounts.";
  $("suSave").textContent = first ? "Save and start" : "Save";
  $("suCancel").hidden = first;
  fillSetup();
  window.scrollTo(0, 0);
}

function closeSetup() {
  setupOpen = false; draft = null;
  $("setupView").hidden = true;
  $("appView").hidden = false;
  render();
}

function fillSetup() {
  // Before the first setup, prefill from what the person has been using.
  const firstAllowance = typeof monthData.allowance === "number" ? monthData.allowance : lastMonthAllowance;
  draft = {
    eaters: settings.setupDone ? settings.defaultEaters : usualPeople(),
    allowance: settings.setupDone ? settings.defaultAllowance : firstAllowance,
    multi: settings.multiMeals,
    schedule: cleanSchedule(settings.schedule),
  };
  if (!draft.multi && Object.values(draft.schedule).some((l) => l.length > 1)) draft.multi = true;
  $("suEatOut").textContent = draft.eaters;
  $("suAllow").value = draft.allowance == null ? "" : draft.allowance.toFixed(2);
  $("suMulti").checked = draft.multi;
  $("suDin").value = settings.dinnerCost.toFixed(2);
  $("suBr").value = settings.brunchCost.toFixed(2);
  $("suOt").value = settings.otherCost.toFixed(2);
  $("suErr").textContent = "";
  renderSetup();
}

function typeOptions(selected, withNone) {
  let h = withNone ? "<option value=''" + (selected ? "" : " selected") + ">No meal</option>" : "";
  for (const t of ["dinner", "brunch", "other"]) h += "<option value='" + t + "'" + (t === selected ? " selected" : "") + ">" + TYPE_LABEL[t] + "</option>";
  return h;
}

function renderSetup() {
  if (!draft) return;
  const maxPerDay = Math.max(1, ...Object.values(draft.schedule).map((l) => l.length));
  $("suPerDay").textContent = draft.multi ? (maxPerDay > 1 ? "up to " + maxPerDay : "1") : "1";
  $("suDaysHint").textContent = draft.multi
    ? "Set how many meals on each day, then pick each meal."
    : "Pick the meal for each eating day.";
  const order = [0, 1, 2, 3, 4, 5, 6];
  let html = "";
  for (const d of order) {
    const list = draft.schedule[d];
    html += "<div class='day" + (list.length ? "" : " off") + "' data-day='" + d + "'><div class='dname'>" + DOW[d] + "</div><div class='dctl'>";
    if (!draft.multi) {
      html += "<select class='sel' data-day='" + d + "' data-slot='0' aria-label='" + DOW_LONG[d] + " meal'>" + typeOptions(list[0] || "", true) + "</select>";
    } else {
      html += "<div class='stepper'><button type='button' data-day='" + d + "' data-act='minus' aria-label='Fewer meals on " + DOW_LONG[d] + "'>&minus;</button>"
        + "<output class='num'>" + list.length + "</output>"
        + "<button type='button' data-day='" + d + "' data-act='plus' aria-label='More meals on " + DOW_LONG[d] + "'>+</button></div>";
      list.forEach((t, i) => {
        html += "<select class='sel' data-day='" + d + "' data-slot='" + i + "' aria-label='" + DOW_LONG[d] + " meal " + (i + 1) + "'>" + typeOptions(t, false) + "</select>";
      });
    }
    html += "</div></div>";
  }
  $("suDays").innerHTML = html;

  const used = new Set(Object.values(draft.schedule).flat());
  $("suDinWrap").classList.toggle("unused", !used.has("dinner"));
  $("suBrWrap").classList.toggle("unused", !used.has("brunch"));
  $("suOtWrap").classList.toggle("unused", !used.has("other"));
  renderSetupSummary();
}

function readCosts() {
  return { dinner: parseMoney($("suDin").value), brunch: parseMoney($("suBr").value), other: parseMoney($("suOt").value) };
}

function renderSetupSummary() {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const counts = { dinner: 0, brunch: 0, other: 0 };
  for (let d = 1; d <= days; d++) for (const t of draft.schedule[new Date(y, m, d).getDay()]) counts[t]++;
  const total = counts.dinner + counts.brunch + counts.other;
  const costs = readCosts();
  const el = $("suSum");
  if (!total) { el.innerHTML = "No meal days selected yet."; return; }
  let est = 0, ok = true;
  for (const t of TYPES) { if (counts[t]) { const c = costs[t]; if (c == null || isNaN(c)) ok = false; else est += counts[t] * c * draft.eaters; } }
  const parts = TYPES.filter((t) => counts[t]).map((t) => plural(counts[t], t === "other" ? "other meal" : t));
  let html = MONTHS[m] + " has <strong>" + plural(total, "meal") + "</strong> on this schedule (" + parts.join(", ") + ").";
  const a = parseMoney($("suAllow").value);
  if (ok) {
    html += "<br>If " + plural(draft.eaters, "person") + " eat" + (draft.eaters === 1 ? "s" : "") + " every meal at these averages: about <strong>" + money(r2(est)) + "</strong>";
    if (a != null && !isNaN(a)) {
      const diff = r2(a - est);
      html += Math.abs(diff) < 0.5 ? ", matching the allowance." : diff > 0 ? ", " + money(diff) + " under the allowance." : ", " + money(-diff) + " over the allowance.";
    } else html += ".";
  }
  el.innerHTML = html;
}

$("suEatMinus").onclick = () => { if (draft && draft.eaters > 1) { draft.eaters--; setupDirty = true; $("suEatOut").textContent = draft.eaters; renderSetupSummary(); } };
$("suEatPlus").onclick = () => { if (draft && draft.eaters < MAX_PEOPLE) { draft.eaters++; setupDirty = true; $("suEatOut").textContent = draft.eaters; renderSetupSummary(); } };
for (const id of ["suAllow", "suDin", "suBr", "suOt"]) $(id).addEventListener("input", () => { setupDirty = true; renderSetupSummary(); });
$("suMulti").addEventListener("change", (e) => {
  draft.multi = e.target.checked;
  setupDirty = true;
  if (!draft.multi) for (let d = 0; d < 7; d++) draft.schedule[d] = draft.schedule[d].slice(0, 1);
  renderSetup();
});
$("suDays").addEventListener("change", (e) => {
  const sel = e.target.closest("select");
  if (!sel) return;
  const d = Number(sel.dataset.day), i = Number(sel.dataset.slot);
  setupDirty = true;
  if (!sel.value) draft.schedule[d] = [];
  else draft.schedule[d][i] = sel.value;
  renderSetup();
});
$("suDays").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const d = Number(b.dataset.day);
  const list = draft.schedule[d];
  setupDirty = true;
  if (b.dataset.act === "minus" && list.length > 0) list.pop();
  else if (b.dataset.act === "plus" && list.length < MAX_PER_DAY) {
    list.push(["dinner", "brunch", "other"].find((t) => !list.includes(t)) || "other");
  }
  renderSetup();
});
$("suCancel").onclick = closeSetup;

$("setupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const err = (msg) => { $("suErr").textContent = msg; };
  const allowance = parseMoney($("suAllow").value);
  if (allowance != null && (isNaN(allowance) || allowance < 0)) return err("Enter a valid monthly allowance, or leave it blank.");
  const costs = readCosts();
  const used = new Set(Object.values(draft.schedule).flat());
  if (!used.size) return err("Pick at least one meal day.");
  for (const t of TYPES) {
    const c = costs[t];
    if (c == null ? used.has(t) : isNaN(c) || c < 0) return err("Enter a valid average for " + (t === "other" ? "other meals" : t) + ".");
  }
  err("");

  const wasDone = settings.setupDone;
  const old = { eaters: wasDone ? settings.defaultEaters : usualPeople(), allowance: wasDone ? settings.defaultAllowance : null };
  const schedule = {};
  for (let d = 0; d < 7; d++) schedule[d] = draft.schedule[d].slice();
  saveSettings({
    defaultEaters: draft.eaters,
    defaultAllowance: allowance,
    multiMeals: draft.multi,
    schedule,
    dinnerCost: costs.dinner ?? settings.dinnerCost,
    brunchCost: costs.brunch ?? settings.brunchCost,
    otherCost: costs.other ?? settings.otherCost,
    setupDone: true,
  });

  // The current month follows the new defaults unless it was set to something else on its own.
  const current = ymKey(new Date());
  if (monthKey === current && monthLoaded) {
    const patch = {};
    const curA = monthData.allowance;
    if (allowance != null && (typeof curA !== "number" || curA === old.allowance || !wasDone)) patch.allowance = allowance;
    const curU = monthData.usual;
    if (typeof curU !== "number" || curU === old.eaters) patch.usual = draft.eaters;
    if (Object.keys(patch).length) saveMonth(patch, current);
    frozenFor = current;
  }
  // After saving, return to the summary only; the day list stays behind its button.
  daysOpen = false;
  $("daysWrap").hidden = true;
  $("daysToggle").setAttribute("aria-expanded", "false");
  closeSetup();
});

// ---------- auth ----------
let signUpMode = false;
function authMsg(msg, cls) { const el = $("authMsg"); el.textContent = msg || ""; el.className = "authmsg" + (cls ? " " + cls : ""); }
function authError(e) {
  const c = (e && e.code) || "";
  if (c.includes("invalid-credential") || c.includes("wrong-password") || c.includes("user-not-found")) return "Email or password is incorrect.";
  if (c.includes("email-already-in-use")) return "An account with this email already exists. Sign in instead.";
  if (c.includes("weak-password")) return "Password must be at least 6 characters.";
  if (c.includes("invalid-email")) return "Enter a valid email address.";
  if (c.includes("too-many-requests")) return "Too many attempts. Wait a few minutes and try again.";
  if (c.includes("network")) return "No connection. Check your internet and try again.";
  if (c.includes("popup-closed") || c.includes("cancelled-popup")) return "";
  if (c.includes("popup-blocked")) return "The sign-in window was blocked. Allow pop-ups for this site and try again.";
  if (c.includes("unauthorized-domain")) return "This website is not yet authorized in Firebase (Authentication → Settings → Authorized domains).";
  return "Something went wrong (" + (c || "unknown") + ").";
}
function setSignUp(on) {
  signUpMode = on;
  $("authSubmit").textContent = on ? "Create account" : "Sign in";
  $("authToggle").textContent = on ? "I already have an account" : "Create an account";
  $("authLead").textContent = on ? "Create an account to track your own meal allowance." : "Sign in to track your monthly meal allowance.";
  $("password").autocomplete = on ? "new-password" : "current-password";
  authMsg("");
}
$("authToggle").onclick = () => setSignUp(!signUpMode);
$("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("email").value.trim(), pw = $("password").value;
  if (!email || !pw) { authMsg("Enter your email and password.", "err"); return; }
  $("authSubmit").disabled = true; authMsg("");
  try {
    if (signUpMode) await createUserWithEmailAndPassword(auth, email, pw);
    else await signInWithEmailAndPassword(auth, email, pw);
  } catch (err) { authMsg(authError(err), "err"); }
  finally { $("authSubmit").disabled = false; }
});
$("authReset").onclick = async () => {
  const email = $("email").value.trim();
  if (!email) { authMsg("Enter your email above, then tap Forgot password.", "err"); return; }
  try { await sendPasswordResetEmail(auth, email); authMsg("If an account exists for " + email + ", a reset link is on its way.", "ok"); }
  catch (err) { authMsg(authError(err), "err"); }
};
$("googleBtn").onclick = async () => {
  authMsg("");
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (err) { const m = authError(err); if (m) authMsg(m, "err"); }
};

onAuthStateChanged(auth, (user) => {
  if (unsubMonth) { unsubMonth(); unsubMonth = null; }
  if (unsubSettings) { unsubSettings(); unsubSettings = null; }
  closeSheet();
  setupOpen = false; draft = null; $("setupView").hidden = true;
  viewReady = false; clearTimeout(bootTimer);
  daysOpen = false; $("daysWrap").hidden = true; $("daysToggle").setAttribute("aria-expanded", "false");
  $("appView").hidden = true;
  if (!user) {
    uid = null; monthData = {}; monthLoaded = false; settingsLoaded = false;
    $("bootView").hidden = true; $("authView").hidden = false; $("password").value = "";
    return;
  }
  uid = user.uid;
  $("whoami").innerHTML = "Signed in as " + esc(user.email || "your account");
  $("authView").hidden = true; $("bootView").hidden = false;
  // If saved data is slow to arrive (offline, first visit), show the main screen anyway.
  bootTimer = setTimeout(() => revealMain(true), 8000);
  monthKey = ymKey(new Date());
  settings = { ...DEFAULTS, schedule: cleanSchedule(LEGACY_SCHEDULE) };
  settingsLoaded = false; frozenFor = null;
  setNote("");
  listenSettings();
  listenMonth();
});
