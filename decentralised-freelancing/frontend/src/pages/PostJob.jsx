// frontend/src/pages/PostJob.jsx
// Client posts a new project

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBriefcase, FiDollarSign, FiCalendar,
  FiArrowLeft, FiSend,
} from 'react-icons/fi';
import useProjects from '../hooks/useProjects';
import SkillInput  from '../components/common/SkillInput';
import Spinner     from '../components/common/Spinner';
import { PROJECT_CATEGORIES } from '../utils/constants';

const PostJob = () => {
  const navigate              = useNavigate();
  const { createProject, isCreating } = useProjects();

  const [form, setForm] = useState({
    title:       '',
    description: '',
    category:    '',
    skills:      [],
    budget:      '',
    deadline:    '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())
      e.title = 'Title is required';
    if (form.title.length > 100)
      e.title = 'Title max 100 characters';
    if (!form.description.trim())
      e.description = 'Description is required';
    if (form.description.trim().length < 20)
      e.description = 'Description must be at least 20 characters';
    if (!form.category)
      e.category = 'Category is required';
    if (!form.budget || isNaN(form.budget) || Number(form.budget) <= 0)
      e.budget = 'Valid budget is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const created = await createProject({
      title:       form.title.trim(),
      description: form.description.trim(),
      category:    form.category,
      skills:      form.skills,
      budget:      Number(form.budget),
      deadline:    form.deadline || null,
    });

    if (created) {
      navigate(`/projects/${created._id}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center
                     border border-gray-200 rounded-xl
                     hover:border-ink-900 transition-colors"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">
            Post a Project
          </h1>
          <p className="text-gray-400 text-sm">
            Describe your project and set a budget in MATIC
          </p>
        </div>
      </div>

      <div className="card space-y-6">

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Project Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Build a DeFi Dashboard with React"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="input-field"
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.title
              ? <p className="text-xs text-red-500">{errors.title}</p>
              : <span />
            }
            <p className="text-xs text-gray-400">
              {form.title.length}/100
            </p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Category <span className="text-red-400">*</span>
          </label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="input-field"
          >
            <option value="">Select a category</option>
            {PROJECT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-500">{errors.category}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Description <span className="text-red-400">*</span>
          </label>
          <textarea
            placeholder="Describe your project in detail — what needs to be built, requirements, deliverables..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={6}
            className="input-field resize-none"
          />
          <div className="flex justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-500">{errors.description}</p>
              : <span />
            }
            <p className="text-xs text-gray-400">
              {form.description.length}/5000
            </p>
          </div>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Required Skills
            <span className="ml-1 font-normal text-gray-400">(optional)</span>
          </label>
          <SkillInput
            skills={form.skills}
            onChange={skills => setForm({ ...form, skills })}
            placeholder="e.g. Solidity, React, ethers.js"
          />
        </div>

        {/* Budget and Deadline row */}
        <div className="grid md:grid-cols-2 gap-4">

          {/* Budget */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              Budget (MATIC) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2
                                       text-gray-400" />
              <input
                type="number"
                placeholder="0.00"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
                className="input-field pl-10"
                min="0"
                step="0.01"
              />
            </div>
            {errors.budget && (
              <p className="mt-1 text-xs text-red-500">{errors.budget}</p>
            )}
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              Deadline
              <span className="ml-1 font-normal text-gray-400">(optional)</span>
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2
                                     text-gray-400" />
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
                className="input-field pl-10"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
          <p className="text-sm text-cyan-800 font-medium mb-1">
            💡 How payment works
          </p>
          <p className="text-xs text-cyan-700 leading-relaxed">
            When you hire a freelancer, your budget will be locked in a smart
            contract escrow. Funds are only released when you approve the work.
            You can request a refund if the work is not delivered.
          </p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isCreating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <><Spinner size="sm" color="cyan" /> Posting...</>
          ) : (
            <><FiSend /> Post Project</>
          )}
        </button>

      </div>
    </div>
  );
};

export default PostJob;