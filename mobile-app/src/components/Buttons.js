import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export function PrimaryButton({ title, onPress }) {
  return (
    <Pressable style={styles.primary} onPress={onPress}>
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress }) {
  return (
    <Pressable style={styles.secondary} onPress={onPress}>
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

const base = {
  paddingVertical: 14,
  borderRadius: 999,
  alignItems: 'center',
  justifyContent: 'center',
};

const styles = StyleSheet.create({
  primary: {
    ...base,
    backgroundColor: colors.accent,
    marginTop: 16,
  },
  primaryText: {
    color: '#000',
    fontWeight: '600',
  },
  secondary: {
    ...base,
    backgroundColor: colors.surfaceAlt,
    marginTop: 8,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
});

