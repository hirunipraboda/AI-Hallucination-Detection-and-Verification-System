import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getAllSources } from '../services/sourceService';

const FILTERS = ['All', 'Academic', 'Government', 'Trusted Web', 'News', 'Other'];

export default function SourcesListScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 useEffect runs when the screen loads
  // We use it to fetch sources from the backend
  useEffect(() => {
    fetchSources();
  }, []);

  // 💡 This also runs when we come back to this screen
  // So if we add a new source, the list refreshes!
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchSources();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const data = await getAllSources();
      setSources(data);
    } catch (error) {
      Alert.alert('Error', 'Could not load sources. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  const filteredSources = sources.filter(source => {
    const matchesSearch = (source.sourceName || '').toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = activeFilter === 'All' ||
                          (source.sourceCategory || '').toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  }).sort((a, b) => b.overallScore - a.overallScore);

  const getStatusColor = (status) => {
    if (status === 'verified') return '#2ecc71';
    if (status === 'unreliable') return '#e74c3c';
    return '#f39c12';
  };
  
  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sources</Text>
          <Text style={styles.subtitle}>TruthLens Verification Hub</Text>
        </View>
        <TouchableOpacity style={styles.shieldButton}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search verified sources..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* FILTER TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.activeFilterTab]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LOADING or SOURCE CARDS */}
      {loading ? (
        <ActivityIndicator size="large" color="#9b59b6" style={{ marginTop: 50 }} />
      ) : filteredSources.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No sources found</Text>
          <Text style={styles.emptySubtext}>Tap + to add a new source</Text>
        </View>
      ) : (
        <ScrollView style={styles.sourcesList}>
          {filteredSources.map(source => (
            <TouchableOpacity
              key={source._id}
              style={styles.sourceCard}
              onPress={() => navigation.navigate('SourceDetail', { source })}
            >
              <View style={styles.sourceLogo}>
                <Text style={styles.sourceLogoText}>
                  {source.sourceName ? source.sourceName.charAt(0) : '?'}
                </Text>
              </View>

              <View style={styles.sourceInfo}>
                <View style={styles.sourceNameRow}>
                  <Text style={styles.sourceName}>{source.sourceName}</Text>
                  {source.status === 'verified' && (
                    <Text style={styles.verifiedBadge}>✓</Text>
                  )}
                </View>
                <Text style={styles.sourceCategory}>
                  <Text style={{ color: getStatusColor(source.status) }}>
                    {source.status?.toUpperCase()}
                  </Text>
                </Text>
              </View>

              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{source.overallScore}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* FAB BUTTON */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSource')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0f1e' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#00d4aa', marginTop: 2 },
  shieldButton: {
    width: 45, height: 45, borderRadius: 22,
    backgroundColor: '#1a2332',
    alignItems: 'center', justifyContent: 'center',
  },
  shieldIcon: { fontSize: 20 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2332',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 15 },
  filterContainer: { paddingHorizontal: 20, marginBottom: 15 },
  filterTab: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#1a2332', marginRight: 10,
  },
  activeFilterTab: { backgroundColor: '#00d4aa' },
  filterText: { color: '#888', fontSize: 14 },
  activeFilterText: { color: '#000000', fontWeight: 'bold' },
  sourcesList: { paddingHorizontal: 20 },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  sourceLogo: {
    width: 50, height: 50, borderRadius: 10,
    backgroundColor: '#00d4aa',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 15,
  },
  sourceLogoText: { color: '#000000', fontSize: 20, fontWeight: 'bold' },
  sourceInfo: { flex: 1 },
  sourceNameRow: { flexDirection: 'row', alignItems: 'center' },
  sourceName: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginRight: 6 },
  verifiedBadge: { color: '#00d4aa', fontSize: 16, fontWeight: 'bold' },
  sourceCategory: { color: '#00d4aa', fontSize: 12, marginTop: 3, fontWeight: '600' },
  scoreContainer: {
    width: 55, height: 55, borderRadius: 27,
    borderWidth: 3, borderColor: '#00d4aa',
    alignItems: 'center', justifyContent: 'center',
  },
  scoreText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  fab: {
    position: 'absolute', bottom: 30, right: 25,
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#00d4aa',
    alignItems: 'center', justifyContent: 'center',
    elevation: 5,
  },
  fabText: { color: '#000000', fontSize: 30, fontWeight: 'bold' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80 },
  emptyText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
  emptySubtext: { color: '#888', fontSize: 14, marginTop: 8 },
});