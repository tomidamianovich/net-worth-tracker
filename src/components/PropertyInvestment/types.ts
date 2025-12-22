export interface RentalIncome {
  id?: number;
  año: number;
  mes: number;
  precioAlquilerARS: number;
  valorUSD: number;
  gananciaUSD: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentalSummary {
  año: number;
  promedioMensualUSD: number;
  gananciasAnualesUSD: number;
  gananciaAnualizada?: number;
  promedioTotal?: number;
}

