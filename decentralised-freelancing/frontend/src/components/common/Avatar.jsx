// frontend/src/components/common/Avatar.jsx
// User avatar — shows image or initials fallback

const Avatar = ({ name, avatar, size = 'md', className = '' }) => {
  const sizes = {
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-16 h-16 text-xl',
    xl:  'w-24 h-24 text-3xl',
  };

  // Get initials from name
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div className={`
      ${sizes[size]} bg-ink-900 text-cyan-400 rounded-full
      flex items-center justify-center font-bold flex-shrink-0 ${className}
    `}>
      {initials}
    </div>
  );
};

export default Avatar;