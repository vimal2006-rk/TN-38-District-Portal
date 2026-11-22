export default function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-10 w-10 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-orange-600 border-t-transparent animate-spin`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
