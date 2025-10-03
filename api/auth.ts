import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { decode as base64decode } from 'base-64';
import { router } from 'expo-router';

const API_PORT = 5001;
const LAN_HOST = '10.0.0.181';

export type AuthHydrateResult =
  | { ok: true; token: string; user: any }
  | { ok: false; message: string; code?: number };

/** ---- In-memory auth state (the single source of truth at runtime) ---- */
const authState: {
  token: string | null;
  user: any | null;
} = {
  token: null,
  user: null,
};

export function getAuthState() {
  return { ...authState };
}

function setTokenInMemory(token: string | null) {
  authState.token = token;
}
function setUserInMemory(user: any | null) {
  authState.user = user;
}

/** ---- API base resolution ---- */
function getApiUrl() {
  if (Platform.OS === 'android') return `http://10.0.2.2:${API_PORT}/api`;
  if (Platform.OS === 'ios') return `http://localhost:${API_PORT}/api`;
  return `http://${LAN_HOST}:${API_PORT}/api`;
}
export const API_URL = getApiUrl();

const CANDIDATE_BASES = [
  `http://localhost:${API_PORT}`,
  `http://${LAN_HOST}:${API_PORT}`,
  `http://10.0.2.2:${API_PORT}`,
  `http://10.0.3.2:${API_PORT}`,
];

// Optional in-memory override (set once per run)
let volatileApiBaseOverride: string | null = null;

export function setApiBaseUrl(base: string) {
  volatileApiBaseOverride = base.replace(/\/+$/, '');
}

export function clearApiBaseUrl() {
  volatileApiBaseOverride = null;
}

async function detectBaseUrl(): Promise<string> {
  if (volatileApiBaseOverride) return volatileApiBaseOverride;

  for (const base of CANDIDATE_BASES) {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${base}/api/_ping`, {
        signal: controller.signal,
      });
      clearTimeout(to);
      if (res?.ok) {
        volatileApiBaseOverride = base;
        return base;
      }
    } catch {
      // try next
    }
  }

  console.warn(
    '[api.auth] no candidate base reachable, falling back to API_URL',
    API_URL
  );
  return API_URL.replace(/\/api$/, '');
}

export async function fetchWithAutoBase(inputPath: string, init?: RequestInit) {
  const base = await detectBaseUrl();
  const url = inputPath.startsWith('http')
    ? inputPath
    : `${base}${inputPath.startsWith('/') ? '' : '/'}${inputPath}`;
  return fetch(url, init);
}

/** ---- Public auth flows ---- */
export async function loginAndHydrate(
  username: string,
  password: string
): Promise<AuthHydrateResult> {
  try {
    const data = await login(username, password); // sets token (mem + storage)
    const user = await getMe(); // uses in-memory token
    return { ok: true, token: data.token, user };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Login failed.' };
  }
}

export async function registerAndHydrate(
  username: string,
  password: string,
  fullName?: string
): Promise<AuthHydrateResult> {
  try {
    const data = await register(username, password, fullName); // sets token
    const user = await getMe();
    return { ok: true, token: data.token, user };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Registration failed.' };
  }
}

/** Try to restore token from storage, then load user */
export async function bootstrapSession(): Promise<AuthHydrateResult> {
  try {
    const stored = await AsyncStorage.getItem('token');
    if (!stored) return { ok: false, message: 'No token' };
    if (isJwtExpired(stored)) {
      await AsyncStorage.removeItem('token');
      setTokenInMemory(null);
      return { ok: false, message: 'Token expired' };
    }
    setTokenInMemory(stored);
    const user = await getMe(); // 401 path clears token
    return { ok: true, token: stored, user };
  } catch (e: any) {
    await AsyncStorage.removeItem('token');
    setTokenInMemory(null);
    return { ok: false, message: e?.message || 'Session invalid' };
  }
}

/** ---- Auth endpoints (no user persisted) ---- */
export async function getMe() {
  const token = authState.token;
  if (!token) throw new Error('No token available');

  const res = await fetchWithAutoBase('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      // clear token (mem + storage), no 'user' in storage anymore
      await AsyncStorage.removeItem('token');
      setTokenInMemory(null);
      setUserInMemory(null);
    }
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to fetch user: ${res.status} ${body}`);
  }

  const me = await res.json();
  setUserInMemory(me);
  return me;
}

