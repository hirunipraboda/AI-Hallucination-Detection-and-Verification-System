import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import { getAllSources, deleteSource } from '../services/sourceService';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  'All', 'Academic', 'Government', 'News', 'Trusted Web', 
  'Science', 'Technology', 'Healthcare', 'Encyclopedia',
  'Educational', 'NGO', 'Corporate', 'Social Media', 'Other'
];

export default function SourcesListScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(theme);
  
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSources();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSources();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchSources = async () => {
    try {
      if (!refreshing) setLoading(true);
      const data = await getAllSources();
      setSources(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load sources.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSources();
  };
  
  const handleDeleteSource = (item) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to remove ${item.sourceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSource(item._id);
              fetchSources();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete source');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const filteredSources = sources.filter(source => {
    const matchesSearch = (source.sourceName || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = activeFilter === 'All' ||
                          (source.sourceCategory || '').toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.overallScore - a.overallScore);

  const getStatusColor = (status) => {
    if (status === 'verified') return '#32ff7e';
    if (status === 'unreliable') return '#ff4d4d';
    return '#fff200';
  };

  const getCategoryIcon = (cat) => {
    switch (cat.toLowerCase()) {
      case 'academic': return 'school-outline';
      case 'government': return 'business-outline';
      case 'news': return 'newspaper-outline';
      case 'science': return 'flask-outline';
      case 'technology': return 'hardware-chip-outline';
      case 'healthcare': return 'medical-outline';
      case 'encyclopedia': return 'library-outline';
      case 'educational': return 'book-outline';
      default: return 'globe-outline';
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="Source Hub" 
      />
      
      <View style={styles.main}>
        {/* SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.textDim} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search truth sources..."
            placeholderTextColor={theme.textDim}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText !== '' && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={theme.textDim} />
            </TouchableOpacity>
          )}
        </View>

        {/* CATEGORY FILTERS */}
        <View style={styles.filterWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, activeFilter === cat && styles.activeFilterChip]}
                onPress={() => setActiveFilter(cat)}
              >
                <Ionicons 
                  name={getCategoryIcon(cat)} 
                  size={14} 
                  color={activeFilter === cat ? '#000' : theme.textDim} 
                  style={{ marginRight: 6 }} 
                />
                <Text style={[styles.filterText, activeFilter === cat && styles.activeFilterText]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* SOURCES LIST */}
        {loading && !refreshing ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredSources}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <GlassCard
                style={styles.sourceCard}
                onPress={() => navigation.navigate('SourceDetail', { source: item })}
              >
                <View style={[styles.logoBox, { backgroundColor: getStatusColor(item.status) + '11' }]}>
                  <Text style={[styles.logoText, { color: getStatusColor(item.status) }]}>
                    {item.sourceName ? item.sourceName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>

                <View style={styles.infoBox}>
                  <View style={styles.titleRow}>
                    <Text style={styles.sourceName} numberOfLines={1}>{item.sourceName}</Text>
                    {item.status === 'verified' && (
                      <View style={[styles.statusBadge, { backgroundColor: '#32ff7e22' }]}>
                        <Text style={styles.statusBadgeText}>VERIFIED</Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.metaRow}>
                    <Ionicons name={getCategoryIcon(item.sourceCategory || 'other')} size={12} color={theme.textDim} />
                    <Text style={styles.categoryLabel}>{item.sourceCategory || 'Other'}</Text>
                    {item.status !== 'verified' && (
                      <>
                        <View style={styles.dot} />
                        <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
                          {item.status?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </View>
                </View>

                <View style={[styles.scoreDial, { borderColor: getStatusColor(item.status) + '44' }]}>
                  <Text style={[styles.dialText, { color: getStatusColor(item.status) }]}>{item.overallScore}</Text>
                </View>

                {user?.role === 'admin' && (
                  <View style={styles.adminQuickActions}>
                    <TouchableOpacity 
                      onPress={() => navigation.navigate('AddSource', { source: item })}
                      style={styles.quickActionBtn}
                    >
                      <Ionicons name="create-outline" size={18} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleDeleteSource(item)}
                      style={styles.quickActionBtn}
                    >
                      <Ionicons name="trash-outline" size={18} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                )}
              </GlassCard>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={60} color={theme.textDim} />
                <Text style={styles.emptyText}>No matching sources found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* FAB - Admin Only */}
      {user?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddSource')}
        >
          <Ionicons name="add" size={32} color="#000" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

// FlatList from react-native
import { FlatList } from 'react-native';

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  main: { flex: 1 },
  searchContainer: {
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.input,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: theme.input + '44',
  },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: theme.text, fontSize: 16, fontWeight: '500' },
  filterWrapper: { marginBottom: 15 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 5 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.input + '55',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeFilterChip: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterText: { color: theme.textDim, fontSize: 13, fontWeight: '700' },
  activeFilterText: { color: '#000', fontWeight: '800' },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  sourceCard: { padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  logoBox: { 
    width: 48, height: 48, borderRadius: 12, 
    alignItems: 'center', justifyContent: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  logoText: { fontSize: 20, fontWeight: '900' },
  infoBox: { flex: 1, marginLeft: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  sourceName: { color: theme.text, fontSize: 16, fontWeight: '800', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { color: '#32ff7e', fontSize: 9, fontWeight: '900' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  categoryLabel: { color: theme.textDim, fontSize: 12, marginLeft: 5, fontWeight: '600' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: theme.textDim, marginHorizontal: 8 },
  statusLabel: { fontSize: 10, fontWeight: '800' },
  scoreDial: { 
    width: 50, height: 50, borderRadius: 25, 
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    marginLeft: 10,
  },
  dialText: { fontSize: 14, fontWeight: '900' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 100, opacity: 0.5 },
  emptyText: { color: theme.textDim, fontSize: 16, marginTop: 15 },
  fab: {
    position: 'absolute', bottom: 30, right: 25,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.primary,
    alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5,
  },
  adminQuickActions: {
    marginLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: theme.border,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  quickActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
});
