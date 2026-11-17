/** The signed-in user, as `UserResource` returns it. */
export type User = {
  id: number;
  name: string | null;
  email: string;
  email_verified: boolean;
  locale: string | null;
  avatar_url: string | null;
  onboarding: { last_step: string | null; completed: boolean };
  created_at: string | null;
};

/** Every successful sign-in (login, device-login, pin-login, register/verify, refresh). */
export type TokenResponse = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token: string;
  refresh_expires_at: string;
  /** `secret` only on the sign-in that created the device; keep the stored one otherwise. */
  device: { id: string; secret?: string; pin_enabled: boolean };
  user?: User;
};

/**
 * What this phone remembers about the account after it signs in, so the next sign-in needs only
 * the password ("Welcome back, Kemi"). Kept in the Keychain / Keystore.
 */
export type RememberedAccount = {
  deviceId: string;
  deviceSecret: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  pinEnabled: boolean;
};

export type Platform = 'ios' | 'android';
