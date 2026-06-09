// src/components/reviews/ReviewForm.jsx
// Form to submit a review after project completion

import { useState }       from 'react';
import { FiSend, FiX }   from 'react-icons/fi';
import reviewService      from '../../services/reviewService';
import StarRatingInput    from '../common/StarRatingInput';
import Avatar             from '../common/Avatar';
import Spinner            from '../common/Spinner';
import toast              from 'react-hot-toast';

const ReviewForm = ({ project, revieweeId, revieweeName, onSuccess, onCancel }) => {
  const [rating,       setRating]       = useState(0);
  const [comment,      setComment]      = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await reviewService.create({
        projectId:  project._id,
        revieweeId,
        rating,
        comment: comment.trim(),
      });

      toast.success('Review submitted successfully!');
      if (onSuccess) onSuccess(data.review);

    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit review';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card border-2 border-cyan-100">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-ink-900 text-lg">Leave a Review</h3>
          <p className="text-gray-400 text-sm">
            Share your experience working with {revieweeName}
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center
                       border border-gray-200 rounded-lg
                       hover:border-red-300 hover:text-red-400
                       transition-colors"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Who you are reviewing */}
      <div className="flex items-center gap-3 p-4 bg-gray-50
                      border border-gray-200 rounded-xl mb-6">
        <Avatar name={revieweeName} size="md" />
        <div>
          <p className="font-semibold text-ink-900 text-sm">
            {revieweeName}
          </p>
          <p className="text-xs text-gray-400">
            {project.title}
          </p>
        </div>
      </div>

      {/* Star rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-ink-900 mb-3">
          Rating <span className="text-red-400">*</span>
        </label>
        <StarRatingInput
          value={rating}
          onChange={setRating}
          size={32}
        />
      </div>

      {/* Comment */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-ink-900 mb-2">
          Comment
          <span className="ml-1 font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          placeholder="Describe your experience — quality of work, communication, professionalism..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          className="input-field resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">
          {comment.length}/1000
        </p>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isSubmitting
          ? <><Spinner size="sm" color="cyan" /> Submitting...</>
          : <><FiSend size={14} /> Submit Review</>
        }
      </button>

    </div>
  );
};

export default ReviewForm;