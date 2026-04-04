import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { updateAnalysis, createAnalysis } from '../services/analysisService';
import { getCleanErrorMessage } from '../utils/errorHelper';

export default function ReportDetailScreen({ route, navigation }) {
  const [report, setReport] = React.useState(route?.params?.report || {});
  const [loading, setLoading] = React.useState(false);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const handleReanalyze = async () => {
    try {
      setLoading(true);
      const isLocalPreview = !report._id || report._id === 'local-preview';
      const text = report.originalResponse || report.originalText;

      let response;
      if (isLocalPreview) {
        console.log('[FLOW] Attempting to CREATE new analysis (local-preview detected)');
        response = await createAnalysis(text);
      } else {
        console.log('[FLOW] Attempting to UPDATE existing analysis (ID:', report._id, ')');
        response = await updateAnalysis(report._id, { originalResponse: text });
      }

      if (response?.success) {
        setReport(response.data);
        Alert.alert('Success', isLocalPreview ? 'Analysis has been saved successfully.' : 'Analysis has been refreshed with the latest logic.');
      }
    } catch (error) {
      const message = getCleanErrorMessage(error);
      const status = error.status || error.response?.status;

      if (status && status >= 400 && status < 500) {
        console.warn('[REANALYZE VALIDATION]', status, message);
        Alert.alert('Validation Warning', message);
      } else {
        console.error('[REANALYZE CRITICAL ERROR]', error);
        Alert.alert('Error', message || 'Server communication failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const score = report?.score || 0;
  const level = report?.confidenceLevel || 'LOW';
  let scoreColor = theme.danger; // Coral (Low)
  if (score >= 75) scoreColor = theme.primary; // Cyan (High)
  else if (score >= 40) scoreColor = theme.warning; // Amber (Mid)

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Analysis Report</Text>

          <View style={styles.headerButton}>
            <Text style={styles.placeholderIcon} />
          </View>
        </View>

        <GlassCard>
          <View style={styles.scoreRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionLabel}>Analysis Summary</Text>
              <Text style={styles.bodyText}>
                {report?.notes || 'No notes available.'}
              </Text>
            </View>
            <View style={styles.scoreTextBox}>
              <Text style={[styles.scorePercent, { color: scoreColor }]}>{Math.round(score)}%</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>{level}</Text>
            </View>
          </View>

          {Array.isArray(report?.confidenceReasons) && report.confidenceReasons.length > 0 && (
            <View style={styles.reasonsContainer}>
               <Text style={styles.sectionLabel}>Confidence Reasoning</Text>
              {report.confidenceReasons.map((reason, idx) => (
                <View key={idx} style={styles.confidenceReasonBox}>
                  <Text style={styles.confidenceReasonText}>• {reason}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.sectionLabel}>Flagged Statements & Reasons</Text>
          {Array.isArray(report?.flaggedSentences) &&
          report.flaggedSentences.length > 0 ? (
            report.flaggedSentences.map((item, index) => (
              <View key={index} style={styles.flaggedItem}>
                <Text style={styles.bulletText}>• {item?.text || 'Issue detected'}</Text>
                <View style={styles.reasonsRow}>
                  {Array.isArray(item?.reasons) && item.reasons.map((reason, rIdx) => (
                    <View key={rIdx} style={styles.reasonBadge}>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>No suspicious statements found.</Text>
          )}

          <Text style={styles.sectionLabel}>Structured Claim Extraction</Text>
          {Array.isArray(report?.extractedClaims) &&
          report.extractedClaims.length > 0 ? (
            report.extractedClaims.map((claim, index) => (
              <View key={index} style={styles.claimItem}>
                <Text style={styles.claimText}>{claim?.text || 'Claim text missing'}</Text>
                <View style={styles.claimMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={styles.typeText}>{(claim?.type || 'general').toUpperCase()}</Text>
                  </View>
                  <Text style={styles.claimConfidence}>
                    {Math.round((claim?.confidence || 0) * 100)}% Confidence
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.bodyText}>No measurable claims extracted.</Text>
          )}

          <Text style={styles.sectionLabel}>Original Response</Text>
          <Text style={styles.originalTextDisplay}>
            {report?.originalResponse || report?.originalText || 'No original response available.'}
          </Text>

          {report?.issues && (
            <>
              <Text style={styles.sectionLabel}>Risk Indicators</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{report.issues?.unsupportedClaims ?? 0}</Text>
                  <Text style={styles.statLabel}>Unsupported</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{report.issues?.overconfidentStatements ?? 0}</Text>
                  <Text style={styles.statLabel}>Confident</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{report.issues?.missingCitations ?? 0}</Text>
                  <Text style={styles.statLabel}>No Citation</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{report.issues?.contradictions ?? 0}</Text>
                  <Text style={styles.statLabel}>Conflict</Text>
                </View>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.reanalyzeButton, loading && { opacity: 0.6 }]}
            onPress={handleReanalyze}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.primary} />
            ) : (
              <Text style={styles.reanalyzeText}>↻ Re-analyze Results</Text>
            )}
          </TouchableOpacity>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.isDarkMode ? 'rgba(30, 194, 255, 0.10)' : 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: theme.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  placeholderIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionLabel: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 14,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 24,
    fontWeight: '900',
  },
  valueText: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  bodyText: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 26,
  },
  bulletText: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 4,
  },
  flaggedItem: {
    marginBottom: 16,
    paddingLeft: 4,
  },
  reasonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    paddingLeft: 12,
  },
  reasonBadge: {
    backgroundColor: theme.isDarkMode ? 'rgba(255, 69, 58, 0.12)' : 'rgba(255, 69, 58, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 58, 0.2)',
  },
  reasonText: {
    color: theme.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  claimItem: {
    backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  claimText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 10,
  },
  claimMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeText: {
    color: theme.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  claimConfidence: {
    color: theme.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.border,
  },
  scoreTextBox: {
    marginLeft: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.isDarkMode ? 'rgba(0,0,0,0.15)' : 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    minWidth: 80,
  },
  scorePercent: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  reasonsContainer: {
    marginBottom: 10,
  },
  confidenceReasonBox: {
    marginBottom: 4,
  },
  confidenceReasonText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  originalTextDisplay: {
    color: theme.textDim,
    fontSize: 14,
    lineHeight: 22,
    backgroundColor: theme.isDarkMode ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    color: theme.textDim,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  reanalyzeButton: {
    backgroundColor: theme.isDarkMode ? 'rgba(30, 194, 255, 0.1)' : 'rgba(30, 194, 255, 0.05)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(30, 194, 255, 0.2)',
  },
  reanalyzeText: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: '800',
  },
});