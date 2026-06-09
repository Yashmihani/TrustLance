// frontend/src/context/AuthContext.js
// Manages logged-in user state globally
// Separate from WalletContext — wallet = blockchain identity, auth = backend session

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import { useWallet } from './WalletContext';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const { account, signer, isConnected } = useWallet();
  const [user, setUser]                   = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated]   = useState(false);

  const signIn = useCallback(async () => {
  if (!account || !signer) {
    toast.error('Please connect your wallet first');
    return;
  }

  setIsAuthenticating(true);
  try {
    // Step 1: Get nonce from backend
    const nonceData = await authService.getNonce(account);

    // Check nonce exists
    if (!nonceData || !nonceData.message) {
      toast.error('Failed to get nonce from server');
      return;
    }

    const message = nonceData.message;

    // Check message is valid string
    if (typeof message !== 'string' || message.length === 0) {
      toast.error('Invalid message received from server');
      return;
    }

    // Step 2: Sign the message
    const signature = await signer.signMessage(message);

    // Step 3: Verify signature
    const { token, user: userData } = await authService.verifySignature(
      account,
      signature
    );

    // Step 4: Save session
    authService.saveSession(token, userData);
    setUser(userData);
    setIsAuthenticated(true);

    toast.success('Welcome ' + (userData.name || 'User') + '!');
    return userData;

  } catch (error) {
    if (error.code === 4001) {
      toast.error('Signature rejected. Please sign to authenticate.');
    } else {
      console.error('Auth error full:', error);
      toast.error('Authentication failed. Please try again.');
    }
  } finally {
    setIsAuthenticating(false);
  }
}, [account, signer]);

  // Sign out
  const signOut = useCallback(() => {
    authService.clearSession();
    setUser(null);
    setIsAuthenticated(false);
    toast.success('Signed out successfully');
  }, []);

  // Update user data (after profile edit)
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  // Auto-restore session on page load
  useEffect(() => {
    const savedUser = authService.getSavedUser();
    const token     = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(savedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Auto sign-in when wallet connects
  // If wallet connects and no session exists → trigger sign in
  useEffect(() => {
    if (isConnected && account && !isAuthenticated) {
      const savedUser = authService.getSavedUser();
      if (!savedUser) {
        // Small delay so wallet context settles first
        setTimeout(() => signIn(), 500);
      }
    }
  }, [isConnected, account]);

  // Sign out when wallet disconnects
  useEffect(() => {
    if (!isConnected && isAuthenticated) {
      signOut();
    }
  }, [isConnected]);

  const value = {
    user,
    isAuthenticated,
    isAuthenticating,
    signIn,
    signOut,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};