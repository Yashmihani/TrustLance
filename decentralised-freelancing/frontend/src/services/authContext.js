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

  // Sign in with wallet — called after wallet is connected
  const signIn = useCallback(async () => {
    if (!account || !signer) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsAuthenticating(true);
    try {
      // Step 1: Get nonce from backend
      const { message } = await authService.getNonce(account);

      // Step 2: Ask MetaMask to sign the nonce message
      // This opens a MetaMask popup asking user to sign
      const signature = await signer.signMessage(message);

      // Step 3: Send signature to backend for verification
      const { token, user: userData } = await authService.verifySignature(
        account,
        signature
      );

      // Step 4: Save session
      authService.saveSession(token, userData);
      setUser(userData);
      setIsAuthenticated(true);

      toast.success(`Welcome back! ${userData.name || 'Anon'}`);
      return userData;

    } catch (error) {
      // User rejected the signature request
      if (error.code === 4001) {
        toast.error('Signature rejected. Please sign to authenticate.');
      } else {
        toast.error('Authentication failed. Please try again.');
        console.error('Auth error:', error);
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