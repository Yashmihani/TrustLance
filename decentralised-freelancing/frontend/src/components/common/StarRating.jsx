// frontend/src/components/common/StarRating.jsx
// Displays a star rating (read-only)

import { FiStar } from 'react-icons/fi';

const StarRating = ({ rating = 0, max = 5, size = 'sm' }) => {
  const sizes = { sm: 12, md: 16, lg: 20 };

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <FiStar
          key={i}
          size={sizes[size]}
          className={i < Math.round(rating)
            ? 'text-amber-400 fill-amber-400'
            : 'text-gray-300'
          }
        />
      ))}
      {rating > 0 && (
        <span className="ml-1 text-xs text-gray-500 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;