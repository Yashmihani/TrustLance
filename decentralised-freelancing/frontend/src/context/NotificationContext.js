// frontend/src/context/NotificationContext.js
// Global notification state — unread count, polling

import React, {
  createContext, useContext,
  useState, useEffect, useCallback,
} from 'react';
import notificationService from '../services/notificationService';
import { useAuth }         from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be inside NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated }               = useAuth();
  const [notifications,  setNotifications] = useState([]);
  const [unreadCount,    setUnreadCount]   = useState(0);
  const [isLoading,      setIsLoading]     = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      // Silent fail
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error(error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await notificationService.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => {
        const wasUnread = notifications.find(
          n => n._id === id && !n.isRead
        );
        return wasUnread ? Math.max(0, prev - 1) : prev;
      });
    } catch (error) {
      console.error(error);
    }
  }, [notifications]);

  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated]);

  // Poll every 30 seconds for new notifications
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};