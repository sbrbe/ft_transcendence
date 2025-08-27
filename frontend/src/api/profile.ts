// src/api/profile.ts

export interface UpdateUserPartial {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
}

export interface UpdatedUserResponse {
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
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
      avatarUrl: partial.avatarUrl ?? '',
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
