import { describe, it, expect } from 'vitest';

describe('Financial Calculations', () => {
  describe('formatCurrency', () => {
    it('should format numbers as EUR currency', () => {
      const value = 1234.56;
      const formatted = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      
      // The format may vary by locale, so we check for key parts
      expect(formatted).toContain('1234');
      expect(formatted).toContain('56');
      expect(formatted).toContain('€');
    });

    it('should handle zero values', () => {
      const value = 0;
      const formatted = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      
      // Check for zero and euro symbol (format may have non-breaking space)
      expect(formatted).toContain('0');
      expect(formatted).toContain('€');
    });

    it('should handle negative values', () => {
      const value = -100.50;
      const formatted = new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
      
      expect(formatted).toContain('-');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentage with 2 decimals', () => {
      const value = 12.345;
      const formatted = `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
      
      expect(formatted).toBe('+12.35%');
    });

    it('should handle negative percentages', () => {
      const value = -5.67;
      const formatted = `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
      
      expect(formatted).toBe('-5.67%');
    });
  });

  describe('Annual Growth Calculation', () => {
    it('should calculate annual growth correctly', () => {
      const initialInvestment = 1000;
      const projectedAnnualGains = 100;
      const annualGrowth = (projectedAnnualGains / initialInvestment) * 100;
      
      expect(annualGrowth).toBe(10);
    });

    it('should handle zero initial investment', () => {
      const initialInvestment = 0;
      const projectedAnnualGains = 100;
      const annualGrowth = initialInvestment > 0
        ? (projectedAnnualGains / initialInvestment) * 100
        : 0;
      
      expect(annualGrowth).toBe(0);
    });

    it('should project full year when months < 12', () => {
      const monthsCount = 6;
      const promedioMensualUSD = 50;
      const projectedAnnualGains = monthsCount < 12 
        ? promedioMensualUSD * 12 
        : promedioMensualUSD * monthsCount;
      
      expect(projectedAnnualGains).toBe(600);
    });

    it('should use actual gains when months = 12', () => {
      const monthsCount = 12;
      const promedioMensualUSD = 50;
      const gananciasAnualesUSD = 600;
      const projectedAnnualGains = monthsCount < 12 
        ? promedioMensualUSD * 12 
        : gananciasAnualesUSD;
      
      expect(projectedAnnualGains).toBe(600);
    });
  });
});

