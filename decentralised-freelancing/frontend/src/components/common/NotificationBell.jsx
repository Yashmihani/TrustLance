// frontend/src/components/common/NotificationBell.jsx
// Bell icon in navbar with unread count badge and dropdown

import { useState, useRef, useEffect } from 'react';
import { Link }                        from 'react-router-dom';
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi';
import { useNotifications }            from '../../context/NotificationContext';
import { formatDate }                  from '../../utils/formatters';

// Icons for each notification type
const TYPE_ICONS = {
  proposal_received: '📩',
  proposal_accepted: '✅',
  proposal_rejected: '❌',
  escrow_created:    '🔒',
  payment_deposited: '💰',
  payment_released:  '🎉',
  payment_refunded:  '↩️',
  dispute_raised:    '⚠️',
  review_received:   '⭐',
};

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef         = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
    setIsOpen(false);
  };

  const recent = notifications.slice(0, 8);

  return (
    <div className="relative" ref={dropdownRef}>

      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 flex items-center justify-center
                   border border-gray-200 rounded-xl hover:border-ink-900
                   transition-colors"
      >
        <FiBell size={18} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-cyan-500
                           text-white text-xs font-bold rounded-full flex
                           items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white border
                        border-gray-200 rounded-2xl shadow-xl z-50
                        overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3
                          border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-ink-900 text-sm">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700
                                 text-xs font-bold rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-xs text-cyan-600
                             hover:text-ink-900 font-medium px-2 py-1
                             rounded-lg hover:bg-gray-100 transition-colors"
                  title="Mark all as read"
                >
                  <FiCheck size={12} /> All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-500
                             px-2 py-1 rounded-lg hover:bg-gray-100
                             transition-colors"
                  title="Clear all"
                >
                  <FiTrash2 size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">
            {recent.length > 0 ? (
              recent.map(notification => (
                <div
                  key={notification._id}
                  className={'flex items-start gap-3 px-4 py-3 border-b ' +
                    'border-gray-50 hover:bg-gray-50 transition-colors ' +
                    'cursor-pointer group ' +
                    (notification.isRead ? '' : 'bg-cyan-50/30')}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Icon */}
                  <div className="w-8 h-8 flex items-center justify-center
                                  bg-white border border-gray-200 rounded-lg
                                  text-sm flex-shrink-0 mt-0.5">
                    {TYPE_ICONS[notification.type] || '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={'text-xs font-semibold mb-0.5 ' +
                      (notification.isRead ? 'text-gray-600' : 'text-ink-900')}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed
                                  line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot + delete */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="opacity-0 group-hover:opacity-100
                                 text-gray-300 hover:text-red-400
                                 transition-all"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <FiBell className="text-gray-300 mx-auto mb-2" size={28} />
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="block text-center text-xs text-cyan-600
                           hover:text-ink-900 font-medium transition-colors"
              >
                View all notifications
              </Link>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default NotificationBell;