// frontend/src/pages/Dashboard.jsx
// Unified dashboard — switches between client and freelancer view

import { useState }             from 'react';
import { Link }                 from 'react-router-dom';
import {
  FiBriefcase, FiUser, FiEdit,
  FiExternalLink,
} from 'react-icons/fi';
import { useAuth }              from '../context/AuthContext';
import { useWallet }            from '../context/WalletContext';
import { formatAddress }        from '../utils/formatters';
import Avatar                   from '../components/common/Avatar';
import StarRating               from '../components/common/StarRating';
import ClientDashboard          from '../components/dashboard/ClientDashboard';
import FreelancerDashboard      from '../components/dashboard/FreelancerDashboard';
import TransactionWidget from '../components/dashboard/TransactionWidget';

const Dashboard = () => {
  const { user }    = useAuth();
  const { account } = useWallet();

  // Default view based on role
  const defaultView = user?.role === 'freelancer' ? 'freelancer' : 'client';
  const [view, setView] = useState(defaultView);

  // Show both tabs only if role is 'both'
  const showBothTabs = user?.role === 'both';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Dashboard Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
        <div className="flex flex-col md:flex-row items-start
                        md:items-center justify-between gap-6">

          {/* User info */}
          <div className="flex items-center gap-4">
            <Avatar
              name={user?.name}
              avatar={user?.avatar}
              size="lg"
            />
            <div>
              <h1 className="text-xl font-extrabold text-ink-900">
                {user?.name || 'Anonymous'}
              </h1>
              <p className="text-sm text-gray-400 font-mono">
                {formatAddress(account)}
              </p>
              {user?.reputationScore > 0 && (
                <div className="mt-1">
                  <StarRating rating={user.reputationScore} size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/profile/edit"
              className="btn-secondary text-sm py-2 flex items-center gap-2"
            >
              <FiEdit size={14} /> Edit Profile
            </Link>
            <Link
              to={`/profile/${account}`}
              className="btn-ghost text-sm flex items-center gap-2"
            >
              <FiExternalLink size={14} /> View Public Profile
            </Link>
          </div>
        </div>

        {/* Role switcher — only for users with both roles */}
        {showBothTabs && (
          <div className="flex gap-2 mt-6 pt-6 border-t border-gray-100">
            <button
              onClick={() => setView('client')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                          text-sm font-semibold transition-all ${
                view === 'client'
                  ? 'bg-ink-900 text-cyan-400'
                  : 'border border-gray-200 text-gray-500 hover:border-ink-900'
              }`}
            >
              <FiBriefcase size={14} />
              Client View
            </button>
            <button
              onClick={() => setView('freelancer')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                          text-sm font-semibold transition-all ${
                view === 'freelancer'
                  ? 'bg-ink-900 text-cyan-400'
                  : 'border border-gray-200 text-gray-500 hover:border-ink-900'
              }`}
            >
              <FiUser size={14} />
              Freelancer View
            </button>
          </div>
        )}
      </div>

      {/* Dashboard content */}
      {view === 'client'
        ? <ClientDashboard />
        : <FreelancerDashboard />
      }
      <div className="mt-8">
  <TransactionWidget />
</div>

    </div>
  );
};

export default Dashboard;