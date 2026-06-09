// frontend/src/components/common/EmptyState.jsx
// Shown when a list has no items

import { Link } from 'react-router-dom';

const EmptyState = ({ icon, title, desc, actionLabel, actionTo }) => (
  <div className="text-center py-12 px-4">
    <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center
                    justify-center mx-auto mb-4 text-gray-400 text-2xl">
      {icon}
    </div>
    <h3 className="font-bold text-ink-900 mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">{desc}</p>
    {actionLabel && actionTo && (
      <Link to={actionTo} className="btn-primary text-sm py-2.5">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;