// app/api/goals.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWithAutoBase } from '@/api/auth';

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
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  const headers = {
    ...(init.headers || {}),
    Authorization: `Bearer ${token}`,
  } as Record<string, string>;
  return fetchWithAutoBase(path, { ...init, headers });
}

export async function listGoals(): Promise<Goal[]> {
  const res = await authed('/api/goals');
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteGoal(id: string): Promise<{ ok: true }> {
  const res = await authed(`/api/goals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
