import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import CircularConfidenceIndicator from '../components/CircularConfidenceIndicator';
import RiskBadge from '../components/RiskBadge';
import BreakdownCard from '../components/BreakdownCard';
import TimestampDisplay from '../components/TimestampDisplay';
import { PrimaryButton, SecondaryButton } from '../components/Buttons';
import {
  useGetScoreByResponseIdQuery,
  useRecalculateScoreMutation,
  useSoftDeleteScoreMutation,
} from '../api/scoringApi';

export default function ScoringDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const initialRecord = route.params?.record;
  const responseId = initialRecord?.responseId || route.params?.responseId;

  const [recalculateScore] = useRecalculateScoreMutation();
  const [softDeleteScore] = useSoftDeleteScoreMutation();

  const {
    data: fetched,
    isLoading,
    error,
    refetch,
  } = useGetScoreByResponseIdQuery(responseId, { skip: !responseId });

  const record = fetched?.data || initialRecord;

  if (isLoading && !record) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Loading score…</Text>
      </View>
    );
  }

  if (error && !record) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Couldn’t load scoring record.</Text>
        <SecondaryButton title="Retry" onPress={refetch} />
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No scoring record provided.</Text>
      </View>
    );
  }

  const handleRecalculate = async () => {
    try {
      await recalculateScore({ id: record._id }).unwrap();
      refetch();
      Alert.alert('Recalculated', 'Score has been recalculated.');
    } catch (e) {
      Alert.alert('Error', 'Could not recalculate score.');
    }
  };

  const handleDelete = async () => {
    try {
      await softDeleteScore(record._id).unwrap();
      Alert.alert('Deleted', 'Record has been soft-deleted.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not delete record.');
    }
  };

  const { verificationScore, credibilityScore, consensusScore } = record.scoringFactors;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CircularConfidenceIndicator
        value={record.confidenceScore}
        riskLevel={record.hallucinationRiskLevel}
        label="RELIABLE"
        subtitle={`${record.hallucinationRiskLevel.toUpperCase()} HALLUCINATION RISK`}
      />
      <View style={styles.headerRow}>
        <RiskBadge level={record.hallucinationRiskLevel} />
        <Text style={styles.responseId}>{record.responseId}</Text>
      </View>
      <TimestampDisplay iso={record.calculatedAt} />
      <BreakdownCard
        verificationScore={verificationScore}
        credibilityScore={credibilityScore}
        consensusScore={consensusScore}
      />
      <View style={styles.buttons}>
        <PrimaryButton title="Recalculate" onPress={handleRecalculate} />
        <SecondaryButton title="Delete" onPress={handleDelete} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  responseId: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  buttons: {
    marginTop: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textSecondary,
  },
});

