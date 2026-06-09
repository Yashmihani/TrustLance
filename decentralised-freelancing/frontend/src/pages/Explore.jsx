// frontend/src/pages/Explore.jsx
// Browse and search all open projects

import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import useProjects   from '../hooks/useProjects';
import ProjectCard   from '../components/common/ProjectCard';
import SkeletonCard  from '../components/common/SkeletonCard';
import { PROJECT_CATEGORIES } from '../utils/constants';

const Explore = () => {
  const { projects, isLoading, pagination, fetchProjects } = useProjects();

  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [status,   setStatus]   = useState('open');
  const [page,     setPage]     = useState(1);

  // Fetch projects whenever filters change
  const loadProjects = useCallback(() => {
    fetchProjects({ search, category, status, page, limit: 12 });
  }, [search, category, status, page]);

  useEffect(() => {
    loadProjects();
  }, [category, status, page]);

  // Search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') loadProjects();
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('open');
    setPage(1);
  };

  const hasFilters = search || category || status !== 'open';

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink-900 mb-2">
          Find Work
        </h1>
        <p className="text-gray-400">
          Browse open projects and submit your proposal
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-3">

          {/* Search bar */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2
                                  text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="input-field pl-10"
            />
          </div>

          {/* Category filter */}
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
            className="input-field md:w-52"
          >
            <option value="">All Categories</option>
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input-field md:w-40"
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Search button */}
          <button
            onClick={loadProjects}
            className="btn-primary px-6 flex items-center gap-2"
          >
            <FiSearch size={16} /> Search
          </button>
        </div>

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Active filters:</span>
            {search && (
              <span className="badge">"{search}"</span>
            )}
            {category && (
              <span className="badge">{category}</span>
            )}
            {status !== 'open' && (
              <span className="badge">{status}</span>
            )}
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-red-400
                         hover:text-red-600 ml-auto"
            >
              <FiX size={12} /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-gray-400 mb-4">
          {pagination?.total || 0} projects found
        </p>
      )}

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(project => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <FiSearch className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-bold text-ink-900 mb-2">
            No projects found
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Try adjusting your filters or search terms
          </p>
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                       font-medium disabled:opacity-40 hover:border-ink-900
                       transition-colors"
          >
            Previous
          </button>

          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium
                          transition-colors ${
                p === page
                  ? 'bg-ink-900 text-cyan-400'
                  : 'border border-gray-200 hover:border-ink-900'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm
                       font-medium disabled:opacity-40 hover:border-ink-900
                       transition-colors"
          >
            Next
          </button>
        </div>
      )}

    </div>
  );
};

export default Explore;