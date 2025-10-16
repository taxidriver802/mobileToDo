// api/env.ts
import Constants from 'expo-constants';

export const isTunnel =
  Constants.expoConfig?.hostUri?.includes('ngrok') ||
  Constants.expoConfig?.hostUri?.includes('tunnel');

export const USE_NGROK = isTunnel;
