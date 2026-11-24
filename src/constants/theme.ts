export const COLORS = {
  primary: '#A1CE50',
  primaryDark: '#87B538',
  primaryLight: '#F3F9E8',
  carbs: '#F54336',
  protein: '#FF981F',
  fat: '#1A96F0',
  water: '#1A96F0',
  steps: '#FF981F',
  weight: '#FF5726',
  success: '#4AAF57',
  warning: '#FF981F',
  danger: '#F54336',
  light: {
    background: '#F5F5F5',
    card: '#FFFFFF',
    inputBg: '#FAFAFA',
    inputBorder: '#EEEEEE',
    secondaryBtnBg: '#F3F9E8',
    text: '#212121',
    textSecondary: '#757575',
    textMuted: '#9E9E9E',
    divider: '#EEEEEE',
  },
  dark: {
    background: '#181A20',
    card: '#1F222A',
    inputBg: '#1F222A',
    inputBorder: '#35383F',
    secondaryBtnBg: '#35383F',
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',
    textMuted: '#9E9E9E',
    divider: '#2B2F3A',
  },
};

export type ThemeMode = 'light' | 'dark';

export function getThemeColors(mode: ThemeMode) {
  return {
    ...COLORS,
    ...COLORS[mode],
  };
}
