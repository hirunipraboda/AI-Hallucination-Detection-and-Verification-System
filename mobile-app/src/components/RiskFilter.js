import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const OPTIONS = ['All', 'Low', 'Medium', 'High'];

export default function RiskFilter({ value, onChange }) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(option)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  chipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
});

