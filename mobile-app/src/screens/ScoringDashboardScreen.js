import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import api from '../services/api';

const { width } = Dimensions.get('window');

export default function ScoringDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({ avgScore: 0, total: 0, riskyCount: 0 });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      if (!refreshing) setLoading(true);
      const response = await api.get('/analyses');
      const data = response.data;
      setRecords(data || []);
      
      // Calculate summary
      if (data && data.length > 0) {
        const total = data.length;
        const avg = data.reduce((acc, curr) => acc + (curr.score || 0), 0) / total;
        const risky = data.filter(r => r.confidenceLevel === 'LOW').length;
        setSummary({ avgScore: Math.round(avg), total, riskyCount: risky });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load scores');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return '#32ff7e';
      case 'MID': return '#fff200';
      case 'LOW': return '#ff4d4d';
      default: return theme.primary;
    }
  };

  const SummaryCard = ({ title, value, icon, color }) => (
    <GlassCard style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{title}</Text>
    </GlassCard>
  );

  const renderItem = ({ item }) => {
    const riskColor = getRiskColor(item.confidenceLevel);
    return (
      <GlassCard 
        style={styles.recordCard}
        onPress={() => navigation.navigate('ReportDetail', { report: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerInfo}>
            <Text style={styles.recordId}>#{item._id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.timestamp}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <View style={[styles.riskTag, { backgroundColor: riskColor + '22', borderColor: riskColor + '55' }]}>
            <Text style={[styles.riskTagText, { color: riskColor }]}>{item.confidenceLevel}</Text>
          </View>
        </View>

        <Text style={styles.previewText} numberOfLines={2}>{item.originalResponse}</Text>

        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${item.score}%`, backgroundColor: riskColor }]} />
          </View>
          <Text style={[styles.scorePercent, { color: riskColor }]}>{item.score}%</Text>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.footerMetric}>
            <Ionicons name="documents-outline" size={14} color={theme.textDim} />
            <Text style={styles.footerMetricText}>{item.metadata?.claimCount || 0} Claims</Text>
          </View>
          <View style={styles.footerMetric}>
            <Ionicons name="link-outline" size={14} color={theme.textDim} />
            <Text style={styles.footerMetricText}>{item.metadata?.sourceCount || 0} Sources</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textDim} style={{ marginLeft: 'auto' }} />
        </View>
      </GlassCard>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="Confidence Analytics"
      />
      
      <View style={styles.main}>
        <View style={styles.summaryGrid}>
          <SummaryCard title="Avg Score" value={`${summary.avgScore}%`} icon="analytics" color="#18dcff" />
          <SummaryCard title="Risk Reports" value={summary.riskyCount} icon="alert-circle" color="#ff4d4d" />
          <SummaryCard title="Total" value={summary.total} icon="cube" color="#32ff7e" />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Scoring History</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="shield-checkmark-outline" size={60} color={theme.textDim} />
                <Text style={styles.emptyText}>No analysis history available</Text>
                <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Analyze')}>
                  <Text style={styles.actionBtnText}>Start Verification</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  main: { flex: 1 },
  summaryGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16,
    marginBottom: 25,
    marginTop: 10,
  },
  summaryItem: {
    width: (width - 48) / 3,
    padding: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  summaryIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: theme.textDim, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  listHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  listTitle: { color: theme.text, fontSize: 20, fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 30 },
  recordCard: { padding: 18, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  recordId: { color: theme.text, fontSize: 14, fontWeight: '800' },
  timestamp: { color: theme.textDim, fontSize: 11, marginTop: 2 },
  riskTag: { px: 10, py: 4, borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  riskTagText: { fontSize: 10, fontWeight: '900' },
  previewText: { color: theme.textDim, fontSize: 14, lineHeight: 20, marginBottom: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: theme.input, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  scorePercent: { marginLeft: 10, fontSize: 15, fontWeight: '800', width: 45, textAlign: 'right' },
  footerRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.input + '44', paddingTop: 15 },
  footerMetric: { flexDirection: 'row', alignItems: 'center', marginRight: 15 },
  footerMetricText: { color: theme.textDim, fontSize: 12, marginLeft: 5, fontWeight: '600' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 80, opacity: 0.6 },
  emptyText: { color: theme.textDim, fontSize: 16, marginVertical: 15 },
  actionBtn: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  actionBtnText: { color: '#000', fontWeight: '800' },
});
