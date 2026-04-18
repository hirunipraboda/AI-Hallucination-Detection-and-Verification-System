import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import RiskBadge from './RiskBadge';

export default function ScoreListItem({ item, onPress }) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.left}>
        <Text style={styles.confidence}>{item.confidenceScore}%</Text>
        <RiskBadge level={item.hallucinationRiskLevel} />
      </View>
      <View style={styles.right}>
        <Text numberOfLines={1} style={styles.responseId}>
          {item.responseId}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.calculatedAt).toLocaleString()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    marginBottom: 10,
  },
  left: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  right: {
    flex: 1,
    justifyContent: 'center',
  },
  confidence: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  responseId: {
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

