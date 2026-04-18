import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import CircularConfidenceIndicator from '../components/CircularConfidenceIndicator';
import RiskBadge from '../components/RiskBadge';
import BreakdownCard from '../components/BreakdownCard';
import { PrimaryButton } from '../components/Buttons';
import { useCreateScoreMutation } from '../api/scoringApi';
import { calculateConfidenceScore, mapRiskLevel } from '../utils/previewScoring';

function parseScore(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export default function GenerateScoreScreen({ navigation }) {
  const [responseId, setResponseId] = useState('');
  const [verification, setVerification] = useState('80');
  const [credibility, setCredibility] = useState('80');
  const [consensus, setConsensus] = useState('80');

  const [createScore, { isLoading }] = useCreateScoreMutation();

  const numeric = useMemo(
    () => ({
      verificationScore: parseScore(verification),
      credibilityScore: parseScore(credibility),
      consensusScore: parseScore(consensus),
    }),
    [verification, credibility, consensus]
  );

  const confidenceScore = useMemo(
    () => calculateConfidenceScore(numeric),
    [numeric]
  );

  const riskLevel = useMemo(
    () => mapRiskLevel(confidenceScore),
    [confidenceScore]
  );

  const handleGenerate = async () => {
    if (!responseId.trim()) {
      Alert.alert('Validation', 'Response ID is required.');
      return;
    }

    try {
      const payload = {
        responseId: responseId.trim(),
        ...numeric,
      };

      const result = await createScore(payload).unwrap();

      if (result?.data) {
        Alert.alert('Created', 'Score generated successfully.', [
          {
            text: 'View details',
            onPress: () =>
              navigation.navigate('ScoringDetail', {
                recordId: result.data._id,
                record: result.data,
              }),
          },
        ]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not create score.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CircularConfidenceIndicator
        value={confidenceScore}
        riskLevel={riskLevel}
        label="PREVIEW"
        subtitle="LIVE SCORING PREVIEW"
      />
      <View style={styles.centerRisk}>
        <RiskBadge level={riskLevel} />
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Response ID</Text>
        <TextInput
          style={styles.input}
          placeholder="ai_response_123"
          placeholderTextColor={colors.textSecondary}
          value={responseId}
          onChangeText={setResponseId}
        />

        <Text style={styles.label}>Verification score</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={verification}
          onChangeText={setVerification}
        />

        <Text style={styles.label}>Credibility score</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={credibility}
          onChangeText={setCredibility}
        />

        <Text style={styles.label}>Consensus score</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={consensus}
          onChangeText={setConsensus}
        />
      </View>

      <BreakdownCard
        verificationScore={numeric.verificationScore}
        credibilityScore={numeric.credibilityScore}
        consensusScore={numeric.consensusScore}
      />

      <PrimaryButton
        title={isLoading ? 'Generating...' : 'Generate score'}
        onPress={handleGenerate}
      />
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
  centerRisk: {
    marginTop: 12,
    alignItems: 'center',
  },
  form: {
    marginTop: 24,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
  },
});

