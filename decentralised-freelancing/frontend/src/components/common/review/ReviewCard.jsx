// src/components/reviews/ReviewCard.jsx
// Displays a single review

import { FiCalendar }  from 'react-icons/fi';
import Avatar          from '../common/Avatar';
import StarRating      from '../common/StarRating';
import { formatDate }  from '../../utils/formatters';

const ReviewCard = ({ review }) => {
  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl
                    hover:border-gray-300 transition-all">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            name={review.reviewer?.name}
            avatar={review.reviewer?.avatar}
            size="md"
          />
          <div>
            <p className="font-semibold text-ink-900 text-sm">
              {review.reviewer?.name || 'Anonymous'}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <FiCalendar size={10} />
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Project reference */}
      {review.project?.title && (
        <div className="mb-3">
          <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-500
                           rounded-lg font-medium">
            {review.project.title}
          </span>
        </div>
      )}

      {/* Comment */}
      {review.comment ? (
        <p className="text-sm text-gray-600 leading-relaxed">
          {review.comment}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">No written comment</p>
      )}

    </div>
  );
};

export default ReviewCard;