import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  return (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.topRow}>
          <View style={styles.leftSection}>
            <Text style={styles.date}>{formatDate(item?.createdAt)}</Text>
            <Text style={styles.preview} numberOfLines={3}>
              {item?.originalResponse || 'No text content available'}
            </Text>
          </View>

          <View style={styles.rightSection}>
            <ConfidenceRing
              confidence={item?.score ?? 0}
              label={item?.confidenceLevel}
            />
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
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.reanalyseButton} 
          onPress={() => onReanalyse && onReanalyse(item?.originalResponse)}
          activeOpacity={0.6}
        >
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
  },
  leftSection: {
    flex: 1,
    paddingRight: 12,
  },
  date: {
    color: theme.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
  preview: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 26,
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 10,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 69, 58, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  deleteText: {
    color: theme.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  reanalyseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(30, 194, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(30, 194, 255, 0.2)',
  },
  reanalyseText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});