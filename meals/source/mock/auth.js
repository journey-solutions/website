// Test stand-in for firebase/auth, kept in localStorage.
const subs = new Set();
const cur = () => { try { return JSON.parse(localStorage.getItem("mock:user")); } catch { return null; } };
const emit = () => { const u = cur(); subs.forEach((f) => f(u)); };
export function getAuth() { return {}; }
export function onAuthStateChanged(_a, f) { subs.add(f); setTimeout(() => f(cur()), 30); return () => subs.delete(f); }
export async function signInWithEmailAndPassword(_a, email, pw) {
  if (pw === "wrong") throw Object.assign(new Error("bad"), { code: "auth/invalid-credential" });
  localStorage.setItem("mock:user", JSON.stringify({ uid: "u_" + email.replace(/\W/g, ""), email })); emit();
}
export const createUserWithEmailAndPassword = signInWithEmailAndPassword;
export async function sendPasswordResetEmail() {}
export async function signInWithPopup() { throw Object.assign(new Error("x"), { code: "auth/popup-closed-by-user" }); }
export class GoogleAuthProvider {}
export async function signOut() { localStorage.removeItem("mock:user"); emit(); }
