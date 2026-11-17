import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { ApiError, NetworkError } from '@/lib/api';
import { authApi } from '@/lib/auth/endpoints';
import { clearAll, loadAccount, loadRefreshToken, saveAccount } from '@/lib/auth/storage';
import { clearTokens, onSessionExpired, refresh, storeTokens } from '@/lib/auth/tokens';
import type { RememberedAccount, TokenResponse, User } from '@/lib/auth/types';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  user: User | null;
  /** The account this phone remembers, for "Welcome back" (password only). Null after "Not you?". */
  account: RememberedAccount | null;
  /** Why the user is signed out: `expired` shows "You've been signed out" on Welcome back. */
  signedOutReason: 'expired' | null;
  /** Signed in, but the server couldn't be reached at launch. */
  offline: boolean;
};

type SessionActions = {
  /** Email + password. Reuses this phone's device when the email matches the remembered account. */
  signIn: (email: string, password: string) => Promise<void>;
  /** Remembered phone, password only. */
  signInWithPassword: (password: string) => Promise<void>;
  /** Start sign-up; an email code follows. */
  register: (email: string, password: string, locale: string) => Promise<void>;
  /** Finish sign-up with the 6-digit code; signs in. */
  verifyEmail: (email: string, code: string) => Promise<void>;
  /** Sign out on this phone. It stays remembered, so the next sign-in is password only. */
  signOut: () => Promise<void>;
  /** "Not you?": forget the account on this phone. */
  forgetAccount: () => Promise<void>;
};

type Session = SessionState & SessionActions;

const SessionContext = createContext<Session | null>(null);

const platform = Platform.OS === 'android' ? 'android' : 'ios';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    status: 'loading',
    user: null,
    account: null,
    signedOutReason: null,
    offline: false,
  });

  // Restore the session at launch: a stored refresh token means "still signed in".
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [account, refreshToken] = await Promise.all([loadAccount(), loadRefreshToken()]);
      if (!refreshToken) {
        if (!cancelled) setState((s) => ({ ...s, status: 'signedOut', account }));
        return;
      }
      try {
        await refresh();
        const me = await authApi.me();
        if (!cancelled) setState({ status: 'signedIn', user: me.data, account, signedOutReason: null, offline: false });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof NetworkError) {
          // Offline: keep the session; requests renew it when the connection is back.
          setState({ status: 'signedIn', user: null, account, signedOutReason: null, offline: true });
        } else {
          const expired = error instanceof ApiError && error.code === 'refresh_invalid';
          setState({ status: 'signedOut', user: null, account, signedOutReason: expired ? 'expired' : null, offline: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // A refresh failed mid-use: show "You've been signed out" on Welcome back.
  useEffect(
    () =>
      onSessionExpired(() =>
        setState((s) => (s.status === 'signedIn' ? { ...s, status: 'signedOut', user: null, signedOutReason: 'expired' } : s)),
      ),
    [],
  );

  const completeSignIn = useCallback(async (tokens: TokenResponse, previous: RememberedAccount | null) => {
    await storeTokens(tokens);
    const user = tokens.user ?? (await authApi.me()).data;
    const sameDevice = previous?.deviceId === tokens.device.id;
    const secret = tokens.device.secret ?? (sameDevice ? previous?.deviceSecret : undefined);
    let account: RememberedAccount | null = null;
    if (secret) {
      account = {
        deviceId: tokens.device.id,
        deviceSecret: secret,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url,
        pinEnabled: tokens.device.pin_enabled,
      };
      await saveAccount(account);
    }
    // Signed in as someone else on this phone: the old device is no longer needed.
    if (previous && !sameDevice) {
      authApi.forgetDevice({ device_id: previous.deviceId, device_secret: previous.deviceSecret }).catch(() => {});
    }
    setState({ status: 'signedIn', user, account, signedOutReason: null, offline: false });
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const previous = state.account;
      const reuse = previous && previous.email.toLowerCase() === email.trim().toLowerCase();
      const tokens = await authApi.login({
        email: email.trim(),
        password,
        platform,
        ...(reuse ? { device_id: previous.deviceId, device_secret: previous.deviceSecret } : {}),
      });
      await completeSignIn(tokens, previous);
    },
    [state.account, completeSignIn],
  );

  const signInWithPassword = useCallback(
    async (password: string) => {
      const account = state.account;
      if (!account) throw new ApiError(401, 'device_revoked');
      try {
        const tokens = await authApi.deviceLogin({ device_id: account.deviceId, device_secret: account.deviceSecret, password });
        await completeSignIn(tokens, account);
      } catch (error) {
        // The server forgot this phone (signed out everywhere, password reset): fall back to the email form.
        if (error instanceof ApiError && error.code === 'device_revoked') {
          await clearAll();
          setState((s) => ({ ...s, account: null, signedOutReason: null }));
        }
        throw error;
      }
    },
    [state.account, completeSignIn],
  );

  const register = useCallback(async (email: string, password: string, locale: string) => {
    await authApi.register({ email: email.trim(), password, locale, consent: true });
  }, []);

  const verifyEmail = useCallback(
    async (email: string, code: string) => {
      const tokens = await authApi.verify({ email: email.trim(), code, platform });
      await completeSignIn(tokens, state.account);
    },
    [state.account, completeSignIn],
  );

  const signOut = useCallback(async () => {
    await authApi.logout().catch(() => {}); // Offline sign-out still works on the phone.
    await clearTokens();
    setState((s) => ({ ...s, status: 'signedOut', user: null, signedOutReason: null, offline: false }));
  }, []);

  const forgetAccount = useCallback(async () => {
    const account = state.account;
    if (account) {
      await authApi.forgetDevice({ device_id: account.deviceId, device_secret: account.deviceSecret }).catch(() => {});
    }
    await clearTokens();
    await clearAll();
    setState((s) => ({ ...s, status: 'signedOut', user: null, account: null, signedOutReason: null }));
  }, [state.account]);

  const value = useMemo<Session>(
    () => ({ ...state, signIn, signInWithPassword, register, verifyEmail, signOut, forgetAccount }),
    [state, signIn, signInWithPassword, register, verifyEmail, signOut, forgetAccount],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}
