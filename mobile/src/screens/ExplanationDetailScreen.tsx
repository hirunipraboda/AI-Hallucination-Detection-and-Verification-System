import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { apiDelete, apiGet, apiPost, apiPut } from '../api/http';
import { API_BASE_URL } from '../config';
import type {
  ApiResponse,
  AnnotatedSentence,
  ExplanationDetail,
  FactorBreakdown,
  RiskLevel,
  SourceReference,
} from '../types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ExplanationDetail'>;
type Route = RouteProp<RootStackParamList, 'ExplanationDetail'>;

const COLORS = {
  bg: '#050816',
  card: '#0b1020',
  cardBorder: '#111827',
  text: '#e5e7eb',
  muted: '#9ca3af',
  subtle: '#6b7280',
  blue: '#2196F3',
  green: '#4CAF50',
  yellow: '#FFC107',
  red: '#F44336',
  dangerBg: '#7f1d1d',
  dangerBorder: '#b91c1c',
  dangerText: '#fecaca',
};

const HIGHLIGHT = {
  green: COLORS.green,
  yellow: COLORS.yellow,
  red: COLORS.red,
};

function riskColor(risk: RiskLevel) {
  if (risk === 'Low') return COLORS.green;
  if (risk === 'Medium') return COLORS.yellow;
  return COLORS.red;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  const pct = clamp(value, 0, 100);
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function ExplanationDetailScreen({
  route,
  navigation,
}: {
  route: Route;
  navigation: Nav;
}) {
  const { responseId } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExplanationDetail | null>(null);
  const [scoreOpen, setScoreOpen] = useState(true);
  const [sourcesOpen, setSourcesOpen] = useState(true);
  const [sentenceModal, setSentenceModal] = useState<{
    open: boolean;
    sentence?: AnnotatedSentence;
    sources?: SourceReference | null;
  }>({ open: false });

  const secondsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<ApiResponse<ExplanationDetail>>(`/api/explanations/${responseId}`);
      setData(res.data);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to load explanation');
    } finally {
      setLoading(false);
    }
  }, [responseId]);

  const track = useCallback(
    async (payload: any) => {
      try {
        await apiPost<ApiResponse<any>>(`/api/explanations/${responseId}/interaction`, payload);
      } catch {
        // ignore
      }
    },
    [responseId]
  );

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  // Time tracking every 30 seconds while screen is mounted
  useEffect(() => {
    secondsRef.current = 0;
    timerRef.current = setInterval(() => {
      secondsRef.current += 30;
      track({ action: 'time', seconds: 30 });
    }, 30_000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [track]);

  const score = data?.scoreBreakdown?.confidenceScore ?? 0;
  const risk = (data?.scoreBreakdown?.hallucinationRisk ?? 'Medium') as RiskLevel;
  const factors = (data?.scoreBreakdown?.factorsBreakdown ?? []) as FactorBreakdown[];
  const annotated = data?.annotatedText ?? [];
  const sourceRefs = data?.sourceReferences ?? [];
  const meta = data?.metadata ?? {};

  const primaryFlag = useMemo(() => {
    return annotated.find((s) => s.highlightColor === 'red') || annotated.find((s) => s.highlightColor === 'yellow');
  }, [annotated]);

  const openSentence = async (s: AnnotatedSentence) => {
    const sources = s.claimId ? sourceRefs.find((r) => String(r.claimId) === String(s.claimId)) || null : null;
    setSentenceModal({ open: true, sentence: s, sources });
    track({ action: 'tap', sentenceId: s.sentenceId });
  };

  const [regenerating, setRegenerating] = useState(false);

  const regenerate = async () => {
    if (regenerating) return;
    setRegenerating(true);
    try {
      const res = await apiPost<ApiResponse<ExplanationDetail>>(`/api/explanations/${responseId}/regenerate`, {});
      setData(res.data);
      Alert.alert('Updated', 'Explanation regenerated successfully.');
    } catch (e: any) {
      Alert.alert('Regeneration failed', e?.message || 'Failed to update explanation');
    } finally {
      setRegenerating(false);
    }
  };

  const [deleteLoading, setDeleteLoading] = useState(false);

  const deleteExplanation = async () => {
    if (deleteLoading) return;

    const performDelete = async () => {
      setDeleteLoading(true);
      try {
        await apiDelete<ApiResponse<any>>(`/api/explanations/${responseId}`);
        navigation.goBack();
      } catch (e: any) {
        console.error('Delete failed', e);
        const msg = e?.message || 'Failed to delete';
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('Delete failed: ' + msg);
        } else {
          Alert.alert('Delete failed', msg);
        }
      } finally {
        setDeleteLoading(false);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const ok = window.confirm('Archive (soft delete) this explanation?');
      if (ok) performDelete();
      return;
    }

    // native: show confirm dialog
    Alert.alert('Delete explanation', 'Archive (soft delete) this explanation?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: performDelete },
    ]);
  };

  const exportPdf = async () => {
    try {
      track({ action: 'export' });
      
      const html = `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 30px; color: #1f2937; }
              h1 { font-size: 24px; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
              .meta { font-size: 14px; color: #6b7280; margin-bottom: 20px; }
              .score-box { background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin-bottom: 30px; }
              .score-title { font-size: 16px; font-weight: bold; color: #374151; }
              .score-val { font-size: 32px; font-weight: 800; color: #111827; margin: 10px 0; }
              .risk { padding: 4px 10px; border-radius: 12px; font-size: 14px; font-weight: bold; color: white; }
              .risk-Low { background-color: #4CAF50; }
              .risk-Medium { background-color: #FFC107; color: black; }
              .risk-High { background-color: #F44336; }
              h2 { font-size: 18px; color: #374151; margin-top: 30px; }
              .sentence { padding: 12px; margin-bottom: 8px; border-radius: 8px; border-left: 4px solid transparent; }
              .green { background-color: #dcfce7; border-left-color: #22c55e; }
              .yellow { background-color: #fef08a; border-left-color: #eab308; }
              .red { background-color: #fee2e2; border-left-color: #ef4444; }
              .stext { font-size: 16px; font-weight: 600; color: #1f2937; }
              .sexp { font-size: 14px; color: #4b5563; margin-top: 6px; }
            </style>
          </head>
          <body>
            <h1>Transparency Report</h1>
            <div class="meta">ID: ${responseId} | Generated on: ${new Date().toLocaleDateString()}</div>
            
            <div class="score-box">
              <div class="score-title">Integrity Score</div>
              <div class="score-val">${score}% Verified</div>
              <span class="risk risk-${risk}">${risk} Risk</span>
            </div>

            <h2>Analyzed Text Breakdown</h2>
            ${annotated.map(s => {
              const noteHtml = s.explanation ? `<div class="sexp"><b>Note:</b> ${s.explanation}</div>` : '';
              return `
                <div class="sentence ${s.highlightColor}">
                  <div class="stext">${s.text}</div>
                  ${noteHtml}
                </div>
              `;
            }).join('')}
          </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const downloadUrl = `${API_BASE_URL}/api/explanations/${responseId}/export?format=pdf`;
        window.location.href = downloadUrl;
        return;
      }

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Export Report PDF' });
      } else {
        Alert.alert('Report saved', `Saved locally to: ${uri}`);
      }
    } catch (e: any) {
      Alert.alert('Export failed', e?.message || 'Failed to export');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.blue} />
        <Text style={styles.centeredText}>Loading report…</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.centered}>
        <Text style={styles.centeredText}>Explanation not found</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchDetail}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalClaims = meta.totalSentences ?? annotated.length ?? 0;
  const flaggedClaims = (meta.contradictedCount ?? 0) + (meta.disputedCount ?? 0) + (meta.unverifiableCount ?? 0);
  const verifiedPercentage = totalClaims > 0 ? Math.round(((totalClaims - flaggedClaims) / totalClaims) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.reportLabel}>TRANSPARENCY REPORT</Text>
          <Text style={styles.reportTitle}>{data.responseId}</Text>
        </View>

        <View style={styles.topCard}>
          <View style={styles.topRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.integrityLabel}>Integrity Score</Text>
              <Text style={styles.integrityValue}>{verifiedPercentage}% Verified</Text>
              <View style={styles.chipRow}>
                <View style={[styles.chip, { backgroundColor: '#111827' }]}>
                  <Text style={styles.chipText}>{totalClaims} Claims</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: COLORS.dangerBg }]}>
                  <Text style={styles.chipText}>{flaggedClaims} Flagged</Text>
                </View>
              </View>
            </View>
            <View style={styles.circleWrap}>
              <View style={[styles.circleOuter, { borderColor: riskColor(risk) }]}>
                <Text style={styles.circleValue}>{verifiedPercentage}%</Text>
              </View>
              <Text style={styles.circleLabel}>{risk} risk</Text>
            </View>
          </View>
        </View>

        {/* Annotated text */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Analyzed Text</Text>
            <Text style={styles.sectionHint}>Tap highlights for details</Text>
          </View>
          <View style={styles.card}>
            {annotated.length === 0 ? (
              <Text style={styles.bodyText}>{data.originalText}</Text>
            ) : (
              annotated.map((s) => (
                <TouchableOpacity
                  key={s.sentenceId}
                  style={[styles.sentence, { backgroundColor: HIGHLIGHT[s.highlightColor] }]}
                  onPress={() => openSentence(s)}
                  activeOpacity={0.9}
                >
                  <Text style={styles.sentenceText}>{s.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Detailed Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Analysis</Text>
          {primaryFlag ? (
            <View style={styles.alertCard}>
              <Text style={styles.alertLabel}>POTENTIAL HALLUCINATION</Text>
              <Text style={styles.alertQuote}>"{primaryFlag.text}"</Text>
              {primaryFlag.explanation ? <Text style={styles.alertExplanation}>{primaryFlag.explanation}</Text> : null}
            </View>
          ) : null}
        </View>

        {/* Score breakdown */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => {
              setScoreOpen((v) => !v);
              track({ action: 'expand', section: 'scoreBreakdown' });
            }}
          >
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            <Text style={styles.sectionHint}>{scoreOpen ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          {scoreOpen ? (
            <View style={styles.card}>
              <Text style={styles.metaLine}>Overall confidence: {score}%</Text>
              <Text style={styles.metaLine}>Risk level: {risk}</Text>
              <View style={{ height: 12 }} />
              {factors.map((f, idx) => (
                <View key={`${f.factorName}-${idx}`} style={{ marginBottom: 12 }}>
                  <View style={styles.factorTop}>
                    <Text style={styles.factorName}>{f.factorName}</Text>
                    <Text style={styles.factorValue}>{f.value}%</Text>
                  </View>
                  <ProgressBar value={f.value} color={COLORS.blue} />
                  <Text style={styles.factorSub}>
                    Weight {f.weight}% • Contribution {f.contribution}
                  </Text>
                  {f.description ? <Text style={styles.factorDesc}>{f.description}</Text> : null}
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Source References */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => {
              setSourcesOpen((v) => !v);
              track({ action: 'expand', section: 'sourceReferences' });
            }}
          >
            <Text style={styles.sectionTitle}>Source References</Text>
            <Text style={styles.sectionHint}>{sourcesOpen ? '▼' : '▶'}</Text>
          </TouchableOpacity>
          {sourcesOpen ? (
            <View style={styles.card}>
              {sourceRefs.length === 0 ? (
                <Text style={styles.bodyMuted}>No sources available.</Text>
              ) : (
                sourceRefs.map((ref, idx) => (
                  <View key={`${ref.claimId || idx}`} style={styles.sourceBlock}>
                    <Text style={styles.claimText}>"{ref.claimText}"</Text>
                    {ref.summary ? <Text style={styles.bodyMuted}>{ref.summary}</Text> : null}
                    {(ref.sources || []).map((src, j) => (
                      <View key={`${idx}-${j}`} style={styles.sourceRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sourceName}>{src.name}</Text>
                          <Text style={styles.bodyMuted}>Credibility: {src.credibility}%</Text>
                          {src.evidence ? <Text style={styles.bodyTextSmall}>{src.evidence}</Text> : null}
                        </View>
                        {src.url ? (
                          <TouchableOpacity
                            style={styles.viewSourceBtn}
                            onPress={() => Linking.openURL(src.url!)}
                          >
                            <Text style={styles.viewSourceText}>View</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ))
              )}
            </View>
          ) : null}
        </View>

        {/* Actions */}
        <TouchableOpacity
          style={[styles.primaryBtn, (deleteLoading || regenerating) && styles.disabledBtn]}
          onPress={regenerate}
          activeOpacity={0.9}
          disabled={deleteLoading || regenerating}
        >
          {regenerating ? (
             <ActivityIndicator color={"#fff"} />
          ) : (
             <Text style={styles.primaryText}>Update / Generate Again</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.exportBtn, (deleteLoading || regenerating) && styles.disabledBtn]}
          onPress={exportPdf}
          activeOpacity={0.9}
          disabled={deleteLoading || regenerating}
        >
          <Text style={styles.exportText}>Export PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.deleteBtn, (deleteLoading || regenerating) && styles.disabledBtn]} onPress={deleteExplanation} activeOpacity={0.9} disabled={deleteLoading || regenerating}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />

        <Modal visible={sentenceModal.open} animationType="slide" transparent onRequestClose={() => setSentenceModal({ open: false })}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Sentence details</Text>
              <Text style={styles.modalSentence}>{sentenceModal.sentence?.text}</Text>
              {sentenceModal.sentence?.explanation ? (
                <Text style={styles.modalExplanation}>{sentenceModal.sentence.explanation}</Text>
              ) : (
                <Text style={styles.bodyMuted}>No explanation provided.</Text>
              )}

              {sentenceModal.sources ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={styles.modalSubtitle}>Sources</Text>
                  {sentenceModal.sources.sources.map((src, idx) => (
                    <View key={idx} style={styles.modalSourceRow}>
                      <Text style={styles.sourceName}>{src.name}</Text>
                      <Text style={styles.bodyMuted}>Credibility: {src.credibility}%</Text>
                      {src.url ? (
                        <TouchableOpacity onPress={() => Linking.openURL(src.url!)}>
                          <Text style={styles.linkText}>Open source</Text>
                        </TouchableOpacity>
                      ) : null}
                      {src.evidence ? <Text style={styles.bodyTextSmall}>{src.evidence}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : null}

              <TouchableOpacity style={styles.modalClose} onPress={() => setSentenceModal({ open: false })}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  centeredText: {
    color: COLORS.muted,
    marginTop: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  retryBtn: { marginTop: 12, backgroundColor: COLORS.blue, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  retryText: {
    color: '#0b1120',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  header: { marginBottom: 20, marginTop: 8 },
  reportLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    color: COLORS.subtle,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  reportTitle: {
    marginTop: 4,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  topCard: { backgroundColor: COLORS.card, borderRadius: 24, borderWidth: 1, borderColor: COLORS.cardBorder, padding: 20, marginBottom: 24 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  integrityLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  integrityValue: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  chipRow: { flexDirection: 'row', marginTop: 12 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginRight: 8 },
  chipText: {
    color: '#f9fafb',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  circleWrap: { alignItems: 'center' },
  circleOuter: { width: 78, height: 78, borderRadius: 39, borderWidth: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617' },
  circleValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  circleLabel: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  sectionHint: {
    color: COLORS.subtle,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  card: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: 20, padding: 18 },
  bodyText: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  bodyTextSmall: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  bodyMuted: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  sentence: { borderRadius: 14, padding: 12, marginBottom: 12 },
  sentenceText: {
    color: '#0b1120',
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  alertCard: { backgroundColor: COLORS.dangerBg, borderWidth: 1, borderColor: COLORS.dangerBorder, borderRadius: 18, padding: 16, marginTop: 10 },
  alertLabel: {
    color: COLORS.dangerText,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  alertQuote: {
    marginTop: 6,
    color: '#fff',
    fontStyle: 'italic',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Georgia'
  },
  alertExplanation: {
    marginTop: 6,
    color: COLORS.dangerText,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  metaLine: {
    color: COLORS.muted,
    fontSize: 14,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  factorTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  factorName: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  factorValue: {
    color: COLORS.muted,
    fontWeight: '700',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  factorSub: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  factorDesc: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  barTrack: { height: 10, backgroundColor: '#0b1225', borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: '#1f2937' },
  barFill: { height: '100%', borderRadius: 999 },

  sourceBlock: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#111827' },
  claimText: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  sourceName: {
    color: COLORS.blue,
    fontWeight: '800',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  viewSourceBtn: { backgroundColor: '#111827', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, marginLeft: 12 },
  viewSourceText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },

  primaryBtn: { backgroundColor: COLORS.blue, borderRadius: 999, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryText: {
    color: '#0b1120',
    fontWeight: '900',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  exportBtn: { marginTop: 12, borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1d4ed8' },
  exportText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  deleteBtn: { marginTop: 12, borderRadius: 999, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.dangerBorder },
  deleteText: {
    color: COLORS.dangerText,
    fontWeight: '800',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  disabledBtn: { opacity: 0.5 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: COLORS.cardBorder, paddingBottom: 40 },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  modalSentence: {
    color: COLORS.text,
    marginTop: 10,
    fontWeight: '700',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  modalExplanation: {
    color: COLORS.muted,
    marginTop: 6,
    lineHeight: 22,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  modalSubtitle: {
    color: COLORS.text,
    fontWeight: '800',
    marginBottom: 8,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  modalSourceRow: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#111827' },
  linkText: {
    color: COLORS.blue,
    marginTop: 4,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  modalClose: { marginTop: 24, backgroundColor: '#111827', paddingVertical: 14, borderRadius: 999, alignItems: 'center' },
  modalCloseText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
});

