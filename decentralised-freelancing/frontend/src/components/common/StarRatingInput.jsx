// src/components/common/StarRatingInput.jsx
// Clickable star rating for submitting reviews

import { useState } from 'react';
import { FiStar }   from 'react-icons/fi';

const StarRatingInput = ({ value = 0, onChange, size = 28 }) => {
  const [hovered, setHovered] = useState(0);

  const labels = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  };

  return (
    <div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => {
          const filled = star <= (hovered || value);
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <FiStar
                size={size}
                className={filled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-300'
                }
              />
            </button>
          );
        })}
      </div>
      {(hovered || value) > 0 && (
        <p className="text-sm text-gray-500 mt-1">
          {labels[hovered || value]}
        </p>
      )}
    </div>
  );
};

export default StarRatingInput;