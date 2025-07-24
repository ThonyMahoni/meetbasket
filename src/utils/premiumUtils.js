/**
 * Utility functions for premium features and subscription management (LIVE version)
 */

// PREMIUM-TIER-KONFIGURATION
export const getPremiumTiers = () => [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 9.99,
    period: 'month',
    features: [
      'No ads',
      'Access to all premium courts',
      'Unlimited challenges',
      'Priority matchmaking',
      'Premium badge'
    ]
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 99.99,
    period: 'year',
    discount: '17% off',
    isRecommended: true,
    features: [
      'All monthly benefits',
      'Early access to new features',
      'Advanced statistics',
      'Court reservation priority',
      'Exclusive tournaments'
    ]
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 299.99,
    period: 'one-time',
    features: [
      'All yearly benefits',
      'Lifetime access',
      'VIP support',
      'Exclusive merchandise',
      'Special event invitations'
    ]
  }
];

// FEATURES für Marketing
export const getPremiumFeatures = () => [
  {
    title: 'Advanced Player Statistics',
    description: 'Get detailed insights into your game performance with advanced analytics.',
    icon: 'chart'
  },
  {
    title: 'Priority Court Booking',
    description: 'Reserve courts before they become available to regular users.',
    icon: 'calendar'
  },
  {
    title: 'Unlimited Challenges',
    description: 'Issue unlimited challenges to other players and track your progress.',
    icon: 'challenge'
  },
  {
    title: 'Premium Badge',
    description: 'Stand out with a distinctive premium badge on your profile and posts.',
    icon: 'badge'
  },
  {
    title: 'Exclusive Tournaments',
    description: 'Access to premium-only tournaments with special prizes.',
    icon: 'trophy'
  },
  {
    title: 'Ad-Free Experience',
    description: 'Enjoy Basketball Connect without any advertisements.',
    icon: 'ad-free'
  }
];

// BERECHNUNG DES ABLAUFDATUMS
export const calculateExpiryDate = (tier, startDate = new Date()) => {
  const expiry = new Date(startDate);

  switch (tier) {
    case 'yearly':
      expiry.setFullYear(expiry.getFullYear() + 1);
      break;
    case 'lifetime':
      expiry.setFullYear(expiry.getFullYear() + 100);
      break;
    case 'monthly':
    default:
      expiry.setMonth(expiry.getMonth() + 1);
      break;
  }

  return expiry;
};

// FORMATIERUNG FÜR ANZEIGE
export const formatExpiryDate = (isoString) => {
  if (!isoString) return '';

  const date = new Date(isoString);
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

  if (date > tenYearsFromNow) {
    return 'Lifetime Access';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// BERECHTIGUNG PRÜFEN
export const canAccessFeature = (user, requiredTier = null) => {
  if (!user?.isPremium) return false;

  if (user.premiumExpiryDate && new Date(user.premiumExpiryDate) < new Date()) {
    return false;
  }

  if (!requiredTier) return true;

  const userTier = user.premiumTier || 'monthly';
  const hierarchy = { monthly: 1, yearly: 2, lifetime: 3 };

  return hierarchy[userTier] >= hierarchy[requiredTier];
};
