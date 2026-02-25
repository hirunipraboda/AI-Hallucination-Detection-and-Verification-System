import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

export default function SourceDetailScreen({ navigation, route }) {
  const { source } = route.params;
  const [score, setScore] = useState(source.score);

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

  const risk = getRiskLevel(score);

  const handleDelete = () => {
    Alert.alert(
      'Delete Source',
      `Are you sure you want to delete ${source.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Deleted!', `${source.name} has been removed.`, [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const handleScoreUpdate = (change) => {
    const newScore = Math.min(100, Math.max(0, score + change));
    setScore(newScore);
    Alert.alert('Score Updated! ✅', `New credibility score: ${newScore}`);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Source Details</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.deleteButton}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>

        {/* SOURCE IDENTITY CARD */}
        <View style={styles.identityCard}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>{source.name.charAt(0)}</Text>
          </View>
          <Text style={styles.sourceName}>{source.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{source.category}</Text>
          </View>
          {source.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified Source</Text>
            </View>
          )}
        </View>

        {/* CREDIBILITY SCORE CARD */}
        <View style={styles.scoreCard}>
          <Text style={styles.sectionTitle}>Credibility Score</Text>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
              {score}
            </Text>
            <Text style={styles.scoreOutOf}>/100</Text>
          </View>
          <View style={[styles.riskBadge, { backgroundColor: risk.color + '22' }]}>
            <Text style={[styles.riskText, { color: risk.color }]}>{risk.label}</Text>
          </View>
          <Text style={styles.adjustLabel}>Adjust Score</Text>
          <View style={styles.adjustButtons}>
            <TouchableOpacity style={[styles.adjustBtn, styles.decreaseBtn]} onPress={() => handleScoreUpdate(-5)}>
              <Text style={styles.adjustBtnText}>-5</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.adjustBtn, styles.decreaseBtn]} onPress={() => handleScoreUpdate(-1)}>
              <Text style={styles.adjustBtnText}>-1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.adjustBtn, styles.increaseBtn]} onPress={() => handleScoreUpdate(+1)}>
              <Text style={styles.adjustBtnText}>+1</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.adjustBtn, styles.increaseBtn]} onPress={() => handleScoreUpdate(+5)}>
              <Text style={styles.adjustBtnText}>+5</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DETAILS CARD */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Source Information</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Category</Text>
            <Text style={styles.detailValue}>{source.category}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Trust Level</Text>
            <Text style={[styles.detailValue, { color: getScoreColor(score) }]}>
              {score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={styles.detailValue}>
              {source.verified ? '✓ Verified' : '⚠ Unverified'}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: { color: '#9b59b6', fontSize: 16, fontWeight: '600' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  deleteButton: { fontSize: 22 },
  content: { paddingHorizontal: 20 },
  identityCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#9b59b6',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: { color: '#ffffff', fontSize: 36, fontWeight: 'bold' },
  sourceName: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: '#9b59b633',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20, marginBottom: 8,
  },
  categoryText: { color: '#9b59b6', fontSize: 13, fontWeight: '600' },
  verifiedBadge: {
    backgroundColor: '#2ecc7122',
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: { color: '#2ecc71', fontSize: 13, fontWeight: '600' },
  scoreCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 15, padding: 20,
    alignItems: 'center', marginBottom: 15,
  },
  sectionTitle: {
    color: '#ffffff', fontSize: 16,
    fontWeight: 'bold', marginBottom: 15,
    alignSelf: 'flex-start',
  },
  scoreCircle: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  scoreNumber: { fontSize: 72, fontWeight: 'bold' },
  scoreOutOf: { color: '#888', fontSize: 20, marginBottom: 12 },
  riskBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginBottom: 20 },
  riskText: { fontSize: 14, fontWeight: 'bold' },
  adjustLabel: { color: '#888', fontSize: 13, marginBottom: 10, alignSelf: 'flex-start' },
  adjustButtons: { flexDirection: 'row', gap: 10 },
  adjustBtn: { width: 60, height: 45, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  decreaseBtn: { backgroundColor: '#e74c3c33' },
  increaseBtn: { backgroundColor: '#2ecc7133' },
  adjustBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  detailsCard: { backgroundColor: '#2a2a3e', borderRadius: 15, padding: 20, marginBottom: 30 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#3a3a5e',
  },
  detailLabel: { color: '#888', fontSize: 15 },
  detailValue: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
});