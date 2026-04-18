import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import { getAllFeedback, updateFeedbackStatus, getFeedbackAnalytics } from '../services/feedbackService';

const { width } = Dimensions.get('window');

export default function AdminFeedbackScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [feedbacks, setFeedbacks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [listData, stats] = await Promise.all([
        getAllFeedback(),
        getFeedbackAnalytics()
      ]);
      setFeedbacks(listData.items || []);
      setAnalytics(stats);
    } catch (error) {
       console.error(error);
       Alert.alert('Error', 'Failed to synchronize feedback engine data.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
       await updateFeedbackStatus(id, status);
       Alert.alert('Success', `Feedback marked as ${status}`);
       loadAllData();
    } catch (error) {
       Alert.alert('Error', error.message);
    }
  };

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const renderInsights = () => {
    if (!analytics) return null;
    const latestMonth = analytics.monthly?.[0];
    const latestYear = analytics.yearly?.[0];

    return (
      <View style={styles.insightsRow}>
        <GlassCard style={styles.insightCard}>
          <Text style={styles.insightTitle}>Monthly Performance</Text>
          {latestMonth ? (
            <>
              <Text style={styles.insightPeriod}>{monthNames[latestMonth._id.month - 1]} {latestMonth._id.year}</Text>
              <View style={styles.insightStat}>
                <Text style={styles.insightVal}>{latestMonth.avgRating.toFixed(1)} <Text style={{ fontSize: 12 }}>⭐</Text></Text>
                <Text style={styles.insightLab}>Accuracy</Text>
              </View>
              <View style={styles.insightStat}>
                <Text style={styles.insightVal}>{latestMonth.avgHelpfulness.toFixed(1)} <Text style={{ fontSize: 12 }}>⭐</Text></Text>
                <Text style={styles.insightLab}>Helpfulness</Text>
              </View>
            </>
          ) : <Text style={styles.emptyStat}>No Data</Text>}
        </GlassCard>

        <GlassCard style={[styles.insightCard, { borderColor: theme.success + '44' }]}>
          <Text style={styles.insightTitle}>Yearly Overall</Text>
          {latestYear ? (
            <>
              <Text style={styles.insightPeriod}>FY {latestYear._id.year}</Text>
              <View style={styles.insightStat}>
                <Text style={[styles.insightVal, { color: theme.success }]}>{latestYear.avgRating.toFixed(1)} <Text style={{ fontSize: 12 }}>⭐</Text></Text>
                <Text style={styles.insightLab}>Success Rate</Text>
              </View>
              <View style={styles.insightStat}>
                <Text style={styles.countBadge}>{latestYear.count} Reports</Text>
                <Text style={styles.insightLab}>Total Sample</Text>
              </View>
            </>
          ) : <Text style={styles.emptyStat}>No Data</Text>}
        </GlassCard>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="Admin Feedback Hub" 
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />

      {loading && !refreshing ? (
        <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Text style={styles.sectionHeading}>System Analytics</Text>
          {renderInsights()}

          <Text style={[styles.sectionHeading, { marginTop: 30 }]}>Recent User reviews</Text>
          {feedbacks.map((item) => (
            <GlassCard key={item._id} style={styles.reviewCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.statusBadge, styles[`status_${item.status}`]]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>

              <View style={styles.userBox}>
                <Ionicons name="person-circle-outline" size={20} color={theme.primary} />
                <Text style={styles.userEmail}>{item.userId?.email || 'Anonymous'}</Text>
              </View>

              <View style={styles.ratingSection}>
                <View style={styles.ratingSub}>
                   <Text style={styles.ratingLab}>Helpfulness</Text>
                   <Text style={styles.ratingVal}>{'⭐'.repeat(item.voteRating)}</Text>
                </View>
                <View style={styles.ratingSub}>
                   <Text style={styles.ratingLab}>Accuracy</Text>
                   <Text style={styles.ratingVal}>{'⭐'.repeat(item.rating)}</Text>
                </View>
              </View>

              {item.observation ? (
                <View style={styles.commentBox}>
                  <Text style={styles.commentTitle}>User Comment:</Text>
                  <Text style={styles.commentBody}>{item.observation}</Text>
                </View>
              ) : null}

              {item.correction ? (
                <View style={[styles.commentBox, { backgroundColor: 'rgba(50, 255, 126, 0.05)', borderColor: 'rgba(50, 255, 126, 0.2)' }]}>
                  <Text style={[styles.commentTitle, { color: '#32ff7e' }]}>Suggested Correction:</Text>
                  <Text style={styles.commentBody}>{item.correction}</Text>
                </View>
              ) : null}

              {item.status === 'pending' && (
                <View style={styles.actions}>
                   <TouchableOpacity 
                     style={[styles.actionBtn, { borderColor: '#32ff7e' }]} 
                     onPress={() => handleStatusUpdate(item._id, 'applied')}
                    >
                     <Text style={[styles.actionText, { color: '#32ff7e' }]}>Apply</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                     style={[styles.actionBtn, { borderColor: '#ff4d4d' }]} 
                     onPress={() => handleStatusUpdate(item._id, 'rejected')}
                   >
                     <Text style={[styles.actionText, { color: '#ff4d4d' }]}>Reject</Text>
                   </TouchableOpacity>
                </View>
              )}
            </GlassCard>
          ))}

          {feedbacks.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="documents-outline" size={60} color={theme.textDim} />
              <Text style={styles.emptyText}>No reviews available in the hub.</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  content: { paddingBottom: 40 },
  sectionHeading: { color: theme.text, fontSize: 18, fontWeight: '800', marginBottom: 15, marginHorizontal: 20 },
  insightsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    marginBottom: 5 
  },
  insightCard: { 
    width: (width - 50) / 2, // Calculated width to fit exactly with 20px padding and 10px gap
    padding: 15, 
    minHeight: 180 
  },
  insightTitle: { color: theme.text, fontSize: 12, fontWeight: '800', marginBottom: 2 },
  insightPeriod: { color: theme.primary, fontSize: 10, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
  insightStat: { marginBottom: 10 },
  insightVal: { color: theme.text, fontSize: 18, fontWeight: '900' },
  insightLab: { color: theme.textDim, fontSize: 8, textTransform: 'uppercase', marginTop: 2 },
  countBadge: { color: theme.text, fontSize: 12, fontWeight: '700' },
  emptyStat: { color: theme.textDim, fontSize: 12, fontStyle: 'italic', marginTop: 10 },
  
  reviewCard: { padding: 20, marginHorizontal: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#000' },
  status_pending: { backgroundColor: '#fdcb6e' },
  status_applied: { backgroundColor: '#32ff7e' },
  status_rejected: { backgroundColor: '#ff4d4d' },
  dateText: { color: theme.textDim, fontSize: 12 },
  userBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(30, 194, 255, 0.05)', padding: 10, borderRadius: 12, marginBottom: 15 },
  userEmail: { color: theme.primary, fontWeight: '700', marginLeft: 8, fontSize: 14 },
  ratingSection: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  ratingSub: { flex: 1 },
  ratingLab: { color: theme.textDim, fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
  ratingVal: { fontSize: 12 },
  commentBox: { padding: 12, borderRadius: 12, backgroundColor: theme.input, borderWidth: 1, borderColor: theme.border, marginTop: 10 },
  commentTitle: { color: theme.primary, fontSize: 11, fontWeight: '800', marginBottom: 5 },
  commentBody: { color: theme.text, fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  actionBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1, marginLeft: 10 },
  actionText: { fontWeight: '800', fontSize: 12 },
  empty: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { color: theme.textDim, marginTop: 15, fontSize: 16 },
});
