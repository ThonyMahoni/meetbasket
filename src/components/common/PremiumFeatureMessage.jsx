import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PremiumFeatureMessage = ({ 
  title = 'Premium Feature', 
  message = 'This feature is available exclusively to premium users.', 
  showUpgradeButton = true,
  compact = false
}) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 border border-indigo-100 rounded-lg shadow-sm ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex items-center space-x-3">
        {/* Premium icon */}
        <div className="flex-shrink-0">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 rounded-full">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        
        {/* Message */}
        <div className="flex-grow">
          <h3 className={`font-semibold text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>{title}</h3>
          <p className={`text-gray-600 ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>{message}</p>
        </div>
      </div>
      
      {/* Upgrade button */}
      {showUpgradeButton && (
        <div className={`${compact ? 'mt-2' : 'mt-4'}`}>
          <Link 
            to="/premium" 
            className={`inline-block text-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-md transition-all
              ${compact ? 'text-xs py-1 px-3' : 'text-sm py-2 px-4'}`}
          >
            Upgrade to Premium
          </Link>
        </div>
      )}
    </div>
  );
};

PremiumFeatureMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  showUpgradeButton: PropTypes.bool,
  compact: PropTypes.bool
};

export default PremiumFeatureMessage;