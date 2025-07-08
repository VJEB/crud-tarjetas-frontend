import { authService } from '@/services/api';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Storage abstraction that works on both web and mobile
const storage = {
  async getItem(key: string) {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    }
    return await SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string) {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  }
};

interface User {
  id?: number;
  username: string;
  token: string;
}

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const loadUser = async () => {
      try {
        const userJson = await storage.getItem('user');
        if (userJson) {
          const userData = JSON.parse(userJson);
          // Ensure we have the token in the user object
          if (userData.token) {
            setUser(userData);
          } else {
            // If token is missing, sign out to clear any invalid state
            await storage.deleteItem('user');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Failed to load user', error);
        // On error, clear any potentially corrupted user data
        await storage.deleteItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const { access_token: token, user: userData } = await authService.signIn(username, password);
      const userWithToken = { 
        ...userData, 
        token 
      };
      await storage.setItem('user', JSON.stringify(userWithToken));
      setUser(userWithToken);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (username: string, password: string) => {
    try {
      const { access_token: token, user: userData } = await authService.signUp(username, password);
      const userWithToken = { 
        ...userData, 
        token 
      };
      await storage.setItem('user', JSON.stringify(userWithToken));
      setUser(userWithToken);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    await storage.deleteItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
