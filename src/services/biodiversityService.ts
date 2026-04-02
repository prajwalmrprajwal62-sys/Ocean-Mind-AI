import { HabitatData, Severity } from '../types';

const MOCK_HABITATS: HabitatData[] = [
  {
    id: 'h1',
    type: 'coral',
    healthScore: 42,
    lastSurveyed: new Date().toISOString(),
    location: { lat: 18.9219, lng: 72.8347 }, // Near Mumbai
    threatLevel: 'high'
  },
  {
    id: 'h2',
    type: 'mangrove',
    healthScore: 78,
    lastSurveyed: new Date().toISOString(),
    location: { lat: 15.4909, lng: 73.8278 }, // near Goa
    threatLevel: 'low'
  },
  {
    id: 'h3',
    type: 'seagrass',
    healthScore: 55,
    lastSurveyed: new Date().toISOString(),
    location: { lat: 13.0827, lng: 80.2707 }, // near Chennai
    threatLevel: 'medium'
  }
];

export const getHabitats = (): HabitatData[] => {
  return MOCK_HABITATS;
};

export const getHabitatRisk = (habitat: HabitatData, pollutionRisk: number): number => {
  // Combine habitat health with local pollution risk
  // Lower health + Higher pollution = Higher Risk
  const baseRisk = 100 - habitat.healthScore;
  return Math.min(100, (baseRisk * 0.6) + (pollutionRisk * 0.4));
};
