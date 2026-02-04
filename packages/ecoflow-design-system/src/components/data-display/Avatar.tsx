import { ImgHTMLAttributes, CSSProperties, useState } from 'react';
import { colors } from '@/tokens/colors';
import { typography } from '@/tokens/typography';
import { borders } from '@/tokens/borders';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  fallbackColor?: string;
}

export const Avatar = ({
  name = '',
  src,
  size = 'md',
  shape = 'circle',
  fallbackColor,
  className = '',
  style,
  alt,
  ...props
}: AvatarProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Size styles
  const sizeMap = {
    sm: { size: '32px', fontSize: typography.fontSize.xs },
    md: { size: '40px', fontSize: typography.fontSize.sm },
    lg: { size: '48px', fontSize: typography.fontSize.base },
    xl: { size: '64px', fontSize: typography.fontSize.lg },
  };

  // Get initials from name
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '?';
    if (words.length === 1) return words[0]!.charAt(0).toUpperCase();
    return (words[0]!.charAt(0) + words[words.length - 1]!.charAt(0)).toUpperCase();
  };

  // Generate color from name
  const getColorFromName = (name: string): string => {
    if (fallbackColor) return fallbackColor;
    if (!name) return colors.neutral[300];

    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const colorOptions = [
      colors.primary[500],
      colors.accent.yellow[500],
      colors.semantic.info.DEFAULT,
      colors.semantic.success.DEFAULT,
      colors.semantic.warning.DEFAULT,
    ];

    const colorIndex = Math.abs(hash) % colorOptions.length;
    return colorOptions[colorIndex] || colors.primary[500];
  };

  const showImage = src && !imageError;
  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);

  const containerStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: sizeMap[size].size,
    height: sizeMap[size].size,
    borderRadius: shape === 'circle' ? borders.borderRadius.full : borders.borderRadius.md,
    backgroundColor: showImage ? 'transparent' : backgroundColor,
    color: colors.neutral.white,
    fontFamily: typography.fontFamily.sans,
    fontSize: sizeMap[size].fontSize,
    fontWeight: typography.fontWeight.semibold,
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
    ...style,
  };

  const imageStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: imageLoaded ? 'block' : 'none',
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  return (
    <div className={className} style={containerStyle} role="img" aria-label={alt || name || 'Avatar'}>
      {showImage ? (
        <>
          {!imageLoaded && <span>{initials}</span>}
          <img
            src={src}
            alt={alt || name}
            style={imageStyle}
            onLoad={handleImageLoad}
            onError={handleImageError}
            {...props}
          />
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
