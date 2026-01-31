export interface User {
  id: string;
  username: string;
  email: string;
  language?: string;
  isGuest?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  language?: string;
  turnstileToken: string;
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
  oldPassword: string;
  newPassword: string;
}

export interface GuestData {
  language: string;
}

export interface RegisterGuestData {
  email: string;
  password: string;
  name: string;
  language: string;
}
