import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import { getAllSources } from '../services/sourceService';
import { getAllFeedback } from '../services/feedbackService';
import api from '../services/api';

export default function AdminDashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { logout } = useAuth();
  const styles = getStyles(theme);

  const [stats, setStats] = useState({
    totalSources: 0,
    officialSources: 0,
    pendingFeedback: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats whenever user navigates back to dashboard
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStats(true); // pass true to skip full screen loader
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchStats = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      
      const [sources, feedback, userResponse] = await Promise.all([
        getAllSources(),
        getAllFeedback(),
        api.get('/auth/users')
      ]);
      
      setStats({
        totalSources: sources.length,
        officialSources: (sources || []).filter(s => s.isOfficial).length,
        pendingFeedback: (feedback.items || []).filter(f => f.status === 'pending').length,
        totalUsers: (userResponse.data || []).length,
      });
    } catch (error) {
       console.error('[STATS REFRESH ERROR]', error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  };

  const AdminAction = ({ title, icon, color, onPress }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress}>
      <GlassCard style={styles.actionInner}>
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <Text style={styles.actionTitle}>{title}</Text>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="Admin Console" 
        rightIcon="log-out-outline"
        onRightPress={logout}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome, Administrator</Text>
          <Text style={styles.subtext}>Manage TruthLens verification hub and system integrity.</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statBox}>
                <Text style={styles.statVal}>{stats.totalSources}</Text>
                <Text style={styles.statLab}>Sources</Text>
              </GlassCard>
              <GlassCard style={styles.statBox}>
                <Text style={styles.statVal}>{stats.totalUsers}</Text>
                <Text style={styles.statLab}>Total Users</Text>
              </GlassCard>
            </View>

            <Text style={styles.sectionTitle}>Management Hub</Text>
            <View style={styles.actionsGrid}>
              <AdminAction 
                title="Source Management" 
                icon="library-outline" 
                color={theme.primary} 
                onPress={() => navigation.navigate('SourcesList')}
              />
              <AdminAction 
                title="User Management" 
                icon="people-outline" 
                color="#a29bfe" 
                onPress={() => navigation.navigate('UserManagement')}
              />
            </View>

            <Text style={styles.sectionTitle}>Operational Center</Text>
            <View style={styles.actionsGrid}>
              <AdminAction 
                title="Review Feedbacks" 
                icon="chatbubbles-outline" 
                color="#fdcb6e" 
                onPress={() => navigation.navigate('Feedbacks')}
              />
            </View>

            <GlassCard style={styles.alertBox}>
              <Ionicons name="alert-circle-outline" size={24} color={theme.warning} />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Pending Actions</Text>
                <Text style={styles.alertText}>
                  You have {stats.pendingFeedback} pending feedback reports to review.
                </Text>
              </View>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  content: { padding: 20 },
  header: { marginBottom: 30 },
  welcome: { color: theme.text, fontSize: 28, fontWeight: '800' },
  subtext: { color: theme.textDim, fontSize: 16, marginTop: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { width: '48%', padding: 16, alignItems: 'center' },
  statVal: { color: theme.primary, fontSize: 28, fontWeight: 'bold' },
  statLab: { color: theme.textDim, fontSize: 12, marginTop: 4, textTransform: 'uppercase' },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 15 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: '48%', marginBottom: 15 },
  actionInner: { padding: 20, alignItems: 'center', height: 130, justifyContent: 'center' },
  iconBox: { padding: 12, borderRadius: 15, marginBottom: 12 },
  actionTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  alertBox: { flexDirection: 'row', padding: 16, marginTop: 20, alignItems: 'center', backgroundColor: 'rgba(253, 203, 110, 0.05)', borderColor: 'rgba(253, 203, 110, 0.2)' },
  alertContent: { marginLeft: 12 },
  alertTitle: { color: theme.text, fontWeight: '700', fontSize: 15 },
  alertText: { color: theme.textDim, fontSize: 13, marginTop: 2 },
});
