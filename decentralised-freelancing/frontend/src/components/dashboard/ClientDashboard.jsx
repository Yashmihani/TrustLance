// frontend/src/components/dashboard/ClientDashboard.jsx
// Shows client's posted projects and received proposals

import { useState, useEffect } from 'react';
import { Link }                from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiDollarSign,
  FiPlusCircle, FiTrendingUp,
} from 'react-icons/fi';
import useProjects   from '../../hooks/useProjects';
import { useAuth }   from '../../context/AuthContext';
import StatsCard     from './StatsCard';
import ProjectRow    from './ProjectRow';
import EmptyState    from '../common/EmptyState';
import Spinner       from '../common/Spinner';
import projectService from '../../services/projectService';

const ClientDashboard = () => {
  const { user }                                    = useAuth();
  const { projects, isLoading, fetchProjects,
          deleteProject }                           = useProjects();
  const [myProjects, setMyProjects]                 = useState([]);
  const [activeTab, setActiveTab]                   = useState('all');

  useEffect(() => {
    loadMyProjects();
  }, []);

  const loadMyProjects = async () => {
    // Fetch all projects then filter by client wallet
    const data = await fetchProjects({ limit: 50 });
    if (data) {
      const mine = data.projects.filter(
        p => p.client?.walletAddress === user?.walletAddress
      );
      setMyProjects(mine);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this project?'
    );
    if (!confirmed) return;
    const success = await deleteProject(id);
    if (success) {
      setMyProjects(prev => prev.filter(p => p._id !== id));
    }
  };

  // Filter projects by tab
  const filtered = myProjects.filter(p => {
    if (activeTab === 'all')         return true;
    if (activeTab === 'open')        return p.status === 'open';
    if (activeTab === 'active')      return p.status === 'in_progress';
    if (activeTab === 'completed')   return p.status === 'completed';
    return true;
  });

  // Stats calculations
  const totalBudget   = myProjects.reduce((sum, p) => sum + p.budget, 0);
  const openCount     = myProjects.filter(p => p.status === 'open').length;
  const activeCount   = myProjects.filter(p => p.status === 'in_progress').length;
  const doneCount     = myProjects.filter(p => p.status === 'completed').length;
  const totalProposals = myProjects.reduce(
    (sum, p) => sum + (p.proposalCount || 0), 0
  );

  return (
    <div className="space-y-8">

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          label="Total Projects"
          value={myProjects.length}
          icon={<FiBriefcase />}
          color="cyan"
          sub="All time"
        />
        <StatsCard
          label="Open Projects"
          value={openCount}
          icon={<FiTrendingUp />}
          color="green"
          sub="Accepting proposals"
        />
        <StatsCard
          label="Total Proposals"
          value={totalProposals}
          icon={<FiUsers />}
          color="amber"
          sub="Received"
        />
        <StatsCard
          label="Total Budget"
          value={`${totalBudget.toFixed(2)}`}
          icon={<FiDollarSign />}
          color="default"
          sub="MATIC posted"
        />
      </div>

      {/* Projects Section */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

        {/* Section header */}
        <div className="flex items-center justify-between p-6
                        border-b border-gray-100">
          <h2 className="font-bold text-ink-900">My Projects</h2>
          <Link
            to="/post-job"
            className="btn-primary text-sm py-2 flex items-center gap-2"
          >
            <FiPlusCircle size={14} /> Post New Project
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-gray-100">
          {[
            { key: 'all',       label: 'All',         count: myProjects.length },
            { key: 'open',      label: 'Open',        count: openCount },
            { key: 'active',    label: 'In Progress', count: activeCount },
            { key: 'completed', label: 'Completed',   count: doneCount },
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

        {/* Project list */}
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="md" color="dark" />
            </div>
          ) : filtered.length > 0 ? (
            filtered.map(project => (
              <ProjectRow
                key={project._id}
                project={project}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <EmptyState
              icon={<FiBriefcase />}
              title="No projects yet"
              desc="Post your first project and start receiving proposals from top freelancers."
              actionLabel="Post a Project"
              actionTo="/post-job"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;