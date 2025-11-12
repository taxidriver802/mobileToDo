// RelationshipActions.tsx
import * as React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import useTheme from '@/hooks/useTheme';

export type RelationshipStatus =
  | 'friends'
  | 'request_sent'
  | 'request_received'
  | 'none'
  | 'self';

type BaseProps = {
  compact?: boolean;
  onClose?: () => void;
  // common callbacks
  onMessage?: (userId: string) => Promise<void> | void;
  onSendRequest?: (userId: string) => Promise<void> | void;
  onCancelRequest?: (userId: string) => Promise<void> | void;
  onAccept?: (userId: string) => Promise<void> | void;
  onDecline?: (userId: string) => Promise<void> | void;
  onUnfriend?: (userId: string) => Promise<void> | void;
  // colors (optional)
  colors?: {
    danger?: string; // e.g. '#e74c3c'
    primary?: string; // e.g. theme primary
    surface?: string; // chip/surface bg
    border?: string; // outline border
    text?: string; // default text
    muted?: string; // subtle text
    success?: string; // accept
    warning?: string; // pending/cancel
    bg?: string;
    textMuted?: string;
  };
};

type ActionProps = BaseProps & {
  userId: string;
  busy?: boolean;
};

const Row: React.FC<React.PropsWithChildren> = ({ children }) => (
  <View style={{ flexDirection: 'row', gap: 8 }}>{children}</View>
);

/* FRIENDS */
export const FriendsActions: React.FC<ActionProps> = ({
  userId,
  busy,
  onUnfriend,
  onMessage,
  onClose,
  compact = true,
  colors,
}) => (
  <Row>
    <Button
      mode="outlined"
      compact={compact}
      disabled={busy}
      textColor={colors?.danger ?? '#e74c3c'}
      style={{ borderColor: colors?.danger ?? '#e74c3c' }}
      icon={() => (
        <Ionicons
          name="person-remove-outline"
          size={16}
          color={colors?.danger ?? '#e74c3c'}
        />
      )}
      onPress={async () => {
        await onUnfriend?.(userId);
        onClose?.();
      }}
      accessibilityLabel="Unfriend"
    >
      Unfriend
    </Button>

    <Button
      mode="contained-tonal"
      compact={compact}
      disabled={busy}
      icon={() => <Ionicons name="chatbubble-ellipses-outline" size={16} />}
      onPress={async () => {
        await onMessage?.(userId);
        onClose?.();
      }}
      accessibilityLabel="Message"
    >
      Message
    </Button>
  </Row>
);

/* REQUEST SENT */
export const RequestSentActions: React.FC<ActionProps> = ({
  userId,
  busy,
  onCancelRequest,
  compact = true,
  colors,
}) => {
  const theme = useTheme();

  // MD3-friendly defaults with your overrides
  const pendingBg = colors?.surface ?? theme.colors.surface;
  const pendingFg = colors?.primary ?? theme.colors.primary;
  const warning = colors?.warning ?? '#c27c2c';

  return (
    <Row>
      {/* PENDING () */}
      <Button
        mode="contained"
        compact={compact}
        buttonColor={pendingBg} // background for tonal button
        textColor={pendingFg} // label color
        icon={() => (
          <Ionicons name="time-outline" size={16} color={pendingFg} />
        )}
        accessibilityLabel="Pending friend request"
      >
        Requested
      </Button>

      {/* CANCEL (outlined) */}
      <Button
        mode="outlined"
        compact={compact}
        disabled={busy}
        textColor={warning} // label color
        style={{ borderColor: warning }} // outline color
        theme={{ colors: { primary: warning } }} // ripple/focus tint
        icon={() => <Ionicons name="close-outline" size={16} color={warning} />}
        onPress={async () => {
          await onCancelRequest?.(userId);
        }}
        accessibilityLabel="Cancel friend request"
      >
        Cancel
      </Button>
    </Row>
  );
};

/* REQUEST RECEIVED */
export const RequestReceivedActions: React.FC<ActionProps> = ({
  userId,
  busy,
  onAccept,
  onDecline,
  compact = true,
  colors,
}) => (
  <Row>
    <Button
      mode="contained"
      compact={compact}
      disabled={busy}
      textColor={colors?.primary ?? '#363736ff'}
      style={{
        borderWidth: 1,
        borderColor: colors?.primary ?? '#3d3b3bff',
        backgroundColor: colors?.border,
      }}
      icon={() => (
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color={colors?.primary}
        />
      )}
      onPress={async () => {
        await onAccept?.(userId);
      }}
      accessibilityLabel="Accept friend request"
    >
      Accept
    </Button>

    <Button
      mode="outlined"
      compact={compact}
      disabled={busy}
      textColor={colors?.danger ?? '#e74c3c'}
      style={{ borderWidth: 0 }}
      icon={() => (
        <Ionicons
          name="close-circle-outline"
          size={16}
          color={colors?.danger ?? '#e74c3c'}
        />
      )}
      onPress={async () => {
        await onDecline?.(userId);
      }}
      accessibilityLabel="Decline friend request"
    >
      Decline
    </Button>
  </Row>
);

/* NONE (no relationship) */
export const NoneActions: React.FC<ActionProps> = ({
  userId,
  busy,
  onSendRequest,
  compact = true,
  colors,
}) => {
  const theme = useTheme();
  const primary = colors?.primary ?? theme.colors.primary;
  const onPrimary = (theme.colors as any).onPrimary ?? colors?.text;

  return (
    <Row>
      <Button
        mode="contained"
        compact={compact}
        disabled={busy}
        buttonColor={primary} // <— background
        textColor={onPrimary} // <— label color
        icon={() => (
          <Ionicons name="person-add-outline" size={16} color={onPrimary} />
        )}
        onPress={async () => {
          await onSendRequest?.(userId);
        }}
        accessibilityLabel="Send friend request"
      >
        Add Friend
      </Button>
    </Row>
  );
};

/* SELF */
export const SelfActions: React.FC = () => (
  <Row>{/* Intentionally empty / or show nothing */}</Row>
);

/* WRAPPER that picks the right one */
export const RelationshipActions: React.FC<
  ActionProps & { status: RelationshipStatus }
> = props => {
  const { status } = props;

  switch (status) {
    case 'friends':
      return <FriendsActions {...props} />;
    case 'request_sent':
      return <RequestSentActions {...props} />;
    case 'request_received':
      return <RequestReceivedActions {...props} />;
    case 'none':
      return <NoneActions {...props} />;
    case 'self':
    default:
      return <SelfActions />;
  }
};
