import Ionicons from '@expo/vector-icons/Ionicons';
import Toast, { ToastShowParams } from 'react-native-toast-message';

// Keep these in sync with what your custom renderer reads in createToastConfig
export type CustomToastExtras = {
  icon?: React.ComponentProps<typeof Ionicons>['name'] | React.ReactElement;
  accentColor?: string;
  backgroundColorOpt?: string;
  avatarUrl?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

type ConfirmOpts = {
  confirmText?: string;
  cancelText?: string;
  icon?: CustomToastExtras['icon'];
  accentColor?: string;
  backgroundColorOpt?: string;
};

type CommonOpts = Partial<
  Pick<ToastShowParams, 'position' | 'autoHide' | 'visibilityTime' | 'onPress'>
>;

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

export const showConfirmToast = (
  title: string,
  subtitle?: string,
  extra?: ConfirmOpts
) =>
  new Promise<boolean>(resolve => {
    const settle = (ok: boolean) => {
      Toast.hide();
      resolve(ok);
    };

    Toast.hide();

    showCustom(
      title,
      subtitle,
      { position: 'bottom', autoHide: false, visibilityTime: 60000 },
      {
        icon: extra?.icon,
        accentColor: extra?.accentColor,
        backgroundColorOpt: extra?.backgroundColorOpt, // <-- thread through
        confirmText: extra?.confirmText ?? 'Unfriend',
        cancelText: extra?.cancelText ?? 'Cancel',
        onConfirm: () => settle(true),
        onCancel: () => settle(false),
      }
    );
  });
