import React from 'react';

interface HayatRehberiLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const HayatRehberiLogo: React.FC<HayatRehberiLogoProps> = ({
  className = '',
  size = 'md',
  showGlow = true
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
    >
      {showGlow && (
        <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xs -z-10" />
      )}
      <img
        src={`${import.meta.env.BASE_URL}icon-512.png`}
        alt="Hayat Rehberi"
        className="w-full h-full object-contain rounded-xl shadow-xs border border-emerald-500/30 transition-transform hover:scale-105"
        onError={(e) => {
          // Fallback to PNG if SVG image fails for any reason
          const target = e.currentTarget;
          if (!target.src.endsWith('apple-touch-icon.png')) {
            target.src = './apple-touch-icon.png';
          }
        }}
      />
    </div>
  );
};
