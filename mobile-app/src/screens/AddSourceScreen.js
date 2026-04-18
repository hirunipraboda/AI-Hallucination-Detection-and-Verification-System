import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import { createSource, updateSource } from '../services/sourceService';

const CATEGORIES = [
  'Academic', 'Government', 'News', 'Trusted Web', 
  'Science', 'Technology', 'Healthcare', 'Encyclopedia',
  'Educational', 'NGO', 'Corporate', 'Social Media', 'Other'
];

export default function AddSourceScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const editingSource = route.params?.source;
  const [sourceName, setSourceName] = useState(editingSource?.sourceName || '');
  const [sourceURL, setSourceURL] = useState(editingSource?.sourceURL || '');
  const [sourceCategory, setSourceCategory] = useState(editingSource?.sourceCategory || 'Other');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!sourceName.trim() || !sourceURL.trim()) {
      Alert.alert('Validation', 'Please fill in Name and URL.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        sourceName,
        sourceURL,
        sourceCategory,
        authorityScore: editingSource?.authorityScore || 50,
        accuracyScore: editingSource?.accuracyScore || 50,
        recencyScore: editingSource?.recencyScore || 50,
      };

      if (editingSource) {
        await updateSource(editingSource._id, payload);
        Alert.alert('Updated ✅', 'Source details updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await createSource(payload);
        Alert.alert('Success ✅', 'New source added to TruthLens Verification Hub.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={editingSource ? "Edit Source" : "Add New Source"}
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{editingSource ? "Update Source" : "Register Source"}</Text>
        <Text style={styles.subHeading}>
          {editingSource 
            ? "Modify the source's primary information and classification."
            : "Manually register a source for credibility evaluation. Our system will auto-vet based on domain if possible."}
        </Text>

        <GlassCard style={styles.card}>
          <Text style={styles.label}>Source Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. World Health Organization"
            placeholderTextColor={theme.textDim}
            value={sourceName}
            onChangeText={setSourceName}
          />

          <Text style={styles.label}>Website URL</Text>
          <TextInput
            style={styles.input}
            placeholder="https://www.who.int"
            placeholderTextColor={theme.textDim}
            autoCapitalize="none"
            value={sourceURL}
            onChangeText={setSourceURL}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryBtn,
                  sourceCategory === cat && styles.activeCategoryBtn
                ]}
                onPress={() => setSourceCategory(cat)}
              >
                <Text style={[
                  styles.categoryText,
                  sourceCategory === cat && styles.activeCategoryText
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <PrimaryButton
              title={editingSource ? "Save Changes" : "Add Source"}
              onPress={handleSave}
              loading={loading}
            />
          </View>
        </GlassCard>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Note: Government (.gov) and Academic (.edu) domains are automatically given higher authority scores by our vetting engine.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  container: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 },
  heading: { color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 10 },
  subHeading: { color: theme.textDim, fontSize: 16, lineHeight: 24, marginBottom: 24 },
  card: { padding: 20 },
  label: { color: theme.text, fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 10 },
  input: {
    backgroundColor: theme.input,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 15,
    color: theme.text,
    fontSize: 16,
    marginBottom: 15,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
    marginBottom: 10,
  },
  categoryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.card,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  activeCategoryBtn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryText: { color: theme.textDim, fontSize: 13, fontWeight: '600' },
  activeCategoryText: { color: '#000000' },
  infoBox: {
    marginTop: 30,
    backgroundColor: theme.card,
    padding: 15,
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  infoText: { color: theme.textDim, fontSize: 14, lineHeight: 22, fontStyle: 'italic' },
});
