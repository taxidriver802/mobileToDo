import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { login as rawLogin, register as rawRegister } from './auth';

const API_PORT = 5001; // backend port (matches mobileBackend/.env)
const LAN_HOST = '10.0.0.181'; // keep your LAN IP here for physical device

export type AuthHydrateResult =
  | { ok: true; token: string; user: any }
  | { ok: false; message: string; code?: number };

export async function loginAndHydrate(
  username: string,
  password: string
): Promise<AuthHydrateResult> {
  try {
    const data = await rawLogin(username, password); // saves token already
    const user = await getMe(); // uses token from storage
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
    const data = await rawRegister(username, password, fullName); // saves token
    const user = await getMe();
    return { ok: true, token: data.token, user };
  } catch (e: any) {
    return { ok: false, message: e?.message || 'Registration failed.' };
  }
}

export async function bootstrapSession(): Promise<AuthHydrateResult> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return { ok: false, message: 'No token' };

    const user = await getMe(); // will clear token on 401 (your code already does that)
    return { ok: true, token, user };
  } catch (e: any) {
    // if token is bad, ensure it’s cleared so we don’t loop
    await AsyncStorage.removeItem('token');
    return { ok: false, message: e?.message || 'Session invalid' };
  }
}

function getApiUrl() {
  if (Platform.OS === 'android') {
    // Android emulator (AVD) maps host machine localhost to 10.0.2.2
    return `http://10.0.2.2:${API_PORT}/api`;
  }
  if (Platform.OS === 'ios') {
    // iOS simulator can use localhost
    return `http://localhost:${API_PORT}/api`;
  }
  // Fallback (web or physical device) - use LAN host
  return `http://${LAN_HOST}:${API_PORT}/api`;
}

export const API_URL = getApiUrl();

const HOST_CACHE_KEY = 'API_BASE_URL';

// Candidate bases to try when detecting reachable backend
const CANDIDATE_BASES = [
  `http://localhost:${API_PORT}`,
  `http://${LAN_HOST}:${API_PORT}`,
  `http://10.0.2.2:${API_PORT}`,
  `http://10.0.3.2:${API_PORT}`,
];

// Convenience helpers: when using a temporary public tunnel (eg. ngrok),
// call `setApiBaseUrl('https://your-ngrok-subdomain.ngrok-free.dev')`
// from app startup or a debug screen so detectBaseUrl() will return it immediately.
export async function setApiBaseUrl(base: string) {
  try {
    if (!base) return;
    // normalize (remove trailing slash)
    const normalized = base.replace(/\/+$/, '');
    await AsyncStorage.setItem(HOST_CACHE_KEY, normalized);
    console.log('[api.auth] manual base set ->', normalized);
  } catch (e) {
    console.error('[api.auth] setApiBaseUrl error ->', e);
  }
}

export async function clearApiBaseUrl() {
  try {
    await AsyncStorage.removeItem(HOST_CACHE_KEY);
    console.log('[api.auth] cleared cached base');
  } catch (e) {
    console.error('[api.auth] clearApiBaseUrl error ->', e);
  }
}

