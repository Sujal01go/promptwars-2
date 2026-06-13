import { describe, it, expect } from 'vitest';
import {
  calculateProfileAnnualEmissionsTons,
  calculateTravelEmissions,
  calculateFoodEmissions,
  calculateEnergyEmissions,
  calculateWasteEmissions,
  LIFESTYLE_PROFILES
} from './carbonCalculator';

describe('Carbon Calculator Calculations', () => {
  describe('calculateTravelEmissions', () => {
    it('should calculate emissions correctly for SUV', () => {
      // SUV emission factor: 0.44
      expect(calculateTravelEmissions(1000, 'suv')).toBe(440);
      expect(calculateTravelEmissions(10, 'suv')).toBe(4.4);
    });

    it('should calculate emissions correctly for Electric Vehicle', () => {
      // EV emission factor: 0.08
      expect(calculateTravelEmissions(1000, 'electric')).toBe(80);
    });

    it('should default to Sedan if travel mode is invalid', () => {
      // Sedan factor: 0.28
      expect(calculateTravelEmissions(1000, 'invalid-mode')).toBe(280);
    });
  });

  describe('calculateFoodEmissions', () => {
    it('should calculate emissions correctly for vegan diet', () => {
      // Vegan factor: 1.0
      expect(calculateFoodEmissions(30, 'vegan')).toBe(30);
    });

    it('should calculate emissions correctly for meat-heavy diet', () => {
      // Meat-heavy factor: 3.3
      expect(calculateFoodEmissions(10, 'meat-heavy')).toBe(33);
    });

    it('should default to average if diet type is invalid', () => {
      // Average factor: 2.5
      expect(calculateFoodEmissions(10, 'invalid-diet')).toBe(25);
    });
  });

  describe('calculateEnergyEmissions', () => {
    it('should calculate emissions correctly for electricity', () => {
      // Electricity factor: 0.42
      expect(calculateEnergyEmissions(100, 'electricity')).toBe(42);
    });

    it('should default to electricity if type is invalid', () => {
      expect(calculateEnergyEmissions(100, 'invalid-energy')).toBe(42);
    });
  });

  describe('calculateWasteEmissions', () => {
    it('should calculate emissions correctly for landfill waste', () => {
      // Landfill factor: 1.25
      expect(calculateWasteEmissions(20, 'landfill')).toBe(25);
    });
  });

  describe('calculateProfileAnnualEmissionsTons', () => {
    it('should calculate correct annual tons for Suburban Commuter preset', () => {
      const suburban = LIFESTYLE_PROFILES.find(p => p.id === 'suburban_us');
      expect(suburban).toBeDefined();
      if (suburban) {
        const result = calculateProfileAnnualEmissionsTons(suburban);
        // SUV: 15000 * 0.44 = 6600 kg
        // Food: 365 * 3.3 = 1204.5 kg
        // Energy: 12000 * 0.42 = 5040 kg
        // Waste: 150 * 1.25 = 187.5 kg
        // Total: 6600 + 1204.5 + 5040 + 187.5 = 13032 kg = 13.03 Tons
        expect(result).toBe(13.03);
      }
    });

    it('should calculate correct annual tons for Carbon Conscious Pioneer preset', () => {
      const pioneer = LIFESTYLE_PROFILES.find(p => p.id === 'eco_advocate');
      expect(pioneer).toBeDefined();
      if (pioneer) {
        const result = calculateProfileAnnualEmissionsTons(pioneer);
        // EV: 3000 * 0.08 = 240 kg
        // Food: 365 * 1.0 = 365 kg
        // Energy: 1500 * 0.42 = 630 kg
        // Waste: 20 * 1.25 = 25 kg
        // Total: 240 + 365 + 630 + 25 = 1260 kg = 1.26 Tons
        expect(result).toBe(1.26);
      }
    });
  });
});
