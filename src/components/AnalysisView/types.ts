import { Asset } from "../../../electron/preload";

export interface PortfolioAsset extends Asset {
  variacion: number;
  variacionEur: number;
  totalActual: number;
  porcentajeCartera: number;
}

export interface AssetData {
  concepto: string;
  tipo: "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO";
  total: number;
  porcentaje: number;
  color: string;
}

export interface Category {
  id: number;
  tipo: string;
  nombre: string;
  color: string;
}

