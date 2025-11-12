// FriendProfileCard.tsx
import * as React from 'react';
import { View, Image } from 'react-native';
import { Card, Button, Divider, Text } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons'; // or 'react-native-vector-icons/Ionicons'
import useTheme from '@/hooks/useTheme';
import { RelationshipActions } from './RelationshipActions';
import { showError, showSuccess } from '@/utils/toast';

import type { RelationshipStatus } from './RelationshipActions';

type FriendLite = {
  _id: string;
  fullName?: string;
  username: string;
  profilePic?: string;
  streak?: number;
  highestStreak?: number;
  relationshipStatus?:
    | 'friends'
    | 'request_sent'
    | 'request_received'
    | 'none'
    | 'self';
  createdAt?: string;
};

type Props = {
  user: FriendLite;
  sortBy: 'current' | 'highest' | 'name';
  onMessage?: (id: string) => void;
  onUnfriend?: (id: string) => Promise<void> | void;
  onClose?: () => void;
  onAdd: (id: string) => void;
};

export default function FriendProfileCard({
  user,
  sortBy,
  onMessage,
  onUnfriend,
  onClose,
  onAdd,
}: Props) {
  const { colors } = useTheme();

  const [busy, setBusy] = React.useState(false);

  const status: RelationshipStatus = (user.relationshipStatus ??
    'none') as RelationshipStatus;

  // simple avatar resolver (swap to your CDN/base if needed)
  const avatarUri =
    user.profilePic && user.profilePic !== 'default.jpg'
      ? user.profilePic
      : undefined; // show fallback if you have one

  const StatPill = ({
    icon,
    value,
    active = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    value: number;
    active?: boolean;
  }) => {
    const bg = active ? colors.primary : colors.surface;
    const border = active ? colors.primary : colors.border;
    const text = active
      ? colors.surface
      : icon === 'trophy-outline'
        ? colors.text
        : colors.textMuted;

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: border,
        }}
      >
        <Ionicons name={icon} size={14} color={text} />
        <Text style={{ color: text, marginLeft: 4, fontSize: 12 }}>
          {value}
        </Text>
      </View>
    );
  };

  const onSendFriendRequest = async (userId: string) => {
    setBusy(true);
    try {
      await onAdd(userId);
      showSuccess('Request sent', '');
    } catch (e) {
      showError('Could not send request', '');
    } finally {
      setBusy(false);
    }
  };

  const onCancelFriendRequest = async (userId: string) => {
    setBusy(true);
    /* try {
      await api.cancelFriendRequest(userId);
      showSuccess('Request canceled');
    } catch {
      showError('Could not cancel');
    } finally {
      setBusy(false);
    } */
  };

  const onAcceptFriendRequest = async (userId: string) => {
    setBusy(true);
    /* try {
      await api.acceptFriendRequest(userId);
      showSuccess('Friend added');
    } catch {
      showError('Could not accept');
    } finally {
      setBusy(false);
    } */
  };

  const onDeclineFriendRequest = async (userId: string) => {
    setBusy(true);
    /*  try {
      await api.declineFriendRequest(userId);
      showSuccess('Request declined');
    } catch {
      showError('Could not decline');
    } finally {
      setBusy(false);
    } */
  };

  const dev = false;

  return (
    <View style={{ width: '100%', height: '100%' }}>
      <Card
        mode="elevated"
        style={{
          borderRadius: 16,
          backgroundColor: colors.surface,
          height: 500,
          flexDirection: 'column',
        }}
      >
        <View>
          <View style={{ flexDirection: 'column' }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 999,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={48}
                    color={colors.textMuted}
                  />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, color: colors.text }}>
                  {user.fullName || user.username}
                </Text>
                <Text style={{ color: colors.textMuted }}>
                  @{user.username}
                </Text>
              </View>

              {user.relationshipStatus === 'friends' && (
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                    Friend
                  </Text>
                </View>
              )}
            </View>

            {/* Stats */}
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                paddingLeft: 20,
                paddingBottom: 10,
              }}
            >
              <StatPill
                icon="flame-outline"
                value={user.streak ?? 0}
                active={sortBy === 'current'}
              />
              <StatPill
                icon="trophy-outline"
                value={user.highestStreak ?? 0}
                active={sortBy === 'highest'}
              />
            </View>
          </View>

          <View
            style={{
              width: '100%',
              paddingTop: 275,
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <RelationshipActions
              status={status}
              userId={user._id}
              busy={busy}
              onClose={onClose}
              onMessage={onMessage}
              onSendRequest={onSendFriendRequest}
              onCancelRequest={onCancelFriendRequest}
              onAccept={onAcceptFriendRequest}
              onDecline={onDeclineFriendRequest}
              onUnfriend={onUnfriend}
              colors={{
                danger: '#e74c3c',
                warning: '#c27c2c',
                primary: colors.primary,
                muted: colors.textMuted,
              }}
            />
          </View>
        </View>

        <Card.Content style={{ gap: 10, paddingBottom: 8 }}>
          <Divider />

          {/* member since */}
          {user.createdAt && (
            <Text
              style={{ color: colors.textMuted, marginTop: 6, fontSize: 12 }}
            >
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          )}
        </Card.Content>

        <View style={{ flex: 1 }} />

        {/* Actions */}
        <Card.Actions
          style={{
            justifyContent: 'center',
            paddingHorizontal: 12,
            /* backgroundColor: 'pink', */
          }}
        >
          <View
            style={{
              flexDirection: 'row',

              /* backgroundColor: 'red', */
            }}
          >
            {dev && (
              <View style={{ paddingRight: 30 }}>
                <Button
                  mode="outlined"
                  disabled={dev ? false : true}
                  icon={() => (
                    <Ionicons name="chatbubble-ellipses-outline" size={16} />
                  )}
                  onPress={() => onMessage?.(user._id)}
                >
                  Message
                </Button>
              </View>
            )}
          </View>
        </Card.Actions>
      </Card>
    </View>
  );
}
