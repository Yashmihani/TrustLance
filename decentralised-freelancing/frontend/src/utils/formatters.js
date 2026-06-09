// src/utils/formatters.js
// Helper functions used throughout the entire app

/**
 * Shortens a wallet address for display
 * e.g. 0x1234...5678 instead of the full 42 chars
 */
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Formats a date string into a readable format
 * e.g. "May 23, 2026"
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Formats MATIC/ETH amounts nicely
 * e.g. 1.5 MATIC
 */
export const formatAmount = (amount, symbol = 'MATIC') => {
  if (!amount) return `0 ${symbol}`;
  return `${parseFloat(amount).toFixed(4)} ${symbol}`;
};

/**
 * Converts a project status code to a display label + color
 */
export const getStatusInfo = (status) => {
  const statusMap = {
    open:        { label: 'Open',        color: 'bg-green-500/20 text-green-400' },
    in_progress: { label: 'In Progress', color: 'bg-yellow-500/20 text-yellow-400' },
    completed:   { label: 'Completed',   color: 'bg-blue-500/20 text-blue-400' },
    cancelled:   { label: 'Cancelled',   color: 'bg-red-500/20 text-red-400' },
    disputed:    { label: 'Disputed',    color: 'bg-orange-500/20 text-orange-400' },
  };
  return statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
};
// Add to src/utils/formatters.js

/**
 * Shortens a transaction hash for display
 * e.g. 0x1234...5678
 */
export const formatTxHash = (hash) => {
  if (!hash) return '';
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

/**
 * Returns label and color for transaction type
 */
export const getTxTypeInfo = (type) => {
  const types = {
    deposit:  { label: 'Deposit',  color: 'bg-blue-50 text-blue-700',   icon: '⬇️' },
    release:  { label: 'Released', color: 'bg-green-50 text-green-700', icon: '✅' },
    refund:   { label: 'Refund',   color: 'bg-gray-50 text-gray-700',   icon: '↩️' },
    dispute:  { label: 'Dispute',  color: 'bg-red-50 text-red-700',     icon: '⚠️' },
  };
  return types[type] || { label: type, color: 'bg-gray-50 text-gray-600', icon: '•' };
};