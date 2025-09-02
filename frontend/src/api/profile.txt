// src/api/profile.ts

import { logout } from "./auth";

export interface UpdateUserPartial {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarPath?: string;
}

export interface UpdatedUserResponse {
  firstName: string;
  lastName: string;
  username: string;
  avatarPath: string;
}

export interface EmailUpdateResponse {
  email: string;
  userId: string;
}

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

/** Helper JSON générique (centralise lecture + messages d’erreur serveur) */
async function requestJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    throw new Error(data?.error || res.statusText || 'Request error');
  }
  return data as T;
}

/** PUT /users/:userId — met à jour le profil côté users-service */
export async function updateUser(
  userId: string,
  partial: UpdateUserPartial
): Promise<UpdatedUserResponse> {
  // on n’envoie que les champs non vides
  const body = Object.fromEntries(
    Object.entries({
      userId,
      firstName: partial.firstName ?? '',
      lastName: partial.lastName ?? '',
      username: partial.username ?? '',
      avatarPath: partial.avatarPath ?? '',
    }).filter(([, v]) => v !== '')
  );

  return requestJSON<UpdatedUserResponse>(`/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}

/** PUT /auth/email/:userId — met à jour l’email côté auth-service */
export async function updateEmail(
  userId: string,
  email: string
): Promise<EmailUpdateResponse> {
  return requestJSON<EmailUpdateResponse>(`/auth/email/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });
}

/** POST /auth/password/:userId — change le mot de passe (204 = OK) */
export async function updatePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const res = await fetch(`/auth/password/${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (res.status === 204) return;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || res.statusText || 'Password update error');
}


let refreshPromise: Promise<boolean> | null = null;

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch('/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(r => r.ok)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function requestWithJWT<T>(
  url: string,
  init?: RequestInit,
  retried =false): Promise<T> {
    const res = await fetch(url, {
      ...init,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {})},
    });

    if (res.status === 401 && !retried) {
      const ok = await refreshOnce();
      if (ok) {
        return requestWithJWT(url, init, true);
      }
      else {
        return logout();
      }
    }
    const data = await res.json().catch(() => ({})) as any;
    if (!res.ok){
      throw new Error(data?.error || res.statusText || 'Request error');
    }
    return data as T;
}
