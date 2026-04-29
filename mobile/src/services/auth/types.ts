export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  fullName: string;
};

export type EmailPayload = {
  email: string;
};

export type VerifyOtpPayload = {
  email: string;
  otp: string;
};

export type ResetPasswordPayload = {
  email: string;
  newPassword: string;
};

export type LoginResponse = {
  access_token?: string;
  token?: string;
  [key: string]: unknown;
};

export type UserProfile = {
  id?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string | null;
  pointsBalance?: number;
  rank?: string;
  [key: string]: unknown;
};

export type AuthResponse = {
  message?: string;
  [key: string]: unknown;
};
