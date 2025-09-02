import { logout } from "./auth";

interface A2FUser {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarPath?: string;
};

/**
 * Vérifie un code 2FA (6 chiffres) pour un utilisateur donné.
 * Attend un 200/204 ; si erreur -> lève une exception.
 */
export async function verify2FA(userId: string, code: string): Promise<void> {
  const res = await fetch('/auth/2fa/verify', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, code })
  });
  
  if (res.ok && res.status === 200)
    return;

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || res.statusText || '2FA failed');
  }
}

/**
 * Récupère le profil complet à partir de 2 microservices:
 *  - users-service:  /users/getUser/:userId
 *  - auth-service:   /auth/getEmail/:userId
 */
export async function fetchUser(userId: string, retried = false): Promise<A2FUser> {
  const [userRes, authRes] = await Promise.all([
    fetch(`/users/getUser/${encodeURIComponent(userId)}`, { method: 'GET', credentials: 'include' }),
    fetch(`/auth/getEmail/${encodeURIComponent(userId)}`, { method: 'GET', credentials: 'include' })
  ]);
  if ((userRes.status === 401 || authRes.status === 401) && !retried ) {
      const ok = await refreshOnce();
      if (ok) {
        return (fetchUser(userId, true));
      } else {
        await logout();
      }
  }
  const usersData = await userRes.json();
  const authData = await authRes.json();
  if (!userRes.ok || !authRes.ok) {
    throw new Error(usersData.error || authData.error);
  }

  return {
    userId: authData.userId,
    username: usersData.username,
    email: authData.email,
    firstName: usersData.firstName,
    lastName: usersData.lastName,
    avatarPath: usersData.avatarPath
  };
}

/**
 * Lance une requete pour refresh les JWT lorsque l'accessToken est expiré.
 * Retourne le nouvel accessToken
 */

let refreshPromise: Promise<boolean> | null = null;

export async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
      .then(r => r.ok)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}