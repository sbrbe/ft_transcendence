export interface AppUser {
  userId: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatarPath?: string;
}

export interface RegisterFormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}