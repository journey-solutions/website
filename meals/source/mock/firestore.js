// Test stand-in for firebase/firestore, kept in localStorage.
const subs = new Map();
const load = (p) => { try { return JSON.parse(localStorage.getItem("mock:doc:" + p)); } catch { return null; } };
const snap = (p) => { const d = load(p); return { exists: () => d != null, data: () => structuredClone(d), metadata: { fromCache: false } }; };
function merge(t, s) { for (const k in s) { const v = s[k]; if (v && typeof v === "object" && !Array.isArray(v)) { if (!t[k] || typeof t[k] !== "object") t[k] = {}; merge(t[k], v); } else t[k] = v; } return t; }
export function initializeFirestore() { return {}; }
export function persistentLocalCache() { return {}; }
export function persistentMultipleTabManager() { return {}; }
export function doc(_db, ...parts) { return { path: parts.join("/") }; }
export async function setDoc(ref, data, opts) {
  const cur = opts && opts.merge ? load(ref.path) || {} : {};
  localStorage.setItem("mock:doc:" + ref.path, JSON.stringify(merge(cur, structuredClone(data))));
  (subs.get(ref.path) || []).forEach((f) => setTimeout(() => f(snap(ref.path)), 5));
}
export async function getDoc(ref) { return snap(ref.path); }
export function onSnapshot(ref, a, b) {
  const next = typeof a === "function" ? a : b;
  const list = subs.get(ref.path) || []; list.push(next); subs.set(ref.path, list);
  setTimeout(() => next(snap(ref.path)), 20);
  return () => { const l = subs.get(ref.path) || []; l.splice(l.indexOf(next), 1); };
}
