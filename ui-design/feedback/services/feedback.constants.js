export const CATEGORIES = ["accuracy", "relevance", "tone", "performance", "other"];
export const STATUSES = ["pending", "applied", "rejected"];
export const RATINGS = ["5", "4", "3", "2", "1"];

export const CATEGORY_COLORS = {
  accuracy: "#00d4d4",
  relevance: "#0ea5e9",
  tone: "#10b981",
  performance: "#f59e0b",
  other: "#6b7280",
};

export const STATUS_META = {
  pending: { label: "Pending", color: "#f59e0b" },
  applied: { label: "Applied", color: "#10b981" },
  rejected: { label: "Rejected", color: "#ef4444" },
};

export const STATUS_DISPLAY = {
  pending: {
    label: "Pending",
    color: "#f59e0b",
    icon: "⏳",
    message: "Awaiting review",
  },
  applied: {
    label: "Applied ✓",
    color: "#10b981",
    icon: "✅",
    message: "Your feedback improved the model!",
  },
  rejected: {
    label: "Not used",
    color: "#ef4444",
    icon: "❌",
    message: "Could not be applied",
  },
};
