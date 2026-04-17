import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Platform, StatusBar, ActivityIndicator, Alert, Linking } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const BRAND_COLOR = '#00E5FF';
const BG_COLOR = '#0A1118';
const CARD_BG = '#121A21';
const BORDER_COLOR = '#1A252D';
const TEXT_MUTED = '#7A8C99';
const VERIFIED_COLOR = '#00E676';
const CONTRADICTED_COLOR = '#FF5252';
const UNVERIFIABLE_COLOR = '#FFC400';

const DUMMY_CLAIMS = [
  {
    id: '1',
    status: 'VERIFIED',
    timeAgo: '2 mins ago',
    text: '"Global renewable energy capacity rose by 50% in 2023, marking the fastest growth rate in two decades."',
    evidenceType: 'EVIDENCE SOURCE',
    sourceTitle: 'IEA Renewables 2023 Report',
    sourceUrl: 'iea.org/reports/renewables-2023',
    sourceIcon: 'file-document-outline',
  },
  {
    id: '2',
    status: 'CONTRADICTED',
    timeAgo: '5 mins ago',
    text: '"The local government has completely banned the use of electric scooters in the downtown district."',
    evidenceType: 'COUNTER EVIDENCE',
    sourceTitle: 'City Council Press Release',
    sourceUrl: 'New regulations limit speed, not us...',
    sourceIcon: 'gavel',
  },
  {
    id: '3',
    status: 'UNVERIFIABLE',
    timeAgo: '8 mins ago',
    text: '"Insiders claim that the CEO plans to resign by the end of the next fiscal quarter."',
    unverifiableReason: 'Insufficient public data to confirm. Based on anonymous reports which lack secondary corroboration.',
  }
];

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState('All Claims');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claims, setClaims] = useState<any[]>([]);

  const fetchClaims = async (filter = 'All Claims') => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      let endpoint = `${baseUrl}/verifications`;
      if (filter === 'Verified') {
        endpoint = `${baseUrl}/verifications/likely-true`;
      } else if (filter === 'Contradicted') {
        endpoint = `${baseUrl}/verifications/likely-false`;
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      setClaims(data.reverse());
    } catch (error) {
      console.error("Error fetching claims:", error);
    }
  };

  useEffect(() => {
    fetchClaims(activeFilter);
  }, [activeFilter]);

  const handleAnalyze = async () => {
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/verifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          claim: searchQuery
        }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      Alert.alert(
        "Analysis Complete",
        "The claim has been successfully analyzed.",
        [{ text: "OK" }]
      );
      setSearchQuery('');
      fetchClaims(activeFilter);
    } catch (error) {
      console.error("Error calling API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClaim = async (id: string) => {
    Alert.alert(
      "Delete Claim",
      "Are you sure you want to delete this verification claim?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const baseUrl = process.env.EXPO_PUBLIC_API_URL;
              const response = await fetch(`${baseUrl}/verifications/${id}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                setClaims(currentClaims => currentClaims.filter(claim => claim._id !== id));
                Alert.alert("Success", "Successfully deleted");
              } else {
                Alert.alert("Error", "Failed to delete claim");
              }
            } catch (error) {
              console.error("Error deleting claim:", error);
              Alert.alert("Error", "An error occurred while deleting the claim");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="shield-check" size={28} color={BRAND_COLOR} />
            <Text style={styles.logoText}>
              TruthLens <Text style={styles.logoTextHighlight}>Verification</Text>
            </Text>
          </View>
          <TouchableOpacity style={styles.historyBtn}>
            <MaterialCommunityIcons name="history" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color={BRAND_COLOR} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Paste news URL or type a claim..."
              placeholderTextColor={TEXT_MUTED}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[styles.analyzeBtn, (isLoading || searchQuery.trim() === '') && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={isLoading || searchQuery.trim() === ''}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.analyzeBtnText}>ANALYZE</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filtersContent}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'All Claims' && styles.filterChipActive]}
              onPress={() => setActiveFilter('All Claims')}>
              <Text style={[styles.filterChipText, activeFilter === 'All Claims' && styles.filterChipTextActive]}>All Claims</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Verified' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Verified')}>
              <MaterialCommunityIcons name="check-circle" size={16} color={VERIFIED_COLOR} />
              <Text style={[styles.filterChipText, activeFilter === 'Verified' && styles.filterChipTextActive]}>Verified</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'Contradicted' && styles.filterChipActive]}
              onPress={() => setActiveFilter('Contradicted')}>
              <MaterialCommunityIcons name="close-circle" size={16} color={CONTRADICTED_COLOR} />
              <Text style={[styles.filterChipText, activeFilter === 'Contradicted' && styles.filterChipTextActive]}>Contradicted</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Subheader */}
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>EXTRACTED CLAIMS ({claims.length})</Text>
          </View>

          {/* List of Claims */}
          <View style={styles.cardsContainer}>
            {claims.map((claimData) => {
              const status = claimData.verificationOutcome;
              const isVerified = status === 'Likely True' || status === 'True';
              const isContradicted = status === 'Likely False' || status === 'False';
              const isUnverifiable = !isVerified && !isContradicted;

              let borderColor = BORDER_COLOR;
              if (isVerified) borderColor = VERIFIED_COLOR;
              if (isContradicted) borderColor = CONTRADICTED_COLOR;
              if (isUnverifiable) borderColor = UNVERIFIABLE_COLOR;

              const statusText = status ? status.toUpperCase() : 'UNKNOWN';
              const timeAgo = claimData.checkedAt ? new Date(claimData.checkedAt).toLocaleString() : 'Just now';

              return (
                <View key={claimData._id || Math.random().toString()} style={[styles.card, { borderColor: borderColor, borderWidth: 1 }]}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.badge, { backgroundColor: isVerified ? '#00E67615' : isContradicted ? '#FF525215' : '#FFC40015' }]}>
                      <Text style={[styles.badgeText, { color: borderColor }]}>{statusText}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={styles.timeText}>{timeAgo}</Text>
                      {claimData._id && (
                        <TouchableOpacity onPress={() => handleDeleteClaim(claimData._id)}>
                          <Feather name="trash-2" size={16} color={TEXT_MUTED} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <Text style={styles.claimText}>"{claimData.claim}"</Text>

                  {/* Evidence Source Sections */}
                  {claimData.factCheckUrl && typeof claimData.factCheckUrl === 'string' && claimData.factCheckUrl.trim() !== '' ? (
                    <View style={styles.sourceSection}>
                      <Text style={styles.sourceLabel}>FACT CHECK SOURCE</Text>
                      <TouchableOpacity
                        style={styles.sourceBox}
                        onPress={() => {
                          const url = claimData.factCheckUrl;
                          Linking.canOpenURL(url).then(supported => {
                            if (supported) {
                              Linking.openURL(url);
                            } else {
                              console.log("Don't know how to open URI: " + url);
                            }
                          });
                        }}
                      >
                        <View style={[styles.sourceIconBox, { backgroundColor: isVerified ? '#00E67615' : isContradicted ? '#FF525215' : '#FFC40015' }]}>
                          <MaterialCommunityIcons name="google-earth" size={20} color={borderColor} />
                        </View>
                        <View style={styles.sourceInfo}>
                          <Text style={styles.sourceTitle}>External Verification</Text>
                          <Text style={styles.sourceUrl} numberOfLines={1}>
                            {claimData.factCheckUrl.replace(/^https?:\/\//, '').split('/')[0]}
                          </Text>
                        </View>
                        <Feather name="external-link" size={18} color={BRAND_COLOR} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.sourceSection}>
                      <Text style={styles.sourceLabel}>EVIDENCE SOURCE</Text>
                      <View style={styles.sourceBox}>
                        <View style={[styles.sourceIconBox, { backgroundColor: isVerified ? '#00E67615' : isContradicted ? '#FF525215' : '#FFC40015' }]}>
                          <MaterialCommunityIcons name="file-document-outline" size={20} color={borderColor} />
                        </View>
                        <View style={styles.sourceInfo}>
                          <Text style={styles.sourceTitle}>System Analysis</Text>
                          <Text style={styles.sourceUrl} numberOfLines={1}>
                            Verification processing completed
                          </Text>
                        </View>
                        <Feather name="external-link" size={18} color={TEXT_MUTED} />
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG_COLOR,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A252D',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 8,
  },
  logoTextHighlight: {
    color: BRAND_COLOR,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: '#2A363D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A363D',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 10,
  },
  searchIcon: {
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    height: 40,
  },
  analyzeBtn: {
    backgroundColor: BRAND_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  analyzeBtnText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 13,
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  filtersContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  filtersContent: {
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A363D',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },
  filterChipText: {
    color: TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  statsLabel: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scoreText: {
    color: BRAND_COLOR,
    fontSize: 13,
    fontWeight: 'bold',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeText: {
    color: TEXT_MUTED,
    fontSize: 12,
    fontStyle: 'italic',
  },
  claimText: {
    color: '#FFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sourceSection: {
    marginTop: 8,
  },
  sourceLabel: {
    color: TEXT_MUTED,
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG_COLOR,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1A252D',
  },
  sourceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceUrl: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  unverifiableBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFC40030',
  },
  unverifiableText: {
    color: UNVERIFIABLE_COLOR,
    fontSize: 13,
    lineHeight: 20,
  }
});
