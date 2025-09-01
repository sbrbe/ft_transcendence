// src/api/users.ts

/* ------------------------------------------------------------------ *
 * [TYPES] Données utiles côté UI / Users service
 * ------------------------------------------------------------------ */
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;     // pas envoyé à /users/register
  password: string;  // pas envoyé à /users/register
}

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

/* ------------------------------------------------------------------ *
 * [UTIL] Helper HTTP JSON
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
 * [API] Users service (/users/*)
 * ------------------------------------------------------------------ */

/** [API] createUserProfile :
 * POST /users/register — crée le profil utilisateur côté users-service.
 * N'envoie que les champs profil (pas l'email ni le mdp).
 */
export async function createUserProfile(userId: string, d: RegisterFormData): Promise<void> {
  await requestJSON<{ message?: string }>('/users/register', {
    method: 'POST',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      userId,
      firstName: d.firstName,
      lastName: d.lastName,
      username: d.username,
    }),
  });
}

/** [API] updateUser :
 * PUT /users/:userId — met à jour le profil (first/last/username/avatarPath).
 * N'envoie que les champs non vides pour éviter d'écraser des valeurs.
 */
export async function updateUser(
  userId: string,
  partial: UpdateUserPartial
): Promise<UpdatedUserResponse> {
  const body = Object.fromEntries(
    Object.entries({
      userId,
      firstName: partial.firstName ?? '',
      lastName : partial.lastName ?? '',
      username : partial.username ?? '',
      avatarPath: partial.avatarPath ?? '',
    }).filter(([, v]) => v !== '')
  );

  return requestJSON<UpdatedUserResponse>(`/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
}
