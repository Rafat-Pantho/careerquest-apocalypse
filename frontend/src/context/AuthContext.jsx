/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * Auth Context - The Hero's Identity Chamber
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Manages authentication state across the application:
 * - User session management
 * - JWT token handling
 * - Login/Logout functionality
 * - Protected route handling
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';




// Create the context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('careerquest_token');
      
      if (token) {
        try {
          // Set default auth header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token and get user data
          const response = await axios.get(`${API_URL}/auth/me`);
          setUser(response.data.data);
        } catch {
          // Token invalid or expired
          localStorage.removeItem('careerquest_token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user: userData } = response.data;
      
      // Store token
      localStorage.setItem('careerquest_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. The gates remain sealed!';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      
      const { token, user: newUser } = response.data;
      
      // Store token
      localStorage.setItem('careerquest_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. The scrolls rejected your application!';
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    localStorage.removeItem('careerquest_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setError(null);
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get the token
  const token = localStorage.getItem('careerquest_token');

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Did you forget to wrap your app?');
  }
  
  return context;
};

