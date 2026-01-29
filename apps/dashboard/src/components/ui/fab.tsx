'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { iconMap, type IconName } from '@/lib/icons';

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: IconName;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-left' | 'bottom-right' | 'bottom-center';
}

const variantStyles = {
  primary: 'bg-yellow-400 hover:bg-yellow-300 text-black shadow-lg shadow-yellow-900/20',
  secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 shadow-lg',
  ghost: 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-700 backdrop-blur-sm',
};

const sizeStyles = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-xs gap-2',
  lg: 'h-12 px-5 text-sm gap-2.5',
};

const iconSizeStyles = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

const positionStyles = {
  'bottom-left': 'bottom-6 left-6',
  'bottom-right': 'bottom-6 right-6',
  'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
};

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      icon = 'plus',
      label,
      variant = 'primary',
      size = 'md',
      position = 'bottom-left',
      className,
      ...props
    },
    ref
  ) => {
    const IconComponent = iconMap[icon];

    return (
      <button
        ref={ref}
        className={cn(
          'fixed z-50 inline-flex items-center justify-center rounded-lg font-bold uppercase tracking-wide',
          'transition-luxury active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          variantStyles[variant],
          sizeStyles[size],
          positionStyles[position],
          className
        )}
        {...props}
      >
        {IconComponent && <IconComponent className={iconSizeStyles[size]} />}
        {label && <span>{label}</span>}
      </button>
    );
  }
);

FAB.displayName = 'FAB';

// Icon-only FAB variant (circular)
interface FABIconProps extends Omit<FABProps, 'label'> {
  tooltip?: string;
}

export const FABIcon = forwardRef<HTMLButtonElement, FABIconProps>(
  (
    {
      icon = 'plus',
      variant = 'ghost',
      size = 'md',
      position = 'bottom-right',
      tooltip,
      className,
      ...props
    },
    ref
  ) => {
    const IconComponent = iconMap[icon];

    const circularSizeStyles = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'fixed z-50 inline-flex items-center justify-center rounded-full',
          'transition-luxury active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          variantStyles[variant],
          circularSizeStyles[size],
          positionStyles[position],
          className
        )}
        title={tooltip}
        {...props}
      >
        {IconComponent && <IconComponent className={iconSizeStyles[size]} />}
      </button>
    );
  }
);

FABIcon.displayName = 'FABIcon';

// Help button convenience component
export function HelpFAB({ className, ...props }: Omit<FABIconProps, 'icon'>) {
  return (
    <button
      className={cn(
        'fixed bottom-6 right-6 z-50 h-8 w-8 rounded-full',
        'bg-zinc-900 border border-zinc-700 text-zinc-500',
        'flex items-center justify-center',
        'hover:text-white hover:border-white transition-colors cursor-help',
        className
      )}
      title="Help"
      {...props}
    >
      <span className="font-bold text-xs">?</span>
    </button>
  );
}
