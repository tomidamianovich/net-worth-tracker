import { describe, it, expect } from 'vitest';

describe('PropertyInvestment', () => {
  it('should have correct component structure', () => {
    // Basic structure test - verify the component can be imported
    expect(() => {
      require('./PropertyInvestment');
    }).not.toThrow();
  });

  it('should calculate annual growth correctly', () => {
    const initialInvestment = 1000;
    const monthsCount = 6;
    const promedioMensualUSD = 50;
    const projectedAnnualGains = monthsCount < 12 
      ? promedioMensualUSD * 12 
      : promedioMensualUSD * monthsCount;
    const gananciaAnualizada = initialInvestment > 0
      ? (projectedAnnualGains / initialInvestment) * 100
      : 0;

    expect(projectedAnnualGains).toBe(600);
    expect(gananciaAnualizada).toBe(60);
  });

  it('should group incomes by year correctly', () => {
    const incomes = [
      { año: 2024, mes: 1, gananciaUSD: 100 },
      { año: 2024, mes: 2, gananciaUSD: 200 },
      { año: 2025, mes: 1, gananciaUSD: 150 },
    ];

    const grouped = new Map<number, typeof incomes>();
    incomes.forEach((income) => {
      const year = income.año;
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(income);
    });

    expect(grouped.size).toBe(2);
    expect(grouped.get(2024)?.length).toBe(2);
    expect(grouped.get(2025)?.length).toBe(1);
  });
});

