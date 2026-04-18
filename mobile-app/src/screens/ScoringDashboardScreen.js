import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Text, Pressable } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchScoresQuery } from '../api/scoringApi';
import { colors } from '../theme/colors';
import {
  selectRecord,
  setConfidenceRange,
  setRiskLevel,
  setSearch,
} from '../store/scoringSlice';
import SearchBar from '../components/SearchBar';
import RiskFilter from '../components/RiskFilter';
import ScoreListItem from '../components/ScoreListItem';
import ConfidenceRangeFilter from '../components/ConfidenceRangeFilter';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';

export default function ScoringDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const {
    filters: { search, riskLevel, confidenceRange },
    pagination: { page, limit },
  } = useSelector((state) => state.scoring);

  const [searchText, setSearchText] = useState(search);

  useEffect(() => {
    setSearchText(search);
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => dispatch(setSearch(searchText)), 400);
    return () => clearTimeout(t);
  }, [dispatch, searchText]);

  const queryParams = useMemo(() => {
    const [min, max] = confidenceRange || [0, 100];

    const params = {
      responseId: search || undefined,
      riskLevel: riskLevel === 'All' ? undefined : riskLevel,
      page,
      limit,
      sortBy: 'calculatedAt',
      order: 'desc',
    };

    if (!(min === 0 && max === 100)) {
      params.minConfidence = min;
      params.maxConfidence = max;
    }

    return params;
  }, [confidenceRange, limit, page, riskLevel, search]);

  const { data, isLoading, isFetching, error, refetch } = useSearchScoresQuery(queryParams);

  const records = data?.data ?? [];

  const handleSelect = (record) => {
    dispatch(selectRecord(record._id));
    navigation.navigate('ScoringDetail', { recordId: record._id, record });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('GenerateScore')}
          style={styles.headerButton}
        >
          <Text style={styles.headerButtonText}>Generate</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  const onRangeChange = useCallback(
    (range) => dispatch(setConfidenceRange(range)),
    [dispatch]
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Loading scores…</Text>
          <Text style={styles.emptySubtitle}>Fetching latest confidence scores from the database.</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn’t load scores</Text>
          <Text style={styles.emptySubtitle}>
            Make sure the backend is running and reachable from your phone.
          </Text>
          <SecondaryButton title="Retry" onPress={refetch} />
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No scores yet</Text>
        <Text style={styles.emptySubtitle}>
          Generate a score to see it appear here instantly.
        </Text>
        <PrimaryButton title="Generate score" onPress={() => navigation.navigate('GenerateScore')} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by response ID"
      />
      <RiskFilter
        value={riskLevel}
        onChange={(value) => dispatch(setRiskLevel(value))}
      />
      <ConfidenceRangeFilter value={confidenceRange} onChange={onRangeChange} />
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ScoreListItem item={item} onPress={() => handleSelect(item)} />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshing={isFetching}
        onRefresh={refetch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  headerButtonText: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  empty: {
    flex: 1,
    paddingTop: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  emptySubtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

