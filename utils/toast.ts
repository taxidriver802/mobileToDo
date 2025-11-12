// utils/toast.ts
import Toast, { ToastShowParams } from 'react-native-toast-message';

// Keep these in sync with what your custom renderer reads in createToastConfig
export type CustomToastExtras = {
  icon?: 'checkmark-circle' | 'alert-circle' | 'information-circle' | 'trophy';
  accentColor?: string;
  avatarUrl?: string;
};

type CommonOpts = Partial<
  Pick<ToastShowParams, 'position' | 'autoHide' | 'visibilityTime' | 'onPress'>
>;

// --- Existing helpers ---
export const showSuccess = (
  message: string,
  message2: string,
  opts?: CommonOpts
) =>
  Toast.show({
    type: 'success',
    text1: message,
    text2: message2,
    position: opts?.position ?? 'bottom',
    visibilityTime: opts?.visibilityTime ?? 3000,
    autoHide: opts?.autoHide ?? true,
    onPress: opts?.onPress,
  } satisfies ToastShowParams);

export const showError = (
  message: string,
  message2: string,
  opts?: CommonOpts
) =>
  Toast.show({
    type: 'error',
    text1: message,
    text2: message2,
    position: opts?.position ?? 'top',
    visibilityTime: opts?.visibilityTime ?? 4000,
    autoHide: opts?.autoHide ?? false,
    onPress: opts?.onPress,
  } satisfies ToastShowParams);

// --- Upgraded custom: accepts subtitle + extra props + options ---
export const showCustom = (
  title: string,
  subtitle?: string,
  opts?: CommonOpts,
  extras?: CustomToastExtras
) =>
  Toast.show({
    type: 'customToast',
    text1: title,
    text2: subtitle,
    position: opts?.position ?? 'bottom',
    visibilityTime: opts?.visibilityTime ?? 3500,
    autoHide: opts?.autoHide ?? true,
    onPress: opts?.onPress,
    props: extras as any,
  } satisfies ToastShowParams);
