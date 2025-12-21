import { contextBridge, ipcRenderer } from "electron";

export interface Stock {
  id?: number;
  symbol: string;
  name: string;
  exchange?: string;
  notes?: string;
  createdAt?: string;
}

export interface Movement {
  id?: number;
  stockId: number;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  date: string;
  fees?: number;
  notes?: string;
  createdAt?: string;
}

export interface StockSummary {
  totalQuantity: number;
  averagePrice: number;
  totalInvested: number;
}

export type AssetType = "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO";

export interface Asset {
  id?: number;
  concepto: string;
  cantidad: number;
  valor: number;
  valor_unitario: number;
  tipo: AssetType;
  createdAt?: string;
  updatedAt?: string;
}

try {
  contextBridge.exposeInMainWorld("electronAPI", {
    // Stock APIs
    getStocks: () => ipcRenderer.invoke("get-stocks"),
    addStock: (stock: Omit<Stock, "id" | "createdAt">) =>
      ipcRenderer.invoke("add-stock", stock),
    updateStock: (id: number, updates: Partial<Stock>) =>
      ipcRenderer.invoke("update-stock", id, updates),
    deleteStock: (id: number) => ipcRenderer.invoke("delete-stock", id),
    addMovement: (movement: Omit<Movement, "id" | "createdAt">) =>
      ipcRenderer.invoke("add-movement", movement),
    getMovements: (stockId: number) =>
      ipcRenderer.invoke("get-movements", stockId),
    deleteMovement: (id: number) => ipcRenderer.invoke("delete-movement", id),
    getStockSummary: (stockId: number) =>
      ipcRenderer.invoke("get-stock-summary", stockId),
    exportData: () => ipcRenderer.invoke("export-data"),
    importData: () => ipcRenderer.invoke("import-data"),

    // Asset APIs
    getAssets: () => ipcRenderer.invoke("get-assets"),
    addAsset: (asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) =>
      ipcRenderer.invoke("add-asset", asset),
    updateAsset: (
      id: number,
      updates: Partial<Omit<Asset, "id" | "createdAt" | "updatedAt">>
    ) => ipcRenderer.invoke("update-asset", id, updates),
    deleteAsset: (id: number) => ipcRenderer.invoke("delete-asset", id),

    // Category APIs
    getCategories: () => ipcRenderer.invoke("get-categories"),
    addCategory: (category: { tipo: string; nombre: string; color: string }) =>
      ipcRenderer.invoke("add-category", category),
    updateCategory: (
      id: number,
      updates: { nombre?: string; color?: string }
    ) => ipcRenderer.invoke("update-category", id, updates),
    deleteCategory: (id: number) => ipcRenderer.invoke("delete-category", id),
    getPatrimonialEvolution: () =>
      ipcRenderer.invoke("get-patrimonial-evolution"),
    addPatrimonialEvolution: (evolution: {
      año: number;
      mes: number;
      dia: number;
      patrimonio: number;
      detalle?: string;
    }) => ipcRenderer.invoke("add-patrimonial-evolution", evolution),
    updatePatrimonialEvolution: (
      id: number,
      updates: {
        año?: number;
        mes?: number;
        dia?: number;
        patrimonio?: number;
        detalle?: string;
      }
    ) => ipcRenderer.invoke("update-patrimonial-evolution", id, updates),
    deletePatrimonialEvolution: (id: number) =>
      ipcRenderer.invoke("delete-patrimonial-evolution", id),
  });
} catch (error) {}
