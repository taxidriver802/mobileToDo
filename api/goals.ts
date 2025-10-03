// app/api/goals.ts
import { fetchWithAutoBase, getToken } from '@/api/auth';

export type Goal = {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  user: string;
  createdAt?: string;
  updatedAt?: string;
};

async function authed(path: string, init: RequestInit = {}) {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  // Ensure Authorization is present; preserve any caller headers (like Content-Type)
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    Authorization: `Bearer ${token}`,
  };

  return fetchWithAutoBase(path, { ...init, headers });
}

async function throwIfNotOk(res: Response, defaultMsg: string) {
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    // surface status + any server message
    throw new Error(`${defaultMsg} (${res.status}): ${text || 'no body'}`);
  }
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`${defaultMsg}: non-JSON response: ${text}`);
  }
}

export async function listGoals(): Promise<Goal[]> {
  const res = await authed('/api/goals');
  return throwIfNotOk(res, 'Failed to list goals');
}

export async function createGoal(input: {
  title: string;
  description: string;
}): Promise<Goal> {
  const res = await authed('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return throwIfNotOk(res, 'Failed to create goal');
}

export async function updateGoal(
  id: string,
  patch: Partial<Pick<Goal, 'title' | 'description' | 'completed'>>
): Promise<Goal> {
  const res = await authed(`/api/goals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return throwIfNotOk(res, 'Failed to update goal');
}

/** Convenience if your business rule is: editing content resets completion */
export async function updateGoalResetCompletion(
  id: string,
  patch: Partial<Pick<Goal, 'title' | 'description'>>
): Promise<Goal> {
  return updateGoal(id, { ...patch, completed: false });
}

export async function deleteGoal(id: string): Promise<{ ok: true }> {
  const res = await authed(`/api/goals/${id}`, { method: 'DELETE' });
  return throwIfNotOk(res, 'Failed to delete goal');
}
