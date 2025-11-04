import Constants from 'expo-constants';

export const isTunnel =
  Constants.expoConfig?.hostUri?.includes('exp') ||
  Constants.expoConfig?.hostUri?.includes('direct');

export const USE_NGROK = isTunnel;
