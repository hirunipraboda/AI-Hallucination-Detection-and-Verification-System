import api from './api';

export const createScoringRecord = async (data) => {
  try {
    const response = await api.post('/scoring', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot create scoring record');
  }
};

export const getScoringByResponseId = async (responseId) => {
  try {
    const response = await api.get(`/scoring/response/${responseId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot fetch scoring record');
  }
};

export const recalculateScore = async (id, data) => {
  try {
    const response = await api.put(`/scoring/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot update scoring record');
  }
};

export const deleteScoringRecord = async (id) => {
  try {
    const response = await api.delete(`/scoring/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Cannot delete scoring record');
  }
};
