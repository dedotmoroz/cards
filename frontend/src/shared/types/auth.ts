export interface User {
  id: string;
  username: string;
  email: string;
  language?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
}

export interface UpdateProfileData {
  name?: string;
  language?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}
