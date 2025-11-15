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
  surface: '#FFFFFF',
  text: '#1E293B',
  textMuted: '#64748B',
  border: '#E2E8F0',
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  shadow: '#000000',
  gradients: {
    background: ['#F8FAFC', '#E2E8F0'],
    surface: ['#FFFFFF', '#F8FAFC'],
    primary: ['#3B82F6', '#1D4ED8'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626'],
    muted: ['#9CA3AF', '#6B7280'],
    empty: ['#F3F4F6', '#E5E7EB'],
    streak: ['#F97316', '#FACC15'],
  },
  backgrounds: {
    input: '#FFFFFF',
    editInput: '#FFFFFF',
  },
  statusBarStyle: 'dark-content',
};

const darkColors: ColorScheme = {
  bg: '#0F172A',
  surface: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#334155',
  primary: '#60A5FA',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  shadow: '#000000',
  gradients: {
    background: ['#0F172A', '#1E293B'],
    surface: ['#1E293B', '#334155'],
    primary: ['#3B82F6', '#1D4ED8'],
    success: ['#10B981', '#059669'],
    warning: ['#F59E0B', '#D97706'],
    danger: ['#EF4444', '#DC2626'],
    muted: ['#374151', '#4B5563'],
    empty: ['#111827', '#020617'],
    streak: ['#FB923C', '#FBBF24'],
  },
  backgrounds: {
    input: '#1E293B',
    editInput: '#0F172A',
  },
  statusBarStyle: 'light-content',
};

const forestColors: ColorScheme = {
  bg: '#06140E',
  surface: '#0D2218',
  text: '#E3F9ED',
  textMuted: '#94B8A5',
  border: '#1C3B2A',
  primary: '#34D399',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#F97373',
  shadow: '#000000',
  gradients: {
    background: ['#020A06', '#06140E'],
    surface: ['#0D2218', '#123225'],
    primary: ['#6EE7B7', '#059669'],
    success: ['#22C55E', '#15803D'],
    warning: ['#FACC15', '#CA8A04'],
    danger: ['#FB7185', '#B91C1C'],
    muted: ['#1F2933', '#243B30'],
    empty: ['#07110B', '#0B1510'],
    streak: ['#22C55E', '#84CC16'],
  },
  backgrounds: {
    input: '#0D2218',
    editInput: '#06140E',
  },
  statusBarStyle: 'light-content',
};

const amoledColors: ColorScheme = {
  bg: '#000000',
  surface: '#050505',
  text: '#F9FAFB',
  textMuted: '#6B7280',
  border: '#111827',
  primary: '#22C55E',
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#F97373',
  shadow: '#000000',
  gradients: {
    background: ['#000000', '#020617'],
    surface: ['#000000', '#050505'],
    primary: ['#22C55E', '#16A34A'],
    success: ['#22C55E', '#15803D'],
    warning: ['#FACC15', '#CA8A04'],
    danger: ['#F97373', '#B91C1C'],
    muted: ['#111827', '#020617'],
    empty: ['#020617', '#000000'],
    streak: ['#22C55E', '#4ADE80'],
  },
  backgrounds: {
    input: '#050505',
    editInput: '#000000',
  },
  statusBarStyle: 'light-content',
};

const roseColors: ColorScheme = {
  bg: '#FFF5F7',
  surface: '#FFFFFF',
  text: '#4A1020',
  textMuted: '#9F1239',
  border: '#FBCFE8',
  primary: '#E11D48',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  shadow: '#000000',
  gradients: {
    background: ['#FFF1F2', '#FCE7F3'],
    surface: ['#FFFFFF', '#FFE4E6'],
    primary: ['#FB7185', '#BE123C'],
    success: ['#22C55E', '#15803D'],
    warning: ['#FBBF24', '#D97706'],
    danger: ['#F97373', '#B91C1C'],
    muted: ['#F9A8D4', '#F472B6'],
    empty: ['#FCE7F3', '#FFE4E6'],
    streak: ['#FB7185', '#F97316'],
  },
  backgrounds: {
    input: '#FFFFFF',
    editInput: '#FFE4E6',
  },
  statusBarStyle: 'dark-content',
};

const sunsetColors: ColorScheme = {
  bg: '#FFF7ED',
  surface: '#FFFFFF',
  text: '#431407',
  textMuted: '#9A3412',
  border: '#FED7AA',
  primary: '#F97316',
  success: '#65A30D',
  warning: '#FACC15',
  danger: '#DC2626',
  shadow: '#000000',
  gradients: {
    background: ['#FFF7ED', '#FFE4E6'],
    surface: ['#FFFFFF', '#FFF7ED'],
    primary: ['#FDBA74', '#EA580C'],
    success: ['#A3E635', '#4D7C0F'],
    warning: ['#FACC15', '#EAB308'],
    danger: ['#F97373', '#B91C1C'],
    muted: ['#FCD34D', '#F59E0B'],
    empty: ['#FFE4E6', '#FFEDD5'],
    streak: ['#F97316', '#F59E0B'],
  },
  backgrounds: {
    input: '#FFFFFF',
    editInput: '#FFF7ED',
  },
  statusBarStyle: 'dark-content',
};

