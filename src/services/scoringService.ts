import { UserScore, RegionalHealth, LeaderboardEntry } from '../types';

export const getUserScore = (userId: string): UserScore => {
  // Mock logic based on user activity
  return {
    total: 78,
    tier: 'Advocate',
    trend: 12,
    breakdown: {
      waste: 32,
      reporting: 24,
      community: 14,
      streak: 8,
    },
    stats: {
      plasticReduction: 42,
      reportsFiled: 8,
      eventsAttended: 2,
      currentStreak: 21,
    },
  };
};

export const getRegionalHealth = (regionId: string): RegionalHealth => {
  const regions: Record<string, RegionalHealth> = {
    mumbai: {
      regionId: 'mumbai',
      regionName: 'Mumbai Coastal Zone',
      score: 67,
      grade: 'C',
      trend: -5,
      pillars: {
        pollution: 65,
        biodiversity: 55,
        resource: 72,
      },
      topThreats: [
        'Biodiversity at risk (12 fish kill incidents)',
        'Pollution worsened due to monsoon runoff',
        'Ghost gear reports increasing',
      ],
      recommendations: [
        'Investigate fish kill cause (likely water quality)',
        'Install river trash traps upstream',
        'Recruit 50 more Ocean Guardians',
      ],
    },
    chennai: {
      regionId: 'chennai',
      regionName: 'Chennai Marina Coast',
      score: 64,
      grade: 'C',
      trend: 12,
      pillars: {
        pollution: 58,
        biodiversity: 62,
        resource: 70,
      },
      topThreats: [
        'High plastic density near Marina Beach',
        'Industrial discharge from Ennore',
        'Turtle nesting areas under pressure',
      ],
      recommendations: [
        'Expand beach cleaning operations',
        'Implement stricter industrial monitoring',
        'Protect turtle nesting corridors',
      ],
    },
    goa: {
      regionId: 'goa',
      regionName: 'Goa Marine Sanctuary',
      score: 84,
      grade: 'A',
      trend: 1,
      pillars: {
        pollution: 82,
        biodiversity: 88,
        resource: 82,
      },
      topThreats: [
        'Tourist waste management pressure',
        'Coral bleaching in specific patches',
        'Over-tourism in sensitive zones',
      ],
      recommendations: [
        'Implement zero-waste tourism zones',
        'Monitor coral health with AI sensors',
        'Limit vessel traffic in sanctuary areas',
      ],
    },
    kochi: {
      regionId: 'kochi',
      regionName: 'Kochi Backwaters & Coast',
      score: 78,
      grade: 'B',
      trend: 3,
      pillars: {
        pollution: 72,
        biodiversity: 75,
        resource: 85,
      },
      topThreats: [
        'Microplastic accumulation in backwaters',
        'Mangrove habitat fragmentation',
        'Illegal fishing in protected zones',
      ],
      recommendations: [
        'Restore mangrove corridors',
        'Implement backwater filtration systems',
        'Enhance community-led patrolling',
      ],
    },
    vizag: {
      regionId: 'vizag',
      regionName: 'Visakhapatnam Coast',
      score: 72,
      grade: 'B',
      trend: 8,
      pillars: {
        pollution: 68,
        biodiversity: 70,
        resource: 78,
      },
      topThreats: [
        'Port-related pollution spikes',
        'Coastal erosion in specific sectors',
        'Marine litter from urban runoff',
      ],
      recommendations: [
        'Implement port-side waste management',
        'Coastal reforestation for erosion control',
        'Urban drainage filtration systems',
      ],
    }
  };

  return regions[regionId] || regions['mumbai'];
};

export const getForecast = (regionId: string) => {
  const forecasts: Record<string, any> = {
    mumbai: { nextMonthScore: 68, confidence: 85, riskLevel: 'medium', primaryThreat: 'Monsoon Runoff' },
    chennai: { nextMonthScore: 62, confidence: 78, riskLevel: 'high', primaryThreat: 'Industrial Discharge' },
    goa: { nextMonthScore: 85, confidence: 92, riskLevel: 'low', primaryThreat: 'Tourist Waste' },
    kochi: { nextMonthScore: 76, confidence: 88, riskLevel: 'medium', primaryThreat: 'Microplastics' },
    vizag: { nextMonthScore: 70, confidence: 82, riskLevel: 'medium', primaryThreat: 'Port Pollution' },
  };
  return forecasts[regionId] || forecasts['mumbai'];
};

export const getLeaderboard = (type: LeaderboardEntry['type']): LeaderboardEntry[] => {
  const mockUsers: LeaderboardEntry[] = [
    { id: '1', name: 'Vikram D.', score: 96, delta: 2, rank: 1, tier: 'Legend', type: 'user' },
    { id: '2', name: 'Anjali M.', score: 94, delta: 5, rank: 2, tier: 'Guardian', type: 'user' },
    { id: '3', name: 'Ravi T.', score: 91, delta: 3, rank: 3, tier: 'Guardian', type: 'user' },
    { id: '4', name: 'Priya S.', score: 69, delta: 45, rank: 4, tier: 'Advocate', type: 'user' },
  ];

  const mockCities: LeaderboardEntry[] = [
    { id: 'c1', name: 'Goa', score: 84, delta: 1, rank: 1, type: 'city' },
    { id: 'c2', name: 'Kochi', score: 78, delta: 3, rank: 2, type: 'city' },
    { id: 'c3', name: 'Mumbai', score: 67, delta: -5, rank: 3, type: 'city' },
    { id: 'c4', name: 'Chennai', score: 64, delta: 12, rank: 4, type: 'city' },
  ];

  const mockCorporates: LeaderboardEntry[] = [
    { id: 'corp1', name: 'Mahindra Group', score: 89, delta: 2, rank: 1, type: 'corporate' },
    { id: 'corp2', name: 'Godrej Foundation', score: 85, delta: 4, rank: 2, type: 'corporate' },
    { id: 'corp3', name: 'Tata Marine', score: 81, delta: 1, rank: 3, type: 'corporate' },
  ];

  const mockFishers: LeaderboardEntry[] = [
    { id: 'f1', name: 'Ramesh (Kochi)', score: 94, delta: 2, rank: 1, tier: 'Gold', type: 'fisher' },
    { id: 'f2', name: 'Suresh (Goa)', score: 88, delta: 4, rank: 2, tier: 'Silver', type: 'fisher' },
  ];

  switch (type) {
    case 'user': return mockUsers;
    case 'city': return mockCities;
    case 'corporate': return mockCorporates;
    case 'fisher': return mockFishers;
    default: return [];
  }
};

export const getTierLabel = (score: number): string => {
  if (score >= 95) return 'Ocean Legend';
  if (score >= 80) return 'Ocean Guardian';
  if (score >= 60) return 'Ocean Advocate';
  if (score >= 40) return 'Ocean Contributor';
  return 'Ocean Learner';
};

export const getTierIcon = (score: number): string => {
  if (score >= 95) return '⭐';
  if (score >= 80) return '🌊';
  if (score >= 60) return '🚀';
  if (score >= 40) return '💪';
  return '🌱';
};
