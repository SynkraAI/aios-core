/**
 * Icon Component
 * Renders icons from the iconMap with consistent sizing and accessibility
 */

import { forwardRef } from 'react';
import { iconMap, iconSizes, type IconName, type IconSize } from '@/lib/icons';
import { cn } from '@/lib/utils';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: IconName;
  size?: IconSize;
  label?: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'md', label, className, ...props }, ref) => {
    const IconComponent = iconMap[name];

    if (!IconComponent) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Icon "${name}" not found in iconMap`);
      }
      return null;
    }

    return (
      <IconComponent
        ref={ref}
        className={cn(iconSizes[size], className)}
        aria-label={label}
        aria-hidden={!label}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';
