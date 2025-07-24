import React from 'react';
import PropTypes from 'prop-types';

const PremiumBadge = ({ size = 'md', showLabel = false, className = '' }) => {
  // Size classes mapping
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };
  
  // Label classes based on size
  const labelClasses = {
    sm: 'text-xs ml-1',
    md: 'text-sm ml-1.5',
    lg: 'text-base ml-2',
  };
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Crown icon */}
        <svg 
          className="text-yellow-500 w-full h-full" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
        >
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.67-3.13 8.64-7 9.94-3.87-1.3-7-5.27-7-9.94V6.3l7-3.12z"/>
          <path d="M12 7l-2 5h4l-2-5z"/>
        </svg>
        {/* Gradient glow effect */}
        <div className="absolute inset-0 rounded-full animate-pulse bg-gradient-to-r from-yellow-300 to-yellow-500 opacity-50 blur-sm -z-10"></div>
      </div>
      
      {showLabel && (
        <span className={`font-medium text-yellow-600 ${labelClasses[size]}`}>
          PREMIUM
        </span>
      )}
    </div>
  );
};

PremiumBadge.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  className: PropTypes.string,
};

export default PremiumBadge;