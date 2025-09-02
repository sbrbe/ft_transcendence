import { RegisterFormData } from "../utils/interface";
import { refreshOnce } from "./A2F";
import { logout } from "./auth";

interface UpdateUserPartial {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarPath?: string;
}
interface UpdatedUserResponse {
  firstName: string;
  lastName: string;
  username: string;
  avatarPath: string;
}

/** [API] createUserProfile :
 * POST /users/register — crée le profil utilisateur côté users-service.
 * N'envoie que les champs profil (pas l'email ni le mdp).
 */
export async function createUserProfile(userId: string, d: RegisterFormData): Promise<void> {
  const res = await fetch('/users/register', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      firstName: d.firstName,
      lastName: d.lastName,
      username: d.username,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Create user profile error: ${data.error || res.statusText}`);
  }
}

/** [API] updateUser :
 * PUT /users/:userId — met à jour le profil (first/last/username/avatarPath).
 * N'envoie que les champs non vides pour éviter d'écraser des valeurs.
 */
export async function updateUser(
  userId: string,
  partial: UpdateUserPartial,
  retried = false
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

    const res = await fetch(`/users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.status === 401 && !retried) {
    const ok = await refreshOnce();
    if (ok) {
      return updateUser(userId, partial, true);
    } else {
      await logout();
    }
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Update user error: ${ data.error || res.statusText}`);
  }
  return data as UpdatedUserResponse;
}
