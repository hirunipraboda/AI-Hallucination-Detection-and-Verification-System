import { Platform } from "react-native";

const API_BASE =
  Platform.OS === "web"
    ? "http://localhost:5000/api/feedback"
    : "http://10.117.88.132:5000/api/feedback";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export const feedbackApi = {
  submit: async (form) => {
    return apiFetch("", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },

  list: async (filters, page, limit = 5) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.rating) params.set("rating", filters.rating);
    if (filters.status) params.set("status", filters.status);

    return apiFetch(`?${params.toString()}`);
  },

  getById: async (id) => {
    return apiFetch(`/${id}`);
  },

  update: async (id, form) => {
    return apiFetch(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
  },

  remove: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res.json();
  },

  markApplied: async (id) => {
    return apiFetch(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "applied" }),
    });
  },

  markRejected: async (id) => {
    return apiFetch(`/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: "rejected" }),
    });
  },

  batchApply: async () => {
    return apiFetch("/batch-apply", {
      method: "POST",
    });
  },
};