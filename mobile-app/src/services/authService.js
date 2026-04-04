import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LAPTOP_IP = '10.112.124.217';
const BACKEND_URL = `http://${LAPTOP_IP}:5000`;
const AUTH_BASE_URL = `${BACKEND_URL}/api/auth`;

const TOKEN_KEY = '@truthlens_token';
const USER_KEY = '@truthlens_user';
const PROFILE_IMAGE_KEY = '@truthlens_profile_image';

// ─── Token Storage ─────────────────────────────────────────────────────────────

export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const saveUser = async (user) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getSavedUser = async () => {
  const data = await AsyncStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const removeUser = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};

export const saveProfileImage = async (userId, uri) => {
  if (!userId) return;
  const key = `${PROFILE_IMAGE_KEY}_${userId}`;
  await AsyncStorage.setItem(key, uri);
};

export const getProfileImage = async (userId) => {
  if (!userId) return null;
  const key = `${PROFILE_IMAGE_KEY}_${userId}`;
  return await AsyncStorage.getItem(key);
};

export const removeProfileImage = async (userId) => {
  if (!userId) return;
  const key = `${PROFILE_IMAGE_KEY}_${userId}`;
  await AsyncStorage.removeItem(key);
};


// ─── API Calls ─────────────────────────────────────────────────────────────────

export const registerUser = async ({ name, email, password }) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/register`, {
      name,
      email,
      password,
    });
    return response.data; // { token, user }
  } catch (error) {
    const msg = error.response?.data?.message;
    throw new Error(msg || 'Registration failed. Please try again.');
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${AUTH_BASE_URL}/login`, {
      email,
      password,
    });
    return response.data; // { token, user }
  } catch (error) {
    const msg = error.response?.data?.message;
    throw new Error(msg || 'Login failed. Please check your credentials.');
  }
};

export const fetchMe = async (token) => {
  try {
    const response = await axios.get(`${AUTH_BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw new Error('Session expired. Please log in again.');
  }
};

export const changePassword = async (currentPassword, newPassword, token) => {
  try {
    const response = await axios.patch(`${AUTH_BASE_URL}/change-password`, 
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    const msg = error.response?.data?.message;
    throw new Error(msg || 'Failed to update password.');
  }
};

