import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { CATEGORIES } from "../services/feedback.constants";
import { feedbackApi } from "../services/feedbackApi";
import { VoteButtons } from "./VoteButtons";
import { StarRating } from "./StarRating";
import { PickerModal } from "./PickerModal";
import { styles, C } from "../styles/feedback.styles";

export function FeedbackForm({ onSubmitted }) {
  const [form, setForm] = useState({
    vote: null,
    rating: 0,
    category: "accuracy",
    observation: "",
    correction: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [catModal, setCatModal] = useState(false);

  const update = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async () => {
    if (!form.vote) {
      setError("Please select Helpful or Inaccurate.");
      return;
    }
    if (!form.rating) {
      setError("Please provide a star rating.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await feedbackApi.submit(form);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setForm({
          vote: null,
          rating: 0,
          category: "accuracy",
          observation: "",
          correction: "",
        });
        if (onSubmitted) onSubmitted();
      }, 1500);
    } catch (e) {
      setError(e?.message || "Submission failed. Check your server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.pageTitle}>How did we do?</Text>
        <Text style={styles.pageSubtitle}>
          Your feedback helps TruthLens improve detection accuracy for everyone.
        </Text>

        <View style={styles.contextCard}>
          <View style={styles.contextLabel}>
            <View style={styles.contextLabelDot}>
              <Text style={styles.contextLabelDotText}>i</Text>
            </View>
            <Text style={styles.contextLabelText}>Detection Context</Text>
          </View>
          <Text style={styles.contextText}>
            "The system flagged 'The Eiffel Tower was built in 1920' as a 98% hallucination probability."
          </Text>
        </View>

        <VoteButtons selected={form.vote} onChange={(v) => update("vote", v)} />

        <Text style={styles.sectionLabel}>Rating</Text>
        <StarRating value={form.rating} onChange={(n) => update("rating", n)} />

        <Text style={styles.sectionLabel}>Category</Text>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => setCatModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.pickerBtnText}>
            {form.category.charAt(0).toUpperCase() + form.category.slice(1)}
          </Text>
          <Text style={styles.pickerArrow}>▾</Text>
        </TouchableOpacity>

        <PickerModal
          visible={catModal}
          options={CATEGORIES}
          selected={form.category}
          onSelect={(v) => update("category", v)}
          onClose={() => setCatModal(false)}
          title="Select Category"
        />

        <Text style={styles.sectionLabel}>Additional details</Text>
        <TextInput
          style={styles.textInput}
          value={form.observation}
          onChangeText={(t) => update("observation", t)}
          placeholder="Tell us more about the result..."
          placeholderTextColor={C.placeholder}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {form.vote === "incorrect" && (
          <>
            <Text style={styles.sectionLabel}>Your Correction</Text>
            <TextInput
              style={[styles.textInput, { borderColor: C.red + "55", minHeight: 80 }]}
              value={form.correction}
              onChangeText={(t) => update("correction", t)}
              placeholder="What should the correct answer have been?"
              placeholderTextColor={C.placeholder}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
            />
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <View style={styles.submitWrapper}>
        <TouchableOpacity
          style={[
            styles.submitBtn,
            success && styles.submitBtnSuccess,
            (loading || success) && styles.submitBtnDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || success}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitBtnText}>
              {success ? "✓ Submitted!" : "Submit Feedback  →"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
