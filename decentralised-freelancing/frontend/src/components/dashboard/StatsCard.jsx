// frontend/src/components/dashboard/StatsCard.jsx
// Single stat box used in dashboard header

const StatsCard = ({ label, value, icon, color = 'default', sub }) => {
  const colors = {
    default: 'bg-white border-gray-200',
    cyan:    'bg-ink-900 border-ink-900',
    green:   'bg-green-50 border-green-200',
    amber:   'bg-amber-50 border-amber-200',
    red:     'bg-red-50 border-red-200',
  };

  const textColors = {
    default: 'text-ink-900',
    cyan:    'text-cyan-400',
    green:   'text-green-600',
    amber:   'text-amber-600',
    red:     'text-red-600',
  };

  return (
    <div className={`border rounded-2xl p-5 ${colors[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <p className={`text-sm font-medium ${
          color === 'cyan' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {label}
        </p>
        <div className={`text-lg ${textColors[color]}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-extrabold ${textColors[color]}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-1 ${
          color === 'cyan' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {sub}
        </p>
      )}
    </div>
  );
};

export default StatsCard;