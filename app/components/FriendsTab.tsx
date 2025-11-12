// app/(tabs)/FriendsTab.tsx
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import useTheme from '@/hooks/useTheme';
import { useUser } from '@/context/UserContextProvider';
import { fetchWithAutoBase, getToken } from '@/api/auth';
import SlideUpSheet from './slideUpSheet';
import { Button, TextInput, Card, Divider } from 'react-native-paper';
import { fetchRelationships } from '@/api/me';
import { showConfirmToast } from '@/utils/toast';
import FriendProfileCard from './FriendProfileCard';

type UserLite = {
  _id: string;
  username: string;
  fullName?: string;
  profilePic?: string;
  streak?: number;
  highestStreak?: number;
};

type UsersResponse = {
  data: UserLite[];
  page: number;
  pageSize: number;
  total: number;
};

const PAGE_SIZE = 25;

type FriendsTabProps = {
  isFriendsOpen: boolean;
  setIsFriendsOpen: (open: boolean) => void;
  handleNavButtons?: (btn: 'friends' | 'settings' | 'updater') => void;
};

export default function FriendsTab({
  isFriendsOpen,
  setIsFriendsOpen,
  handleNavButtons,
}: FriendsTabProps) {
  const { colors } = useTheme();
  const { user: currentUser } = useUser();

  const [users, setUsers] = React.useState<UserLite[]>([]);
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [sheetBusy, setSheetBusy] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'current' | 'highest' | 'name'>(
    'current'
  );
  const [meLocal, setMeLocal] = React.useState(() => ({
    friends: new Set<string>(),
    sent: new Set<string>(),
    received: new Set<string>(),
  }));
  const [nameAsc, setNameAsc] = React.useState(true);
  const [query, setQuery] = React.useState('');

  const [rels, setRels] = React.useState<{
    meId: string;
    friends: Set<string>;
    sent: Set<string>;
    received: Set<string>;
  } | null>(null);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);

  const openProfile = (user: any) => {
    setSelectedUser(user);
    setProfileOpen(true);
  };
  const closeProfile = () => {
    setProfileOpen(false);
    /* setSelectedUser(null); */
  };

  const loadRelationships = React.useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const r = await fetchRelationships(token);
    setRels({
      meId: r.meId,
      friends: new Set(r.friends),
      sent: new Set(r.sent),
      received: new Set(r.received),
    });
  }, []);

  React.useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  const abortRef = React.useRef<AbortController | null>(null);

  const fetchPage = React.useCallback(
    async (nextPage: number, mode: 'append' | 'replace') => {
      if (!currentUser?.id) return;

      setErrorMsg(null);
      if (mode === 'replace') setIsRefreshing(true);
      else setIsLoading(true);

      const token = await getToken();

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (typeof token === 'string' && token.length > 0) {
        headers.Authorization = `Bearer ${token}`;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const url = `/api/users?page=${nextPage}&pageSize=${PAGE_SIZE}`;

        const res = await fetchWithAutoBase(url, {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 401) {
            setErrorMsg(
              'Session expired or unauthorized. Please log in again.'
            );
            setHasMore(false);
            return;
          }
          throw new Error(`Request failed (${res.status})`);
        }

        const json: UsersResponse = await res.json();
        const filtered = json.data.filter(u => u._id !== currentUser.id);

        setUsers(prev =>
          mode === 'replace' ? filtered : [...prev, ...filtered]
        );

        const received = filtered.length;
        const noMore =
          received < PAGE_SIZE || json.page * json.pageSize >= json.total;
        setHasMore(!noMore);
        setPage(nextPage);
      } catch (err: any) {
        if (err?.name !== 'AbortError')
          setErrorMsg(err?.message ?? 'Something went wrong.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUser?.id]
  );

  React.useEffect(() => {
    if (isFriendsOpen) {
      fetchPage(1, 'replace');
    } else {
      abortRef.current?.abort();
    }
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFriendsOpen]);

  type RelationshipStatus =
    | 'self'
    | 'friends'
    | 'request_sent'
    | 'request_received'
    | 'none';

  type RowActionsProps = {
    status: RelationshipStatus | undefined;
    userId: string;
    user: UserLite;
    onAdd: (id: string) => void;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    onUnfriend: (id: string) => void;
  };

  const onRefresh = React.useCallback(() => {
    setHasMore(true);
    setMeLocal({ friends: new Set(), sent: new Set(), received: new Set() });
    fetchPage(1, 'replace');
  }, [fetchPage]);

  const loadMore = React.useCallback(() => {
    if (isLoading || !hasMore || users.length === 0) return;
    fetchPage(page + 1, 'append');
  }, [fetchPage, isLoading, hasMore, page, users.length]);

  const renderItem: ListRenderItem<UserLite> = ({ item }) => (
    <TouchableOpacity
      disabled={sheetBusy}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        gap: 12,
      }}
      onPress={() => {
        openProfile(item);
      }}
    >
      {/* avatar */}
      {item?.profilePic && item.profilePic !== 'default.jpg' ? (
        <Image
          source={{ uri: item.profilePic }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
          }}
        />
      ) : item?.profilePic === 'default.jpg' ? (
        <Ionicons
          name="person-circle-outline"
          size={40}
          color={colors.textMuted}
        />
      ) : (
        <Image
          source={require('../../assets/images/adaptive-icon.png')}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.surface,
          }}
        />
      )}

      {/* name + handle */}
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          {item.fullName || item.username}
        </Text>
        {!!item.fullName && (
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            @{item.username}
          </Text>
        )}
      </View>

      {/* streak pills (right-aligned) */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View style={{ flexDirection: 'column', gap: 3 }}>
          {(item.streak ?? 0) > 0 && (
            <StatPill
              icon="flame-outline"
              value={item.streak ?? 0}
              active={sortBy === 'current'}
            />
          )}
          {(item.highestStreak ?? 0) > 0 && (
            <StatPill
              icon="trophy-outline"
              value={item.highestStreak ?? 0}
              active={sortBy === 'highest'}
            />
          )}
        </View>
        <RenderFriendActions
          status={relationshipStatus(item._id)}
          userId={item._id}
          user={item}
          onAdd={onAdd}
          onAccept={onAccept}
          onDecline={onDecline}
          onUnfriend={onUnfriend}
        />
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View
      style={{
        paddingHorizontal: 8,
        paddingTop: 6,
        gap: 10,
      }}
    >
      {/* chips */}
      <View
        style={{
          flexDirection: 'row',
          gap: 5,
          justifyContent: 'center',
        }}
      >
        {[
          {
            key: 'current' as const,
            label: 'Current',
            icon: 'flame-outline' as const,
            a11y: 'Sort by current streak',
          },
          {
            key: 'highest' as const,
            label: 'All-time',
            icon: 'trophy-outline' as const,
            a11y: 'Sort by highest all-time streak',
          },
          {
            key: 'name' as const,
            label: nameAsc ? 'A→Z' : 'Z→A',
            icon: 'swap-vertical-outline' as const,
            a11y: `Sort by name ${nameAsc ? 'A to Z' : 'Z to A'}`,
          },
        ].map(opt => {
          const active = sortBy === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => {
                if (opt.key === 'name') {
                  if (sortBy === 'name') setNameAsc(v => !v);
                  setSortBy('name');
                } else {
                  setSortBy(opt.key);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel={opt.a11y}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: active ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Ionicons
                name={opt.icon}
                size={14}
                color={active ? colors.surface : colors.text}
              />
              <Text style={{ color: active ? colors.surface : colors.text }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const baseComparator = React.useCallback(
    (a: any, b: any) => {
      if (sortBy === 'name') {
        const aName = (a.fullName || a.username || '').toString();
        const bName = (b.fullName || b.username || '').toString();
        const cmp = aName.localeCompare(bName);
        return nameAsc ? cmp : -cmp;
      }
      if (sortBy === 'current') {
        return (b.streak ?? -1) - (a.streak ?? -1); // desc
      }
      // 'highest'
      return (b.highestStreak ?? -1) - (a.highestStreak ?? -1); // desc
    },
    [sortBy, nameAsc]
  );

  const visibleUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? users.filter(u =>
          [u.fullName, u.username].some(v => v?.toLowerCase().includes(q))
        )
      : users;

    // keep your previous secondary sort for within-tier ordering
    return [...base].sort(baseComparator);
  }, [users, query, baseComparator]);

  const sortedVisibleUsers = React.useMemo(() => {
    const friends = rels?.friends ?? new Set<string>();
    const sent = rels?.sent ?? new Set<string>();
    const received = rels?.received ?? new Set<string>();

    const tier = (u: any) => {
      const id = String(u._id ?? u.id);
      if (friends.has(id)) return 0;
      if (received.has(id)) return 1;
      if (sent.has(id)) return 2;
      return 3;
    };

    return [...visibleUsers].sort((a, b) => {
      const ta = tier(a);
      const tb = tier(b);
      if (ta !== tb) return ta - tb;
      return baseComparator(a, b);
    });
  }, [visibleUsers, rels, baseComparator]);

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

  const meSets = React.useMemo(() => {
    const friends = new Set((currentUser?.friends ?? []).map(String));
    const sent = new Set((currentUser?.friendRequests?.sent ?? []).map(String));
    const received = new Set(
      (currentUser?.friendRequests?.received ?? []).map(String)
    );

    // overlay (optimistic)
    meLocal.friends.forEach(id => friends.add(id));
    meLocal.sent.forEach(id => sent.add(id));
    meLocal.received.forEach(id => received.add(id));

    return { friends, sent, received };
  }, [
    currentUser?.friends,
    currentUser?.friendRequests?.sent,
    currentUser?.friendRequests?.received,
    meLocal,
  ]);

  const relationshipStatus = React.useCallback(
    (otherUserId: string) => {
      if (!rels) return 'none' as const;
      if (rels.meId === otherUserId) return 'self';
      if (rels.friends.has(otherUserId)) return 'friends';
      if (rels.sent.has(otherUserId)) return 'request_sent';
      if (rels.received.has(otherUserId)) return 'request_received';
      return 'none';
    },
    [rels]
  );

  function RenderFriendActions({
    status,
    userId,
    user,
    onAdd,
    onAccept,
    onDecline,
    onUnfriend,
  }: RowActionsProps) {
    if (!status) return null;

    const pillStyle = {
      borderRadius: 999,
      height: 40,
    };
    const pillContent = {
      height: 40,
      paddingHorizontal: 8,
    };

    switch (status) {
      case 'self':
        return null;

      case 'none': // Add
        return (
          <Button
            mode="contained"
            compact
            style={pillStyle}
            contentStyle={pillContent}
            buttonColor={colors.surface}
            textColor={colors.primary}
            onPress={() => onAdd(userId)}
          >
            Add
          </Button>
        );

      case 'request_sent': // Pending
        return (
          <Button
            mode="contained"
            compact
            labelStyle={{ color: colors.primary }}
            style={[
              pillStyle,
              {
                backgroundColor: colors.surface,
                opacity: 0.5,
                paddingHorizontal: 3,
                borderColor: colors.border,
              },
            ]}
            contentStyle={pillContent}
            disabled
          >
            <Text>
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </Text>
          </Button>
        );

      case 'request_received': // Accept / Decline
        return (
          <View style={{ flexDirection: 'column', gap: 8 }}>
            <Button
              mode="text"
              compact
              style={[
                pillStyle,
                {
                  backgroundColor: colors.surface,
                  paddingHorizontal: 3,
                  borderColor: colors.border,
                },
              ]}
              contentStyle={pillContent}
              onPress={() => onAccept(userId)}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
              />
            </Button>
            {/* <Button
              mode="text"
              compact
              style={[pillStyle]}
              contentStyle={pillContent}
              onPress={() => onDecline(userId)}
            >
              <Ionicons name="close-circle" size={20} color={colors.danger} />
            </Button> */}
          </View>
        );

      case 'friends': // Unfriend
        return (
          <View style={{ width: 57 }}>
            <Button
              mode="outlined"
              compact
              style={[pillStyle, { borderColor: colors.border }]}
              textColor={colors.primary}
              onPress={() => openProfile(user)}
            >
              <Text>
                <Ionicons name="person-outline" size={16} />
              </Text>
            </Button>
          </View>
        );

      default:
        return null;
    }
  }

  const onAdd = async (id: string) => {
    try {
      await fetchWithAutoBase(`/api/friends/request/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
    } finally {
      await loadRelationships();
    }
  };

  const onAccept = async (id: string) => {
    try {
      await fetchWithAutoBase(`/api/friends/accept/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
    } finally {
      await loadRelationships();
    }
  };

  const onDecline = async (id: string) => {
    const confirmed = await new Promise<boolean>(resolve => {
      Alert.alert(
        'Decline request?',
        'Are you sure you want to decline this friend request?',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          {
            text: 'Decline',
            style: 'destructive',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: true }
      );
    });

    if (!confirmed) return;

    try {
      await fetchWithAutoBase(`/api/friends/decline/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
    } finally {
      await loadRelationships();
    }
  };

  const onUnfriend = async (id: string) => {
    const confirmed = await showConfirmToast(
      'Unfriend this user?',
      "They won't see your updates anymore.",
      {
        icon: 'person-remove-outline',
        accentColor: '#FF6B6B',
        backgroundColorOpt: '#1E1E2A',
      }
    );

    if (!confirmed) return;

    try {
      await fetchWithAutoBase(`/api/friends/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
    } finally {
      await loadRelationships();
    }
  };

  const selectedUserWithStatus = React.useMemo(() => {
    if (!selectedUser) return null;
    return {
      ...selectedUser,
      relationshipStatus: relationshipStatus(selectedUser._id),
    };
  }, [selectedUser, relationshipStatus]);

  return (
    <>
      <SlideUpSheet
        open={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        onOpenStart={() => setSheetBusy(true)}
        onOpenEnd={() => setSheetBusy(false)}
        onCloseStart={() => setSheetBusy(true)}
        onCloseEnd={() => setSheetBusy(false)}
        backdropStyle={{ backgroundColor: 'transparent' }}
        dismissOnBackdropPress
        heightPct={0.9}
        sheetStyle={{ backgroundColor: 'transparent' }}
      >
        {/* panel container */}
        <View
          style={{
            padding: 25,
            borderRadius: 8,
            marginHorizontal: 10,
            marginTop: 100,
            marginBottom: 100,
            backgroundColor: colors.bg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.75,
            shadowRadius: 3.84,
            maxHeight: 'auto',
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            Users Streaks
          </Text>

          {/* top-right toggle button  */}
          <TouchableOpacity
            disabled={sheetBusy}
            style={{
              backgroundColor: colors.primary,
              position: 'absolute',
              top: -40,
              right: 13,
              width: 34,
              height: 27,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 7,
            }}
            onPress={() => {
              if (handleNavButtons) handleNavButtons('friends');
              else setIsFriendsOpen(false);
            }}
          >
            <Text>
              <Ionicons name="close" size={15} color={colors.surface} />
            </Text>
          </TouchableOpacity>
          <Pressable onPress={Keyboard.dismiss}>
            {/* list */}
            <SafeAreaView
              style={{
                height: '115%',
                paddingTop: 15,
                paddingBottom: 175,
              }}
              edges={['left', 'right', 'bottom']}
            >
              {errorMsg ? (
                <View style={{ padding: 16 }}>
                  <Text style={{ color: colors.danger }}>{errorMsg}</Text>
                  <TouchableOpacity
                    disabled={sheetBusy}
                    onPress={onRefresh}
                    style={{
                      marginTop: 8,
                      alignSelf: 'flex-start',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.primary,
                    }}
                  >
                    <Text style={{ color: colors.primary }}>Try again</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* search */}
              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: colors.surface,
                  height: 40,
                }}
              >
                <TextInput
                  placeholder="Search users"
                  placeholderTextColor={colors.textMuted}
                  onChangeText={setQuery}
                  value={query}
                  mode="flat"
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  submitBehavior="blurAndSubmit"
                  returnKeyType="done"
                  style={{
                    color: colors.text,
                    height: 24,
                    backgroundColor: 'transparent',
                  }}
                />
                <View
                  style={{
                    height: 50,
                    marginTop: 10,
                    borderBottomWidth: 3,
                    borderRadius: 15,
                    borderColor: colors.border,
                  }}
                >
                  <ListHeader />
                </View>
              </View>
              <View
                style={{
                  paddingTop: 52,
                  paddingBottom: 50,
                }}
              >
                <FlatList
                  data={sortedVisibleUsers}
                  keyExtractor={u => u._id}
                  renderItem={renderItem}
                  refreshing={isRefreshing}
                  onRefresh={onRefresh}
                  onEndReachedThreshold={0.4}
                  onEndReached={loadMore}
                  showsVerticalScrollIndicator={false}
                  ListFooterComponent={
                    isLoading ? (
                      <View style={{ paddingVertical: 16 }}>
                        <ActivityIndicator />
                      </View>
                    ) : null
                  }
                  ListEmptyComponent={
                    !isLoading && !isRefreshing ? (
                      <View style={{ padding: 16 }}>
                        <Text style={{ color: colors.textMuted }}>
                          No users found yet.
                        </Text>
                      </View>
                    ) : null
                  }
                  keyboardDismissMode="on-drag"
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </SafeAreaView>
          </Pressable>
        </View>
      </SlideUpSheet>
      <SlideUpSheet
        open={profileOpen}
        onClose={closeProfile}
        onOpenStart={() => setSheetBusy(true)}
        onOpenEnd={() => setSheetBusy(false)}
        onCloseStart={() => setSheetBusy(true)}
        onCloseEnd={() => {
          setSheetBusy(false);
          setSelectedUser(null);
        }}
        backdropStyle={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        dismissOnBackdropPress
        heightPct={0.6}
        sheetStyle={{ backgroundColor: 'transparent' }}
      >
        <View
          style={{
            flex: 1,
            padding: 20,
            marginHorizontal: 10,
            backgroundColor: colors.bg,
            borderRadius: 12,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.75,
            shadowRadius: 3.84,
          }}
        >
          {selectedUser ? (
            <FriendProfileCard
              user={selectedUserWithStatus}
              sortBy={sortBy}
              onMessage={id => {
                // TODO: navigate to chat screen
                closeProfile();
              }}
              onUnfriend={async id => {
                await onUnfriend(id);
                await loadRelationships();
              }}
              onClose={closeProfile}
              onAdd={async id => {
                await onAdd(id);
                await loadRelationships();
              }}
            />
          ) : (
            <View />
          )}
        </View>
      </SlideUpSheet>
    </>
  );
}
