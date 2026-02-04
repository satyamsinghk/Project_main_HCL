import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token on load
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
        setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      // Standard response: { success: true, data: { token, user } }
      const { token, user } = res.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error', error);
      return { 
          success: false, 
          message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/signup', { name, email, password, role });
      // Note: Admin might require approval, so token might be missing or handled differently
      // My backend returns { user } but not token for Students if approval needed.
      // But now I changed response format.
      // Backend: data: { user } (if student) or { token, user } if authorized? 
      // Checked AuthController:
      // If student: data: { user } (and returns 201). Token is NOT returned.
      // So destructuring token might fail or be undefined.
      
      const { data } = res.data; // data contains user, maybe token
      
      if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
      }
      // If no token (approval needed), we don't login automatically.
      
      return { success: true };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Signup failed' 
        };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
