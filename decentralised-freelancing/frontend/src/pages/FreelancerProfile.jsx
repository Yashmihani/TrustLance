// src/pages/FreelancerProfile.jsx
import { useEffect, useState }  from 'react';
import { useParams, Link }      from 'react-router-dom';
import {
  FiDollarSign, FiBriefcase,
  FiStar, FiEdit, FiArrowLeft,
} from 'react-icons/fi';
import { useAuth }     from '../context/AuthContext';
import useProfile      from '../hooks/useProfile';
import Avatar          from '../components/common/Avatar';
import StarRating      from '../components/common/StarRating';
import ReviewsList     from '../components/reviews/ReviewsList';
import Spinner         from '../components/common/Spinner';
import { formatDate }  from '../utils/formatters';

const FreelancerProfile = () => {
  const { walletAddress }           = useParams();
  const { user: currentUser }       = useAuth();
  const { fetchProfile, isLoading } = useProfile();
  const [profileData, setProfileData] = useState(null);

  const isOwnProfile = currentUser?.walletAddress?.toLowerCase()
    === walletAddress?.toLowerCase();

  useEffect(() => {
    const load = async () => {
      const data = await fetchProfile(walletAddress);
      if (data) setProfileData(data);
    };
    load();
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="dark" />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Profile not found
        </h2>
        <p className="text-gray-400 mb-6">
          This wallet address does not have a profile yet.
        </p>
        <Link to="/explore" className="btn-primary">Browse Projects</Link>
      </div>
    );
  }

  const { user, reviews } = profileData;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-ink-900
                   mb-8 transition-colors text-sm"
      >
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-3 gap-6">

        {/* ── Left — Profile Card ── */}
        <div className="md:col-span-1 space-y-4">
          <div className="card text-center">

            <Avatar
              name={user.name}
              avatar={user.avatar}
              size="xl"
              className="mx-auto mb-4"
            />

            <h1 className="text-xl font-extrabold text-ink-900">
              {user.name || 'Anonymous'}
            </h1>

            <span className="inline-block mt-1 px-3 py-1 bg-ink-900
                             text-cyan-400 rounded-full text-xs
                             font-semibold capitalize">
              {user.role}
            </span>

            {user.reputationScore > 0 && (
              <div className="flex justify-center mt-3">
                <StarRating rating={user.reputationScore} size="md" />
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4
                            border-t border-gray-100">
              <div className="text-center">
                <p className="text-xl font-bold text-ink-900">
                  {user.completedJobs}
                </p>
                <p className="text-xs text-gray-400">Jobs Done</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-ink-900">
                  {user.reputationScore > 0
                    ? user.reputationScore.toFixed(1)
                    : '—'
                  }
                </p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
            </div>

            {/* Hourly rate */}
            {user.hourlyRate > 0 && (
              <div className="flex items-center justify-center gap-1
                              mt-4 text-sm text-gray-600">
                <FiDollarSign size={14} className="text-cyan-500" />
                <span className="font-semibold text-ink-900">
                  {user.hourlyRate} MATIC
                </span>
                <span className="text-gray-400">/ hr</span>
              </div>
            )}

            {/* Edit button if own profile */}
            {isOwnProfile && (
              <Link
                to="/profile/edit"
                className="btn-secondary w-full mt-4 flex items-center
                           justify-center gap-2 text-sm"
              >
                <FiEdit size={14} /> Edit Profile
              </Link>
            )}
          </div>

          {/* Wallet address */}
          <div className="card">
            <p className="text-xs text-gray-400 font-medium mb-1">
              Wallet Address
            </p>
            <p className="text-xs font-mono text-ink-900 break-all">
              {user.walletAddress}
            </p>
          </div>

          {/* Member since */}
          <div className="card">
            <p className="text-xs text-gray-400 font-medium mb-1">
              Member Since
            </p>
            <p className="text-sm font-semibold text-ink-900">
              {formatDate(user.createdAt)}
            </p>
          </div>
        </div>

        {/* ── Right — Bio, Skills, Reviews ── */}
        <div className="md:col-span-2 space-y-6">

          {/* Bio */}
          {user.bio && (
            <div className="card">
              <h2 className="font-bold text-ink-900 mb-3 flex items-center gap-2">
                <FiBriefcase size={16} className="text-cyan-500" />
                About
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div className="card">
              <h2 className="font-bold text-ink-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(skill => (
                  <span key={skill}
                    className="px-3 py-1.5 bg-ink-900 text-cyan-400
                               rounded-lg text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div className="card">
            <h2 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
              <FiStar size={16} className="text-amber-400" />
              Reviews
              <span className="text-gray-400 font-normal text-sm">
                ({reviews?.length || 0})
              </span>
            </h2>
            <ReviewsList
              reviews={reviews || []}
              userName={user?.name}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default FreelancerProfile;