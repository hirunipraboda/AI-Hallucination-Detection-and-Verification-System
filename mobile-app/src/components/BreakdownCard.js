import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

function FactorRow({ label, value }) {
  const width = Math.max(6, Math.min(100, value));
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${width}%` }]} />
      </View>
    </View>
  );
}

export default function BreakdownCard({ verificationScore, credibilityScore, consensusScore }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scoring breakdown</Text>
      <FactorRow label="Verification" value={verificationScore} />
      <FactorRow label="Credibility" value={credibilityScore} />
      <FactorRow label="Consensus" value={consensusScore} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    marginTop: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  row: {
    marginBottom: 10,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
});

