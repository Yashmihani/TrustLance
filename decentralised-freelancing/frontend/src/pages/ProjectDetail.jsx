// frontend/src/pages/ProjectDetail.jsx

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import {
  FiClock,
  FiDollarSign,
  FiUser,
  FiArrowLeft,
  FiSend,
  FiCheck,
  FiX,
  FiLock,
  FiStar,
  FiPaperclip,
  FiExternalLink,
} from 'react-icons/fi';

import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

import useProjects from '../hooks/useProjects';

import Avatar from '../components/common/Avatar';
import StarRating from '../components/common/StarRating';
import Spinner from '../components/common/Spinner';

import ReviewForm from '../components/reviews/ReviewForm';
import ReviewCard from '../components/reviews/ReviewCard';

import {
  formatDate,
  formatAddress,
  getStatusInfo,
} from '../utils/formatters';

import proposalService from '../services/proposalService';
import reviewService from '../services/reviewService';

import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuth();
  const { account } = useWallet();

  const { fetchProject, isLoading } = useProjects();

  const [projectData, setProjectData] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [proposalForm, setProposalForm] = useState({
    coverLetter: '',
    bidAmount: '',
    deliveryDays: '',
  });

  useEffect(() => {
    const load = async () => {
      const data = await fetchProject(id);

      if (data) {
        setProjectData(data.project);
        setProposals(data.proposals || []);
      }
    };

    load();
  }, [id]);

  useEffect(() => {
    const checkReview = async () => {
      if (
        projectData &&
        projectData.status === 'completed' &&
        projectData.freelancer
      ) {
        try {
          const data = await reviewService.getUserReviews(
            projectData.freelancer._id
          );

          const allRevs = data.reviews || [];

          const myReview = allRevs.find((r) => {
            const sameProject =
              r.project && r.project._id === id;

            const reviewerWallet =
              r.reviewer && r.reviewer.walletAddress
                ? r.reviewer.walletAddress.toLowerCase()
                : '';

            const currentWallet = account
              ? account.toLowerCase()
              : '';

            return (
              sameProject &&
              reviewerWallet === currentWallet
            );
          });

          if (myReview) {
            setExistingReview(myReview);
          }

          setReviews(allRevs);
        } catch (e) {
          console.error(e);
        }
      }
    };

    if (projectData) {
      checkReview();
    }
  }, [projectData, id, account]);

  const alreadyProposed = proposals.some((p) => {
    const fw =
      p.freelancer && p.freelancer.walletAddress
        ? p.freelancer.walletAddress.toLowerCase()
        : '';

    const aw = account
      ? account.toLowerCase()
      : '';

    return fw === aw;
  });

  const isClient =
    projectData &&
    projectData.client &&
    projectData.client.walletAddress &&
    projectData.client.walletAddress.toLowerCase() ===
      (account || '').toLowerCase();

  const isFreelancer =
    projectData &&
    projectData.freelancer &&
    projectData.freelancer.walletAddress &&
    projectData.freelancer.walletAddress.toLowerCase() ===
      (account || '').toLowerCase();

  const handleSubmitProposal = async () => {
    if (!proposalForm.coverLetter.trim()) {
      toast.error('Cover letter is required');
      return;
    }

    if (proposalForm.coverLetter.length < 50) {
      toast.error(
        'Cover letter must be at least 50 characters'
      );
      return;
    }

    if (
      !proposalForm.bidAmount ||
      Number(proposalForm.bidAmount) <= 0
    ) {
      toast.error('Valid bid amount is required');
      return;
    }

    if (
      !proposalForm.deliveryDays ||
      Number(proposalForm.deliveryDays) < 1
    ) {
      toast.error('Delivery days is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await proposalService.create({
        projectId: id,
        coverLetter: proposalForm.coverLetter,
        bidAmount: Number(proposalForm.bidAmount),
        deliveryDays: Number(
          proposalForm.deliveryDays
        ),
      });

      setProposals((prev) => [
        data.proposal,
        ...prev,
      ]);

      setShowForm(false);

      setProposalForm({
        coverLetter: '',
        bidAmount: '',
        deliveryDays: '',
      });

      toast.success('Proposal submitted!');
    } catch (error) {
      const msg =
        error.response &&
        error.response.data &&
        error.response.data.message
          ? error.response.data.message
          : 'Failed to submit proposal';

      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptProposal = async (
    proposalId
  ) => {
    try {
      await proposalService.accept(proposalId);

      const data = await fetchProject(id);

      if (data) {
        setProjectData(data.project);
        setProposals(data.proposals || []);
      }

      toast.success(
        'Proposal accepted! Set up escrow next.'
      );
    } catch (error) {
      toast.error('Failed to accept proposal');
    }
  };

  const handleRejectProposal = async (
    proposalId
  ) => {
    try {
      await proposalService.reject(proposalId);

      setProposals((prev) =>
        prev.map((p) =>
          p._id === proposalId
            ? { ...p, status: 'rejected' }
            : p
        )
      );

      toast.success('Proposal rejected');
    } catch (error) {
      toast.error('Failed to reject proposal');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" color="dark" />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-ink-900 mb-4">
          Project not found
        </h2>

        <Link
          to="/explore"
          className="btn-primary"
        >
          Browse Projects
        </Link>
      </div>
    );
  }

  const statusInfo = getStatusInfo(
    projectData.status
  );

  const statusBadgeClass =
    'badge flex-shrink-0 ' +
    statusInfo.color;

  const statusPillClass =
    'px-2 py-0.5 rounded-full text-xs font-medium ' +
    statusInfo.color;

  const proposalCountText =
    proposals.length + ' proposals';

  const postedText =
    'Posted ' +
    formatDate(projectData.createdAt);

  const budgetText =
    projectData.budget + ' MATIC';

  const categoryText =
    projectData.category;

  const attachCount =
    projectData.attachments
      ? projectData.attachments.length
      : 0;

  const attachCountText =
    'Attachments (' + attachCount + ')';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-ink-900 mb-6 transition-colors text-sm"
      >
        <FiArrowLeft size={16} />
        Back to projects
      </button>

      <div className="grid md:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="md:col-span-2 space-y-6">

          <div className="card">

            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-2xl font-extrabold text-ink-900 flex-1">
                {projectData.title}
              </h1>

              <span className={statusBadgeClass}>
                {statusInfo.label}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6">

              <div className="flex items-center gap-1.5">
                <FiDollarSign
                  size={14}
                  className="text-cyan-500"
                />

                <span className="font-semibold text-ink-900">
                  {budgetText}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <FiClock size={14} />
                {postedText}
              </div>

              {projectData.deadline && (
                <div className="flex items-center gap-1.5">
                  <FiClock
                    size={14}
                    className="text-red-400"
                  />

                  {'Due ' +
                    formatDate(
                      projectData.deadline
                    )}
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <FiUser size={14} />
                {proposalCountText}
              </div>

            </div>

            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium mb-4 inline-block">
              {categoryText}
            </span>

            <div>
              <h3 className="font-bold text-ink-900 mb-2">
                Description
              </h3>

              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap text-sm">
                {projectData.description}
              </p>
            </div>

            {/* ATTACHMENTS FIXED */}
            {projectData.attachments &&
              projectData.attachments.length >
                0 && (
                <div className="mt-4">

                  <h3 className="font-bold text-ink-900 mb-2 flex items-center gap-2">
                    <FiPaperclip
                      size={14}
                      className="text-cyan-500"
                    />

                    {attachCountText}
                  </h3>

                  <div className="flex flex-wrap gap-2">

                    {projectData.attachments.map(
                      (
                        attachmentUrl,
                        attachIndex
                      ) => {
                        const fileLabel =
                          'File ' +
                          (attachIndex + 1);

                        return (
                          <a
                            key={attachIndex}
                            href={attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition-colors"
                          >
                            <FiExternalLink
                              size={10}
                            />

                            {fileLabel}
                          </a>
                        );
                      }
                    )}

                  </div>
                </div>
              )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;