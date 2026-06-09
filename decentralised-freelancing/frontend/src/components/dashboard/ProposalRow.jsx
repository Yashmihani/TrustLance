// frontend/src/components/dashboard/ProposalRow.jsx
// Single proposal row for freelancer dashboard

import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiDollarSign } from 'react-icons/fi';
import { formatDate } from '../../utils/formatters';

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  accepted:  'bg-green-50 text-green-700 border-green-200',
  rejected:  'bg-red-50 text-red-600 border-red-200',
  withdrawn: 'bg-gray-50 text-gray-500 border-gray-200',
};

const ProposalRow = ({ proposal }) => {
  const statusStyle = STATUS_STYLES[proposal.status] || STATUS_STYLES.pending;

  return (
    <div className="flex items-center gap-4 p-4 bg-white border
                    border-gray-200 rounded-xl hover:border-gray-300
                    transition-all group">

      {/* Project title */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/projects/${proposal.project?._id}`}
          className="font-semibold text-ink-900 hover:text-cyan-600
                     transition-colors text-sm truncate block"
        >
          {proposal.project?.title || 'Project'}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">
          Applied {formatDate(proposal.createdAt)}
        </p>
      </div>

      {/* Bid amount */}
      <div className="flex items-center gap-1 text-sm font-semibold
                      text-ink-900">
        <FiDollarSign size={12} className="text-cyan-500" />
        {proposal.bidAmount} MATIC
      </div>

      {/* Delivery days */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <FiClock size={12} />
        {proposal.deliveryDays} days
      </div>

      {/* Status badge */}
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                       border capitalize ${statusStyle}`}>
        {proposal.status}
      </span>

      {/* View project */}
      <Link
        to={`/projects/${proposal.project?._id}`}
        className="w-8 h-8 flex items-center justify-center border
                   border-gray-200 rounded-lg hover:border-ink-900
                   transition-colors opacity-0 group-hover:opacity-100"
      >
        <FiArrowRight size={14} />
      </Link>
    </div>
  );
};

export default ProposalRow;