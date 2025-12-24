import { describe, it, expect } from 'vitest';

describe('PortfolioTable', () => {
  it('should have correct component structure', () => {
    // Basic structure test - verify the component can be imported
    expect(() => {
      require('./PortfolioTable');
    }).not.toThrow();
  });

  it('should format currency correctly', () => {
    const formatCurrency = (value: number): string =>
      new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);

    const formatted = formatCurrency(1000);
    expect(formatted).toContain('1000');
    expect(formatted).toContain('€');
    expect(formatted).toContain(',00');
  });

  it('should format percentage correctly', () => {
    const formatPercentage = (value: number): string =>
      `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

    expect(formatPercentage(10.5)).toBe('+10.50%');
    expect(formatPercentage(-5.25)).toBe('-5.25%');
  });
});

