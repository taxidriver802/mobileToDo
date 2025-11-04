import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';

export interface ColorScheme {
  bg: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  success: string;
  warning: string;
  danger: string;
  shadow: string;
  gradients: {
    background: [string, string];
    surface: [string, string];
    primary: [string, string];
    success: [string, string];
    warning: [string, string];
    danger: [string, string];
    muted: [string, string];
    empty: [string, string];
    streak: [string, string];
  };
  backgrounds: {
    input: string;
    editInput: string;
  };
  statusBarStyle: 'light-content' | 'dark-content';
}

const lightColors: ColorScheme = {
  bg: '#F6FAF7',
  surface: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  shadow: '#000000',
  gradients: {
    background: ['#f8fafc', '#e2e8f0'],
    surface: ['#ffffff', '#f8fafc'],
    primary: ['#3b82f6', '#1d4ed8'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
    muted: ['#9ca3af', '#6b7280'],
    empty: ['#f3f4f6', '#e5e7eb'],
    streak: ['#f97316', '#facc15'],
  },
  backgrounds: {
    input: '#ffffff',
    editInput: '#ffffff',
  },
  statusBarStyle: 'dark-content' as const,
};

const darkColors: ColorScheme = {
  bg: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  border: '#334155',
  primary: '#60a5fa',
  success: '#34d399',
  warning: '#fbbf24',
  danger: '#f87171',
  shadow: '#000000',
  gradients: {
    background: ['#0f172a', '#1e293b'],
    surface: ['#1e293b', '#334155'],
    primary: ['#3b82f6', '#1d4ed8'],
    success: ['#10b981', '#059669'],
    warning: ['#f59e0b', '#d97706'],
    danger: ['#ef4444', '#dc2626'],
    muted: ['#374151', '#4b5563'],
    empty: ['#374151', '#4b5563'],
    streak: ['#fb923c', '#fbbf24'],
  },
  backgrounds: {
    input: '#1e293b',
    editInput: '#0f172a',
  },
  statusBarStyle: 'light-content' as const,
};

const forestColors: ColorScheme = {
  ...darkColors,
  bg: '#0b1d16',
  surface: '#12251d',
  primary: '#34d399',
  success: '#22c55e',
  warning: '#eab308',
  danger: '#f43f5e',
  gradients: {
    ...darkColors.gradients,
    primary: ['#34d399', '#0e766e'],
    background: ['#0b1d16', '#12251d'],
    streak: ['#22c55e', '#84cc16'],
  },
  backgrounds: { input: '#12251d', editInput: '#0b1d16' },
};

const amoledColors: ColorScheme = {
  ...darkColors,
  bg: '#000000',
  surface: '#0a0a0a',
  border: '#1f2937',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  gradients: {
    ...darkColors.gradients,
    streak: ['#0ea5e9', '#22d3ee'],
  },
  backgrounds: { input: '#0a0a0a', editInput: '#000000' },
};

const roseColors: ColorScheme = {
  ...lightColors,
  bg: '#6a016a5f',
  primary: '#e11d48',
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#dc2626',
  gradients: {
    ...lightColors.gradients,
    primary: ['#fb7185', '#be123c'],
    surface: ['#fff1f2', '#ffe4e6'],
    streak: ['#fb7185', '#f43f5e'],
  },
  backgrounds: { input: '#ffffff', editInput: '#fff1f2' },
};

const sunsetColors: ColorScheme = {
  ...lightColors,
  bg: '#FFF8F1',
  surface: '#FFFFFF',
  text: '#3C2A1E',
  textMuted: '#A16207',
  border: '#FED7AA',
  primary: '#F97316',
  success: '#84CC16',
  warning: '#FACC15',
  danger: '#DC2626',
  gradients: {
    background: ['#FFF8F1', '#FFE4E6'],
    surface: ['#FFFFFF', '#FFF7ED'],
    primary: ['#FDBA74', '#EA580C'],
    success: ['#A3E635', '#65A30D'],
    warning: ['#FACC15', '#EAB308'],
    danger: ['#F87171', '#B91C1C'],
    muted: ['#FCD34D', '#F59E0B'],
    empty: ['#FFE4E6', '#FFEDD5'],
    streak: ['#f97316', '#f59e0b'],
  },
  backgrounds: { input: '#FFFFFF', editInput: '#FFF7ED' },
  statusBarStyle: 'dark-content',
};

const midnightColors: ColorScheme = {
  ...darkColors,
  bg: '#0A0218',
  surface: '#1A0933',
  text: '#E9D5FF',
  textMuted: '#C4B5FD',
  border: '#3F0071',
  primary: '#8B5CF6',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  gradients: {
    background: ['#0A0218', '#1A0933'],
    surface: ['#1A0933', '#3B0764'],
    primary: ['#8B5CF6', '#6D28D9'],
    success: ['#22C55E', '#15803D'],
    warning: ['#EAB308', '#CA8A04'],
    danger: ['#EF4444', '#B91C1C'],
    muted: ['#7C3AED', '#6D28D9'],
    empty: ['#1A0933', '#0A0218'],
    streak: ['#8b5cf6', '#a855f7'],
  },
  backgrounds: { input: '#1A0933', editInput: '#0A0218' },
  statusBarStyle: 'light-content',
};

const arcticColors: ColorScheme = {
  ...lightColors,
  bg: '#E6F0FA',
  surface: '#FFFFFF',
  text: '#1A202C',
  textMuted: '#4A5568',
  border: '#CBD5E0',
  primary: '#3182CE',
  success: '#38B2AC',
  warning: '#ECC94B',
  danger: '#E53E3E',
  gradients: {
    background: ['#E6F0FA', '#D1E8FF'],
    surface: ['#FFFFFF', '#F7FAFC'],
    primary: ['#63B3ED', '#3182CE'],
    success: ['#38B2AC', '#2C7A7B'],
    warning: ['#ECC94B', '#D69E2E'],
    danger: ['#E53E3E', '#C53030'],
    muted: ['#CBD5E0', '#A0AEC0'],
    empty: ['#EDF2F7', '#E2E8F0'],
    streak: ['#63b3ed', '#38bdf8'],
  },
  backgrounds: { input: '#FFFFFF', editInput: '#EDF2F7' },
  statusBarStyle: 'dark-content',
};

const solarizedDarkColors: ColorScheme = {
  ...darkColors,
  bg: '#002B36',
  surface: '#073642',
  text: '#EEE8D5',
  textMuted: '#93A1A1',
  border: '#0A3C4A',
  primary: '#268BD2',
  success: '#859900',
  warning: '#B58900',
  danger: '#DC322F',
  gradients: {
    background: ['#002B36', '#073642'],
    surface: ['#073642', '#0A3C4A'],
    primary: ['#268BD2', '#005F87'],
    success: ['#859900', '#586E75'],
    warning: ['#B58900', '#996E00'],
    danger: ['#DC322F', '#B71C1C'],
    muted: ['#586E75', '#657B83'],
    empty: ['#073642', '#002B36'],
    streak: ['#b58900', '#cb4b16'],
  },
  backgrounds: { input: '#073642', editInput: '#002B36' },
  statusBarStyle: 'light-content',
};

const solarizedLightColors: ColorScheme = {
  ...lightColors,
  bg: '#FDF6E3',
  surface: '#FFFDF5',
  text: '#657B83',
  textMuted: '#93A1A1',
  border: '#E0DCC7',
  primary: '#268BD2',
  success: '#859900',
  warning: '#B58900',
  danger: '#DC322F',
  shadow: '#000000',
  gradients: {
    background: ['#FDF6E3', '#EEE8D5'],
    surface: ['#FFFDF5', '#FDF6E3'],
    primary: ['#268BD2', '#005F87'],
    success: ['#859900', '#586E75'],
    warning: ['#B58900', '#996E00'],
    danger: ['#DC322F', '#B71C1C'],
    muted: ['#93A1A1', '#839496'],
    empty: ['#EEE8D5', '#FDF6E3'],
    streak: ['#f59e0b', '#f97316'],
  },
  backgrounds: { input: '#FFFDF5', editInput: '#FDF6E3' },
  statusBarStyle: 'dark-content',
};

const cyberColors: ColorScheme = {
  ...darkColors,
  bg: '#050505',
  surface: '#101010',
  text: '#E0F2FE',
  textMuted: '#67E8F9',
  border: '#1E293B',
  primary: '#0EA5E9',
  success: '#22D3EE',
  warning: '#FACC15',
  danger: '#FB7185',
  gradients: {
    background: ['#050505', '#0F172A'],
    surface: ['#101010', '#1E293B'],
    primary: ['#0EA5E9', '#0284C7'],
    success: ['#22D3EE', '#06B6D4'],
    warning: ['#FACC15', '#CA8A04'],
    danger: ['#FB7185', '#E11D48'],
    muted: ['#334155', '#1E293B'],
    empty: ['#1E293B', '#0F172A'],
    streak: ['#22d3ee', '#0ea5e9'],
  },
  backgrounds: { input: '#1E293B', editInput: '#0F172A' },
  statusBarStyle: 'light-content',
};

export type ThemeName =
  | 'light'
  | 'dark'
  | 'forest'
  | 'amoled'
  | 'rose'
  | 'sunset'
  | 'midnight'
  | 'arctic'
  | 'solarizedDark'
  | 'solarizedLight'
  | 'cyber';

const THEMES: Record<ThemeName, ColorScheme> = {
  light: lightColors,
  dark: darkColors,
  forest: forestColors,
  amoled: amoledColors,
  rose: roseColors,
  sunset: sunsetColors,
  midnight: midnightColors,
  arctic: arcticColors,
  solarizedDark: solarizedDarkColors,
  solarizedLight: solarizedLightColors,
  cyber: cyberColors,
};

type ThemeContextType = {
  themeName: ThemeName;
  setTheme: (t: ThemeName) => void;
  toggleLightDark: () => void; // optional convenience
  colors: ColorScheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeName, setThemeName] = useState<ThemeName>('light');

  // 4) Migrate old boolean storage if present; otherwise use 'themeName'
  useEffect(() => {
    (async () => {
      const storedTheme = await AsyncStorage.getItem('themeName');
      if (storedTheme && storedTheme in THEMES) {
        setThemeName(storedTheme as ThemeName);
        return;
      }
      const legacyDark = await AsyncStorage.getItem('darkMode'); // legacy
      if (legacyDark) {
        const isDark = JSON.parse(legacyDark) as boolean;
        const migrated = isDark ? 'dark' : 'light';
        setThemeName(migrated);
        await AsyncStorage.multiRemove(['darkMode']);
        await AsyncStorage.setItem('themeName', migrated);
      }
    })();
  }, []);

  const setTheme = async (t: ThemeName) => {
    setThemeName(t);
    await AsyncStorage.setItem('themeName', t);
  };

  const toggleLightDark = () =>
    setTheme(themeName === 'light' ? 'dark' : 'light');

  const colors = useMemo(() => THEMES[themeName], [themeName]);

  return (
    <ThemeContext.Provider
      value={{ themeName, setTheme, toggleLightDark, colors }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};

export default useTheme;
