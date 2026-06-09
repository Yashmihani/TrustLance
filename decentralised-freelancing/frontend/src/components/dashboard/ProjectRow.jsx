// frontend/src/components/dashboard/ProjectRow.jsx
// Single project row in dashboard table

import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiTrash2 } from 'react-icons/fi';
import { formatDate, getStatusInfo } from '../../utils/formatters';

const ProjectRow = ({ project, onDelete }) => {
  const statusInfo = getStatusInfo(project.status);

  return (
    <div className="flex items-center gap-4 p-4 bg-white border
                    border-gray-200 rounded-xl hover:border-gray-300
                    transition-all group">

      {/* Title and date */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/projects/${project._id}`}
          className="font-semibold text-ink-900 hover:text-cyan-600
                     transition-colors text-sm truncate block"
        >
          {project.title}
        </Link>
        <p className="text-xs text-gray-400 mt-0.5">
          Posted {formatDate(project.createdAt)}
        </p>
      </div>

      {/* Proposals count */}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <FiUsers size={12} />
        <span>{project.proposalCount || 0} proposals</span>
      </div>

      {/* Budget */}
      <span className="budget-tag text-xs">
        {project.budget} MATIC
      </span>

      {/* Status */}
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                       ${statusInfo.color}`}>
        {statusInfo.label}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100
                      transition-opacity">
        <Link
          to={`/projects/${project._id}`}
          className="w-8 h-8 flex items-center justify-center border
                     border-gray-200 rounded-lg hover:border-ink-900
                     transition-colors"
        >
          <FiArrowRight size={14} />
        </Link>
        {project.status === 'open' && onDelete && (
          <button
            onClick={() => onDelete(project._id)}
            className="w-8 h-8 flex items-center justify-center border
                       border-gray-200 rounded-lg hover:border-red-300
                       hover:text-red-500 transition-colors"
          >
            <FiTrash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectRow;