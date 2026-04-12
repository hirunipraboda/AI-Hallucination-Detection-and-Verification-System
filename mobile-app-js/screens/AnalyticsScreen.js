import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getAllSources } from '../services/sourceService';

export default function AnalyticsScreen() {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await getAllSources();
      setSources(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load analytics. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  // 💡 Calculate analytics from sources
  const totalSources = sources.length;
  const verified = sources.filter(s => s.status === 'verified').length;
  const unverified = sources.filter(s => s.status === 'unverified').length;
  const unreliable = sources.filter(s => s.status === 'unreliable').length;
  const avgScore = totalSources > 0
    ? Math.round(sources.reduce((sum, s) => sum + s.overallScore, 0) / totalSources)
    : 0;
  const topSource = sources.length > 0
    ? sources.reduce((max, s) => s.overallScore > max.overallScore ? s : max, sources[0])
    : null;

  // Category breakdown
  const categories = ['Academic', 'Government', 'Trusted Web', 'News', 'Other'];
  const categoryCount = categories.map(cat => ({
    name: cat,
    count: sources.filter(s => s.sourceCategory === cat).length,
  }));

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Source Credibility Overview</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00d4aa" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.content}>

          {/* OVERVIEW CARDS */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.overviewGrid}>
            <View style={[styles.overviewCard, { borderColor: '#00d4aa' }]}>
              <Text style={styles.overviewNumber}>{totalSources}</Text>
              <Text style={styles.overviewLabel}>Total Sources</Text>
            </View>
            <View style={[styles.overviewCard, { borderColor: '#2ecc71' }]}>
              <Text style={[styles.overviewNumber, { color: '#2ecc71' }]}>{verified}</Text>
              <Text style={styles.overviewLabel}>Verified</Text>
            </View>
            <View style={[styles.overviewCard, { borderColor: '#f39c12' }]}>
              <Text style={[styles.overviewNumber, { color: '#f39c12' }]}>{unverified}</Text>
              <Text style={styles.overviewLabel}>Unverified</Text>
            </View>
            <View style={[styles.overviewCard, { borderColor: '#e74c3c' }]}>
              <Text style={[styles.overviewNumber, { color: '#e74c3c' }]}>{unreliable}</Text>
              <Text style={styles.overviewLabel}>Unreliable</Text>
            </View>
          </View>

          {/* AVERAGE SCORE */}
          <Text style={styles.sectionTitle}>Average Credibility Score</Text>
          <View style={styles.avgScoreCard}>
            <Text style={[styles.avgScoreNumber, { 
              color: avgScore >= 80 ? '#2ecc71' : avgScore >= 50 ? '#f39c12' : '#e74c3c' 
            }]}>
              {avgScore}
            </Text>
            <Text style={styles.avgScoreLabel}>/100</Text>
            <View style={styles.avgScoreBar}>
              <View style={[styles.avgScoreBarFill, { 
                width: `${avgScore}%`,
                backgroundColor: avgScore >= 80 ? '#2ecc71' : avgScore >= 50 ? '#f39c12' : '#e74c3c'
              }]} />
            </View>
          </View>

          {/* TOP SOURCE */}
          {topSource && (
            <>
              <Text style={styles.sectionTitle}>🏆 Top Rated Source</Text>
              <View style={styles.topSourceCard}>
                <View style={styles.topSourceLogo}>
                  <Text style={styles.topSourceLogoText}>
                    {topSource.sourceName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.topSourceInfo}>
                  <Text style={styles.topSourceName}>{topSource.sourceName}</Text>
                  <Text style={styles.topSourceCategory}>{topSource.sourceCategory}</Text>
                </View>
                <View style={styles.topSourceScore}>
                  <Text style={styles.topSourceScoreText}>{topSource.overallScore}</Text>
                </View>
              </View>
            </>
          )}

          {/* CATEGORY BREAKDOWN */}
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <View style={styles.categoryCard}>
            {categoryCount.map(cat => (
              <View key={cat.name} style={styles.categoryRow}>
                <Text style={styles.categoryName}>{cat.name}</Text>
                <View style={styles.categoryBarContainer}>
                  <View style={[styles.categoryBar, { 
                    width: totalSources > 0 ? `${(cat.count / totalSources) * 100}%` : '0%'
                  }]} />
                </View>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </View>
            ))}
          </View>

        </ScrollView>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#00d4aa', marginTop: 2 },
  content: { paddingHorizontal: 20 },
  sectionTitle: {
    color: '#ffffff', fontSize: 18,
    fontWeight: 'bold', marginTop: 20, marginBottom: 12,
  },
  overviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewCard: {
    backgroundColor: '#111827',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    width: '47%',
    borderWidth: 1,
  },
  overviewNumber: {
    fontSize: 36, fontWeight: 'bold',
    color: '#00d4aa',
  },
  overviewLabel: {
    color: '#888', fontSize: 13,
    marginTop: 4,
  },
  avgScoreCard: {
    backgroundColor: '#111827',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  avgScoreNumber: {
    fontSize: 64, fontWeight: 'bold',
  },
  avgScoreLabel: {
    color: '#888', fontSize: 18,
  },
  avgScoreBar: {
    width: '100%', height: 8,
    backgroundColor: '#1a2332',
    borderRadius: 4, marginTop: 15,
    overflow: 'hidden',
  },
  avgScoreBarFill: {
    height: '100%', borderRadius: 4,
  },
  topSourceCard: {
    backgroundColor: '#111827',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topSourceLogo: {
    width: 50, height: 50, borderRadius: 10,
    backgroundColor: '#00d4aa',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 15,
  },
  topSourceLogoText: { color: '#000', fontSize: 20, fontWeight: 'bold' },
  topSourceInfo: { flex: 1 },
  topSourceName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  topSourceCategory: { color: '#00d4aa', fontSize: 12, marginTop: 3 },
  topSourceScore: {
    width: 55, height: 55, borderRadius: 27,
    borderWidth: 3, borderColor: '#00d4aa',
    alignItems: 'center', justifyContent: 'center',
  },
  topSourceScoreText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  categoryCard: {
    backgroundColor: '#111827',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: { color: '#888', fontSize: 13, width: 80 },
  categoryBarContainer: {
    flex: 1, height: 8,
    backgroundColor: '#1a2332',
    borderRadius: 4, marginHorizontal: 10,
    overflow: 'hidden',
  },
  categoryBar: {
    height: '100%',
    backgroundColor: '#00d4aa',
    borderRadius: 4,
  },
  categoryCount: { color: '#ffffff', fontSize: 13, fontWeight: 'bold', width: 20 },
});