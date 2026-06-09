// src/components/common/TransactionCard.jsx
import { FiExternalLink, FiArrowRight } from 'react-icons/fi';
import { formatDate, getTxTypeInfo } from '../../utils/formatters';

const TransactionCard = ({ tx, currentWallet }) => {

  const typeInfo    = getTxTypeInfo(tx.type);
  const isSender    = tx.from?.toLowerCase() === currentWallet?.toLowerCase();
  const scanUrl     = 'https://mumbai.polygonscan.com/tx/' + tx.txHash;
  const fromShort   = tx.from ? tx.from.slice(0, 8) + '...' : 'Unknown';
  const toShort     = tx.to   ? tx.to.slice(0, 8)   + '...' : 'Unknown';
  const amountSign  = isSender ? '-' : '+';
  const amountColor = isSender ? 'font-bold text-sm text-red-500' : 'font-bold text-sm text-green-600';
  const sentLabel   = isSender ? 'Sent' : 'Received';
  const badgeClass  = 'px-2 py-0.5 rounded-full text-xs font-semibold ' + typeInfo.color;
  const projectTitle = tx.project ? tx.project.title : '';

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all group">

      <div className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-xl text-lg flex-shrink-0">
        {typeInfo.icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={badgeClass}>
            {typeInfo.label}
          </span>
          <span className="text-xs text-gray-400 truncate">
            {projectTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
          <span className="font-mono">{fromShort}</span>
          <FiArrowRight size={10} />
          <span className="font-mono">{toShort}</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatDate(tx.createdAt)}
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={amountColor}>
          {amountSign}{tx.amount} MATIC
        </p>
        <p className="text-xs text-gray-400">
          {sentLabel}
        </p>
      </div>

      
        href={scanUrl}
        target="_blank"
        rel="noreferrer"
        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:border-ink-900 text-gray-400 hover:text-ink-900 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
      
        <FiExternalLink size={14} />
      

    </div>
  );
};

export default TransactionCard;