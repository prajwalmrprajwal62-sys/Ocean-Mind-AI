export const COASTAL_REGIONS = [
  { 
    id: 'chennai', 
    name: 'Chennai', 
    lat: 13.0827, 
    lng: 80.2707, 
    healthScore: 64, 
    trend: 'declining', 
    threats: ['Plastic Pollution', 'Industrial Runoff', 'Overfishing'] 
  },
  { 
    id: 'kochi', 
    name: 'Kochi', 
    lat: 9.9312, 
    lng: 76.2673, 
    healthScore: 78, 
    trend: 'stable', 
    threats: ['Microplastics', 'Habitat Loss', 'Invasive Species'] 
  },
  { 
    id: 'goa', 
    name: 'Goa', 
    lat: 15.2993, 
    lng: 74.1240, 
    healthScore: 82, 
    trend: 'improving', 
    threats: ['Tourism Impact', 'Ghost Gear', 'Coastal Erosion'] 
  },
  { 
    id: 'mumbai', 
    name: 'Mumbai', 
    lat: 19.0760, 
    lng: 72.8777, 
    healthScore: 52, 
    trend: 'declining', 
    threats: ['Untreated Sewage', 'Oil Spills', 'Mangrove Destruction'] 
  },
  { 
    id: 'vizag', 
    name: 'Visakhapatnam', 
    lat: 17.6868, 
    lng: 83.2185, 
    healthScore: 68, 
    trend: 'stable', 
    threats: ['Shipping Traffic', 'Industrial Waste', 'Coral Bleaching'] 
  },
];

export const REPORT_CATEGORIES = {
  pollution: ['plastic_litter', 'fishing_gear', 'oil_chemical', 'natural_debris', 'unknown'],
  biodiversity: ['turtle_sighting', 'dolphin_sighting', 'fish_kill', 'coral_damage', 'mangrove_cutting'],
  resource: ['overfishing', 'illegal_gear', 'unauthorized_zone'],
};

export const IMPACT_LEVELS = {
  GUARDIAN: { min: 80, label: 'Ocean Guardian', color: 'text-green-600' },
  PATH: { min: 60, label: 'On the Right Path', color: 'text-blue-600' },
  IMPROVE: { min: 0, label: 'Needs Improvement', color: 'text-yellow-600' },
};
