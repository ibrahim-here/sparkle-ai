export const SparkleIcon = ({ className = '', size = 24 }: { className?: string; size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
        fill="currentColor"
      />
      <path
        d="M19 14L19.75 16.25L22 17L19.75 17.75L19 20L18.25 17.75L16 17L18.25 16.25L19 14Z"
        fill="currentColor"
      />
      <path
        d="M7 3L7.5 4.5L9 5L7.5 5.5L7 7L6.5 5.5L5 5L6.5 4.5L7 3Z"
        fill="currentColor"
      />
    </svg>
  );
};
