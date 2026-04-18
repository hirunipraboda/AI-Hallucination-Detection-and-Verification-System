import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import HistoryCard from '../components/HistoryCard';
import { useTheme } from '../context/ThemeContext';
import { getAllAnalyses, deleteAnalysis } from '../services/analysisService';
import { sampleHistory } from '../data/sampleHistory';
import { getCleanErrorMessage } from '../utils/errorHelper';

export default function HistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const loadHistory = async () => {
    try {
      console.log('Loading history from API...');
      const response = await getAllAnalyses();
      const data = Array.isArray(response?.data) ? response.data : [];
      
      if (data.length === 0) {
        console.log('API returned empty history, using sample data.');
        setHistory(Array.isArray(sampleHistory) ? sampleHistory : []);
      } else {
        console.log(`Loaded ${data.length} records from API.`);
        setHistory(data);
      }
    } catch (error) {
      console.error('History API error:', error);
      setHistory(Array.isArray(sampleHistory) ? sampleHistory : []);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Analysis',
      'Are you sure you want to remove this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await deleteAnalysis(id);
              if (res.success) {
                setHistory(prev => prev.filter(item => item._id !== id));
              }
            } catch (err) {
              const message = getCleanErrorMessage(err);
              Alert.alert('Error', message);
            }
          }
        }
      ]
    );
  };

  const handleReanalyse = (text) => {
    navigation.navigate('Analyze', { prefillText: text });
  };

  const filteredHistory = history.filter((item) => {
    const text = item?.originalResponse || item?.originalText || '';
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Scoring History</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search past analyses..."
            placeholderTextColor={theme.textDim}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>RECENT REPORTS</Text>
          <Text style={styles.filterText}>Filter</Text>
        </View>

        {filteredHistory.map((item, index) => (
          <HistoryCard
            key={item?._id || `history-${index}`}
            item={item}
            onPress={() => navigation.navigate('ReportDetail', { report: item })}
            onDelete={() => handleDelete(item._id)}
            onReanalyse={(text) => handleReanalyse(text)}
          />
        ))}

        {filteredHistory.length > 5 && (
          <TouchableOpacity style={styles.loadMoreButton} activeOpacity={0.8}>
            <Text style={styles.loadMoreText}>Load Older History</Text>
          </TouchableOpacity>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    color: theme.text,
    fontSize: 24,
    fontWeight: '700',
    width: 28,
    textAlign: 'center',
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  searchBar: {
    backgroundColor: theme.input,
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    color: theme.textMuted,
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 17,
    marginLeft: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  filterText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  loadMoreButton: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 6,
  },
  loadMoreText: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '600',
  },
});