import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function LearningScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Learning</Text>
      <Text style={styles.text}>
        Educational content about hallucination detection can be added here.
      </Text>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: theme.text,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 12,
  },
  text: {
    color: theme.textMuted,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
  },
});