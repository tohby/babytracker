import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { loadDevPreviewUser } from '@/lib/dev-preview';
import { Platform } from 'react-native';

import { ApiError, NetworkError } from '@/lib/api';
import { authApi, type EmailIntent } from '@/lib/auth/endpoints';
import { clearAll, loadAccount, loadRefreshToken, saveAccount } from '@/lib/auth/storage';
import { clearTokens, onSessionExpired, refresh, storeTokens } from '@/lib/auth/tokens';
import type { RememberedAccount, TokenResponse, User } from '@/lib/auth/types';
import { forgetUnlockRecord } from '@/lib/unlock/storage';

export type SessionStatus = 'loading' | 'signedOut' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  user: User | null;
  /** The account this phone remembers, for "Welcome back" (password only). Null after "Not you?". */
  account: RememberedAccount | null;
  /**
   * Why the user is signed out: `expired` shows "You've been signed out" on Welcome back;
   * `switched` (Switch account) opens a blank Sign in instead of the intro.
   */
  signedOutReason: 'expired' | 'switched' | null;
  /** Signed in, but the server couldn't be reached at launch. */
  offline: boolean;
};

type SessionActions = {
  verifyEmailCode: (email: string, intent: EmailIntent, code: string, beforeSignIn?: () => Promise<void>) => Promise<void>;
  /** Email + password. `beforeSignIn` runs once the server accepts it (lock-screen unlock or PIN reset). */
  signInWithPassword: (email: string, password: string, beforeSignIn?: () => Promise<void>) => Promise<void>;
  /** Sign out on this phone. The email stays remembered for the next sign-in. */
  signOut: () => Promise<void>;
  /**
   * "Not you?" / Switch account: forget the account on this phone (tokens, remembered device,
   * PIN and biometric key). Pass `switching` to go straight to a blank Sign in.
   */
  forgetAccount: (options?: { switching?: boolean }) => Promise<void>;
  /** Replace the signed-in user after a profile or onboarding change (keeps the remembered name in step). */
  updateUser: (user: User) => void;
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
      const preview = await loadDevPreviewUser();
      if (preview) {
        if (!cancelled) setState({ status: 'signedIn', user: preview, account: null, signedOutReason: null, offline: false });
        return;
      }
      const [account, refreshToken] = await Promise.all([loadAccount(), loadRefreshToken()]);
      if (!refreshToken) {
        if (!cancelled) setState((s) => ({ ...s, status: 'signedOut', account }));
        return;
      }
      try {
        await refresh();
        const me = await authApi.me();
        if (cancelled) return;
        const remembered = account?.email === me.data.email ? { ...account, profile: me.data } : account;
        if (remembered) void saveAccount(remembered).catch(() => {});
        setState({ status: 'signedIn', user: me.data, account: remembered, signedOutReason: null, offline: false });
      } catch (error) {
        if (cancelled) return;
        if (error instanceof NetworkError) {
          // Offline: keep the session; requests renew it when the connection is back.
          setState({ status: 'signedIn', user: account?.profile ?? null, account, signedOutReason: null, offline: true });
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
        profile: user,
      };
      await saveAccount(account);
    }
    // Signed in as someone else on this phone: the old device is no longer needed.
    if (previous && !sameDevice) {
      authApi.forgetDevice({ device_id: previous.deviceId, device_secret: previous.deviceSecret }).catch(() => {});
    }
    setState({ status: 'signedIn', user, account, signedOutReason: null, offline: false });
  }, []);

  const verifyEmailCode = useCallback(
    async (email: string, intent: EmailIntent, code: string, beforeSignIn?: () => Promise<void>) => {
      const previous = state.account;
      const reuse = !beforeSignIn && previous && previous.email.toLowerCase() === email.trim().toLowerCase();
      const tokens = await authApi.verifyEmailCode({
        email: email.trim(),
        intent,
        code,
        platform,
        ...(reuse ? { device_id: previous.deviceId, device_secret: previous.deviceSecret } : {}),
      });
      await beforeSignIn?.();
      await completeSignIn(tokens, previous);
    },
    [state.account, completeSignIn],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string, beforeSignIn?: () => Promise<void>) => {
      const previous = state.account;
      // Same account on this phone: reuse its device, as verifyEmailCode does (not during lock-screen recovery).
      const reuse = !beforeSignIn && previous && previous.email.toLowerCase() === email.trim().toLowerCase();
      const tokens = await authApi.login({
        email: email.trim(),
        password,
        platform,
        ...(reuse ? { device_id: previous.deviceId, device_secret: previous.deviceSecret } : {}),
      });
      await beforeSignIn?.();
      await completeSignIn(tokens, previous);
    },
    [state.account, completeSignIn],
  );

  const signOut = useCallback(async () => {
    await authApi.logout().catch(() => {}); // Offline sign-out still works on the phone.
    await clearTokens();
    setState((s) => ({ ...s, status: 'signedOut', user: null, signedOutReason: null, offline: false }));
  }, []);

  const forgetAccount = useCallback(async ({ switching = false }: { switching?: boolean } = {}) => {
    const account = state.account;
    if (account) {
      await authApi.forgetDevice({ device_id: account.deviceId, device_secret: account.deviceSecret }).catch(() => {});
    }
    await clearTokens();
    if (account?.email) await forgetUnlockRecord(account.email).catch(() => {});
    await clearAll();
    setState((s) => ({ ...s, status: 'signedOut', user: null, account: null, signedOutReason: switching ? 'switched' : null, offline: false }));
  }, [state.account]);

  const updateUser = useCallback((user: User) => {
    setState((s) => {
      const account = s.account && s.account.email === user.email ? { ...s.account, name: user.name, avatarUrl: user.avatar_url, profile: user } : s.account;
      if (account && account !== s.account) saveAccount(account).catch(() => {});
      return { ...s, user, account };
    });
  }, []);

  const value = useMemo<Session>(
    () => ({ ...state, verifyEmailCode, signInWithPassword, signOut, forgetAccount, updateUser }),
    [state, verifyEmailCode, signInWithPassword, signOut, forgetAccount, updateUser],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession must be used inside SessionProvider');
  return session;
}
