import axios from 'axios';

// 💡 Your computer's IP address
const BASE_URL = 'http://192.168.1.176:5001/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// GET all sources
export const getAllSources = async () => {
  const response = await api.get('/sources');
  return response.data;
};

// POST create new source
export const createSource = async (sourceData) => {
  const response = await api.post('/sources', sourceData);
  return response.data;
};

// PUT update source
export const updateSource = async (id, sourceData) => {
  const response = await api.put(`/sources/${id}`, sourceData);
  return response.data;
};

// DELETE source
export const deleteSource = async (id) => {
  const response = await api.delete(`/sources/${id}`);
  return response.data;
};
