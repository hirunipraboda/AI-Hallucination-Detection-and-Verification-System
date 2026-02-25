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
} from 'react-native';

// 💡 The categories a user can pick from
const CATEGORIES = ['Academic', 'Government', 'Trusted Web', 'News', 'Other'];

export default function AddSourceScreen({ navigation }) {
  // 💡 useState stores the form data as the user types
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 💡 This runs when the user taps "Add Source"
  const handleAddSource = () => {
    // Check if required fields are filled
    if (!name || !url || !selectedCategory) {
      Alert.alert('Missing Fields', 'Please fill in Name, URL and Category!');
      return;
    }

    // For now we just show a success message
    // Later we'll save this to MongoDB
    Alert.alert('Success! ✅', `${name} has been added as a source!`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
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

        {/* NAME INPUT */}
        <Text style={styles.label}>Source Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. PubMed Central"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        {/* URL INPUT */}
        <Text style={styles.label}>URL *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. https://pubmed.ncbi.nlm.nih.gov"
          placeholderTextColor="#888"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
        />

        {/* DESCRIPTION INPUT */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief description of this source..."
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* CATEGORY SELECTOR */}
        <Text style={styles.label}>Category *</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.activeCategoryChipText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddSource}>
          <Text style={styles.addButtonText}>+ Add Source</Text>
        </TouchableOpacity>

      </ScrollView>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  backButton: {
    color: '#9b59b6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  label: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    padding: 15,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 5,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#2a2a3e',
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  activeCategoryChip: {
    backgroundColor: '#9b59b6',
    borderColor: '#9b59b6',
  },
  categoryChipText: {
    color: '#888',
    fontSize: 14,
  },
  activeCategoryChipText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#9b59b6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});