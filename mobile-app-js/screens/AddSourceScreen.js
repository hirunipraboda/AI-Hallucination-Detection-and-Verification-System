import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createSource } from '../services/sourceService';

const CATEGORIES = ['Academic', 'Government', 'Trusted Web', 'News', 'Other'];

export default function AddSourceScreen({ navigation }) {
  const [sourceName, setSourceName] = useState('');
  const [sourceURL, setSourceURL] = useState('');
  const [sourceCategory, setSourceCategory] = useState('');
  const [authorityScore, setAuthorityScore] = useState('50');
  const [accuracyScore, setAccuracyScore] = useState('50');
  const [recencyScore, setRecencyScore] = useState('50');
  const [loading, setLoading] = useState(false);

  const handleAddSource = async () => {
    if (!sourceName || !sourceURL || !sourceCategory) {
      Alert.alert('Missing Fields', 'Please fill in Name, URL and Category!');
      return;
    }

    try {
      setLoading(true);
      await createSource({
        sourceName,
        sourceURL,
        sourceCategory,
        authorityScore: Number(authorityScore),
        accuracyScore: Number(accuracyScore),
        recencyScore: Number(recencyScore),
      });

      Alert.alert('Success! ✅', `${sourceName} has been added!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Could not add source. Is your backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Source</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView style={styles.form}>

        {/* SOURCE NAME */}
        <Text style={styles.label}>Source Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. PubMed Central"
          placeholderTextColor="#888"
          value={sourceName}
          onChangeText={setSourceName}
        />

        {/* URL */}
        <Text style={styles.label}>URL *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. https://pubmed.ncbi.nlm.nih.gov"
          placeholderTextColor="#888"
          value={sourceURL}
          onChangeText={setSourceURL}
          autoCapitalize="none"
        />

        {/* CATEGORY */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryChip, sourceCategory === cat && styles.activeCategoryChip]}
              onPress={() => setSourceCategory(cat)}
            >
              <Text style={[styles.categoryChipText, sourceCategory === cat && styles.activeCategoryChipText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* AUTHORITY SCORE */}
        <Text style={styles.label}>Authority Score (0-100)</Text>
        <TextInput
          style={styles.input}
          placeholder="50"
          placeholderTextColor="#888"
          value={authorityScore}
          onChangeText={setAuthorityScore}
          keyboardType="numeric"
        />

        {/* ACCURACY SCORE */}
        <Text style={styles.label}>Accuracy Score (0-100)</Text>
        <TextInput
          style={styles.input}
          placeholder="50"
          placeholderTextColor="#888"
          value={accuracyScore}
          onChangeText={setAccuracyScore}
          keyboardType="numeric"
        />

        {/* RECENCY SCORE */}
        <Text style={styles.label}>Recency Score (0-100)</Text>
        <TextInput
          style={styles.input}
          placeholder="50"
          placeholderTextColor="#888"
          value={recencyScore}
          onChangeText={setRecencyScore}
          keyboardType="numeric"
        />

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddSource}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.addButtonText}>+ Add Source</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: { color: '#9b59b6', fontSize: 16, fontWeight: '600' },
  title: { color: '#ffffff', fontSize: 20, fontWeight: 'bold' },
  form: { paddingHorizontal: 20, marginTop: 10 },
  label: { color: '#ffffff', fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 15 },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 },
  categoryChip: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#2a2a3e',
    borderWidth: 1, borderColor: '#3a3a5e',
  },
  activeCategoryChip: { backgroundColor: '#9b59b6', borderColor: '#9b59b6' },
  categoryChipText: { color: '#888', fontSize: 14 },
  activeCategoryChipText: { color: '#ffffff', fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  addButtonText: { color: '#ffffff', fontSize: 18, fontWeight: 'bold' },
});