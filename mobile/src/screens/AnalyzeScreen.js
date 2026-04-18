import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import { useTheme } from '../context/ThemeContext';
import { createAnalysis } from '../services/analysisService';
import { getCleanErrorMessage } from '../utils/errorHelper';

export default function AnalyzeScreen({ navigation, route }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = getStyles(theme);

  // Handle pre-filled text from History (Reanalyse)
  useEffect(() => {
    const prefillText = route.params?.prefillText;
    if (prefillText) {
      setInputText(prefillText);
      // We delay slightly to ensure state is set before calling handleAnalyze
      setTimeout(() => {
        handleAnalyzeFromText(prefillText);
      }, 100);
      
      // Clear the param so it doesn't re-trigger on back navigation
      navigation.setParams({ prefillText: undefined });
    }
  }, [route.params?.prefillText]);

  const handleAnalyzeFromText = async (text) => {
    try {
      setLoading(true);
      const response = await createAnalysis(text);
      const report = response?.data;
      navigation.navigate('ReportDetail', { report });
    } catch (error) {
      const message = getCleanErrorMessage(error);
      const status = error.status || error.response?.status;

      if (status === 409 || status === 400) {
        Alert.alert('Validation Warning', message);
        return;
      }

      console.error('[API REANALYSE CRITICAL]', error);
      Alert.alert('Error', message || 'Failed to auto-reanalyse. Please try manual analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      Alert.alert('Validation', 'Please paste an AI response first.');
      return;
    }

    try {
      setLoading(true);

      const response = await createAnalysis(inputText);
      const report = response?.data;

      navigation.navigate('ReportDetail', { report });
      setInputText('');
    } catch (error) {
      const message = getCleanErrorMessage(error);
      const status = error.status || error.response?.status;

      // For Validation errors (like duplicates or short inputs), only show the popup and STAY on the screen.
      if (status === 409 || status === 400) {
        Alert.alert(
          'Validation Error',
          'the response is too short or duplicated cannot analyse.'
        );
        return;
      }

      // ONLY for critical/network errors, show the alert and THEN fallback to local preview
      Alert.alert(
        'Server Error',
        message || 'Failed to reach backend. Using local preview mode.'
      );

      const fallbackReport = {
        _id: 'local-preview',
        originalText: inputText,
        extractedClaims: [inputText],
        suspiciousSentences: [
          'Possible unsupported or overconfident statement detected.',
        ],
        issues: {
          unsupportedClaims: 1,
          overconfidentStatements: 1,
          contradictions: 0,
        },
        score: 68,
        confidenceLevel: 'MID',
        notes: 'Preview mode result generated because backend is unavailable.',
        metadata: {
          responseLength: inputText.length,
          claimCount: 1,
          sourceType: 'manual-input',
        },
        createdAt: new Date().toISOString(),
      };

      navigation.navigate('ReportDetail', { report: fallbackReport });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="AI Response Analysis"
        />

        <Text style={styles.heading}>Verify AI Output</Text>
        <Text style={styles.subHeading}>
          Paste the response you received from any AI model to check for
          hallucinations and factual errors.
        </Text>

        <GlassCard style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.searchIcon}>⌕</Text>
            <Text style={styles.label}>Paste AI Response</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Paste the text here... (e.g., 'The capital of France is Marseille according to...')"
            placeholderTextColor={theme.textDim}
            multiline
            textAlignVertical="top"
            value={inputText}
            onChangeText={setInputText}
          />

          <PrimaryButton
            title="Analyze Response"
            onPress={handleAnalyze}
            loading={loading}
          />
        </GlassCard>

        <Text style={styles.footerText}>
          Your input is processed securely and used to improve TruthLens'
          detection capabilities.
          <Text style={styles.privacyLink}> Privacy Policy</Text>
        </Text>
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
    paddingTop: 14,
    paddingBottom: 28,
  },
  heading: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
  },
  subHeading: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 28,
    marginBottom: 24,
  },
  card: {
    padding: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchIcon: {
    color: theme.primary,
    fontSize: 18,
  },
  label: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  input: {
    minHeight: 250,
    borderRadius: 24,
    backgroundColor: theme.input,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
    color: theme.text,
    fontSize: 16,
    marginBottom: 22,
  },
  footerText: {
    color: theme.textDim,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 25,
    marginTop: 30,
    paddingHorizontal: 8,
  },
  privacyLink: {
    color: theme.primary,
    textDecorationLine: 'underline',
  },
});