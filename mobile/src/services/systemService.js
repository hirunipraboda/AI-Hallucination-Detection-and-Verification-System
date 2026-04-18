import api from './api';

export const getSystemHealth = async () => {
  try {
    const response = await api.get('/system/health');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch system health');
  }
};
