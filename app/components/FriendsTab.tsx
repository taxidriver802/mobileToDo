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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import useTheme from '@/hooks/useTheme';
import { useUser } from '@/context/UserContextProvider';
import { fetchWithAutoBase, getToken } from '@/api/auth';
import SlideUpSheet from './slideUpSheet';

type UserLite = {
  _id: string;
  username: string;
  fullName?: string;
  profilePic?: string;
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
        console.log('hello', item.profilePic);
      }}
    >
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
    </TouchableOpacity>
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
          Find Friends
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

        {/* list */}
        <SafeAreaView
          style={{ height: 'auto', paddingTop: 29 }}
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

          <FlatList
            data={users}
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
            /* style={{ marginTop: -45 }} */
          />
        </SafeAreaView>
      </View>
    </SlideUpSheet>
  );
}
