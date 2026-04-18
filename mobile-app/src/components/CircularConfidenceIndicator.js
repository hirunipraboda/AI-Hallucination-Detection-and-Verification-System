import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

const SIZE = 220;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getRiskColor(riskLevel) {
  if (riskLevel === 'Low') return colors.riskLow;
  if (riskLevel === 'Medium') return colors.riskMedium;
  return colors.riskHigh;
}

export default function CircularConfidenceIndicator({
  value,
  riskLevel,
  label = 'RELIABLE',
  subtitle = 'LOW HALLUCINATION RISK',
}) {
  const clamped = Math.max(0, Math.min(100, value || 0));
  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * clamped) / 100;

  const riskColor = getRiskColor(riskLevel);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          stroke={colors.surfaceAlt}
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
        />
        <Circle
          stroke={riskColor}
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.centerContent}>
        <Text style={styles.valueText}>{clamped}%</Text>
        <Text style={styles.labelText}>{label}</Text>
        <Text style={styles.subtitleText}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  labelText: {
    marginTop: 4,
    fontSize: 14,
    letterSpacing: 1.5,
    color: colors.textSecondary,
  },
  subtitleText: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
});

