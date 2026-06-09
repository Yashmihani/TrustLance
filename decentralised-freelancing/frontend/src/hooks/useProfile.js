// frontend/src/hooks/useProfile.js
// Handles all profile logic — fetch, update, loading states

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

const useProfile = () => {
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading]   = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [profile, setProfile]       = useState(null);

  // Fetch any user's profile by wallet address
  const fetchProfile = useCallback(async (walletAddress) => {
    setIsLoading(true);
    try {
      const data = await userService.getByWallet(walletAddress);
      setProfile(data.user);
      return data;
    } catch (error) {
      toast.error('Failed to load profile');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update own profile
  const saveProfile = useCallback(async (profileData) => {
    setIsSaving(true);
    try {
      const data = await userService.updateProfile(profileData);
      setProfile(data.user);
      // Update global auth context so navbar reflects changes
      updateUser(data.user);
      toast.success('Profile updated successfully!');
      return data.user;
    } catch (error) {
      toast.error('Failed to save profile');
      console.error(error);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [updateUser]);

  return {
    profile,
    isLoading,
    isSaving,
    fetchProfile,
    saveProfile,
  };
};

export default useProfile;