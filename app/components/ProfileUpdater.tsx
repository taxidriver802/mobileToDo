import useTheme from '@/hooks/useTheme';
import { useUser } from '@/context/UserContextProvider';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';

type ProfileUpdaterProps = {
  handleNavButtons: (btn: 'updater') => void;
  sheetBusy?: boolean;
  isOpen?: boolean;
};

const ProfileUpdater: React.FC<ProfileUpdaterProps> = ({
  handleNavButtons,
  sheetBusy = false,
  isOpen = false,
}) => {
  const { colors } = useTheme();
  const { user, updateUser, updateProfilePic } = useUser();

  const [isEditingName, setIsEditingName] = React.useState(false);
  const [draftUsername, setDraftUsername] = React.useState(
    user?.username ?? ''
  );
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const [forceHidden, setForceHidden] = React.useState(true);

  async function uploadToCloudinary(uri: string): Promise<string> {
    const file = { uri, type: 'image/jpeg', name: 'avatar.jpg' } as any;
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', 'profile_pics'); // 👈 must be unsigned

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/dipywwx95/image/upload`,
      {
        method: 'POST',
        body: form as any,
      }
    );

    const json = await res.json();
    if (!res.ok || !json.secure_url)
      throw new Error(json.error?.message || 'Upload failed');
    return json.secure_url as string;
  }

  const handleProfilePic = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'Please allow photo access to change your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setUploading(true);

      const publicUrl = await uploadToCloudinary(asset.uri);

      await updateProfilePic(publicUrl);

      Alert.alert('Success', 'Profile photo updated!');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e?.message ?? 'Failed to update profile photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleUsername = async () => {
    if (!draftUsername?.trim()) {
      Alert.alert('Invalid username', 'Please enter a username.');
      return;
    }
    try {
      setSaving(true);
      await updateUser({ username: draftUsername.trim() });
      setIsEditingName(false);
      Alert.alert('Success', 'Username updated.');
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e?.message ?? 'Failed to update username.');
    } finally {
      setSaving(false);
    }
  };

  const HIDE_MS = 260;

  const hideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);

    if (isOpen) {
      setForceHidden(true);
      hideTimer.current = setTimeout(() => setForceHidden(false), HIDE_MS);
    } else {
      setForceHidden(true);
    }

    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [isOpen]);

  const isHidden = forceHidden || sheetBusy || !isOpen;
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        marginHorizontal: 'auto',
        height: '100%',
        width: '100%',
      }}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.bg,
            height: '100%',
            marginTop: 100,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          Update Profile
        </Text>
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.textMuted,
          }}
        >
          <View style={{ marginTop: 50 }}>
            <View
              style={{
                zIndex: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                width: 200,
                height: 200,
                marginHorizontal: 'auto',
                borderRadius: 100,
              }}
            >
              <Ionicons
                name="pencil-outline"
                size={20}
                color="white"
                style={{ position: 'absolute', left: 90, top: 85, zIndex: 2 }}
              />
            </View>
            <TouchableOpacity
              onPress={handleProfilePic}
              disabled={uploading}
              activeOpacity={0.8}
              style={{
                marginBottom: 50,
                borderWidth: 2.5,
                borderColor: 'white',
                borderRadius: 100,
                width: 200,
                height: 200,
                overflow: 'hidden',
                alignSelf: 'center',
                position: 'absolute',
              }}
            >
              {user?.profilePic !== 'default.jpg' ? (
                <Image
                  source={
                    user?.profilePic
                      ? { uri: user.profilePic }
                      : require('../../assets/images/profilePhoto.jpg')
                  }
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 100,
                    alignSelf: 'center',
                  }}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={200}
                  color={colors.text}
                  style={{ alignSelf: 'center' }}
                />
              )}
              {uploading && (
                <ActivityIndicator
                  style={{
                    position: 'absolute',
                    alignSelf: 'center',
                    top: 90,
                  }}
                />
              )}
            </TouchableOpacity>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 50,
              }}
            >
              {isEditingName ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    gap: 8,
                    width: '100%',
                  }}
                >
                  <TextInput
                    value={draftUsername}
                    onChangeText={setDraftUsername}
                    placeholder="New username"
                    placeholderTextColor={colors.textMuted}
                    style={{
                      minWidth: 180,
                      color: colors.text,
                      borderRadius: 8,
                      fontSize: 20,
                      fontWeight: '800',
                      paddingLeft: 105,
                    }}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={handleUsername}
                    disabled={saving}
                    style={{ padding: 6 }}
                  >
                    {saving ? (
                      <ActivityIndicator />
                    ) : (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                        style={{ paddingLeft: 30 }}
                      />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditingName(false);
                      setDraftUsername(user?.username ?? '');
                    }}
                    style={{ padding: 6 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={22}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.title,
                      { color: colors.text, paddingBottom: 5 },
                    ]}
                  >
                    {user?.username}
                  </Text>
                  <TouchableOpacity onPress={() => setIsEditingName(true)}>
                    <Text
                      style={{ position: 'absolute', right: -100, top: -10 }}
                    >
                      <Ionicons
                        name="pencil-outline"
                        size={20}
                        color={colors.primary}
                      />
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>
      </View>
      <Pressable
        style={[
          {
            backgroundColor: colors.primary,
            position: 'absolute',
            top: -26,
            right: 23,
            width: 34,
            height: 27,
            padding: 0,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 7,
            opacity: isHidden ? 0 : 1,
          },
        ]}
        onPress={() => handleNavButtons('updater')}
        disabled={isHidden}
        pointerEvents={isHidden ? 'none' : 'auto'}
      >
        <Text style={{ padding: 0 }}>
          <Ionicons
            name="close"
            size={15}
            color={colors.surface}
            style={{ padding: 0 }}
          />
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    borderRadius: 8,
    margin: 10,
    marginBottom: 100,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 3.84,
    height: 'auto',
  },
  text: { fontSize: 16, fontWeight: '500' },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  todoButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  close: { width: 25, position: 'absolute', top: 5, right: 5, borderRadius: 7 },
  logout: {
    color: 'rgba(160, 3, 3, 0.9)',
  },
});

export default ProfileUpdater;
