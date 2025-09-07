import { navigateTo } from "../router/router";
import { AppUser } from "../utils/interface";
import { clearUser, getSavedUser } from "../utils/ui";
import { refreshOnce } from "./A2F";

interface EmailUpdateResponse { 
  email: string;
  userId: string; 
}

/** [API] createAuthAccount :
 * POST /auth/register → userId (création de compte auth).
 */
export async function createAuthAccount(email: string, password: string): Promise<string> {
  const res = await fetch('/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Auth error: ${data.error || res.statusText}` );
  }
  return String(data.userId);
}

/** [API] deleteAuthAccount :
 * DELETE /auth/delete/:userId (rollback best effort).
 * En cas d'erreur, on ignore (ne bloque pas le flux d'inscription).
 */
export async function deleteAuthAccount(userId: string): Promise<void> {
  try {
    await fetch(`/auth/delete/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      credentials: 'include'
    });
  } catch {
    // silencieux : on ignore l'erreur de rollback
  }
}

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
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok || !data?.userId) {
    throw new Error(data?.error || res.statusText || 'Login error');
  }
  return { userId: String(data.userId) };
}

/** [API] updateEmail :
 * PUT /auth/email/:userId — met à jour l’email côté auth-service.
 */
export async function updateEmail(
  userId: string,
  email: string,
  retried = false): Promise<EmailUpdateResponse> {
  const res = await fetch(`/auth/email/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (res.status === 401 && !retried) {
    const ok = await refreshOnce();
    if (ok) {
      return updateEmail(userId, email, true);
    } else {
      await logout();
    }
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(`Email update error : ${data?.error || res.statusText}`);
  }
  return data as EmailUpdateResponse;
}

/** [API] updatePassword :
 * POST /auth/password/:userId — change le mot de passe (204 attendu).
 */
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
  retried = false) {
  const res = await fetch(`/auth/password/${encodeURIComponent(userId)}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
    if (res.status === 401 && !retried) {
    const ok = await refreshOnce();
    if (ok) {
      return updatePassword(userId, oldPassword, newPassword, true);
    } else {
      await logout();
    }
  }

  if (!res.ok) {
    const data = await res.json();
    throw new Error(`Password update error : ${data?.error || res.statusText}`);
  }
}

/** [API] logout (robuste) :
 * 1) POST /users/logout (cookies)
 * 2) si NOK et userId dispo → retente avec body { userId }
 * 3) nettoie le client dans tous les cas
 */
export async function logout() {
  const user = getSavedUser<AppUser>();

  let res = await fetch('/auth/logout', {
      method: 'POST',
      credentials: 'include',
    headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ userId: user?.userId }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.warn('Logout failed OK:', res.statusText, data.error);
  }
  clearUser();
  navigateTo('/connection');
}
