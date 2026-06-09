// frontend/src/pages/ProfileSetup.jsx
// First-time profile setup — shown after first wallet connection

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiDollarSign, FiFileText, FiCheckCircle } from 'react-icons/fi';
import { useAuth }    from '../context/AuthContext';
import useProfile     from '../hooks/useProfile';
import SkillInput     from '../components/common/SkillInput';
import Spinner        from '../components/common/Spinner';
import { PROJECT_CATEGORIES } from '../utils/constants';

const ProfileSetup = () => {
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const { saveProfile, isSaving } = useProfile();

  const [form, setForm] = useState({
    name:       '',
    role:       'both',
    bio:        '',
    skills:     [],
    hourlyRate: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim())
      newErrors.name = 'Name is required';
    if (form.name.trim().length < 2)
      newErrors.name = 'Name must be at least 2 characters';
    if (form.bio && form.bio.length > 500)
      newErrors.bio = 'Bio max 500 characters';
    if (form.hourlyRate && isNaN(form.hourlyRate))
      newErrors.hourlyRate = 'Hourly rate must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const saved = await saveProfile({
      name:       form.name.trim(),
      role:       form.role,
      bio:        form.bio.trim(),
      skills:     form.skills,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
    });

    if (saved) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-ink-900 rounded-2xl flex items-center
                          justify-center mx-auto mb-4">
            <FiUser className="text-cyan-400 text-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-ink-900 mb-2">
            Set Up Your Profile
          </h1>
          <p className="text-gray-500">
            Tell us about yourself — this is how clients and freelancers will find you.
          </p>
        </div>

        {/* Form Card */}
        <div className="card space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              Full Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Johnson"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              I want to...
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'freelancer', label: '💻 Find Work',    desc: 'As a freelancer' },
                { value: 'client',    label: '📋 Hire Talent',   desc: 'As a client' },
                { value: 'both',      label: '⚡ Both',          desc: 'Hire & freelance' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: option.value })}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    form.role === option.value
                      ? 'border-ink-900 bg-ink-900 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold text-sm">{option.label}</p>
                  <p className={`text-xs mt-0.5 ${
                    form.role === option.value ? 'text-gray-300' : 'text-gray-400'
                  }`}>
                    {option.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              Bio
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Tell clients about your experience, expertise, and what you do..."
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              rows={4}
              className="input-field resize-none"
            />
            <div className="flex justify-between mt-1">
              {errors.bio
                ? <p className="text-xs text-red-500">{errors.bio}</p>
                : <span />
              }
              <p className="text-xs text-gray-400">
                {form.bio.length}/500
              </p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              Skills
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <SkillInput
              skills={form.skills}
              onChange={skills => setForm({ ...form, skills })}
              placeholder="Type a skill and press Enter (e.g. Solidity, React)"
            />
            <p className="mt-1 text-xs text-gray-400">
              Press Enter or comma to add each skill
            </p>
          </div>

          {/* Hourly Rate */}
          <div>
            <label className="block text-sm font-semibold text-ink-900 mb-2">
              Hourly Rate (MATIC)
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2
                                       text-gray-400" />
              <input
                type="number"
                placeholder="0.00"
                value={form.hourlyRate}
                onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
                className="input-field pl-10"
                min="0"
                step="0.01"
              />
            </div>
            {errors.hourlyRate && (
              <p className="mt-1 text-xs text-red-500">{errors.hourlyRate}</p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <><Spinner size="sm" color="cyan" /> Saving...</>
            ) : (
              <><FiCheckCircle /> Complete Profile</>
            )}
          </button>

          {/* Skip */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-center text-sm text-gray-400
                       hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;