async function detectBaseUrl(): Promise<string> {
  // Try cached value first
  try {
    const cached = await AsyncStorage.getItem(HOST_CACHE_KEY);
    if (cached) return cached;
  } catch (e) {
    /* ignore */
  }

  // Try candidates sequentially with a short timeout
  for (const base of CANDIDATE_BASES) {
    try {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${base}/api/_ping`, {
        signal: controller.signal,
      });
      clearTimeout(to);
      if (res && res.ok) {
        // cache and return
        try {
          await AsyncStorage.setItem(HOST_CACHE_KEY, base);
        } catch (e) {
          /* ignore cache failures */
        }
        console.log('[api.auth] detected reachable base ->', base);
        return base;
      }
    } catch (e) {
      console.log('[api.auth] base not reachable ->', base, String(e));
      // try next
    }
  }

  // Fallback to compile-time API_URL
  console.warn(
    '[api.auth] no candidate base reachable, falling back to API_URL',
    API_URL
  );
  return API_URL.replace(/\/api$/, '');
}

async function fetchWithAutoBase(inputPath: string, init?: RequestInit) {
  const base = await detectBaseUrl();
  const url = inputPath.startsWith('http')
    ? inputPath
    : `${base}${inputPath.startsWith('/') ? '' : '/'}${inputPath}`;
  return fetch(url, init);
}

// api/auth.ts
export async function getMe() {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('No token available');

  const res = await fetchWithAutoBase('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    const body = await res.text().catch(() => '');
    throw new Error(`Failed to fetch user: ${res.status} ${body}`);
  }
  return res.json();
}
export async function register(
  username: string,
  password: string,
  fullName?: string
) {
  // Add a timeout to the fetch so it doesn't hang indefinitely.
  const controller = new AbortController();
  const timeoutMs = 10000; // 10s timeout - adjust as needed
  const timeout = setTimeout(() => {
    console.warn(
      '[auth.register] timeout reached, aborting fetch after',
      timeoutMs,
      'ms'
    );
    controller.abort();
  }, timeoutMs);
  let startTs: number | undefined;

  try {
    startTs = Date.now();
    console.log(
      '[auth.register] starting fetch ->',
      `${API_URL}/auth/register`,
      'startTs=',
      startTs,
      'fullNameProvided=',
      Boolean(fullName)
    );
    console.log(
      '[auth.register] controller.signal.aborted before fetch ->',
      controller.signal.aborted
    );
    const res = await fetchWithAutoBase(`/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName }),
      signal: controller.signal,
    });

    console.log('[auth.register] fetch resolved, status ->', res.status);

    const data = await res.json();

    console.log('[auth.register] parsed response json ->', data);

    if (!res.ok) {
      // Handle specific error cases
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

    if (data.token) {
      try {
        const token = data.token;
        await AsyncStorage.setItem('token', token);
      } catch (storageErr) {
        console.error(
          '[auth.register] AsyncStorage.setItem failed ->',
          String(storageErr)
        );
        // do not rethrow - treat storage failure as non-fatal for register flow
      }
    }

    console.log('[auth.register] returning data to caller');
    return data;
  } catch (err: any) {
    console.error('[auth.register] caught error ->', {
      asString: String(err),
      type: typeof err,
      name: err?.name,
      message: err?.message,
      props: Object.getOwnPropertyNames(err || {}),
      stack: err?.stack,
      controllerAborted: controller.signal.aborted,
      elapsedMs: typeof startTs === 'number' ? Date.now() - startTs : undefined,
    });

    // Convert AbortError into a friendly timeout message
    if (
      err &&
      (err.name === 'AbortError' ||
        err.message === 'The user aborted a request.')
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
  // Add a timeout to the fetch so it doesn't hang indefinitely.
  const controller = new AbortController();
  const timeoutMs = 15000; // 15s timeout
  const timeout = setTimeout(() => {
    console.warn(
      '[auth.login] timeout reached, aborting fetch after',
      timeoutMs,
      'ms'
    );
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetchWithAutoBase(`/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      signal: controller.signal,
    });

    let data: any = null;

    try {
      data = await res.json();
    } catch {
      // leave payload null if non-JSON
    }

    if (!res.ok) {
      // Handle specific error cases
      if (res.status === 400) {
        throw new Error(data.error || 'Invalid username or password format.');
      } else if (res.status === 401) {
        throw new Error('Unauthorized.');
      } else if (res.status === 403) {
        throw new Error('Forbidden.');
      } else if (res.status === 404) {
        throw new Error('User not found. Please check your username.');
      } else if (res.status === 500) {
        throw new Error('Server error. Please try again later.');
      } else {
        throw new Error(data.error || 'Failed to login. Please try again.');
      }
    }

    try {
      await AsyncStorage.setItem('token', data.token); // Save token
    } catch (storageErr) {
      console.error(
        '[auth.login] AsyncStorage.setItem failed ->',
        String(storageErr)
      );
    }
    return data;
  } catch (err: any) {
    console.error('[auth.login] caught error ->', {
      asString: String(err),
      type: typeof err,
      name: err?.name,
      message: err?.message,
      props: Object.getOwnPropertyNames(err || {}),
      stack: err?.stack,
    });

    console.error(
      '[auth.login] controller.signal.aborted at catch ->',
      controller.signal.aborted
    );

    if (
      err &&
      (err.name === 'AbortError' ||
        err.message === 'The user aborted a request.')
    ) {
      throw new Error(
        'Request timed out. Please check your network and try again.'
      );
    }

    if (
      err &&
      typeof err.message === 'string' &&
      err.message.includes('Network request failed')
    ) {
      throw new Error(
        'Network request failed. Check that API_URL is reachable from this device/emulator.'
      );
    }

    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Helper function to check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  try {
    const token = await AsyncStorage.getItem('token');
    return token !== null;
  } catch (error) {
    return false;
  }
}

// Helper function to logout
export async function logout(): Promise<void> {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

// Helper function to get stored token
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    return null;
  }
}

// Biometrics authentication
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