export async function register(
  username: string,
  password: string,
  fullName?: string
) {
  const controller = new AbortController();
  const timeoutMs = 10000;
  const timeout = setTimeout(() => {
    console.warn('[auth.register] timeout reached after', timeoutMs, 'ms');
    controller.abort();
  }, timeoutMs);
  let startTs: number | undefined;

  try {
    startTs = Date.now();

    const res = await fetchWithAutoBase(`/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName }),
      signal: controller.signal,
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error(
          'Username already exists. Please choose a different one.'
        );
      } else if (res.status === 400) {
        throw new Error(data.error || 'Invalid username or password format.');
      } else {
        throw new Error(data.error || 'Failed to register. Please try again.');
      }
    }

    const token = data?.token;
    if (token) {
      try {
        await AsyncStorage.setItem('token', token);
        setTokenInMemory(token);
      } catch (e) {
        console.error('[auth.register] storing token failed ->', String(e));
      }
    }

    return data;
  } catch (err: any) {
    console.error('[auth.register] error ->', {
      asString: String(err),
      name: err?.name,
      message: err?.message,
      controllerAborted: controller.signal.aborted,
      elapsedMs: typeof startTs === 'number' ? Date.now() - startTs : undefined,
    });

    if (
      err?.name === 'AbortError' ||
      err?.message === 'The user aborted a request.'
    ) {
      throw new Error(
        'Request timed out. Please check your network and try again.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export async function login(username: string, password: string) {
  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchWithAutoBase('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      const detail = text || data?.error || 'No response body';
      const msg =
        res.status === 400
          ? data?.error || 'Invalid username or password format.'
          : res.status === 401
            ? 'Unauthorized.'
            : res.status === 403
              ? 'Forbidden.'
              : res.status === 404
                ? 'User not found. Please check your username.'
                : res.status === 500
                  ? 'Server error. Please try again later.'
                  : `Login failed: ${res.status} ${detail}`;
      throw new Error(msg);
    }

    const token = data?.token;
    if (!token) throw new Error('Login succeeded but no token returned.');

    await AsyncStorage.setItem('token', token);
    setTokenInMemory(token);
    return data;
  } catch (err: any) {
    console.error('[auth.login] error ->', err?.message || String(err));
    if (
      err?.name === 'AbortError' ||
      err?.message === 'The user aborted a request.'
    ) {
      throw new Error(
        'Request timed out. Please check your network and try again.'
      );
    }
    if (
      typeof err?.message === 'string' &&
      err.message.includes('Network request failed')
    ) {
      throw new Error(
        'Network request failed. Check that your API base is reachable from this device/emulator.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

/** ---- Utilities ---- */
export async function isLoggedIn(): Promise<boolean> {
  // Prefer in-memory token (fast path); fall back to storage during cold start
  let token = authState.token;
  if (!token) token = await AsyncStorage.getItem('token');
  return !!token && !isJwtExpired(token);
}

export async function logout(): Promise<void> {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    setTokenInMemory(null);
    setUserInMemory(null);
  }
}

export async function getToken(): Promise<string | null> {
  // Return the freshest thing we have; keep storage as fallback
  if (authState.token) return authState.token;
  const stored = await AsyncStorage.getItem('token');
  if (stored && !isJwtExpired(stored)) {
    setTokenInMemory(stored);
    return stored;
  }
  return null;
}

export async function updateMe(patch: Record<string, any>) {
  const token = authState.token;
  if (!token) throw new Error('Not authenticated');

  const res = await fetchWithAutoBase('/api/auth/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to update user: ${res.status} ${body}`);
  }

  const updated = await res.json();
  setUserInMemory(updated);
  return updated;
}

export async function authenticateWithBiometrics() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();

  if (hasHardware && isEnrolled) {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Sign in with biometrics',
      fallbackLabel: 'Use password',
    });
    return result.success;
  }
  return false;
}

const isJwtExpired = (token: string) => {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(base64decode(payload));
    return exp * 1000 <= Date.now();
  } catch {
    return true; // bad token -> treat as expired
  }
};

export async function bootstrapAuth() {
  // Lightweight boot that just ensures we land in the right screen.
  const stored = await AsyncStorage.getItem('token');
  if (!stored || isJwtExpired(stored)) {
    await AsyncStorage.removeItem('token');
    setTokenInMemory(null);
    setUserInMemory(null);
    router.replace('/(auth)/authIndex');
    return;
  }

  setTokenInMemory(stored);
  try {
    await getMe();
    // proceed to app
  } catch {
    await AsyncStorage.removeItem('token');
    setTokenInMemory(null);
    setUserInMemory(null);
    router.replace('/(auth)/authIndex');
  }
}
