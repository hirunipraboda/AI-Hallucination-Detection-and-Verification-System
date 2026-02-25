import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

// 💡 This is our DUMMY DATA - fake sources so the screen looks real
// Later we'll replace this with real data from MongoDB
const DUMMY_SOURCES = [
  { id: '1', name: 'PubMed Central', category: 'ACADEMIC', score: 98, verified: true },
  { id: '2', name: 'Data.gov', category: 'GOVERNMENT', score: 95, verified: true },
  { id: '3', name: 'Reuters', category: 'TRUSTED WEB', score: 92, verified: true },
  { id: '4', name: 'WHO', category: 'GOVERNMENT', score: 90, verified: true },
  { id: '5', name: 'MIT Tech Review', category: 'ACADEMIC', score: 87, verified: true },
];

// 💡 The filter categories shown at the top
const FILTERS = ['All', 'Academic', 'Government', 'Trusted Web'];

export default function SourcesListScreen({ navigation }) {
  // 💡 useState is how we store data that can change
  // searchText stores what the user types in the search bar
  const [searchText, setSearchText] = useState('');
  // activeFilter stores which filter tab is selected
  const [activeFilter, setActiveFilter] = useState('All');

  // 💡 This filters the sources based on search and selected filter
  const filteredSources = DUMMY_SOURCES.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesFilter = activeFilter === 'All' || 
                          source.category.toLowerCase().includes(activeFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

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

      {/* SOURCE CARDS LIST */}
      <ScrollView style={styles.sourcesList}>
        {filteredSources.map(source => (
          <TouchableOpacity 
            key={source.id} 
            style={styles.sourceCard}
            onPress={() => navigation.navigate('SourceDetail', { source })}
>
            
            {/* Source Logo Placeholder */}
            <View style={styles.sourceLogo}>
              <Text style={styles.sourceLogoText}>
                {source.name.charAt(0)}
              </Text>
            </View>

            {/* Source Info */}
            <View style={styles.sourceInfo}>
              <View style={styles.sourceNameRow}>
                <Text style={styles.sourceName}>{source.name}</Text>
                {source.verified && <Text style={styles.verifiedBadge}>✓</Text>}
              </View>
              <Text style={styles.sourceCategory}>{source.category}</Text>
            </View>

            {/* Credibility Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{source.score}</Text>
            </View>

          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB BUTTON (+ button) */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddSource')}>
  <Text style={styles.fabText}>+</Text>
</TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#9b59b6',
    marginTop: 2,
  },
  shieldButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: '#2a2a3e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    marginHorizontal: 20,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    marginRight: 10,
  },
  activeFilterTab: {
    backgroundColor: '#9b59b6',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sourcesList: {
    paddingHorizontal: 20,
  },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
  },
  sourceLogo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  sourceLogoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  verifiedBadge: {
    color: '#9b59b6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sourceCategory: {
    color: '#9b59b6',
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  scoreContainer: {
    width: 55,
    height: 55,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#9b59b6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});