import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { apiGet, apiPost, apiDelete } from '../api/http';
import * as DocumentPicker from 'expo-document-picker';
import { API_BASE_URL } from '../config';
import type { ApiResponse, ExplanationSummary, RiskLevel } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Explanations'>;

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
};

const ISSUE_TYPES = [
  { label: 'All', value: '' },
  { label: 'Verified', value: 'verified' },
  { label: 'Contradicted', value: 'contradicted' },
  { label: 'Disputed', value: 'disputed' },
  { label: 'Unverifiable', value: 'unverifiable' },
];

function confidenceColor(score: number) {
  if (score > 70) return COLORS.green;
  if (score >= 40) return COLORS.yellow;
  return COLORS.red;
}

function riskColor(risk: RiskLevel) {
  if (risk === 'Low') return COLORS.green;
  if (risk === 'Medium') return COLORS.yellow;
  return COLORS.red;
}


export default function ExplanationListScreen({ navigation }: Props) {
  const [items, setItems] = useState<ExplanationSummary[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [issueType, setIssueType] = useState('');

  const canLoadMore = useMemo(() => page < pages && !loadingMore && !loading, [page, pages, loadingMore, loading]);

  const loadPage = useCallback(
    async (nextPage: number, mode: 'initial' | 'refresh' | 'more', query: string = '', filter: string = '') => {
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);
      if (mode === 'initial') setLoading(true);
      try {
        const queryParam = query ? `&search=${encodeURIComponent(query)}` : '';
        const filterParam = filter ? `&issueType=${filter}` : '';
        const res = await apiGet<ApiResponse<ExplanationSummary[]>>(
          `/api/explanations?page=${nextPage}&limit=10&sort=desc${queryParam}${filterParam}`
        );
        const list = res.data || [];
        setItems((prev) => (mode === 'more' ? [...prev, ...list] : list));
        setPage(res.pagination?.page ?? nextPage);
        setPages(res.pagination?.pages ?? 1);
      } catch (e: any) {
        Alert.alert('Error', e?.message || 'Failed to load explanations');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadPage(1, 'initial', searchQuery, issueType);
    }, [loadPage, searchQuery, issueType])
  );

  const onRefresh = () => loadPage(1, 'refresh', searchQuery, issueType);

  const onEndReached = () => {
    if (!canLoadMore) return;
    loadPage(page + 1, 'more', searchQuery, issueType);
  };

  const executeSearch = () => {
    setSearchQuery(searchInput);
    // loadPage will be triggered by useFocusEffect due to search query change
  };

  const handleFilterChange = (val: string) => {
    setIssueType(val);
    // loadPage will be triggered by useFocusEffect
  };


  const deleteExplanation = async (responseId: string) => {
    setDeletingId(responseId);
    try {
      await apiDelete<ApiResponse<any>>(`/api/explanations/${responseId}`);
      await loadPage(1, 'refresh', searchQuery);
    } catch (e: any) {
      console.error('Delete failed', e);
      const msg = e?.message || 'Failed to delete explanation';
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Delete failed: ' + msg);
      } else {
        Alert.alert('Delete failed', msg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const pickAndUploadPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      setUploading(true);
      const asset = result.assets[0];

      const formData = new FormData();
      if (Platform.OS === 'web') {
        const asset = result.assets[0];
        // @ts-ignore - 'file' exists on web
        if (asset.file) {
          // @ts-ignore
          formData.append('pdf', asset.file);
        } else {
          const blob = await (await fetch(asset.uri)).blob();
          formData.append('pdf', blob, asset.name || 'document.pdf');
        }
      } else {
        const asset = result.assets[0];
        // @ts-ignore
        formData.append('pdf', {
          uri: asset.uri,
          name: asset.name || 'document.pdf',
          type: 'application/pdf',
        });
      }

      console.log(`Uploading PDF to: ${API_BASE_URL}/api/explanations/upload`);
      const response = await fetch(`${API_BASE_URL}/api/explanations/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      const resData = await response.json();
      console.log('PDF Upload Response:', resData);
      if (!response.ok) {
        const error = resData.error || 'Upload failed';
        const details = resData.details ? `\n\nDetails: ${resData.details}` : '';
        throw new Error(`${error}${details}`);
      }

      await loadPage(1, 'refresh', searchQuery);

      const newResponseId = resData.data?.responseId;
      if (newResponseId) {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          if (window.confirm('PDF uploaded and analyzed successfully. View Report?')) {
            navigation.navigate('ExplanationDetail', { responseId: newResponseId });
          }
        } else {
          Alert.alert('Success', 'PDF uploaded and analyzed successfully.', [
            { text: 'View Report', onPress: () => navigation.navigate('ExplanationDetail', { responseId: newResponseId }) },
            { text: 'OK' }
          ]);
        }
      } else {
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.alert('PDF uploaded and analyzed successfully.');
        } else {
          Alert.alert('Success', 'PDF uploaded and analyzed successfully.');
        }
      }
    } catch (e: any) {
      console.error('Upload failed', e);
      let errorMsg = e?.message || 'Failed to upload PDF';

      // Special check for localhost connectivity on mobile
      if (Platform.OS !== 'web' && errorMsg.toLowerCase().includes('network request failed') && API_BASE_URL.includes('localhost')) {
        errorMsg = 'Connection failed. Since you are using a physical phone, please change "localhost" to your PC\'s IP address in "mobile/src/config.ts".';
      }

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('Upload failed: ' + errorMsg);
      } else {
        Alert.alert('Upload failed', errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const totalClaims = item.totalSentences || 0;
    const verified = item.verifiedCount || 0;
    const score = totalClaims > 0 ? Math.round((verified / totalClaims) * 100) : (item.confidenceScore ?? 0);
    
    const risk: RiskLevel = item.riskLevel || 'Medium';
    const preview = (item.originalPreview || '').trim();

    const handleLongPress = () => {
      if (deletingId) return;

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const ok = window.confirm('Delete this explanation? It will be removed from the list.');
        if (ok) deleteExplanation(item.responseId);
        return;
      }

      Alert.alert(
        'Delete Explanation',
        'Are you sure you want to delete this explanation? It will be removed from the list.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteExplanation(item.responseId) },
        ]
      );
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ExplanationDetail', { responseId: String(item.responseId) })}
        onLongPress={handleLongPress}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View style={styles.cardLeft}>
            <Text style={styles.preview} numberOfLines={2}>
              {preview.length ? preview + (preview.length >= 50 ? '…' : '') : '—'}
            </Text>
            <Text style={styles.date}>{item.date || '—'}</Text>
          </View>

          <View style={styles.cardRight}>
            <>
              <View style={[styles.badge, { backgroundColor: confidenceColor(score) }]}>
                <Text style={styles.badgeText}>{score}%</Text>
              </View>
              <View style={[styles.riskPill, { borderColor: riskColor(risk) }]}>
                <View style={[styles.riskDot, { backgroundColor: riskColor(risk) }]} />
                <Text style={styles.riskText}>{risk}</Text>
              </View>
              {Platform.OS === 'web' ? (
                <TouchableOpacity
                  style={styles.inlineDelete}
                  onPress={() => {
                    const ok = typeof window !== 'undefined' && window.confirm('Delete this explanation?');
                    if (ok) deleteExplanation(item.responseId);
                  }}
                >
                  <Text style={styles.inlineDeleteText}>Delete</Text>
                </TouchableOpacity>
              ) : null}
            </>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search explanations..."
          placeholderTextColor={COLORS.subtle}
          value={searchInput}
          onChangeText={setSearchInput}
          onSubmitEditing={executeSearch}
          returnKeyType="search"
          maxLength={20}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchInput.length > 0 && (
          <TouchableOpacity onPress={() => { setSearchInput(''); setSearchQuery(''); loadPage(1, 'initial', ''); }} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {ISSUE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.filterChip,
                issueType === type.value && styles.filterChipActive
              ]}
              onPress={() => handleFilterChange(type.value)}
            >
              <Text style={[
                styles.filterChipText,
                issueType === type.value && styles.filterChipTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.blue} />
          <Text style={[styles.centeredText, { fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' }]}>Loading explanations…</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(it) => String(it.responseId)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.blue} />}
            onEndReachedThreshold={0.4}
            onEndReached={onEndReached}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={COLORS.blue} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No explanations yet</Text>
                <Text style={styles.emptyText}>Upload a PDF to generate a report.</Text>
              </View>
            }
          />

          <Text style={styles.hintText}>Long-press any card to delete</Text>

          <TouchableOpacity
            style={[styles.fab, { bottom: 90, backgroundColor: COLORS.green }]}
            onPress={pickAndUploadPdf}
            activeOpacity={0.9}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#0b1120" />
            ) : (
              <Text style={styles.fabText}>Upload PDF</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  filterContainer: {
    height: 40,
    marginTop: 5,
    marginBottom: 5,
  },
  filterList: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.blue,
    borderColor: COLORS.blue,
  },
  filterChipText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#0b1120',
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    height: 44,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  clearBtn: { padding: 8 },
  clearBtnText: { color: COLORS.subtle, fontSize: 16, fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 110 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLeft: { flex: 1, paddingRight: 16 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  preview: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  date: {
    color: COLORS.subtle,
    fontSize: 12,
    marginTop: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10 },
  badgeText: {
    color: '#0b1120',
    fontWeight: '800',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  riskDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  riskText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  inlineDelete: { marginTop: 8, backgroundColor: 'transparent', paddingHorizontal: 8, paddingVertical: 6 },
  inlineDeleteText: {
    color: COLORS.dangerBg,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centeredText: { color: COLORS.muted, marginTop: 10 },
  empty: { paddingTop: 40, alignItems: 'center' },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  emptyText: {
    color: COLORS.muted,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  footer: { paddingVertical: 16 },
  hintText: {
    color: COLORS.subtle,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 80,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: COLORS.blue,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  fabText: {
    color: '#0b1120',
    fontWeight: '900',
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto'
  },
});

