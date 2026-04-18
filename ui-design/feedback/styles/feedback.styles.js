// ─────────────────────────────────────────────
// styles/feedback.styles.ts
// Save to: components/feedback/styles/feedback.styles.ts
// ─────────────────────────────────────────────

import { StyleSheet, Platform, StatusBar } from "react-native";

// ── Color Tokens ──────────────────────────────
export const C = {
  bg:          "#0d1117",   // page background
  card:        "#161b22",   // card background
  cardBorder:  "#1e2a38",   // card border
  input:       "#1a2332",   // input background
  inputBorder: "#243044",   // input border
  teal:        "#00d4d4",   // primary accent (cyan/teal)
  tealDim:     "#00d4d422", // teal with opacity
  tealBorder:  "#00d4d455",
  green:       "#10b981",
  greenDim:    "#10b98122",
  red:         "#ef4444",
  redDim:      "#ef444422",
  textPrimary: "#ffffff",
  textSub:     "#8b9ab0",
  textMuted:   "#4b5a6e",
  placeholder: "#3d4f63",
};

export const styles = StyleSheet.create({
  // ── Root ──────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },

  // ── Header ────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  headerBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerBackText: {
    color: C.teal,
    fontSize: 22,
    fontWeight: "300",
    lineHeight: 26,
  },
  headerTitle: {
    color: C.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // ── Page Title ────────────────────────────
  pageTitle: {
    color: C.textPrimary,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: C.textSub,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },

  // ── Detection Context Card ────────────────
  contextCard: {
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 18,
    marginBottom: 28,
  },
  contextLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  contextLabelDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: C.teal,
    justifyContent: "center",
    alignItems: "center",
  },
  contextLabelDotText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
  },
  contextLabelText: {
    color: C.textSub,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  contextText: {
    color: C.textPrimary,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
  },

  // ── Vote Buttons ──────────────────────────
  voteRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 32,
  },
  voteBtn: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingVertical: 28,
    alignItems: "center",
    gap: 14,
  },
  voteBtnHelpfulActive: {
    backgroundColor: "#0d2e2a",
    borderColor: C.green,
  },
  voteBtnIncorrectActive: {
    backgroundColor: "#2e1515",
    borderColor: C.red,
  },
  voteIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  voteIconCircleHelpful:   { backgroundColor: "#0a3d30" },
  voteIconCircleIncorrect: { backgroundColor: "#3d1515" },
  voteIconCircleHelpfulActive:   { backgroundColor: C.green },
  voteIconCircleIncorrectActive: { backgroundColor: C.red },
  voteEmoji: {
    fontSize: 28,
  },
  voteBtnLabel: {
    color: C.textSub,
    fontSize: 16,
    fontWeight: "600",
  },
  voteBtnLabelActive: {
    color: C.textPrimary,
  },

  // ── Section Label ──────────────────────────
  sectionLabel: {
    color: C.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },

  // ── Text Input ─────────────────────────────
  textInput: {
    backgroundColor: C.input,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.inputBorder,
    padding: 16,
    color: C.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 120,
    textAlignVertical: "top",
    marginBottom: 24,
  },

  // ── Picker Button ──────────────────────────
  pickerBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginTop: 8,
    marginBottom: 20,
  },
  pickerBtnText: { color: C.textPrimary, fontSize: 15 },
  pickerArrow:   { color: C.textSub, fontSize: 16 },

  // ── Star Rating ────────────────────────────
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },

  // ── Privacy Note ───────────────────────────
  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 100,
  },
  privacyIcon: {
    fontSize: 13,
    color: C.textMuted,
    marginTop: 1,
  },
  privacyText: {
    flex: 1,
    color: C.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },

  // ── Submit Button ──────────────────────────
  submitWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: C.cardBorder,
  },
  submitBtn: {
    backgroundColor: C.teal,
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  submitBtnSuccess: {
    backgroundColor: C.green,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: "#000000",
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 0.3,
  },

  // ── Error ──────────────────────────────────
  errorText: {
    color: C.red,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },

  // ── Badge ──────────────────────────────────
  badge: {
    borderRadius: 99,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
  },

  // ── Dashboard ──────────────────────────────
  dashHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 8,
  },
  dashTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
  },
  totalBadge: {
    backgroundColor: C.tealDim,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: C.tealBorder,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  totalBadgeText: {
    color: C.teal,
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Search ─────────────────────────────────
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.input,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: C.textPrimary,
    fontSize: 14,
  },

  // ── Filter Chips ───────────────────────────
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    backgroundColor: C.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    borderColor: C.tealBorder,
    backgroundColor: C.tealDim,
  },
  filterChipText: {
    color: C.textSub,
    fontSize: 12,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: C.teal,
  },
  clearChip: {
    backgroundColor: "#2a1a1a",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3f1f1f",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  clearChipText: {
    color: C.red,
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Feedback Item ──────────────────────────
  feedbackItem: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 16,
  },
  feedbackItemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  feedbackItemLeft: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    flex: 1,
  },
  feedbackVoteIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  dateText:  { fontSize: 11, color: C.textMuted },
  anonText:  { fontSize: 10, color: C.textMuted },
  obsText: {
    fontSize: 13,
    color: C.textSub,
    marginTop: 10,
    borderLeftWidth: 2,
    borderLeftColor: C.cardBorder,
    paddingLeft: 10,
    lineHeight: 20,
    fontStyle: "italic",
  },
  emptyText: {
    color: C.textMuted,
    textAlign: "center",
    paddingVertical: 30,
    fontSize: 14,
  },

  // ── Pagination ─────────────────────────────
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 16,
  },
  pageBtn: {
    backgroundColor: C.input,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.inputBorder,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  pageBtnDisabled: { opacity: 0.3 },
  pageBtnText:     { color: C.textSub, fontSize: 16 },
  pageText:        { color: C.textMuted, fontSize: 12 },

  // ── Modal ──────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: C.cardBorder,
    padding: 20,
    paddingBottom: 44,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1e2a38",
  },
  modalOptionActive: { backgroundColor: "#00d4d411" },
  modalOptionText:   { color: C.textSub, fontSize: 16 },
  modalCancel: {
    marginTop: 14,
    backgroundColor: "#1a2332",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
  },
  modalCancelText: { color: C.red, fontWeight: "700", fontSize: 15 },
});