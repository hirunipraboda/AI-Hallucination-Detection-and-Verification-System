import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function GlassCard({ children, style }) {
  const { theme } = useTheme();
  
  return <View style={[stylesContainer(theme).card, style]}>{children}</View>;
}

const stylesContainer = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
});