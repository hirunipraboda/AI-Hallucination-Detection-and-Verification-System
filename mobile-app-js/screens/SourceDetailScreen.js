import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { deleteSource, updateSource } from '../services/sourceService';

export default function SourceDetailScreen({ navigation, route }) {
  const { source } = route.params;
  const [currentSource, setCurrentSource] = useState(source);
  const [loading, setLoading] = useState(false);

  const getScoreColor = (s) => {
    if (s >= 80) return '#2ecc71';
    if (s >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const getRiskLevel = (s) => {
    if (s >= 80) return { label: 'LOW RISK', color: '#2ecc71' };
    if (s >= 50) return { label: 'MEDIUM RISK', color: '#f39c12' };
    return { label: 'HIGH RISK', color: '#e74c3c' };
  };

  const risk = getRiskLevel(currentSource.overallScore);
  const statusView = (() => {
    if (currentSource.status === 'verified') {
      return { label: '✓ Verified', color: '#2ecc71', bg: '#2ecc7122' };
    }
    if (currentSource.status === 'unreliable') {
      return { label: '✕ Unreliable', color: '#e74c3c', bg: '#e74c3c22' };
    }
    return { label: '⚠ Unverified', color: '#f39c12', bg: '#f39c1222' };
  })();

  const handleDelete = () => {
    if (currentSource.status !== 'unreliable') {
      Alert.alert('Delete restricted', 'You can only delete unreliable sources for this module.');
      return;
    }
    Alert.alert(
      'Delete Source',
      `Are you sure you want to delete ${currentSource.sourceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSource(currentSource._id);
              Alert.alert('Deleted!', `${currentSource.sourceName} has been removed.`, [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Could not delete source!');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleScoreUpdate = async (field, change) => {
    try {
      setLoading(true);
      const newValue = Math.min(100, Math.max(0, currentSource[field] + change));
      const updatedData = {
        ...currentSource,
        [field]: newValue,
      };
      const overallScore = Math.round(
        (updatedData.authorityScore + updatedData.accuracyScore + updatedData.recencyScore) / 3
      );
      updatedData.overallScore = overallScore;

      const updated = await updateSource(currentSource._id, updatedData);
      setCurrentSource(updated);
      Alert.alert('Updated! ✅', `New overall score: ${overallScore}`);
    } catch (error) {
      Alert.alert('Error', 'Could not update score!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Source Details</Text>
        {currentSource.status === 'unreliable' ? (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteButton}>🗑️</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 22 }} />
        )}
      </View>

      {loading && <ActivityIndicator color="#9b59b6" style={{ marginBottom: 10 }} />}

      <ScrollView style={styles.content}>

        {/* IDENTITY CARD */}
        <View style={styles.identityCard}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>
              {currentSource.sourceName ? currentSource.sourceName.charAt(0) : '?'}
            </Text>
          </View>
          <Text style={styles.sourceName}>{currentSource.sourceName}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{currentSource.sourceCategory}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusView.bg }]}>
            <Text style={[styles.statusText, { color: statusView.color }]}>
              {statusView.label}
            </Text>
          </View>
        </View>

        {/* OVERALL SCORE */}
        <View style={styles.scoreCard}>
          <Text style={styles.sectionTitle}>Overall Credibility Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(currentSource.overallScore) }]}>
              {currentSource.overallScore}
            </Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.color + '22' }]}>
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>

        {/* SCORE BREAKDOWN */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Score Breakdown</Text>

          {/* Authority Score */}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Authority Score</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity style={[styles.adjustBtn, styles.decreaseBtn]} onPress={() => handleScoreUpdate('authorityScore', -5)}>
                <Text style={styles.adjustBtnText}>-5</Text>
              </TouchableOpacity>
              <Text style={styles.scoreValue}>{currentSource.authorityScore}</Text>
              <TouchableOpacity style={[styles.adjustBtn, styles.increaseBtn]} onPress={() => handleScoreUpdate('authorityScore', +5)}>
                <Text style={styles.adjustBtnText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Accuracy Score */}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Accuracy Score</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity style={[styles.adjustBtn, styles.decreaseBtn]} onPress={() => handleScoreUpdate('accuracyScore', -5)}>
                <Text style={styles.adjustBtnText}>-5</Text>
              </TouchableOpacity>
              <Text style={styles.scoreValue}>{currentSource.accuracyScore}</Text>
              <TouchableOpacity style={[styles.adjustBtn, styles.increaseBtn]} onPress={() => handleScoreUpdate('accuracyScore', +5)}>
                <Text style={styles.adjustBtnText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recency Score */}
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Recency Score</Text>
            <View style={styles.adjustButtons}>
              <TouchableOpacity style={[styles.adjustBtn, styles.decreaseBtn]} onPress={() => handleScoreUpdate('recencyScore', -5)}>
                <Text style={styles.adjustBtnText}>-5</Text>
              </TouchableOpacity>
              <Text style={styles.scoreValue}>{currentSource.recencyScore}</Text>
              <TouchableOpacity style={[styles.adjustBtn, styles.increaseBtn]} onPress={() => handleScoreUpdate('recencyScore', +5)}>
                <Text style={styles.adjustBtnText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* SOURCE INFO */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Source Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>URL</Text>
            <Text style={styles.detailValue} numberOfLines={1}>{currentSource.sourceURL}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{currentSource.sourceCategory}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailValue, { color: getScoreColor(currentSource.overallScore) }]}>
              {currentSource.status}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15,
  },
  backButton: { color: '#9b59b6', fontSize: 16, fontWeight: '600' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  deleteButton: { fontSize: 22 },
  content: { paddingHorizontal: 20 },
  identityCard: {
    backgroundColor: '#2a2a3e', borderRadius: 15,
    padding: 20, alignItems: 'center', marginBottom: 15,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#9b59b6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoText: { color: '#ffffff', fontSize: 36, fontWeight: 'bold' },
  sourceName: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: '#9b59b633', paddingHorizontal: 14,
    paddingVertical: 5, borderRadius: 20, marginBottom: 8,
  },
  categoryText: { color: '#9b59b6', fontSize: 13, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 13, fontWeight: '600' },
  scoreCard: {
    backgroundColor: '#2a2a3e', borderRadius: 15,
    padding: 20, alignItems: 'center', marginBottom: 15,
  },
  sectionTitle: {
    color: '#ffffff', fontSize: 16, fontWeight: 'bold',
    marginBottom: 15, alignSelf: 'flex-start',
  },
  scoreCircle: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  scoreNumber: { fontSize: 72, fontWeight: 'bold' },
  scoreOutOf: { color: '#888', fontSize: 20, marginBottom: 12 },
  riskBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  riskText: { fontSize: 14, fontWeight: 'bold' },
  detailsCard: {
    backgroundColor: '#2a2a3e', borderRadius: 15,
    padding: 20, marginBottom: 15,
  },
  scoreRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#3a3a5e',
  },
  scoreLabel: { color: '#888', fontSize: 15 },
  scoreValue: { color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginHorizontal: 10 },
  adjustButtons: { flexDirection: 'row', alignItems: 'center' },
  adjustBtn: {
    width: 45, height: 35, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  decreaseBtn: { backgroundColor: '#e74c3c33' },
  increaseBtn: { backgroundColor: '#2ecc7133' },
  adjustBtnText: { color: '#ffffff', fontSize: 14, fontWeight: 'bold' },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3a3a5e',
  },
  detailLabel: { color: '#888', fontSize: 15 },
  detailValue: { color: '#ffffff', fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'right' },
});