import { fetchWithAutoBase } from './auth';

export async function fetchRelationships(token: string) {
  const res = await fetchWithAutoBase(`/api/me/relationships`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load relationships');
  return res.json() as Promise<{
    meId: string;
    friends: string[];
    sent: string[];
    received: string[];
  }>;
}
