import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stored token and user on startup
    const loadStorageData = async () => {
      try {
        const storedToken = await authService.getToken();
        const storedUser = await authService.getSavedUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          
          // Load specific profile image for this user
          const storedImage = await authService.getProfileImage(storedUser._id);
          if (storedImage) setProfileImage(storedImage);

          // Optionally verify token with backend
          try {
            const freshUser = await authService.fetchMe(storedToken);
            setUser(freshUser);
            await authService.saveUser(freshUser);
            
            // Re-check profile image in case user changed on server (not implemented, but good practice)
            const freshImage = await authService.getProfileImage(freshUser._id);
            if (freshImage) setProfileImage(freshImage);
          } catch (e) {
            console.log('Token verification failed, logging out');
            await logout();
          }
        }
      } catch (e) {
        console.error('Failed to load auth data', e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  const login = async (email, password) => {
    const data = await authService.loginUser({ email, password });
    setToken(data.token);
    setUser(data.user);
    await authService.saveToken(data.token);
    await authService.saveUser(data.user);
    
    // Load this user's specific profile image
    const userImage = await authService.getProfileImage(data.user._id);
    setProfileImage(userImage);

    return data;
  };

  const signup = async (name, email, password, userType) => {
    const data = await authService.registerUser({ name, email, password, userType });
    setToken(data.token);
    setUser(data.user);
    await authService.saveToken(data.token);
    await authService.saveUser(data.user);
    
    // For new user, profile image will be null
    setProfileImage(null);

    return data;
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    setProfileImage(null); // Clear from current state, but keep in AsyncStorage for persistence
    await authService.removeToken();
    await authService.removeUser();
    // Do not call removeProfileImage so it stays for next login
  };

  const updateProfileImage = async (uri) => {
    if (!user?._id) return;
    setProfileImage(uri);
    await authService.saveProfileImage(user._id, uri);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      profileImage, 
      loading, 
      login, 
      signup, 
      logout,
      updateProfileImage
    }}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
