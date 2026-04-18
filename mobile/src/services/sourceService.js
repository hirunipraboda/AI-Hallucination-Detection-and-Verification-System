import api from './api';

export const getAllSources = async () => {
  try {
    const response = await api.get('/sources');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot fetch sources');
  }
};

export const getSourceById = async (id) => {
  try {
    const response = await api.get(`/sources/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot fetch source');
  }
};

export const createSource = async (sourceData) => {
  try {
    const response = await api.post('/sources', sourceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot create source');
  }
};

export const updateSource = async (id, sourceData) => {
  try {
    const response = await api.put(`/sources/${id}`, sourceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot update source');
  }
};

export const deleteSource = async (id) => {
  try {
    const response = await api.delete(`/sources/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot delete source');
  }
};

export const checkSourceCredibility = async (url) => {
  try {
    const response = await api.get('/sources/check', { params: { url } });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Cannot check source credibility');
  }
};
