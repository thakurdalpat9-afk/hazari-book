import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const COLORS = {
  primary: '#0B7A4B',
  primaryDark: '#095C39',
  primaryLight: '#10A062',
  primarySoft: '#E6F4EE',
  accent: '#F59E0B',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  info: '#2563EB',
};

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  dark: false,
  colors: {
    surface: '#FFFFFF',
    background: '#F4F6F8',
    card: '#FFFFFF',
    text: '#0F172A',
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
    border: '#E2E8F0',
    borderSoft: '#F1F5F9',
    inputBg: '#F8FAFC',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#F59E0B',
    warningSoft: '#FEF3C7',
    error: '#DC2626',
    errorSoft: '#FEE2E2',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
    primary: COLORS.primary,
    primaryDark: COLORS.primaryDark,
    primaryLight: COLORS.primaryLight,
    primarySoft: COLORS.primarySoft,
    shadow: 'rgba(15, 23, 42, 0.08)',
    overlay: 'rgba(15, 23, 42, 0.4)',
    tabBar: '#FFFFFF',
    tabBarActive: COLORS.primary,
    tabBarInactive: '#94A3B8',
  },
};

export const darkTheme = {
  dark: true,
  colors: {
    surface: '#0F172A',
    background: '#0B1220',
    card: '#16202E',
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    border: '#1E293B',
    borderSoft: '#1A2533',
    inputBg: '#1A2533',
    success: '#22C55E',
    successSoft: '#0F2A1C',
    warning: '#FBBF24',
    warningSoft: '#2A2010',
    error: '#EF4444',
    errorSoft: '#2A1010',
    info: '#3B82F6',
    infoSoft: '#0F1F3A',
    primary: COLORS.primaryLight,
    primaryDark: COLORS.primary,
    primaryLight: COLORS.primaryLight,
    primarySoft: '#0F2A1C',
    shadow: 'rgba(0, 0, 0, 0.4)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    tabBar: '#0F172A',
    tabBarActive: COLORS.primaryLight,
    tabBarInactive: '#475569',
  },
};

export type AppTheme = typeof lightTheme;

export const navLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: '#F4F6F8',
    card: '#FFFFFF',
    text: '#0F172A',
    border: '#E2E8F0',
    notification: COLORS.error,
  },
};

export const navDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primaryLight,
    background: '#0B1220',
    card: '#16202E',
    text: '#F1F5F9',
    border: '#1E293B',
    notification: COLORS.error,
  },
};
