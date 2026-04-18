import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import { getSystemHealth } from '../services/systemService';

export default function SystemHealthScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHealth();
    // Refresh health every 30 seconds while screen is active
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const data = await getSystemHealth();
      setHealthData(data);
    } catch (error) {
       console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHealth();
  };

  if (loading && !healthData) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="System Pulse" leftIcon="chevron-back" onLeftPress={() => navigation.goBack()} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.primary} size="large" />
          <Text style={styles.loadingText}>Syncing metrics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const HealthMetric = ({ icon, label, value, subValue, color = theme.primary }) => (
    <GlassCard style={styles.metricCard}>
      <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.metricInfo}>
        <Text style={styles.metricLab}>{label}</Text>
        <Text style={styles.metricVal}>{value}</Text>
        {subValue ? <Text style={styles.metricSub}>{subValue}</Text> : null}
      </View>
    </GlassCard>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="System Pulse" 
        leftIcon="chevron-back" 
        onLeftPress={() => navigation.goBack()} 
      />

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <View style={styles.mainStatus}>
          <View style={[styles.pulseCircle, { borderColor: theme.success }]}>
            <Ionicons name="pulse" size={40} color={theme.success} />
          </View>
          <Text style={styles.statusTitle}>All Systems Nominal</Text>
          <Text style={styles.statusSub}>TruthLens infra is operating at peak performance.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backend Core</Text>
          <View style={styles.metricGrid}>
            <HealthMetric 
              icon="time-outline" 
              label="Uptime" 
              value={healthData.uptime.formatted} 
              color={theme.primary} 
            />
            <HealthMetric 
              icon="hardware-chip-outline" 
              label="Node Version" 
              value={healthData.process.nodeVersion} 
              color="#a29bfe" 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resource Utilization</Text>
          <GlassCard style={styles.fullCard}>
             <View style={styles.storageRow}>
                <View style={styles.storageItem}>
                  <Text style={styles.storageVal}>{healthData.process.memory.heapUsed}</Text>
                  <Text style={styles.storageLab}>Heap Used</Text>
                </View>
                <View style={styles.storageDivider} />
                <View style={styles.storageItem}>
                  <Text style={styles.storageVal}>{healthData.system.freeMem}</Text>
                  <Text style={styles.storageLab}>Free System Mem</Text>
                </View>
             </View>
             <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '45%', backgroundColor: theme.primary }]} />
             </View>
             <Text style={styles.progressLab}>Engine Resource Load: 45%</Text>
          </GlassCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Infrastucture Links</Text>
          <HealthMetric 
            icon="server-outline" 
            label="Database" 
            value={healthData.database.status.toUpperCase()} 
            subValue={`Host: ${healthData.database.host}`}
            color={healthData.database.status === 'connected' ? theme.success : theme.error} 
          />
          <HealthMetric 
            icon="globe-outline" 
            label="Platform" 
            value={healthData.process.platform.toUpperCase()} 
            subValue={`${healthData.system.cpuCores} CPU Cores`}
            color="#fdcb6e" 
          />
        </View>

        <Text style={styles.footerText}>Last Refreshed: {new Date(healthData.timestamp).toLocaleTimeString()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: theme.textDim, marginTop: 15, fontSize: 14, fontWeight: '600' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  mainStatus: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  pulseCircle: { 
    width: 80, height: 80, borderRadius: 40, 
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    marginBottom: 15, backgroundColor: 'rgba(50, 255, 126, 0.05)'
  },
  statusTitle: { color: theme.text, fontSize: 20, fontWeight: '800', marginBottom: 5 },
  statusSub: { color: theme.textDim, fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
  section: { marginBottom: 25 },
  sectionTitle: { color: theme.text, fontSize: 16, fontWeight: '800', marginBottom: 15 },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricCard: { width: '48%', padding: 15, flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metricInfo: { marginLeft: 12, flex: 1 },
  metricLab: { color: theme.textDim, fontSize: 9, textTransform: 'uppercase', fontWeight: '700' },
  metricVal: { color: theme.text, fontSize: 13, fontWeight: '800', marginTop: 2 },
  metricSub: { color: theme.textDim, fontSize: 9, marginTop: 4 },
  fullCard: { padding: 20 },
  storageRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  storageItem: { alignItems: 'center' },
  storageVal: { color: theme.text, fontSize: 18, fontWeight: '900' },
  storageLab: { color: theme.textDim, fontSize: 10, textTransform: 'uppercase', marginTop: 4 },
  storageDivider: { width: 1, height: '100%', backgroundColor: theme.border },
  progressBarBg: { height: 8, backgroundColor: theme.input, borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  progressLab: { color: theme.textDim, fontSize: 10, marginTop: 10, fontWeight: '600', textAlign: 'center' },
  footerText: { textAlign: 'center', color: theme.textDim, fontSize: 11, fontStyle: 'italic', marginTop: 10 },
});
