// frontend/src/components/common/SkeletonCard.jsx
// Shown while projects are loading

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-5 bg-gray-200 rounded w-16" />
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-5/6" />
    </div>
    <div className="flex gap-2 mb-4">
      <div className="h-5 bg-gray-200 rounded w-16" />
      <div className="h-5 bg-gray-200 rounded w-20" />
      <div className="h-5 bg-gray-200 rounded w-14" />
    </div>
    <div className="flex justify-between pt-3 border-t border-gray-100">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="h-4 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

export default SkeletonCard;