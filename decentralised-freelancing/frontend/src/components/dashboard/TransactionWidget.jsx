// src/components/dashboard/TransactionWidget.jsx
// Mini transaction list shown on dashboard

import { useState, useEffect }   from 'react';
import { Link }                  from 'react-router-dom';
import { FiArrowRight, FiInbox } from 'react-icons/fi';
import { useWallet }             from '../../context/WalletContext';
import transactionService        from '../../services/transactionService';
import { getTxTypeInfo, formatDate } from '../../utils/formatters';
import Spinner                   from '../common/Spinner';

const TransactionWidget = () => {
  const { account }                       = useWallet();
  const [transactions, setTransactions]   = useState([]);
  const [isLoading,    setIsLoading]      = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await transactionService.getMyTransactions();
        // Show only last 5
        setTransactions((data.transactions || []).slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-6
                      border-b border-gray-100">
        <h2 className="font-bold text-ink-900">Recent Transactions</h2>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-sm text-cyan-600
                     hover:text-ink-900 font-medium transition-colors"
        >
          View all <FiArrowRight size={14} />
        </Link>
      </div>

      {/* List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spinner size="md" color="dark" />
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map(tx => {
              const typeInfo = getTxTypeInfo(tx.type);
              const isSender = tx.from?.toLowerCase() === account?.toLowerCase();

              return (
                <div key={tx._id}
                  className="flex items-center gap-3 p-3 bg-gray-50
                             border border-gray-100 rounded-xl">

                  {/* Icon */}
                  <div className="w-8 h-8 flex items-center justify-center
                                  bg-white border border-gray-200 rounded-lg
                                  text-sm flex-shrink-0">
                    {typeInfo.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full
                                       font-medium ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {tx.project?.title || 'Unknown project'}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${
                      isSender ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {isSender ? '-' : '+'}{tx.amount} MATIC
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiInbox className="text-gray-300 mx-auto mb-2" size={28} />
            <p className="text-gray-400 text-sm">No transactions yet</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default TransactionWidget;