// frontend/src/pages/Notifications.jsx

import { useState }            from 'react';
import { Link }                from 'react-router-dom';
import {
  FiBell, FiCheck, FiTrash2,
  FiArrowLeft, FiFilter,
} from 'react-icons/fi';
import { useNotifications }    from '../context/NotificationContext';
import { formatDate }          from '../utils/formatters';
import EmptyState              from '../components/common/EmptyState';

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

const TYPE_LABELS = {
  proposal_received: 'Proposals',
  proposal_accepted: 'Proposals',
  proposal_rejected: 'Proposals',
  escrow_created:    'Payments',
  payment_deposited: 'Payments',
  payment_released:  'Payments',
  payment_refunded:  'Payments',
  dispute_raised:    'Disputes',
  review_received:   'Reviews',
};

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = useState('all');

  const filters = [
    { key: 'all',      label: 'All' },
    { key: 'unread',   label: 'Unread' },
    { key: 'Proposals', label: 'Proposals' },
    { key: 'Payments',  label: 'Payments' },
    { key: 'Disputes',  label: 'Disputes' },
    { key: 'Reviews',   label: 'Reviews' },
  ];

  const filtered = notifications.filter(n => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.isRead;
    return TYPE_LABELS[n.type] === filter;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="w-10 h-10 flex items-center justify-center
                     border border-gray-200 rounded-xl
                     hover:border-ink-900 transition-colors"
        >
          <FiArrowLeft />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-ink-900">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-cyan-100 text-cyan-700
                               text-xs font-bold rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">
            Stay updated on your projects and payments
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 btn-secondary text-sm py-2"
            >
              <FiCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 text-sm text-gray-400
                         hover:text-red-500 border border-gray-200
                         hover:border-red-300 px-4 py-2 rounded-xl
                         transition-colors"
            >
              <FiTrash2 size={14} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap mb-6 bg-white border
                      border-gray-200 rounded-2xl p-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={'flex items-center gap-1.5 px-4 py-2 rounded-xl ' +
              'text-sm font-medium transition-colors ' +
              (filter === f.key
                ? 'bg-ink-900 text-cyan-400'
                : 'text-gray-500 hover:bg-gray-100'
              )}
          >
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className={'text-xs px-1.5 py-0.5 rounded-full ' +
                (filter === f.key
                  ? 'bg-ink-800 text-cyan-400'
                  : 'bg-gray-100 text-gray-500'
                )}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(notification => (
            <div
              key={notification._id}
              className={'flex items-start gap-4 p-4 rounded-2xl border ' +
                'transition-all group ' +
                (notification.isRead
                  ? 'bg-white border-gray-200'
                  : 'bg-cyan-50/50 border-cyan-200'
                )}
            >
              {/* Icon */}
              <div className="w-10 h-10 flex items-center justify-center
                              bg-white border border-gray-200 rounded-xl
                              text-lg flex-shrink-0">
                {TYPE_ICONS[notification.type] || '🔔'}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={'font-semibold text-sm mb-1 ' +
                      (notification.isRead ? 'text-gray-700' : 'text-ink-900')}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full
                                    flex-shrink-0 mt-1" />
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 mt-3">
                  {notification.link && (
                    <Link
                      to={notification.link}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification._id);
                        }
                      }}
                      className="text-xs text-cyan-600 hover:text-ink-900
                                 font-medium transition-colors"
                    >
                      View details →
                    </Link>
                  )}
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-xs text-gray-400 hover:text-ink-900
                                 transition-colors flex items-center gap-1"
                    >
                      <FiCheck size={10} /> Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification._id)}
                    className="text-xs text-gray-300 hover:text-red-400
                               transition-colors ml-auto flex items-center gap-1"
                  >
                    <FiTrash2 size={10} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FiBell />}
          title="No notifications"
          desc={filter === 'unread'
            ? 'You are all caught up!'
            : 'Notifications will appear here when there is activity on your projects'
          }
          actionLabel="Browse Projects"
          actionTo="/explore"
        />
      )}

    </div>
  );
};

export default Notifications;