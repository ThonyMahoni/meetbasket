import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';

const usePremiumStatus = () => {
  const { user: currentUser } = useAuth();

  return useMemo(() => {
    if (!currentUser) {
      return {
        isPremium: false,
        premiumTier: null,
        expiryDate: null,
        isExpired: false,
        daysRemaining: 0
      };
    }

    const isPremium = !!currentUser.isPremium;
    const premiumTier = currentUser.premiumTier || null;
    const expiryDateStr = currentUser.premiumExpiryDate;

    let expiryDate = null;
    let isExpired = false;
    let daysRemaining = 0;

    if (expiryDateStr) {
      expiryDate = new Date(expiryDateStr);
      const now = new Date();
      isExpired = expiryDate < now;

      if (!isExpired) {
        const diffTime = expiryDate - now;
        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    return {
      isPremium,
      premiumTier,
      expiryDate,
      isExpired,
      daysRemaining,
      canAccessFeature: (requiredTier) => {
        if (!isPremium || isExpired) return false;
        if (!requiredTier) return true;

        const tierHierarchy = {
          monthly: 1,
          yearly: 2,
          lifetime: 3,
        };

        return tierHierarchy[premiumTier] >= tierHierarchy[requiredTier];
      },
    };
  }, [currentUser]);
};

export default usePremiumStatus;
