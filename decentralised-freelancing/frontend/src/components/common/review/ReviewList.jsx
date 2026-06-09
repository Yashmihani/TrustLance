// src/components/reviews/ReviewsList.jsx
// Shows all reviews for a user with summary stats

import { FiStar, FiMessageSquare } from 'react-icons/fi';
import ReviewCard   from './ReviewCard';
import StarRating   from '../common/StarRating';
import EmptyState   from '../common/EmptyState';

const ReviewsList = ({ reviews = [], userName = 'this user' }) => {

  // Calculate rating distribution
  const totalReviews  = reviews.length;
  const avgRating     = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const distribution = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const pct   = totalReviews > 0
      ? Math.round((count / totalReviews) * 100)
      : 0;
    return { star, count, pct };
  });

  if (totalReviews === 0) {
    return (
      <EmptyState
        icon={<FiStar />}
        title="No reviews yet"
        desc={'Be the first to review ' + userName}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6 items-center">

          {/* Big rating number */}
          <div className="text-center flex-shrink-0">
            <p className="text-5xl font-extrabold text-ink-900">
              {avgRating.toFixed(1)}
            </p>
            <StarRating rating={avgRating} size="md" />
            <p className="text-sm text-gray-400 mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating bars */}
          <div className="flex-1 w-full space-y-2">
            {distribution.map(item => (
              <div key={item.star}
                className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-8 text-right flex-shrink-0">
                  {item.star}★
                </span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: item.pct + '%' }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 flex-shrink-0">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {reviews.map(review => (
          <ReviewCard key={review._id} review={review} />
        ))}
      </div>

    </div>
  );
};

export default ReviewsList;