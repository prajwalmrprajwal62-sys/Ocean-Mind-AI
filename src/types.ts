export type UserRole = 'citizen' | 'fisher' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  homeRegion?: string;
  points: number;
  streakCount: number;
  lastActiveDate: string;
  personalImpactScore: number;
  credibilityScore?: number;
  totalWasteRemoved?: number;
  reportCount?: number;
  totalCatchKg?: number;
  totalEarnings?: number;
  sustainabilityScore?: number;
  certificationLevel?: string;
}

export interface WasteLog {
  id?: string;
  userId: string;
  date: string;
  plasticCount: number;
  organicCount: number;
  recycledCount: number;
  eWasteCount?: number;
  notes?: string;
}

export type ReportType = 'pollution' | 'biodiversity' | 'resource' | 'wildlife' | 'fishing_trip';
export type ReportStatus = 'new' | 'in_review' | 'resolved' | 'dispatched' | 'rescued' | 'logged';

export interface FishingTrip {
  id: string;
  userId: string;
  date: string;
  hoursFished: number;
  gearType: string;
  zoneId: string;
  catchKg: number;
  species: string[];
  earnings: number;
  cpue: number; // catchKg / hoursFished
  status?: string;
}

export interface FishingZone {
  id: string;
  name: string;
  status: 'safe' | 'caution' | 'avoid';
  avgCpue: number;
  activeFishers: number;
  weather: string;
  location: { lat: number, lng: number };
}

export interface UserScore {
  total: number;
  tier: 'Learner' | 'Contributor' | 'Advocate' | 'Guardian' | 'Legend';
  trend: number; // delta vs last month
  breakdown: {
    waste: number;      // max 40
    reporting: number;  // max 30
    community: number;  // max 20
    streak: number;     // max 10
  };
  stats: {
    plasticReduction: number;
    reportsFiled: number;
    eventsAttended: number;
    currentStreak: number;
  };
}

export interface RegionalHealth {
  regionId: string;
  regionName: string;
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  trend: number;
  pillars: {
    pollution: number;    // 0-100
    biodiversity: number; // 0-100
    resource: number;     // 0-100
  };
  topThreats: string[];
  recommendations: string[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  photoUrl?: string;
  score: number;
  delta: number;
  rank: number;
  tier?: string;
  type: 'user' | 'city' | 'corporate' | 'fisher' | 'squad';
}

export interface PolicyMetric {
  totalIncidents: number;
  highPriorityAlerts: number;
  atRiskZones: number;
  improvementRate: number;
}

export interface UrgentZone {
  rank: number;
  zone: string;
  healthScore: number;
  primaryThreat: string;
  recommendedAction: string;
  estCost: string;
  estImpact: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Intervention {
  id: string;
  name: string;
  cost: number;
  impact: number;
  description: string;
}

export interface CorporateFacility {
  id: string;
  name: string;
  location: { lat: number, lng: number };
  healthScore: number;
  riskProfile: {
    pollution: 'Low' | 'Medium' | 'High';
    biodiversity: 'Low' | 'Medium' | 'High';
    compliance: 'Good' | 'Fair' | 'Poor';
  };
}

export interface WildlifeIncident extends MarineReport {
  species?: string;
  condition: 'healthy' | 'injured' | 'entangled' | 'stranded' | 'deceased';
  animalType: 'turtle' | 'mammal' | 'fish' | 'bird' | 'other';
}

export interface HabitatData {
  id: string;
  type: 'coral' | 'mangrove' | 'seagrass';
  healthScore: number; // 0-100
  lastSurveyed: string;
  location: { lat: number, lng: number };
  threatLevel: Severity;
}
export type Severity = 'low' | 'medium' | 'high';

export interface MarineReport {
  id?: string;
  userId: string;
  type: ReportType;
  category: string;
  location: {
    lat: number;
    lng: number;
    regionLabel: string;
  };
  description: string;
  imageUrl?: string;
  severity: Severity;
  status: ReportStatus;
  createdAt: string;
}

export interface RegionStatus {
  id?: string;
  name: string;
  pollutionIndex: number;
  biodiversityRisk: number;
  resourcePressure: number;
  coastalHealthScore: number;
  lastUpdated: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}
