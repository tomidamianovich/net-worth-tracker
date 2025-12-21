export interface PatrimonialEvolution {
  id?: number;
  año: number;
  mes: number;
  dia: number;
  patrimonio: number;
  detalle?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatrimonialEvolutionFormData {
  año: number;
  mes: number;
  dia: number;
  patrimonio: string;
  detalle: string;
}

export interface ChartDataPoint {
  date: string;
  label: string;
  patrimonio: number;
}

