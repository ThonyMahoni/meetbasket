// Mock API service for Basketball Connect app
// This would be replaced with real API calls in a production environment
import { calculateExpiryDate } from './premiumUtils';

// Mock database
const mockUsers = [
  {
    id: '1',
    email: 'user@example.com',
    displayName: 'John Doe',
    password: 'password123',
    bio: 'Basketball enthusiast from LA',
    position: 'Point Guard',
    skillLevel: 'Intermediate',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    isPremium: false
  },
  {
    id: '2',
    email: 'player@example.com',
    displayName: 'Player One',
    password: 'player123',
    bio: 'Former college player',
    position: 'Shooting Guard',
    skillLevel: 'Advanced',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    isPremium: true,
    premiumTier: 'monthly',
    premiumExpiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
  }
];

const mockCourts = [
  {
    id: '1',
    name: 'Venice Beach Courts',
    address: '1800 Ocean Front Walk, Venice, CA',
    lat: 33.985,
    lng: -118.472,
    rating: 4.5,
    numHoops: 6,
    surface: 'Concrete',
    amenities: ['Lighting', 'Water Fountain', 'Restrooms'],
    isPremiumOnly: false,
    photos: ['https://example.com/courts/venice1.jpg', 'https://example.com/courts/venice2.jpg']
  },
  {
    id: '2',
    name: 'Rucker Park',
    address: '155th St and Frederick Douglass Blvd, New York, NY',
    lat: 40.830,
    lng: -73.936,
    rating: 4.8,
    numHoops: 2,
    surface: 'Asphalt',
    amenities: ['Bleachers', 'Historic Site'],
    isPremiumOnly: false,
    photos: ['https://example.com/courts/rucker1.jpg']
  },
  {
    id: '3',
    name: 'Elite Indoor Courts',
    address: '123 Premium Ave, Los Angeles, CA',
    lat: 34.052,
    lng: -118.243,
    rating: 5.0,
    numHoops: 8,
    surface: 'Hardwood',
    amenities: ['Air Conditioning', 'Locker Rooms', 'Pro Shop', 'Training Equipment'],
    isPremiumOnly: true,
    photos: ['https://example.com/courts/elite1.jpg', 'https://example.com/courts/elite2.jpg']
  }
];

const mockGames = [
  {
    id: '1',
    courtId: '1',
    organizer: '1',
    title: 'Saturday Morning Pickup',
    description: 'Casual pickup game, all skill levels welcome',
    date: '2023-07-15T10:00:00',
    maxPlayers: 10,
    currentPlayers: [
      { id: '1', displayName: 'John Doe' }
    ]
  },
  {
    id: '2',
    courtId: '2',
    organizer: '2',
    title: 'Competitive 3v3',
    description: 'Looking for advanced players for 3v3 tournament practice',
    date: '2023-07-16T18:00:00',
    maxPlayers: 6,
    currentPlayers: [
      { id: '2', displayName: 'Player One' }
    ],
    isPremiumOnly: true
  }
];

