import api from './api';

export const createFeedback = async (data) => {
  try {
    const response = await api.post('/feedback', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot submit feedback');
  }
};

export const getAllFeedback = async (params = {}) => {
  try {
    const response = await api.get('/feedback', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot fetch feedback');
  }
};

export const getFeedbackById = async (id) => {
  try {
    const response = await api.get(`/feedback/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot fetch feedback entry');
  }
};

export const updateFeedback = async (id, data) => {
  try {
    const response = await api.put(`/feedback/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot update feedback');
  }
};

export const deleteFeedback = async (id) => {
  try {
    const response = await api.delete(`/feedback/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot delete feedback');
  }
};

export const updateFeedbackStatus = async (id, status) => {
  try {
    const response = await api.patch(`/feedback/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot update status');
  }
};

export const batchApplyFeedback = async () => {
  try {
    const response = await api.post('/feedback/batch-apply');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot apply batch feedback');
  }
};

export const getFeedbackAnalytics = async () => {
  try {
    const response = await api.get('/feedback/analytics');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot fetch analytics');
  }
};
