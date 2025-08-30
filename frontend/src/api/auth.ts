// src/api/auth.ts

// ------------------------------------------------------------------ 
// [STATE] Types & helpers d'état auth utilisateur
// ------------------------------------------------------------------ 
export interface AppUser {
  userId: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// [STATE] getSavedUser :
// Lit l'utilisateur depuis localStorage (ou null en cas d'absence/erreur).
//
export function getSavedUser<T = AppUser>(): T | null {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}

/** [STATE] setLoggedInUser :
 * Sauvegarde l'utilisateur et notifie l'app (navbar, etc.) via "auth:changed".
 */
export function setLoggedInUser(user: AppUser) {
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
}

/** [STATE] clearUser :
 * Supprime l'utilisateur du localStorage et notifie l'app.
 */
export function clearUser() {
  localStorage.removeItem('user');
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
}

/* ------------------------------------------------------------------ *
 * [UTIL] Helpers HTTP JSON
 * ------------------------------------------------------------------ */
const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

/** [UTIL] requestJSON :
 * fetch + parse JSON + gestion d'erreur homogène.
 */
async function requestJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) throw new Error(data?.error || res.statusText || 'Request error');
  return data as T;
}

/* ------------------------------------------------------------------ *
 * [API] Auth service (/auth/*)
 * ------------------------------------------------------------------ */

/** [API] loginUser :
 * POST /auth/login → { userId }.
 * Renvoie une Error si statut non OK ou si userId manquant.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ userId: string }> {
  const res = await fetch('/auth/login', {
    method: 'POST',
    credentials: 'include', // décommente si cookies
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || !data?.userId) {
    throw new Error(data?.error || res.statusText || 'Login error');
  }
  return { userId: String(data.userId) };
}

/** [API] createAuthAccount :
 * POST /auth/register → userId (création de compte auth).
 */
export async function createAuthAccount(email: string, password: string): Promise<string> {
  const data = await requestJSON<{ userId: string }>('/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  if (!data?.userId) throw new Error('Auth error: userId manquant');
  return String(data.userId);
}

/** [API] deleteAuthAccount :
 * DELETE /auth/delete/:userId (rollback best effort).
 * En cas d'erreur, on ignore (ne bloque pas le flux d'inscription).
 */
export async function deleteAuthAccount(userId: string): Promise<void> {
  try {
    await requestJSON<unknown>(`/auth/delete/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
  } catch {
    // silencieux : on ignore l'erreur de rollback
  }
}

/** [API] updateEmail :
 * PUT /auth/email/:userId — met à jour l’email côté auth-service.
 */
export interface EmailUpdateResponse { email: string; userId: string; }
export async function updateEmail(
  userId: string,
  email: string
): Promise<EmailUpdateResponse> {
  const res = await fetch(`/auth/email/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.error || res.statusText || 'Request error');
  return data as EmailUpdateResponse;
}

/** [API] updatePassword :
 * POST /auth/password/:userId — change le mot de passe (204 attendu).
 */
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`/auth/password/${encodeURIComponent(userId)}`, {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  if (res.status === 204) return;

  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) throw new Error(data?.error || res.statusText || 'Password update error');
}

/** [API] logout (robuste) :
 * 1) POST /users/logout (cookies)
 * 2) si NOK et userId dispo → retente avec body { userId }
 * 3) nettoie le client dans tous les cas
 */
export async function logout(): Promise<void> {
  const user = getSavedUser<AppUser>();

//  let res = await fetch('/auth/logout', {
//    method: 'POST',
//    credentials: 'include',
//    headers: JSON_HEADERS,
//  });

//  if (!res.ok && user?.userId) {
  let res = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
      headers: JSON_HEADERS,
      body: JSON.stringify({ userId: user?.userId }),
    });
//  }

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.warn('Logout non OK:', res.status, txt);
  }
  clearUser();
}
