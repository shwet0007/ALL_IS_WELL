import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Soft gradient background circle */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(15, 100%, 90%)" />
            <stop offset="50%" stopColor="hsl(150, 50%, 92%)" />
            <stop offset="100%" stopColor="hsl(200, 80%, 92%)" />
          </linearGradient>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(15, 80%, 75%)" />
            <stop offset="100%" stopColor="hsl(0, 70%, 70%)" />
          </linearGradient>
        </defs>
        
        {/* Main circle */}
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" />
        
        {/* Mother silhouette holding baby */}
        <path
          d="M50 25C55 25 59 29 59 34C59 39 55 43 50 43C45 43 41 39 41 34C41 29 45 25 50 25Z"
          fill="hsl(15, 60%, 30%)"
          opacity="0.9"
        />
        
        {/* Mother body */}
        <path
          d="M35 75C35 58 42 48 50 48C58 48 65 58 65 75"
          stroke="hsl(15, 60%, 30%)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        />
        
        {/* Baby in arms */}
        <ellipse
          cx="50"
          cy="60"
          rx="8"
          ry="6"
          fill="hsl(15, 60%, 30%)"
          opacity="0.7"
        />
        
        {/* Small heart */}
        <path
          d="M50 68C50 68 44 63 44 59C44 56 46 54 49 54C50 54 50 55 50 55C50 55 50 54 51 54C54 54 56 56 56 59C56 63 50 68 50 68Z"
          fill="url(#heartGradient)"
        />
        
        {/* Decorative sparkles */}
        <circle cx="25" cy="35" r="2" fill="hsl(200, 80%, 75%)" opacity="0.6" />
        <circle cx="75" cy="35" r="2" fill="hsl(150, 50%, 75%)" opacity="0.6" />
        <circle cx="30" cy="70" r="1.5" fill="hsl(15, 80%, 80%)" opacity="0.6" />
        <circle cx="70" cy="70" r="1.5" fill="hsl(200, 60%, 80%)" opacity="0.6" />
      </svg>
    </div>
  );
};

export default Logo;
