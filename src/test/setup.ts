import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Setup jsdom environment properly
if (typeof window !== 'undefined') {
  // Mock window methods that might be needed
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Mock window.electronAPI
global.window = {
  ...global.window,
  electronAPI: {
    getStocks: async () => [],
    addStock: async () => ({} as any),
    updateStock: async () => true,
    deleteStock: async () => true,
    addMovement: async () => ({} as any),
    getMovements: async () => [],
    deleteMovement: async () => true,
    getStockSummary: async () => ({} as any),
    exportData: async () => ({ success: true }),
    importData: async () => ({ success: true }),
    getAssets: async () => [],
    addAsset: async () => ({} as any),
    updateAsset: async () => true,
    deleteAsset: async () => true,
    updateAssetWithBtcPrice: async () => ({} as any),
    updateAssetWithCryptoPrice: async () => ({} as any),
    fetchBtcPrice: async () => 0,
    fetchCryptoPrice: async () => 0,
    fetchGoldPrice: async () => 0,
    updateAssetWithGoldPrice: async () => ({} as any),
    getCategories: async () => [],
    addCategory: async () => ({} as any),
    updateCategory: async () => true,
    deleteCategory: async () => true,
    getPatrimonialEvolution: async () => [],
    addPatrimonialEvolution: async () => ({} as any),
    updatePatrimonialEvolution: async () => true,
    deletePatrimonialEvolution: async () => true,
    getRentalIncomes: async () => [],
    getPropertyInitialInvestment: async () => 0,
    updatePropertyInitialInvestment: async () => true,
    addRentalIncome: async () => ({} as any),
    updateRentalIncome: async () => true,
    deleteRentalIncome: async () => true,
    createBackup: async () => ({ success: true }),
    saveBackupAs: async () => ({ success: true }),
    restoreFromBackup: async () => ({ success: true }),
    login: async () => ({ success: true }),
    hasUsers: async () => false,
    setupInitialUser: async () => ({ success: true }),
    changePassword: async () => ({ success: true }),
  } as any,
} as any;

