import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

function getRiskStyles(level) {
  switch (level) {
    case 'Low':
      return { bg: colors.accentSoft, fg: colors.riskLow };
    case 'Medium':
      return { bg: 'rgba(255,159,28,0.16)', fg: colors.riskMedium };
    case 'High':
    default:
      return { bg: 'rgba(255,75,92,0.16)', fg: colors.riskHigh };
  }
}

export default function RiskBadge({ level }) {
  const { bg, fg } = getRiskStyles(level);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.text, { color: fg }]}>{level} risk</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

