import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Linking,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import { deleteSource, updateSource } from '../services/sourceService';

const { width } = Dimensions.get('window');

export default function SourceDetailScreen({ navigation, route }) {
  const { source } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(theme);
  
  const [currentSource, setCurrentSource] = useState(source);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const getScoreColor = (s) => {
    if (s >= 80) return '#32ff7e';
    if (s >= 50) return '#fff200';
    return '#ff4d4d';
  };

  const statusMap = {
    verified: { label: 'VERIFIED', color: '#32ff7e', icon: 'shield-checkmark' },
    unreliable: { label: 'UNRELIABLE', color: '#ff4d4d', icon: 'alert-circle' },
    unverified: { label: 'UNVERIFIED', color: '#fff200', icon: 'help-circle' },
  };

  const status = statusMap[currentSource.status] || statusMap.unverified;

  const handleDelete = () => {
    Alert.alert(
      'Remove Source',
      `Are you sure you want to completely remove ${currentSource.sourceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSource(currentSource._id);
              Alert.alert('Success', 'Source removed from Hub.');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove source.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleScoreUpdate = async (field, change) => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const newValue = Math.min(100, Math.max(0, currentSource[field] + change));
      const updatedData = { ...currentSource, [field]: newValue };
      
      const overallScore = Math.round(
        (updatedData.authorityScore + updatedData.accuracyScore + updatedData.recencyScore) / 3
      );
      updatedData.overallScore = overallScore;

      const updated = await updateSource(currentSource._id, updatedData);
      setCurrentSource(updated);
    } catch (error) {
      Alert.alert('Error', 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, value, field, color }) => (
    <View style={styles.scoreItem}>
      <View style={styles.scoreInfoRow}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={[styles.scoreNumber, { color }]}>{value}%</Text>
      </View>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
        </View>
        {isAdmin && (
          <View style={styles.controlRow}>
            <TouchableOpacity onPress={() => handleScoreUpdate(field, -5)} style={styles.miniBtn}>
              <Ionicons name="remove" size={16} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleScoreUpdate(field, +5)} style={styles.miniBtn}>
              <Ionicons name="add" size={16} color={theme.text} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="Source Insights" 
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon={isAdmin ? "trash-outline" : null}
        onRightPress={isAdmin ? handleDelete : null}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* TOP IDENTITY */}
        <GlassCard style={styles.heroCard}>
          <View style={[styles.bigLogo, { backgroundColor: status.color + '22' }]}>
            <Text style={[styles.bigLogoText, { color: status.color }]}>
              {currentSource.sourceName?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.heroName}>{currentSource.sourceName}</Text>
          {isAdmin && (
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('AddSource', { source: currentSource })}
            >
              <Ionicons name="create-outline" size={16} color={theme.primary} />
              <Text style={styles.editBtnText}>Edit Details</Text>
            </TouchableOpacity>
          )}
          <View style={styles.heroMeta}>
            <View style={styles.metaChip}>
              <Ionicons name="pricetag-outline" size={12} color={theme.primary} />
              <Text style={styles.metaChipText}>{currentSource.sourceCategory}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: status.color + '22' }]}>
              <Ionicons name={status.icon} size={12} color={status.color} />
              <Text style={[styles.statusTagText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
        </GlassCard>

        {/* OVERALL SCORE DIAL */}
        <View style={styles.dialSection}>
          <GlassCard style={styles.dialCard}>
            <View style={[styles.dialInner, { borderColor: getScoreColor(currentSource.overallScore) + '44' }]}>
              <Text style={[styles.dialValue, { color: getScoreColor(currentSource.overallScore) }]}>
                {currentSource.overallScore}
              </Text>
              <Text style={styles.dialLabel}>CREDIBILITY INDEX</Text>
            </View>
          </GlassCard>
        </View>

        {/* METRICS BREAKDOWN */}
        <Text style={styles.sectionHeading}>Credibility Metrics</Text>
        <GlassCard style={styles.metricsCard}>
          <ScoreBar label="Authority" value={currentSource.authorityScore} field="authorityScore" color="#18dcff" />
          <ScoreBar label="Accuracy" value={currentSource.accuracyScore} field="accuracyScore" color="#32ff7e" />
          <ScoreBar label="Recency" value={currentSource.recencyScore} field="recencyScore" color="#fff200" />
        </GlassCard>

        {/* GENERAL INFO */}
        <Text style={styles.sectionHeading}>General Information</Text>
        <GlassCard style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="link" size={18} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Official Website</Text>
              <TouchableOpacity onPress={() => Linking.openURL(currentSource.sourceURL)}>
                <Text style={styles.infoValue} numberOfLines={1}>{currentSource.sourceURL}</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={18} color={theme.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Last Assessment</Text>
              <Text style={styles.infoValue}>{new Date(currentSource.updatedAt || currentSource.lastUpdated || Date.now()).toLocaleDateString()}</Text>
            </View>
          </View>

          {currentSource.vetNote && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={18} color={theme.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Administrative Note</Text>
                <Text style={styles.noteValue}>{currentSource.vetNote}</Text>
              </View>
            </View>
          )}
        </GlassCard>

        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { paddingHorizontal: 20 },
  heroCard: { padding: 30, alignItems: 'center', marginBottom: 20 },
  bigLogo: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  bigLogoText: { fontSize: 36, fontWeight: '900' },
  heroName: { color: theme.text, fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  heroMeta: { flexDirection: 'row', alignItems: 'center' },
  metaChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.input + '44', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 10 },
  metaChipText: { color: theme.textDim, fontSize: 11, fontWeight: '700', marginLeft: 5, textTransform: 'uppercase' },
  statusTag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusTagText: { fontSize: 11, fontWeight: '900', marginLeft: 5 },
  dialSection: { alignItems: 'center', marginBottom: 25 },
  dialCard: { width: 160, height: 160, borderRadius: 80, padding: 0, justifyContent: 'center', alignItems: 'center' },
  dialInner: { width: 140, height: 140, borderRadius: 70, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  dialValue: { fontSize: 48, fontWeight: '900' },
  dialLabel: { fontSize: 8, color: theme.textDim, fontWeight: '800', marginTop: 4 },
  sectionHeading: { color: theme.text, fontSize: 14, fontWeight: '800', textTransform: 'uppercase', opacity: 0.6, marginBottom: 12, marginLeft: 5 },
  metricsCard: { padding: 20, marginBottom: 25 },
  scoreItem: { marginBottom: 20 },
  scoreInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  scoreLabel: { color: theme.text, fontSize: 15, fontWeight: '600' },
  scoreNumber: { fontSize: 16, fontWeight: '800' },
  progressContainer: { flexDirection: 'row', alignItems: 'center' },
  progressBar: { flex: 1, height: 8, backgroundColor: theme.input + '66', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  controlRow: { flexDirection: 'row', marginLeft: 15 },
  miniBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: theme.input, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  infoCard: { padding: 20, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  infoContent: { marginLeft: 15, flex: 1 },
  infoLabel: { color: theme.textDim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  infoValue: { color: theme.primary, fontSize: 14, fontWeight: '600' },
  noteValue: { color: theme.text, fontSize: 14, lineHeight: 20 },
  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.isDarkMode ? 'rgba(30, 194, 255, 0.1)' : 'rgba(30, 194, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(30, 194, 255, 0.2)',
  },
  editBtnText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
});
