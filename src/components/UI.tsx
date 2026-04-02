import React from 'react';
import { cn } from '../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'neon';
}

export const Card = ({ children, className, title, subtitle, variant = 'default', ...props }: CardProps) => (
  <div 
    className={cn(
      "bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 transition-all duration-300",
      variant === 'neon' ? "border-[#D1FF4D] shadow-[0_0_15px_rgba(209,255,77,0.15)]" : "hover:border-[#333]",
      className
    )}
    {...props}
  >
    {(title || subtitle) && (
      <div className="mb-4">
        {title && <h3 className="text-xl font-bold uppercase tracking-tighter text-white">{title}</h3>}
        {subtitle && <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'accent' }) => (
  <button
    className={cn(
      "px-8 py-3 font-bold uppercase tracking-tighter transition-all duration-300 rounded-lg active:scale-95",
      variant === 'primary' 
        ? "bg-[#D1FF4D] text-black hover:shadow-[0_0_20px_rgba(209,255,77,0.4)]" 
        : variant === 'accent'
        ? "bg-blue-500 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
        : "bg-transparent text-[#D1FF4D] border border-[#D1FF4D] hover:bg-[#D1FF4D] hover:text-black",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export const Badge = ({ children, className, variant = 'default', style }: { children: React.ReactNode, className?: string, variant?: 'default' | 'accent' | 'danger' | 'outline', style?: React.CSSProperties }) => {
  const variants = {
    default: 'bg-[#1A1A1A] text-gray-400 border-[#333]',
    accent: 'bg-[#D1FF4D] text-black border-[#D1FF4D]',
    danger: 'bg-red-500/10 text-red-500 border-red-500/20',
    outline: 'bg-transparent text-gray-500 border-[#1A1A1A]'
  };
  return (
    <span 
      className={cn("px-2 py-1 text-[10px] font-bold uppercase border rounded-md tracking-widest", variants[variant], className)}
      style={style}
    >
      {children}
    </span>
  );
};
