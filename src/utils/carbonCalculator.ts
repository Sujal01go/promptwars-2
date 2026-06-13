/**
 * Carbon footprint emission factors, profile presets, and educational calculation models.
 * Scientific source values in kg CO2 equivalent.
 */

export interface CarbonLog {
  id: string;
  date: string;
  category: 'travel' | 'food' | 'energy' | 'waste';
  description: string;
  value: number;
  unit: string;
  emissions: number; // in kg CO2
}

export const EMISSION_FACTORS = {
  travel: {
    suv: 0.44,       // kg CO2 per mile for gasoline SUV/Truck
    sedan: 0.28,     // kg CO2 per mile for gasoline Sedan
    electric: 0.08,  // kg CO2 per mile for EV (average US grid draw)
    bus: 0.12,       // kg CO2 per mile for transit bus passenger
    train: 0.06      // kg CO2 per mile for subway/train passenger
  },
  food: {
    'meat-heavy': 3.3, // kg CO2 per day for meat lover diet
    average: 2.5,      // kg CO2 per day for average omnivorous diet
    vegetarian: 1.7,   // kg CO2 per day for vegetarian diet
    vegan: 1.0         // kg CO2 per day for plant-based vegan diet
  },
  energy: {
    electricity: 0.42, // kg CO2 per kWh of grid electricity
    gas: 5.30          // kg CO2 per therm of natural gas
  },
  waste: {
    landfill: 1.25,    // kg CO2 per bag of landfill trash
    recycling: -0.45   // kg CO2 offset credit per bag recycled
  }
};

// Paris Agreement Carbon Budget Goals (Tons per capita per year)
export const PARIS_AGREEMENT_GOAL_TONS = 2.0;
export const GLOBAL_AVERAGE_TONS = 4.8;
export const US_AVERAGE_TONS = 16.0;

// Global Lifestyle Profile Presets for educational simulation
export interface LifestyleProfile {
  id: string;
  name: string;
  location: string;
  travelMiles: number; // annual miles
  travelMode: 'suv' | 'sedan' | 'electric' | 'bus' | 'train';
  dietType: 'meat-heavy' | 'average' | 'vegetarian' | 'vegan';
  energyKwh: number; // annual kWh
  wasteBags: number; // annual trash bags
  description: string;
}

export const LIFESTYLE_PROFILES: LifestyleProfile[] = [
  {
    id: 'suburban_us',
    name: 'Suburban Commuter',
    location: 'Houston, Texas, USA',
    travelMiles: 15000,
    travelMode: 'suv',
    dietType: 'meat-heavy',
    energyKwh: 12000,
    wasteBags: 150,
    description: 'Represents a typical suburban lifestyle relying heavily on internal combustion SUVs, a high-carbon grain-fed beef diet, and large air-conditioned households.'
  },
  {
    id: 'urban_eu',
    name: 'Urban Professional',
    location: 'Munich, Bavaria, Germany',
    travelMiles: 4000,
    travelMode: 'train',
    dietType: 'average',
    energyKwh: 3500,
    wasteBags: 60,
    description: 'Represents high-density European living, commuting via electric municipal rail network, residing in insulated apartment blocks, and eating a mixed seasonal diet.'
  },
  {
    id: 'eco_advocate',
    name: 'Carbon Conscious Pioneer',
    location: 'Oslo, Norway',
    travelMiles: 3000,
    travelMode: 'electric',
    dietType: 'vegan',
    energyKwh: 1500,
    wasteBags: 20,
    description: 'A carbon reduction model: travel limited to electric vehicles powered by hydroelectric grids, consumption offset by organic recycling, and an entirely plant-based diet.'
  },
  {
    id: 'rural_developing',
    name: 'Rural Agriculturist',
    location: 'Bihar, India',
    travelMiles: 800,
    travelMode: 'bus',
    dietType: 'vegetarian',
    energyKwh: 600,
    wasteBags: 12,
    description: 'Represents low-intensity living in agricultural sectors of developing regions: minimal transportation footprints, vegetarian grains, and low household electrical grid draws.'
  }
];

/**
 * Calculates total annual emissions for a given profile in Metric Tons CO2
 */
export const calculateProfileAnnualEmissionsTons = (profile: Omit<LifestyleProfile, 'id' | 'name' | 'location' | 'description'>): number => {
  const travelEmissions = (profile.travelMiles * EMISSION_FACTORS.travel[profile.travelMode]) / 1000;
  const foodEmissions = (365 * EMISSION_FACTORS.food[profile.dietType]) / 1000;
  const energyEmissions = (profile.energyKwh * EMISSION_FACTORS.energy.electricity) / 1000;
  const wasteEmissions = (profile.wasteBags * EMISSION_FACTORS.waste.landfill) / 1000;
  
  return parseFloat((travelEmissions + foodEmissions + energyEmissions + wasteEmissions).toFixed(2));
};

/**
 * Calculates emissions for individual components (in kg)
 */
export const calculateTravelEmissions = (miles: number, mode: string): number => {
  const factor = EMISSION_FACTORS.travel[mode as keyof typeof EMISSION_FACTORS.travel] ?? EMISSION_FACTORS.travel.sedan;
  return parseFloat((miles * factor).toFixed(2));
};

export const calculateFoodEmissions = (days: number, diet: string): number => {
  const factor = EMISSION_FACTORS.food[diet as keyof typeof EMISSION_FACTORS.food] ?? EMISSION_FACTORS.food.average;
  return parseFloat((days * factor).toFixed(2));
};

export const calculateEnergyEmissions = (value: number, type: string): number => {
  const factor = EMISSION_FACTORS.energy[type as keyof typeof EMISSION_FACTORS.energy] ?? EMISSION_FACTORS.energy.electricity;
  return parseFloat((value * factor).toFixed(2));
};

export const calculateWasteEmissions = (bags: number, type: string): number => {
  const factor = EMISSION_FACTORS.waste[type as keyof typeof EMISSION_FACTORS.waste] ?? EMISSION_FACTORS.waste.landfill;
  return parseFloat((bags * factor).toFixed(2));
};
