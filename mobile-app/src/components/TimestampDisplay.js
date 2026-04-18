import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function TimestampDisplay({ iso }) {
  if (!iso) return null;

  const date = new Date(iso);

  return (
    <Text style={styles.text}>
      Calculated at {date.toLocaleString()}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

