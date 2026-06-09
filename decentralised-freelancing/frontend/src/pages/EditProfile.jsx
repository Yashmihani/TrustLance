// frontend/src/pages/EditProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth }      from '../context/AuthContext';
import useProfile       from '../hooks/useProfile';
import SkillInput       from '../components/common/SkillInput';
import AvatarUpload     from '../components/common/AvatarUpload';
import Spinner          from '../components/common/Spinner';

const EditProfile = () => {
  const navigate                      = useNavigate();
  const { user }                      = useAuth();
  const { saveProfile, isSaving }     = useProfile();
  const [avatarUrl, setAvatarUrl]     = useState('');

  const [form, setForm] = useState({
    name:       '',
    role:       'both',
    bio:        '',
    skills:     [],
    hourlyRate: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        name:       user.name       || '',
        role:       user.role       || 'both',
        bio:        user.bio        || '',
        skills:     user.skills     || [],
        hourlyRate: user.hourlyRate || '',
      });
      setAvatarUrl(user.avatar || '');
    }
  }, [user]);

  const handleSave = async () => {
    const saved = await saveProfile({
      name:       form.name.trim(),
      role:       form.role,
      bio:        form.bio.trim(),
      skills:     form.skills,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : 0,
      avatar:     avatarUrl,
    });
    if (saved) navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">

      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-xl hover:border-ink-900 transition-colors"
        >
          <FiArrowLeft />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-ink-900">Edit Profile</h1>
          <p className="text-gray-400 text-sm">Update your public profile</p>
        </div>
      </div>

      <div className="card space-y-6">

        {/* Avatar upload */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
          <AvatarUpload
            currentAvatar={avatarUrl}
            name={form.name}
            onUpload={(url) => setAvatarUrl(url)}
          />
          <div>
            <p className="font-semibold text-ink-900">
              {form.name || 'Your Name'}
            </p>
            <p className="text-sm text-gray-400 font-mono">
              {user && user.walletAddress ? user.walletAddress.slice(0, 10) + '...' : ''}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Stored permanently on IPFS
            </p>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="input-field"
            placeholder="Your full name"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Role
          </label>
          <select
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            className="input-field"
          >
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={e => setForm({ ...form, bio: e.target.value })}
            rows={4}
            className="input-field resize-none"
            placeholder="Describe your experience..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {form.bio.length}/500
          </p>
        </div>

        {/* Skills */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Skills
          </label>
          <SkillInput
            skills={form.skills}
            onChange={skills => setForm({ ...form, skills })}
          />
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-semibold text-ink-900 mb-2">
            Hourly Rate (MATIC)
          </label>
          <input
            type="number"
            value={form.hourlyRate}
            onChange={e => setForm({ ...form, hourlyRate: e.target.value })}
            className="input-field"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isSaving
            ? <><Spinner size="sm" color="cyan" /> Saving...</>
            : <><FiSave /> Save Changes</>
          }
        </button>

      </div>
    </div>
  );
};

export default EditProfile;