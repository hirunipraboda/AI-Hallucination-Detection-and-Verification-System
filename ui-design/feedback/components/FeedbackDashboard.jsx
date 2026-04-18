import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import {
  CATEGORIES,
  STATUSES,
  RATINGS,
  STATUS_DISPLAY,
} from "../services/feedback.constants";
import { feedbackApi } from "../services/feedbackApi";
import { CategoryBadge, StatusBadge } from "./Badges";
import { PickerModal } from "./PickerModal";
import { VoteButtons } from "./VoteButtons";
import { StarRating } from "./StarRating";
import { styles, C } from "../styles/feedback.styles";

const LIMIT = 5;

function EditModal({ visible, item, onClose, onSaved }) {
  const [form, setForm] = useState({
    vote: null,
    rating: 0,
    category: "accuracy",
    observation: "",
    correction: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [catModal, setCatModal] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        vote: item.vote,
        rating: item.rating,
        category: item.category,
        observation: item.observation,
        correction: item.correction,
      });
      setError("");
    }
  }, [item]);

  const update = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSave = async () => {
    if (!form.vote) {
      setError("Please select Helpful or Inaccurate.");
      return;
    }
    if (!form.rating) {
      setError("Please provide a star rating.");
      return;
    }
    if (!item) return;

    setError("");
    setLoading(true);
    

    try {
      await feedbackApi.update(item._id, form);
      onSaved();
      onClose();
    } catch (e) {
      setError(e?.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={editStyles.overlay}>
        <View style={editStyles.sheet}>
          <View style={editStyles.header}>
            <Text style={editStyles.title}>Edit Feedback</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={editStyles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.sectionLabel}>Was this accurate?</Text>
            <VoteButtons selected={form.vote} onChange={(v) => update("vote", v)} />

            <Text style={styles.sectionLabel}>Rating</Text>
            <StarRating value={form.rating} onChange={(n) => update("rating", n)} />

            <Text style={[styles.sectionLabel, { marginTop: 4 }]}>Category</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setCatModal(true)}>
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
              style={[styles.textInput, { minHeight: 80 }]}
              value={form.observation}
              onChangeText={(t) => update("observation", t)}
              placeholder="Tell us more about the result..."
              placeholderTextColor={C.placeholder}
              multiline
              textAlignVertical="top"
            />

            {form.vote === "incorrect" && (
              <>
                <Text style={styles.sectionLabel}>Your Correction</Text>
                <TextInput
                  style={[styles.textInput, { borderColor: C.red + "55", minHeight: 60 }]}
                  value={form.correction}
                  onChangeText={(t) => update("correction", t)}
                  placeholder="What should the correct answer have been?"
                  placeholderTextColor={C.placeholder}
                  multiline
                  textAlignVertical="top"
                />
              </>
            )}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={[editStyles.saveBtn, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={editStyles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const editStyles = {
  overlay: {
    flex: 1,
    backgroundColor: "#000000bb",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  title: { color: C.textPrimary, fontSize: 17, fontWeight: "700" },
  closeBtn: { color: C.textMuted, fontSize: 20, padding: 4 },
  saveBtn: {
    backgroundColor: C.teal,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#000", fontWeight: "800", fontSize: 16 },
};

const itemStyles = {
  statusBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  statusMsg: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  editBtn: {
    flex: 1,
    backgroundColor: C.tealDim,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.tealBorder,
    paddingVertical: 9,
    alignItems: "center",
  },
  editBtnText: {
    color: C.teal,
    fontSize: 13,
    fontWeight: "700",
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: "#2a1515",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.red + "55",
    paddingVertical: 9,
    alignItems: "center",
  },
  deleteBtnText: {
    color: C.red,
    fontSize: 13,
    fontWeight: "700",
  },
};

export function FeedbackDashboard({ refresh }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    rating: "",
    status: "",
  });

  const [editItem, setEditItem] = useState(null);
  const [editVisible, setEditVisible] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);

  const updateFilter = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: "", category: "", rating: "", status: "" });
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await feedbackApi.list(filters, page, LIMIT);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, refresh]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = (item) => {
    if (item.status !== "pending") {
      Alert.alert(
        "Cannot Delete",
        "This feedback has already been processed and cannot be deleted.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Delete Feedback",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await feedbackApi.remove(item._id);
              load();
            } catch (e) {
              Alert.alert("Error", e?.message || "Delete failed.");
            }
          },
        },
      ]
    );
  };

  const handleEdit = (item) => {
    if (item.status !== "pending") {
      Alert.alert(
        "Cannot Edit",
        "This feedback has already been processed and cannot be edited.",
        [{ text: "OK" }]
      );
      return;
    }

    setEditItem(item);
    setEditVisible(true);
  };

  const pages = Math.ceil(total / LIMIT);

  return (
    <View>
      <View style={styles.dashHeader}>
        <Text style={styles.dashTitle}>My Submissions</Text>
        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>{total} entries</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Text style={{ color: C.textMuted, fontSize: 15 }}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={filters.search}
          onChangeText={(t) => updateFilter("search", t)}
          placeholder="Search your feedback..."
          placeholderTextColor={C.placeholder}
        />
        {filters.search ? (
          <TouchableOpacity onPress={() => updateFilter("search", "")}>
            <Text style={{ color: C.textMuted, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, !!filters.category && styles.filterChipActive]}
            onPress={() => setCatModal(true)}
          >
            <Text style={[styles.filterChipText, !!filters.category && styles.filterChipTextActive]}>
              {filters.category || "Category"} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, !!filters.rating && styles.filterChipActive]}
            onPress={() => setRatingModal(true)}
          >
            <Text style={[styles.filterChipText, !!filters.rating && styles.filterChipTextActive]}>
              {filters.rating ? `${filters.rating} ★` : "Rating"} ▾
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, !!filters.status && styles.filterChipActive]}
            onPress={() => setStatusModal(true)}
          >
            <Text style={[styles.filterChipText, !!filters.status && styles.filterChipTextActive]}>
              {filters.status || "Status"} ▾
            </Text>
          </TouchableOpacity>

          {hasFilters && (
            <TouchableOpacity style={styles.clearChip} onPress={clearFilters}>
              <Text style={styles.clearChipText}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <PickerModal
        visible={catModal}
        options={CATEGORIES}
        selected={filters.category}
        onSelect={(v) => updateFilter("category", v)}
        onClose={() => setCatModal(false)}
        title="Filter by Category"
        allowAll
      />

      <PickerModal
        visible={statusModal}
        options={STATUSES}
        selected={filters.status}
        onSelect={(v) => updateFilter("status", v)}
        onClose={() => setStatusModal(false)}
        title="Filter by Status"
        allowAll
      />

      <PickerModal
        visible={ratingModal}
        options={RATINGS}
        selected={filters.rating}
        onSelect={(v) => updateFilter("rating", v)}
        onClose={() => setRatingModal(false)}
        title="Filter by Rating"
        allowAll
      />

      <EditModal
        visible={editVisible}
        item={editItem}
        onClose={() => {
          setEditVisible(false);
          setEditItem(null);
        }}
        onSaved={() => load()}
      />

      {loading ? (
        <View style={{ paddingVertical: 30, alignItems: "center" }}>
          <ActivityIndicator color={C.teal} size="large" />
        </View>
      ) : items.length === 0 ? (
        <Text style={styles.emptyText}>No feedback found.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => {
            const statusInfo = STATUS_DISPLAY[item.status];
            const canEdit = item.status === "pending";

            return (
              <View style={styles.feedbackItem}>
                <View style={styles.feedbackItemTop}>
                  <View style={styles.feedbackItemLeft}>
                    <View
                      style={[
                        styles.feedbackVoteIcon,
                        { backgroundColor: item.vote === "helpful" ? C.green + "22" : C.red + "22" },
                      ]}
                    >
                      <Text style={{ fontSize: 16 }}>{item.vote === "helpful" ? "👍" : "👎"}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
                        <CategoryBadge cat={item.category} />
                        <StatusBadge status={item.status} />
                      </View>
                      <Text style={{ fontSize: 18, marginTop: 5, letterSpacing: 2 }}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Text key={n} style={{ color: n <= item.rating ? C.teal : "#243044" }}>
                            ★
                          </Text>
                        ))}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {item.observation ? (
                  <Text style={styles.obsText}>"{item.observation}"</Text>
                ) : null}

                {item.correction ? (
                  <Text style={[styles.obsText, { color: C.teal, borderLeftColor: C.teal }]}>
                    ✎ {item.correction}
                  </Text>
                ) : null}

                <View style={itemStyles.statusBar}>
                  <Text style={{ fontSize: 14 }}>{statusInfo.icon}</Text>
                  <Text style={[itemStyles.statusMsg, { color: statusInfo.color }]}>
                    {statusInfo.message}
                  </Text>
                </View>

                {canEdit && (
                  <View style={itemStyles.actionRow}>
                    <TouchableOpacity
                      style={itemStyles.editBtn}
                      onPress={() => handleEdit(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={itemStyles.editBtnText}>✏️  Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={itemStyles.deleteBtn}
                      onPress={() => handleDelete(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={itemStyles.deleteBtnText}>🗑  Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      {pages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            <Text style={styles.pageBtnText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>Page {page} of {pages}</Text>

          <TouchableOpacity
            style={[styles.pageBtn, page === pages && styles.pageBtnDisabled]}
            onPress={() => setPage((p) => p + 1)}
            disabled={page === pages}
          >
            <Text style={styles.pageBtnText}>→</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}