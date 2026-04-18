import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function parseMaybeNumber(text) {
  if (text == null) return null;
  const trimmed = String(text).trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
}

export default function ConfidenceRangeFilter({ value, onChange }) {
  const [minText, setMinText] = useState(String(value?.[0] ?? 0));
  const [maxText, setMaxText] = useState(String(value?.[1] ?? 100));

  useEffect(() => {
    setMinText(String(value?.[0] ?? 0));
    setMaxText(String(value?.[1] ?? 100));
  }, [value?.[0], value?.[1]]);

  const parsed = useMemo(() => {
    const minN = parseMaybeNumber(minText);
    const maxN = parseMaybeNumber(maxText);
    const min = clamp(minN ?? 0, 0, 100);
    const max = clamp(maxN ?? 100, 0, 100);
    return min <= max ? [min, max] : [max, min];
  }, [minText, maxText]);

  useEffect(() => {
    const t = setTimeout(() => onChange(parsed), 400);
    return () => clearTimeout(t);
  }, [parsed, onChange]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Confidence range</Text>
      <View style={styles.row}>
        <View style={[styles.inputWrap, styles.inputWrapLeft]}>
          <Text style={styles.label}>Min</Text>
          <TextInput
            value={minText}
            onChangeText={setMinText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Max</Text>
          <TextInput
            value={maxText}
            onChangeText={setMaxText}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
  },
  inputWrap: {
    flex: 1,
  },
  inputWrapLeft: {
    marginRight: 10,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});

