import axios from 'axios';
import { getToken } from './authService';

// Fallback to localhost if no IP is provided. 
// In production/testing, replace with your development machine's IP.
const LAPTOP_IP = '192.168.8.117'; 
const BACKEND_URL = `http://${LAPTOP_IP}:5000`; 

export const API_BASE_URL = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