// Mock API functions
export const api = {
  // Auth functions
  login: async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email && u.password === password);
        if (user) {
          // Don't send password to client
          const { password, ...userWithoutPassword } = user;
          resolve({ user: userWithoutPassword });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 500);
    });
  },
  
  register: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          reject(new Error('Email already in use'));
          return;
        }
        
        // Create new user
        const newUser = {
          id: `${mockUsers.length + 1}`,
          displayName: userData.displayName,
          email: userData.email,
          password: userData.password,
          bio: '',
          position: '',
          skillLevel: 'Beginner',
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
          isPremium: false
        };
        
        mockUsers.push(newUser);
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = newUser;
        resolve({ user: userWithoutPassword });
      }, 500);
    });
  },
  
  // Profile functions
  updateProfile: async (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUsers.findIndex(u => u.id === userData.id);
        if (index !== -1) {
          // Update user data but keep password
          mockUsers[index] = { ...mockUsers[index], ...userData };
          
          // Don't send password to client
          const { password, ...userWithoutPassword } = mockUsers[index];
          resolve({ user: userWithoutPassword });
        } else {
          reject(new Error('User not found'));
        }
      }, 500);
    });
  },
  
  // Court functions
  getCourts: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredCourts = [...mockCourts];
        
        // Apply premium filter
        if (filters.includesPremiumOnly === false) {
          filteredCourts = filteredCourts.filter(court => !court.isPremiumOnly);
        }
        
        // Other filters can be added here (location, amenities, etc.)
        
        resolve({ courts: filteredCourts });
      }, 500);
    });
  },
  
  getCourtById: async (courtId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const court = mockCourts.find(c => c.id === courtId);
        if (court) {
          resolve({ court });
        } else {
          reject(new Error('Court not found'));
        }
      }, 300);
    });
  },
  
  // Game functions
  getGames: async (filters = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredGames = [...mockGames];
        
        // Apply filters
        if (filters.courtId) {
          filteredGames = filteredGames.filter(game => game.courtId === filters.courtId);
        }
        
        if (filters.organizerId) {
          filteredGames = filteredGames.filter(game => game.organizer === filters.organizerId);
        }
        
        if (filters.includesPremiumOnly === false) {
          filteredGames = filteredGames.filter(game => !game.isPremiumOnly);
        }
        
        // Sort by date
        filteredGames.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        resolve({ games: filteredGames });
      }, 500);
    });
  },
  
  createGame: async (gameData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newGame = {
          id: `${mockGames.length + 1}`,
          ...gameData,
          currentPlayers: [
            { id: gameData.organizer, displayName: mockUsers.find(u => u.id === gameData.organizer)?.displayName || 'Unknown' }
          ]
        };
        
        mockGames.push(newGame);
        resolve({ game: newGame });
      }, 500);
    });
  },
  
  joinGame: async (gameId, userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const gameIndex = mockGames.findIndex(g => g.id === gameId);
        if (gameIndex === -1) {
          reject(new Error('Game not found'));
          return;
        }
        
        const game = mockGames[gameIndex];
        
        // Check if player is already in the game
        if (game.currentPlayers.some(p => p.id === userId)) {
          reject(new Error('You are already in this game'));
          return;
        }
        
        // Check if game is full
        if (game.currentPlayers.length >= game.maxPlayers) {
          reject(new Error('Game is full'));
          return;
        }
        
        // Add player to game
        const user = mockUsers.find(u => u.id === userId);
        if (!user) {
          reject(new Error('User not found'));
          return;
        }
        
        game.currentPlayers.push({
          id: user.id,
          displayName: user.displayName
        });
        
        mockGames[gameIndex] = game;
        resolve({ game });
      }, 500);
    });
  },
  
  // Premium upgrade
  upgradeToPremium: async (userId, premiumTier = 'monthly') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = mockUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) {
          reject(new Error('User not found'));
          return;
        }
        
        // Calculate expiry date based on tier
        const expiryDate = calculateExpiryDate(premiumTier);
        
        // Update user with premium info
        mockUsers[userIndex] = {
          ...mockUsers[userIndex],
          isPremium: true,
          premiumTier: premiumTier,
          premiumExpiryDate: expiryDate.toISOString()
        };
        
        // Don't send password to client
        const { password, ...userWithoutPassword } = mockUsers[userIndex];
        resolve({ user: userWithoutPassword });
      }, 500);
    });
  },
  
  // Get premium status
  getPremiumStatus: async (userId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.id === userId);
        if (!user) {
          reject(new Error('User not found'));
          return;
        }
        
        const premiumStatus = {
          isPremium: user.isPremium || false,
          premiumTier: user.premiumTier || null,
          expiryDate: user.premiumExpiryDate || null
        };
        
        resolve({ premiumStatus });
      }, 300);
    });
  }
};