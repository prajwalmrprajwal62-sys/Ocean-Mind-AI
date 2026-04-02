import { COASTAL_REGIONS } from '../constants';

export interface PollutionForecast {
  regionId: string;
  date: string;
  riskScore: number; // 0-100
  reason: string;
  expectedIncidents: number;
}

export const getPollutionForecast = (days: number = 7): PollutionForecast[] => {
  const forecast: PollutionForecast[] = [];
  const now = new Date();

  COASTAL_REGIONS.forEach(region => {
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      
      // Mock ML logic: 
      // Higher risk on weekends, near river mouths, and random spikes
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      let riskScore = 20 + Math.random() * 30;
      
      if (isWeekend) riskScore += 20;
      if (region.id === 'mumbai_juhu' || region.id === 'chennai_marina') riskScore += 15;
      
      // Random "Monsoon Mode" or "Festival" spikes
      if (Math.random() > 0.8) riskScore += 30;

      riskScore = Math.min(100, riskScore);

      let reason = "Baseline seasonal patterns";
      if (riskScore > 80) reason = "Critical: Post-monsoon drift + high tourist activity";
      else if (riskScore > 60) reason = "High: Weekend spike predicted";
      else if (riskScore > 40) reason = "Medium: Moderate river discharge";

      forecast.push({
        regionId: region.id,
        date: date.toISOString().split('T')[0],
        riskScore: Math.round(riskScore),
        reason,
        expectedIncidents: Math.round(riskScore / 10 + Math.random() * 5)
      });
    }
  });

  return forecast;
};

export const getRiskLevel = (score: number) => {
  if (score >= 86) return { label: 'CRITICAL', color: '#FF0000' };
  if (score >= 61) return { label: 'HIGH', color: '#FF4444' };
  if (score >= 31) return { label: 'MEDIUM', color: '#FFA500' };
  return { label: 'LOW', color: '#D1FF4D' };
};
