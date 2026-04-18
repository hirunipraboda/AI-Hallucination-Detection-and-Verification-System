import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ConfidenceRing from './ConfidenceRing';

const formatDate = (dateString) => {
  if (!dateString) return 'Date unknown';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return 'Date error';
  }
};

export default function HistoryCard({ item, onPress, onDelete, onReanalyse }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  if (!item) return null;

  const score = item?.score ?? 0;
  const level = item?.confidenceLevel || 'LOW';
  
  const getRiskColor = () => {
    if (score >= 75) return theme.primary;
    if (score >= 40) return theme.warning;
    return theme.danger;
  };

  const riskColor = getRiskColor();

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
              <Text style={styles.date}>{formatDate(item?.createdAt)}</Text>
            </View>
            <Text style={styles.preview} numberOfLines={3}>
              {item?.originalResponse || item?.originalText || 'No text content available'}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <ConfidenceRing
              confidence={score}
              label={level}
            />
          </View>
        </View>

        {/* Highlighted Scoring Section */}
        <View style={[styles.scoringSection, { backgroundColor: riskColor + '10', borderColor: riskColor + '30' }]}>
          <View style={styles.scoringInfo}>
            <Text style={styles.scoringLabel}>VERIFICATION SCORE</Text>
            <View style={styles.scoreBadgeRow}>
                <Text style={[styles.scorePercent, { color: riskColor }]}>{score}%</Text>
                <View style={[styles.levelBadge, { backgroundColor: riskColor }]}>
                   <Text style={styles.levelBadgeText}>{level}</Text>
                </View>
            </View>
          </View>
          <View style={styles.metricRow}>
             <View style={styles.metric}>
                <Text style={styles.metricVal}>{item.issues?.unsupportedClaims || 0}</Text>
                <Text style={styles.metricLab}>Issues</Text>
             </View>
             <View style={styles.metricDivider} />
             <View style={styles.metric}>
                <Text style={styles.metricVal}>{item.extractedClaims?.length || 0}</Text>
                <Text style={styles.metricLab}>Claims</Text>
             </View>
          </View>
        </View>

        <View style={styles.divider} />
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => onDelete && onDelete(item?._id)}
          activeOpacity={0.6}
        >
          <Ionicons name="trash-outline" size={16} color={theme.danger} />
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.reanalyseButton} 
          onPress={() => onReanalyse && onReanalyse(item?.originalResponse || item?.originalText)}
          activeOpacity={0.6}
        >
          <Ionicons name="refresh-outline" size={16} color={theme.primary} />
          <Text style={styles.reanalyseText}>Reanalyse</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    borderRadius: 28,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: theme.border,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  leftSection: {
    flex: 1,
    paddingRight: 12,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  date: {
    color: theme.textMuted,
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '600',
  },
  preview: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
  },
  scoringSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 5,
  },
  scoringInfo: {
    flex: 1,
  },
  scoringLabel: {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scorePercent: {
    fontSize: 22,
    fontWeight: '900',
    marginRight: 10,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  metricVal: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  metricLab: {
    color: theme.textDim,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: theme.border,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 15,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 69, 58, 0.05)',
  },
  deleteText: {
    color: theme.danger,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  reanalyseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 194, 255, 0.05)',
  },
  reanalyseText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
});