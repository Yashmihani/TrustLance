// frontend/src/components/common/ProjectCard.jsx
// Reusable project card — used on Explore and Dashboard pages

import { Link } from 'react-router-dom';
import {
  FiClock, FiUsers, FiDollarSign, FiArrowRight
} from 'react-icons/fi';
import { formatDate, getStatusInfo } from '../../utils/formatters';
import Avatar from './Avatar';
import { PROJECT_CATEGORIES } from '../../utils/constants';

const ProjectCard = ({ project }) => {
  const statusInfo = getStatusInfo(project.status);

  return (
    <Link
      to={`/projects/${project._id}`}
      className="card group block hover:shadow-md transition-all duration-200
                 hover:-translate-y-0.5"
    >
      {/* Top row — title and budget */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-bold text-ink-900 group-hover:text-cyan-600
                       transition-colors line-clamp-2 flex-1">
          {project.title}
        </h3>
        <span className="budget-tag flex-shrink-0">
          {project.budget} MATIC
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
        {project.description}
      </p>

      {/* Skills */}
      {project.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills.slice(0, 3).map(skill => (
            <span key={skill}
              className="px-2 py-0.5 bg-gray-100 text-gray-600
                         rounded-md text-xs font-medium">
              {skill}
            </span>
          ))}
          {project.skills.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-400
                             rounded-md text-xs">
              +{project.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3
                      border-t border-gray-100">
        <div className="flex items-center gap-3">
          {/* Client avatar */}
          <div className="flex items-center gap-1.5">
            <Avatar name={project.client?.name} size="sm" />
            <span className="text-xs text-gray-400">
              {project.client?.name || 'Anonymous'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400">
          {/* Proposals count */}
          <div className="flex items-center gap-1">
            <FiUsers size={12} />
            <span>{project.proposalCount || 0}</span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-1">
            <FiClock size={12} />
            <span>{formatDate(project.createdAt)}</span>
          </div>

          {/* Status */}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                           ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;