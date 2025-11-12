export type RelationshipStatus =
  | 'self'
  | 'friends'
  | 'request_sent'
  | 'request_received'
  | 'none';

export function getRelationshipStatus(
  meId: string,
  otherId: string,
  me: { friends: string[]; sent: string[]; received: string[] }
): RelationshipStatus {
  if (meId === otherId) return 'self';
  if (me.friends.includes(otherId)) return 'friends';
  if (me.sent.includes(otherId)) return 'request_sent';
  if (me.received.includes(otherId)) return 'request_received';
  return 'none';
}
