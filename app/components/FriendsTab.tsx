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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import useTheme from '@/hooks/useTheme';
import { useUser } from '@/context/UserContextProvider';
import { fetchWithAutoBase, getToken } from '@/api/auth';
import SlideUpSheet from './slideUpSheet';
import { TextInput } from 'react-native-paper';

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
  const [nameAsc, setNameAsc] = React.useState(true);
  const [query, setQuery] = React.useState('');

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

  const onRefresh = React.useCallback(() => {
    setHasMore(true);
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
        console.log('hello', item.username);
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
        {item.streak! > 0 && (
          <StatPill icon="flame-outline" value={item.streak!} />
        )}
        {item.highestStreak! > 0 && (
          <StatPill icon="trophy-outline" value={item.highestStreak!} />
        )}
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

  const visibleUsers = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? users.filter(u =>
          [u.fullName, u.username].some(v => v?.toLowerCase().includes(q))
        )
      : users;

    const sorted = [...base].sort((a, b) => {
      if (sortBy === 'name') {
        const cmp = (a.fullName || a.username).localeCompare(
          b.fullName || b.username
        );
        return nameAsc ? cmp : -cmp;
      }
      if (sortBy === 'current') {
        return (b.streak ?? -1) - (a.streak ?? -1); // desc
      }
      // 'highest'
      return (b.highestStreak ?? -1) - (a.highestStreak ?? -1); // desc
    });
    return sorted;
  }, [users, sortBy, nameAsc, query]);

  const StatPill = ({
    icon,
    value,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    value: number;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Ionicons name={icon} size={14} color={colors.text} />
      <Text
        style={{
          color: icon === 'trophy-outline' ? colors.text : colors.textMuted,
          marginLeft: 4,
          fontSize: 12,
        }}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <SlideUpSheet
      open={isFriendsOpen}
      onClose={() => setIsFriendsOpen(false)}
      onOpenStart={() => setSheetBusy(true)}
      onOpenEnd={() => setSheetBusy(false)}
      onCloseStart={() => setSheetBusy(true)}
      onCloseEnd={() => setSheetBusy(false)}
      backdropStyle={{ backgroundColor: 'transparent' }} // match Settings
      dismissOnBackdropPress={true}
      heightPct={0.9}
      sheetStyle={{ backgroundColor: 'transparent' }}
    >
      {/* panel container (styled similarly to Settings container) */}
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

        {/* top-right toggle button (parity with Settings) */}
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
            {!isFriendsOpen ? (
              <Ionicons name="close" size={15} color={colors.surface} />
            ) : (
              <Ionicons name="close" size={15} color={colors.surface} />
            )}
          </Text>
        </TouchableOpacity>
        <Pressable onPress={Keyboard.dismiss}>
          {/* list */}
          <SafeAreaView
            style={{
              height: '115%',
              paddingTop: 15,
              paddingBottom: 175,
              /* backgroundColor: 'red', */
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
            </View>

            <FlatList
              data={visibleUsers}
              keyExtractor={u => u._id}
              renderItem={renderItem}
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              onEndReachedThreshold={0.4}
              onEndReached={loadMore}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={<ListHeader />}
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
          </SafeAreaView>
        </Pressable>
        {/*  <View>
          <Text style={{ color: colors.text }}>All Users: {users.length}</Text>
        </View> */}
      </View>
    </SlideUpSheet>
  );
}
