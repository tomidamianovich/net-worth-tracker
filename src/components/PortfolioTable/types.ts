import { Asset } from "../../../electron/preload";

export interface PortfolioAsset extends Asset {
  variacion: number; // percentage
  variacionEur: number; // euros
  totalActual: number; // cantidad * valor_unitario
  porcentajeCartera: number;
}

export type FilterType = "Todos" | "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO";

export interface Category {
  id: number;
  tipo: string;
  nombre: string;
  color: string;
}

export interface AssetData {
  concepto: string;
  tipo: "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO";
  total: number;
  porcentaje: number;
  color: string;
}

