import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  children, 
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = 'font-medium rounded-full transition-all duration-300 cursor-pointer';
  
  const variantStyles = {
    primary: 'hover:scale-105',
    secondary: 'bg-transparent border-2 hover:text-white',
  };
  
  const sizeStyles = {
    small: 'px-6 py-2 text-sm',
    medium: 'px-8 py-3 text-base',
    large: 'px-12 py-4 text-lg',
  };
  
  const primaryStyle = variant === 'primary' ? {
    backgroundColor: '#B2FF00',
    color: '#000000',
  } : {};
  
  const secondaryStyle = variant === 'secondary' ? {
    borderColor: '#000000',
    color: '#000000',
  } : {};
  
  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ ...primaryStyle, ...secondaryStyle }}
      whileHover={{ 
        scale: 1.05,
        boxShadow: variant === 'primary' ? '0 0 20px rgba(178, 255, 0, 0.4)' : undefined,
        backgroundColor: variant === 'secondary' ? '#000000' : undefined,
        color: variant === 'secondary' ? '#FFFFFF' : undefined,
      }}
      whileTap={{ scale: 0.95 }}
      type={props.type || 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      aria-label={props['aria-label']}
    >
      {children}
    </motion.button>
  );
};
