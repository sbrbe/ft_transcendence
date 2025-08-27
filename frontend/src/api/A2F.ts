// src/api/A2F.ts
// Regroupe toutes les requêtes 2FA + helpers de "pending userId"

export type A2FUser = {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
};

/* ---------------- Session helpers (pending userId) ---------------- */

const PENDING_KEY = 'pendingUserId';

export function setPendingUserId(userId: string) {
  sessionStorage.setItem(PENDING_KEY, userId);
}
export function getPendingUserId(): string | null {
  return sessionStorage.getItem(PENDING_KEY);
}
export function clearPendingUserId() {
  sessionStorage.removeItem(PENDING_KEY);
}

/* -------------------------- API calls ----------------------------- */

/**
 * Vérifie un code 2FA (6 chiffres) pour un utilisateur donné.
 * Attend un 200/204 ; si erreur -> lève une exception.
 */
export async function verify2FA(userId: string, code: string): Promise<void> {
  const res = await fetch('/auth/2fa/verify', {
    method: 'POST',
    credentials: 'include', // décommente si vous utilisez des cookies
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code })
  });

  // Beaucoup d’API renvoient 204 No Content en succès
  if (res.ok && res.status === 204) return;

  // Sinon on tente de lire le JSON pour remonter un message
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    throw new Error(data?.error || res.statusText || 'Vérification échouée');
  }
}

/**
 * Récupère le profil complet à partir de 2 microservices:
 *  - users-service:  /users/getUser/:userId
 *  - auth-service:   /auth/getEmail/:userId
 */
export async function fetchUser(userId: string): Promise<A2FUser> {
  const [userRes, authRes] = await Promise.all([
    fetch(`/users/getUser/${encodeURIComponent(userId)}`, { method: 'GET', credentials: 'include' }),
    fetch(`/auth/getEmail/${encodeURIComponent(userId)}`, { method: 'GET', credentials: 'include' })
  ]);

  if (!userRes.ok || !authRes.ok) {
    const t1 = await userRes.text().catch(() => '');
    const t2 = await authRes.text().catch(() => '');
    throw new Error(
      `User fetch error. users:${userRes.status} ${t1} | auth:${authRes.status} ${t2}`
    );
  }

  const [user, auth] = await Promise.all([userRes.json(), authRes.json()]);
  return {
    ...user,
    email: auth.email,
    userId: auth.userId
  };
}
