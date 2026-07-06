import type { ReactNode } from 'react';

interface SimpleDotGridProps {
  children?: ReactNode;
  className?: string;
  dotSize?: number;
  gap?: number;
  dotColor?: string;
}

export const SimpleDotGrid = ({ 
  children, 
  className = '', 
  dotSize = 2, 
  gap = 30,
  dotColor = 'rgba(0, 0, 0, 0.2)'
}: SimpleDotGridProps) => {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${gap}px ${gap}px`,
        }}
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};
