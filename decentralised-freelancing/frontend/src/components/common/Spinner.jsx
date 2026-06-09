// src/components/common/Spinner.jsx
const Spinner = ({ size = 'md', color = 'dark' }) => {
  const sizes  = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  const colors = {
    dark: 'border-ink-900',
    cyan: 'border-cyan-400',
    gray: 'border-gray-400',
  };
  return (
    <div className={`${sizes[size]} ${colors[color]}
                     border-2 border-t-transparent rounded-full animate-spin`} />
  );
};
export default Spinner;