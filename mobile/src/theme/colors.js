/**
 * TruthLens Carbon Design System - Colors
 * 
 * To implement theme-aware components, do NOT import this file directly.
 * Instead, use the `useTheme` hook from `src/context/ThemeContext`:
 * 
 * const { theme } = useTheme();
 * const styles = getStyles(theme);
 */

const darkTheme = {
  isDarkMode: true,
  background: '#041824',
  backgroundAlt: '#071f2d',
  card: '#10253b',
  cardSoft: '#152c47',
  input: '#0a1d33',
  border: 'rgba(95, 140, 200, 0.18)',
  text: '#F4F8FC',
  textMuted: '#A7B4C7',
  textDim: '#708199',
  primary: '#1EC2FF',
  primaryDark: '#11A8E8',
  warning: '#F2C94C',
  danger: '#FF5B5B',
  success: '#27C46B',
  tabInactive: '#8F9EB2',
  shadow: '#0C9FE8',
  white: '#FFFFFF',
};

const lightTheme = {
  isDarkMode: false,
  background: '#F8F9FA',
  backgroundAlt: '#E9ECEF',
  card: '#FFFFFF',
  cardSoft: '#F8F9FA',
  input: '#F1F3F5',
  border: 'rgba(0, 0, 0, 0.1)',
  text: '#212529',
  textMuted: '#495057',
  textDim: '#6C757D',
  primary: '#1EC2FF',
  primaryDark: '#11A8E8',
  warning: '#F2C94C',
  danger: '#DC3545',
  success: '#28A745',
  tabInactive: '#ADB5BD',
  shadow: 'rgba(30, 194, 255, 0.2)',
  white: '#FFFFFF',
};

export { darkTheme, lightTheme };