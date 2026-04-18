import api from './api';

export const checkBackendHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data?.status === 'ok';
  } catch (error) {
    return false;
  }
};

export const createAnalysis = async (originalText) => {
  try {
    const response = await api.post('/analyses', { originalResponse: originalText });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    const finalError = new Error(backendMessage || 'Failed to perform analysis');
    finalError.status = status;
    throw finalError;
  }
};

export const getAllAnalyses = async (params = {}) => {
  try {
    const response = await api.get('/analyses', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot fetch history');
  }
};

export const getAnalysisById = async (id) => {
  try {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot fetch analysis');
  }
};

export const updateAnalysis = async (id, payload) => {
  try {
    const response = await api.put(`/analyses/${id}`, payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot update analysis');
  }
};

export const deleteAnalysis = async (id) => {
  try {
    const response = await api.delete(`/analyses/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};