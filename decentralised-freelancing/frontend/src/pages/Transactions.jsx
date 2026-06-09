// src/pages/Transactions.jsx
// Full transaction history with filters and export

import { useState, useEffect, useCallback } from 'react';
import { Link }                             from 'react-router-dom';
import {
  FiDownload, FiFilter, FiRefreshCw,
  FiArrowLeft, FiInbox,
} from 'react-icons/fi';
import { useWallet }         from '../context/WalletContext';
import transactionService    from '../services/transactionService';
import TransactionCard       from '../components/common/TransactionCard';
import Spinner               from '../components/common/Spinner';
import { getTxTypeInfo }     from '../utils/formatters';
import toast                 from 'react-hot-toast';

const TX_TYPES = ['all', 'deposit', 'release', 'refund', 'dispute'];

const Transactions = () => {
  const { account }                         = useWallet();
  const [transactions,  setTransactions]    = useState([]);
  const [filtered,      setFiltered]        = useState([]);
  const [isLoading,     setIsLoading]       = useState(true);
  const [activeType,    setActiveType]      = useState('all');
  const [dateRange,     setDateRange]       = useState({ from: '', to: '' });

  // Load transactions
  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await transactionService.getMyTransactions();
      setTransactions(data.transactions || []);
      setFiltered(data.transactions || []);
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
  loadTransactions();
}, [loadTransactions]);

  // Apply filters whenever type or date changes
  useEffect(() => {
    let result = [...transactions];

    // Filter by type
    if (activeType !== 'all') {
      result = result.filter(tx => tx.type === activeType);
    }

    // Filter by date range
    if (dateRange.from) {
      result = result.filter(tx =>
        new Date(tx.createdAt) >= new Date(dateRange.from)
      );
    }
    if (dateRange.to) {
      result = result.filter(tx =>
        new Date(tx.createdAt) <= new Date(dateRange.to + 'T23:59:59')
      );
    }

    setFiltered(result);
  }, [activeType, dateRange, transactions]);

  // Calculate summary stats
  const totalDeposited = transactions
    .filter(tx => tx.type === 'deposit' &&
      tx.from?.toLowerCase() === account?.toLowerCase())
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReceived = transactions
    .filter(tx => tx.type === 'release' &&
      tx.to?.toLowerCase() === account?.toLowerCase())
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalRefunded = transactions
    .filter(tx => tx.type === 'refund' &&
      tx.to?.toLowerCase() === account?.toLowerCase())
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Export to CSV
  const exportCSV = () => {
    if (filtered.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Type', 'Amount (MATIC)', 'From', 'To', 'Project', 'Tx Hash'];
    const rows    = filtered.map(tx => [
      new Date(tx.createdAt).toLocaleDateString(),
      tx.type,
      tx.amount,
      tx.from,
      tx.to,
      tx.project?.title || '',
      tx.txHash || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Transactions exported!');
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveType('all');
    setDateRange({ from: '', to: '' });
  };

  const hasFilters = activeType !== 'all' || dateRange.from || dateRange.to;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

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
          <h1 className="text-2xl font-extrabold text-ink-900">
            Transaction History
          </h1>
          <p className="text-gray-400 text-sm">
            All your on-chain payments
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTransactions}
            className="w-10 h-10 flex items-center justify-center
                       border border-gray-200 rounded-xl
                       hover:border-ink-900 transition-colors"
            title="Refresh"
          >
            <FiRefreshCw size={16} />
          </button>
          <button
            onClick={exportCSV}
            className="btn-primary text-sm py-2 flex items-center gap-2"
          >
            <FiDownload size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Total Deposited</p>
          <p className="text-xl font-extrabold text-ink-900">
            {totalDeposited.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400">MATIC</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Total Received</p>
          <p className="text-xl font-extrabold text-green-600">
            {totalReceived.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400">MATIC</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-400 mb-1">Total Refunded</p>
          <p className="text-xl font-extrabold text-blue-600">
            {totalRefunded.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400">MATIC</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">

          {/* Type filter tabs */}
          <div className="flex gap-1 flex-wrap">
            {TX_TYPES.map(type => {
              const info = type === 'all'
                ? { label: 'All', icon: '📋' }
                : getTxTypeInfo(type);
              return (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg
                              text-xs font-medium transition-colors ${
                    activeType === type
                      ? 'bg-ink-900 text-cyan-400'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span className="capitalize">{info.label}</span>
                  {type !== 'all' && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeType === type
                        ? 'bg-ink-800 text-cyan-400'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {transactions.filter(tx => tx.type === type).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Date range */}
          <div className="flex gap-2 ml-auto">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={e => setDateRange(prev => ({
                  ...prev, from: e.target.value
                }))}
                className="input-field text-xs py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={e => setDateRange(prev => ({
                  ...prev, to: e.target.value
                }))}
                className="input-field text-xs py-2 px-3"
              />
            </div>
          </div>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center justify-between mt-3 pt-3
                          border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {transactions.length} transactions
            </p>
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-600
                         transition-colors flex items-center gap-1"
            >
              <FiFilter size={10} /> Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" color="dark" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(tx => (
            <TransactionCard
              key={tx._id}
              tx={tx}
              currentWallet={account}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <FiInbox className="text-gray-400 text-2xl" />
          </div>
          <h3 className="font-bold text-ink-900 mb-2">No transactions yet</h3>
          <p className="text-gray-400 text-sm mb-6">
            {hasFilters
              ? 'No transactions match your filters'
              : 'Your payment history will appear here once you start using escrow'
            }
          </p>
          {hasFilters ? (
            <button onClick={clearFilters} className="btn-secondary text-sm">
              Clear Filters
            </button>
          ) : (
            <Link to="/explore" className="btn-primary text-sm">
              Browse Projects
            </Link>
          )}
        </div>
      )}

    </div>
  );
};

export default Transactions;