const midnightColors: ColorScheme = {
  bg: '#0A0218',
  surface: '#1A0933',
  text: '#E9D5FF',
  textMuted: '#C4B5FD',
  border: '#3F0071',
  primary: '#8B5CF6',
  success: '#22C55E',
  warning: '#EAB308',
  danger: '#EF4444',
  shadow: '#000000',
  gradients: {
    background: ['#0A0218', '#1A0933'],
    surface: ['#1A0933', '#3B0764'],
    primary: ['#8B5CF6', '#6D28D9'],
    success: ['#22C55E', '#15803D'],
    warning: ['#EAB308', '#CA8A04'],
    danger: ['#EF4444', '#B91C1C'],
    muted: ['#7C3AED', '#6D28D9'],
    empty: ['#1A0933', '#0A0218'],
    streak: ['#8B5CF6', '#A855F7'],
  },
  backgrounds: {
    input: '#1A0933',
    editInput: '#0A0218',
  },
  statusBarStyle: 'light-content',
};

const arcticColors: ColorScheme = {
  bg: '#E4F3FF',
  surface: '#F9FBFF',
  text: '#0F172A',
  textMuted: '#475569',
  border: '#C4D7F5',
  primary: '#0EA5E9',
  success: '#22C55E',
  warning: '#FACC15',
  danger: '#E11D48',
  shadow: '#000000',
  gradients: {
    background: ['#E4F3FF', '#BFDBFE'],
    surface: ['#F9FBFF', '#E0F2FE'],
    primary: ['#38BDF8', '#0EA5E9'],
    success: ['#6EE7B7', '#22C55E'],
    warning: ['#FACC15', '#EAB308'],
    danger: ['#F97373', '#E11D48'],
    muted: ['#C4D7F5', '#94A3B8'],
    empty: ['#E0F2FE', '#DBEAFE'],
    streak: ['#38BDF8', '#A5B4FC'],
  },
  backgrounds: {
    input: '#F9FBFF',
    editInput: '#E0F2FE',
  },
  statusBarStyle: 'dark-content',
};

const solarizedDarkColors: ColorScheme = {
  bg: '#002B36',
  surface: '#073642',
  text: '#EEE8D5',
  textMuted: '#93A1A1',
  border: '#0A3C4A',
  primary: '#268BD2',
  success: '#859900',
  warning: '#B58900',
  danger: '#DC322F',
  shadow: '#000000',
  gradients: {
    background: ['#002B36', '#073642'],
    surface: ['#073642', '#0A3C4A'],
    primary: ['#268BD2', '#005F87'],
    success: ['#859900', '#586E75'],
    warning: ['#B58900', '#996E00'],
    danger: ['#DC322F', '#B71C1C'],
    muted: ['#586E75', '#657B83'],
    empty: ['#073642', '#002B36'],
    streak: ['#B58900', '#CB4B16'],
  },
  backgrounds: {
    input: '#073642',
    editInput: '#002B36',
  },
  statusBarStyle: 'light-content',
};

const solarizedLightColors: ColorScheme = {
  bg: '#FDF6E3',
  surface: '#F9F1D8',
  text: '#586E75',
  textMuted: '#93A1A1',
  border: '#E4D8B4',
  primary: '#268BD2',
  success: '#859900',
  warning: '#B58900',
  danger: '#DC322F',
  shadow: '#000000',
  gradients: {
    background: ['#FDF6E3', '#EEE8D5'],
    surface: ['#FFFDF5', '#F9F1D8'],
    primary: ['#268BD2', '#6C71C4'],
    success: ['#859900', '#657B83'],
    warning: ['#B58900', '#CB4B16'],
    danger: ['#DC322F', '#CB4B16'],
    muted: ['#93A1A1', '#839496'],
    empty: ['#EEE8D5', '#FDF6E3'],
    streak: ['#B58900', '#CB4B16'],
  },
  backgrounds: {
    input: '#FFFDF5',
    editInput: '#FDF6E3',
  },
  statusBarStyle: 'dark-content',
};

const cyberColors: ColorScheme = {
  bg: '#020617',
  surface: '#020617',
  text: '#E5E7EB',
  textMuted: '#A5B4FC',
  border: '#4C1D95',
  primary: '#22D3EE',
  success: '#A3E635',
  warning: '#FACC15',
  danger: '#FB7185',
  shadow: '#000000',
  gradients: {
    background: ['#020617', '#0F172A'],
    surface: ['#020617', '#111827'],
    primary: ['#22D3EE', '#38BDF8'],
    success: ['#A3E635', '#4ADE80'],
    warning: ['#FACC15', '#EAB308'],
    danger: ['#FB7185', '#E11D48'],
    muted: ['#4C1D95', '#7C3AED'],
    empty: ['#020617', '#111827'],
    streak: ['#22D3EE', '#F472B6'],
  },
  backgrounds: {
    input: '#020617',
    editInput: '#030712',
  },
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
