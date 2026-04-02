import { FishingZone, FishingTrip } from '../types';

const MOCK_ZONES: FishingZone[] = [
  {
    id: 'zone-a',
    name: 'Zone A (NE Coast)',
    status: 'safe',
    avgCpue: 12.5,
    activeFishers: 8,
    weather: 'Calm',
    location: { lat: 18.95, lng: 72.85 }
  },
  {
    id: 'zone-b',
    name: 'Zone B (Deep Sea)',
    status: 'safe',
    avgCpue: 10.2,
    activeFishers: 15,
    weather: 'Moderate',
    location: { lat: 18.80, lng: 72.70 }
  },
  {
    id: 'zone-c',
    name: 'Zone C (Southern Reef)',
    status: 'caution',
    avgCpue: 5.1,
    activeFishers: 4,
    weather: 'Choppy',
    location: { lat: 18.70, lng: 72.90 }
  },
  {
    id: 'zone-d',
    name: 'Zone D (Turtle Nesting)',
    status: 'avoid',
    avgCpue: 8.4,
    activeFishers: 2,
    weather: 'Calm',
    location: { lat: 18.60, lng: 72.95 }
  }
];

export const getFishingZones = (): FishingZone[] => {
  return MOCK_ZONES;
};

export const calculateCPUE = (catchKg: number, hours: number): number => {
  if (hours <= 0) return 0;
  return Number((catchKg / hours).toFixed(2));
};

export const getSustainabilityScore = (trips: FishingTrip[]): number => {
  if (trips.length === 0) return 70; // Base score
  
  let score = 70;
  const recentTrips = trips.slice(-10);
  
  recentTrips.forEach(trip => {
    const zone = MOCK_ZONES.find(z => z.id === trip.zoneId);
    if (zone?.status === 'safe') score += 2;
    if (zone?.status === 'avoid') score -= 10;
    if (trip.cpue > 8) score += 1;
    
    // Gear type impact
    if (['Handline', 'Trap'].includes(trip.gearType)) score += 2;
    if (trip.gearType === 'Trawler') score -= 5;
  });
  
  return Math.min(100, Math.max(0, score));
};

export const getCertificationLevel = (score: number): 'none' | 'bronze' | 'silver' | 'gold' => {
  if (score >= 90) return 'gold';
  if (score >= 75) return 'silver';
  if (score >= 60) return 'bronze';
  return 'none';
};

export const getPricePremium = (level: string): number => {
  switch (level) {
    case 'gold': return 0.15;
    case 'silver': return 0.10;
    case 'bronze': return 0.05;
    default: return 0;
  }
};
