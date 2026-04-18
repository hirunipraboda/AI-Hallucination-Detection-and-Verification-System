import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import { createFeedback, getAllFeedback, updateFeedback, deleteFeedback } from '../services/feedbackService';

export default function FeedbackScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(theme);
  
  const [activeTab, setActiveTab] = useState('form');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  
  // Form State
  const [voteRating, setVoteRating] = useState(5);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('accuracy');
  const [observation, setObservation] = useState('');
  const [correction, setCorrection] = useState('');
  const [editingId, setEditingId] = useState(null);

  const reportId = route.params?.reportId; // If coming from a specific report

  useEffect(() => {
    if (activeTab === 'history') {
      fetchFeedback();
    }
  }, [activeTab]);

  const fetchFeedback = async () => {
    try {
      setHistoryLoading(true);
      const data = await getAllFeedback();
      setFeedbackList(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const finalReportId = reportId && reportId !== 'local-preview' ? reportId : undefined;
      
      const payload = {
        reportId: finalReportId,
        voteRating,
        rating,
        category,
        observation,
        correction: voteRating <= 2 ? correction : '',
      };

      if (editingId) {
        await updateFeedback(editingId, payload);
        Alert.alert('Success', 'Feedback updated successfully');
      } else {
        await createFeedback(payload);
        Alert.alert('Thank You!', 'Your feedback helps us improve TruthLens.');
      }
      
      handleCancelEdit();
      setActiveTab('history');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setVoteRating(item.voteRating);
    setRating(item.rating);
    setCategory(item.category);
    setObservation(item.observation);
    setCorrection(item.correction || '');
    setActiveTab('form');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to remove this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteFeedback(id);
              fetchFeedback();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setVoteRating(5);
    setRating(5);
    setCategory('accuracy');
    setObservation('');
    setCorrection('');
  };

  const renderForm = () => (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Impact Analysis</Text>
      <Text style={styles.subHeading}>Help us verify if the AI analysis was accurate and useful to you.</Text>
      
      <GlassCard style={styles.card}>
        <Text style={styles.label}>Rate the helpfulness of this analysis</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity key={`helpful-${num}`} onPress={() => setVoteRating(num)}>
              <Ionicons 
                name={voteRating >= num ? "star" : "star-outline"} 
                size={32} 
                color={voteRating >= num ? theme.primary : theme.textDim} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>System Accuracy Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(num => (
            <TouchableOpacity key={`accuracy-${num}`} onPress={() => setRating(num)}>
              <Ionicons 
                name={rating >= num ? "star" : "star-outline"} 
                size={32} 
                color={rating >= num ? theme.primary : theme.textDim} 
              />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {['accuracy', 'relevance', 'tone', 'performance', 'others'].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catBtn, category === cat && styles.activeCatBtn]} 
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.activeCatText]}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tell us more</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="What did you observe?"
          placeholderTextColor={theme.textDim}
          value={observation}
          onChangeText={setObservation}
        />

        {voteRating <= 2 && (
          <>
            <Text style={styles.label}>Provide Correction</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="What should it have been?"
              placeholderTextColor={theme.textDim}
              value={correction}
              onChangeText={setCorrection}
            />
          </>
        )}

        <View style={{ marginTop: 10 }}>
          <PrimaryButton 
            title={editingId ? "Update Feedback" : "Submit Feedback"} 
            onPress={handleSubmit} 
            loading={loading}
          />
          {editingId && (
            <TouchableOpacity style={styles.cancelLink} onPress={handleCancelEdit}>
              <Text style={styles.cancelLinkText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>
    </ScrollView>
  );

  const renderHistory = () => (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Feedback Log</Text>
      <Text style={styles.subHeading}>Past contributions to system improvement.</Text>
      
      {historyLoading ? (
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      ) : feedbackList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No feedback history found</Text>
        </View>
      ) : (
        feedbackList.map(item => (
          <GlassCard key={item._id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <View style={[styles.statusBadge, { backgroundColor: item.voteRating >= 3 ? theme.success + '22' : theme.error + '22' }]}>
                <Text style={{ color: item.voteRating >= 3 ? theme.success : theme.error, fontWeight: '700', fontSize: 12 }}>
                  HELPFULNESS: {item.voteRating}/5
                </Text>
              </View>
              <Text style={styles.historyDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            {user?.role === 'admin' && item.userId && (
              <View style={styles.userInfoRow}>
                <Ionicons name="person-circle-outline" size={16} color={theme.primary} />
                <Text style={styles.userEmail}>{item.userId?.email || 'Unknown User'}</Text>
              </View>
            )}

            <Text style={styles.historyRating}>Rating: {'⭐'.repeat(item.rating || 0)}</Text>
            <Text style={styles.historyCategory}>Category: {item.category}</Text>
            {item.observation ? (
                <Text style={styles.historyObs} numberOfLines={2}>"{item.observation}"</Text>
            ) : null}
            <View style={styles.statusRow}>
               <Text style={[styles.statusLabel, { color: item.status === 'applied' ? theme.success : theme.warning }]}>
                 ● Status: {(item.status || 'pending').toUpperCase()}
               </Text>
               <View style={styles.historyActions}>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(item)}>
                    <Ionicons name="create-outline" size={20} color={theme.primary} />
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item._id)}>
                    <Ionicons name="trash-outline" size={20} color={theme.error} />
                 </TouchableOpacity>
               </View>
            </View>
          </GlassCard>
        ))
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader 
        title="Feedbacks"
      />
      
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'form' && styles.activeTab]} 
          onPress={() => setActiveTab('form')}
        >
          <Text style={[styles.tabText, activeTab === 'form' && styles.activeTabText]}>Review</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'form' ? renderForm() : renderHistory()}
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  tabContainer: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 10,
    backgroundColor: theme.card,
    borderRadius: 25,
    padding: 5,
    borderWidth: 1,
    borderColor: theme.border,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  activeTab: { backgroundColor: theme.primary },
  tabText: { color: theme.textDim, fontWeight: '700' },
  activeTabText: { color: '#000000' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  heading: { color: theme.text, fontSize: 28, fontWeight: '800', marginBottom: 6 },
  subHeading: { color: theme.textDim, fontSize: 16, lineHeight: 24, marginBottom: 20 },
  card: { padding: 20 },
  label: { color: theme.text, fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 10 },
  voteRow: { flexDirection: 'row', marginBottom: 15 },
  voteBtn: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12, 
    backgroundColor: theme.input,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 10,
  },
  activeVoteBtn: { backgroundColor: theme.success + '44', borderColor: theme.success },
  activeVoteBtnRed: { backgroundColor: theme.error + '44', borderColor: theme.error },
  voteText: { color: theme.textDim, fontWeight: '600' },
  activeVoteText: { color: theme.text, fontWeight: '700' },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  catBtn: { 
    paddingHorizontal: 15, paddingVertical: 8, 
    borderRadius: 20, backgroundColor: theme.input, 
    marginRight: 8, marginBottom: 8,
    borderWidth: 1, borderColor: theme.border 
  },
  activeCatBtn: { backgroundColor: theme.primary + '22', borderColor: theme.primary },
  catText: { color: theme.textDim, fontSize: 13, fontWeight: '600' },
  activeCatText: { color: theme.primary },
  input: {
    backgroundColor: theme.input,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 15,
    color: theme.text,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  historyCard: { padding: 16, marginBottom: 12 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, backgroundColor: 'rgba(30, 194, 255, 0.05)', padding: 6, borderRadius: 8 },
  userEmail: { color: theme.primary, fontSize: 13, fontWeight: '700', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  historyDate: { color: theme.textDim, fontSize: 12 },
  historyRating: { color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  historyCategory: { color: theme.textDim, fontSize: 13, marginBottom: 8 },
  historyObs: { color: theme.text, fontSize: 14, fontStyle: 'italic', marginBottom: 10 },
  statusRow: { 
    borderTopWidth: 1, 
    borderTopColor: theme.border, 
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: { fontSize: 12, fontWeight: '700' },
  historyActions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { marginLeft: 15, padding: 5 },
  cancelLink: { marginTop: 15, alignItems: 'center' },
  cancelLinkText: { color: theme.textMuted, fontSize: 14, textDecorationLine: 'underline' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: theme.textDim, fontSize: 16 },
});
