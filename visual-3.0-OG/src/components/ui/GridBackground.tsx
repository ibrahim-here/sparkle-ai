import type { ReactNode } from 'react';

interface GridBackgroundProps {
  children: ReactNode;
  className?: string;
  opacity?: number;
}

export const GridBackground = ({ children, className = '', opacity = 0.1 }: GridBackgroundProps) => {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, ${opacity}) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, ${opacity}) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
