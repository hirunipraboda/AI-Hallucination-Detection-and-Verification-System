import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './authService';

// FOR LOCAL LAN MODE: This is much more stable than free tunnels.
// Make sure your laptop and phone are on the exact same Wi-Fi/Hotspot.
const LAPTOP_IP = '10.112.124.217';
// Fallback Tunnel (only use if LAN fails): https://common-pigs-marry.loca.lt
const BACKEND_URL = `http://${LAPTOP_IP}:5000`; 

const API_BASE_URL = `${BACKEND_URL}/api`;

console.log('[API] Initializing with Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, 
});

// Attach Authorization token to every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const checkBackendHealth = async () => {
  try {
    console.log('[API] Checking backend health at:', `${API_BASE_URL}/health`);
    const response = await api.get('/health');
    return response.data?.ok === true;
  } catch (error) {
    console.warn('[API WARNING] Health check failed:', error.message);
    return false;
  }
};

export const createAnalysis = async (originalText) => {
  try {
    // Send the analysis request directly to let backend handle validations/errors
    console.log('[API] Sending analysis request to:', `${API_BASE_URL}/analyses`);
    const response = await api.post('/analyses', { originalResponse: originalText });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;
    
    // Use warn instead of error for validation errors (4xx) to avoid triggering system overlays/RedBoxes
    if (status && status >= 400 && status < 500) {
      console.warn('[API VALIDATION] createAnalysis:', status, backendMessage || error.message);
    } else {
      console.error('[API CRITICAL] createAnalysis:', status, backendMessage || error.message);
    }

    const finalError = new Error(backendMessage || (error.message === 'Network Error' || !status ? 'Cannot connect to backend' : 'Failed to perform analysis'));
    finalError.status = status; // Attach status code for screen-level handling
    throw finalError;
  }
};

export const getAllAnalyses = async (params = {}) => {
  try {
    console.log('[API] Fetching history from:', `${API_BASE_URL}/analyses`);
    const response = await api.get('/analyses', { params });
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message;
    console.error('[API ERROR] getAllAnalyses:', backendMessage || error.message);
    throw new Error(backendMessage || 'Cannot connect to backend');
  }
};

export const getAnalysisById = async (id) => {
  try {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message;
    console.error('[API ERROR] getAnalysisById:', backendMessage || error.message);
    throw new Error(backendMessage || 'Cannot connect to backend');
  }
};

export const updateAnalysis = async (id, payload) => {
  try {
    console.log('[API] updateAnalysis ID:', id, 'Payload:', JSON.stringify(payload));
    const response = await api.put(`/analyses/${id}`, payload);
    return response.data;
  } catch (error) {
    const backendMessage = error.response?.data?.message;
    console.error('[API ERROR] updateAnalysis:', backendMessage || error.message);
    throw new Error(backendMessage || 'Cannot connect to backend');
  }
};

export const deleteAnalysis = async (id) => {
  try {
    const response = await api.delete(`/analyses/${id}`);
    return response.data;
  } catch (error) {
    console.error('[API ERROR] deleteAnalysis failed:', error.message);
    throw error;
  }
};

export default api;