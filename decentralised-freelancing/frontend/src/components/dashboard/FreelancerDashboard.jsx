// frontend/src/components/dashboard/FreelancerDashboard.jsx
// Shows freelancer's submitted proposals and active jobs

import { useState, useEffect }  from 'react';
import { Link }                 from 'react-router-dom';
import {
  FiSend, FiCheckCircle, FiClock,
  FiDollarSign, FiTrendingUp, FiSearch,
} from 'react-icons/fi';
import proposalService   from '../../services/proposalService';
import { useAuth }       from '../../context/AuthContext';
import StatsCard         from './StatsCard';
import ProposalRow       from './ProposalRow';
import EmptyState        from '../common/EmptyState';
import Spinner           from '../common/Spinner';

const FreelancerDashboard = () => {
  const { user }                              = useAuth();
  const [proposals, setProposals]             = useState([]);
  const [isLoading, setIsLoading]             = useState(true);
  const [activeTab, setActiveTab]             = useState('all');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setIsLoading(true);
    try {
      const data = await proposalService.getMyProposals();
      setProposals(data.proposals || []);
    } catch (error) {
      console.error('Failed to load proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by tab
  const filtered = proposals.filter(p => {
    if (activeTab === 'all')      return true;
    if (activeTab === 'pending')  return p.status === 'pending';
    if (activeTab === 'accepted') return p.status === 'accepted';
    if (activeTab === 'rejected') return p.status === 'rejected';
    return true;
  });

  // Stats
  const pendingCount  = proposals.filter(p => p.status === 'pending').length;
  const acceptedCount = proposals.filter(p => p.status === 'accepted').length;
  const rejectedCount = proposals.filter(p => p.status === 'rejected').length;
  const totalEarnings = proposals
    .filter(p => p.status === 'accepted')
    .reduce((sum, p) => sum + p.bidAmount, 0);

  return (
    <div className="space-y-8">

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Proposals"
          value={proposals.length}
          icon={<FiSend />}
          color="cyan"
          sub="Submitted"
        />
        <StatsCard
          label="Pending"
          value={pendingCount}
          icon={<FiClock />}
          color="amber"
          sub="Awaiting response"
        />
        <StatsCard
          label="Accepted"
          value={acceptedCount}
          icon={<FiCheckCircle />}
          color="green"
          sub="Active jobs"
        />
        <StatsCard
          label="Potential Earnings"
          value={`${totalEarnings.toFixed(2)}`}
          icon={<FiDollarSign />}
          color="default"
          sub="MATIC from accepted"
        />
      </div>

      {/* Profile completion nudge */}
      {!user?.isProfileComplete && (
        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-5
                        flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-ink-900 text-sm mb-1">
              Complete your profile to get more work
            </p>
            <p className="text-xs text-gray-500">
              Clients are more likely to hire freelancers with complete profiles.
            </p>
          </div>
          <Link
            to="/profile/edit"
            className="btn-primary text-sm py-2 flex-shrink-0"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Proposals section */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6
                        border-b border-gray-100">
          <h2 className="font-bold text-ink-900">My Proposals</h2>
          <Link
            to="/explore"
            className="btn-primary text-sm py-2 flex items-center gap-2"
          >
            <FiSearch size={14} /> Find More Work
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-gray-100">
          {[
            { key: 'all',      label: 'All',      count: proposals.length },
            { key: 'pending',  label: 'Pending',  count: pendingCount },
            { key: 'accepted', label: 'Accepted', count: acceptedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium
                          transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-ink-900 text-cyan-400'
                  : 'text-gray-500 hover:text-ink-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-ink-800 text-cyan-400'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Proposals list */}
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" color="dark" />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map(proposal => (
              <ProposalRow
                key={proposal._id}
                proposal={proposal}
              />
            ))
          ) : (
            <EmptyState
              icon={<FiSend />}
              title="No proposals yet"
              desc="Browse open projects and submit your first proposal to start earning."
              actionLabel="Browse Projects"
              actionTo="/explore"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerDashboard;