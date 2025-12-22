import { StockDatabase } from "../database";

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

export class RentalIncomeService {
  constructor(private db: StockDatabase) {}

  getAllRentalIncomes(): RentalIncome[] {
    const incomes = this.db.getAllRentalIncomes();
    return incomes.map((income: any) => ({
      id: income.id,
      año: income.año,
      mes: income.mes,
      precioAlquilerARS: income.precio_alquiler_ars,
      valorUSD: income.valor_usd,
      gananciaUSD: income.ganancia_usd,
      createdAt: income.created_at,
      updatedAt: income.updated_at,
    }));
  }

  addRentalIncome(
    income: Omit<RentalIncome, "id" | "createdAt" | "updatedAt">
  ): RentalIncome {
    const id = this.db.insertRentalIncome(
      income.año,
      income.mes,
      income.precioAlquilerARS,
      income.valorUSD,
      income.gananciaUSD
    );
    const newIncome = this.db.getRentalIncomeById(id);
    if (!newIncome) throw new Error("Failed to create rental income");
    return {
      id: newIncome.id,
      año: newIncome.año,
      mes: newIncome.mes,
      precioAlquilerARS: newIncome.precio_alquiler_ars,
      valorUSD: newIncome.valor_usd,
      gananciaUSD: newIncome.ganancia_usd,
      createdAt: newIncome.created_at,
      updatedAt: newIncome.updated_at,
    };
  }

  updateRentalIncome(
    id: number,
    updates: Partial<Omit<RentalIncome, "id" | "createdAt" | "updatedAt">>
  ): boolean {
    const dbUpdates: {
      año?: number;
      mes?: number;
      precioAlquilerARS?: number;
      valorUSD?: number;
      gananciaUSD?: number;
    } = {};

    if (updates.año !== undefined) dbUpdates.año = updates.año;
    if (updates.mes !== undefined) dbUpdates.mes = updates.mes;
    if (updates.precioAlquilerARS !== undefined)
      dbUpdates.precioAlquilerARS = updates.precioAlquilerARS;
    if (updates.valorUSD !== undefined) dbUpdates.valorUSD = updates.valorUSD;
    if (updates.gananciaUSD !== undefined)
      dbUpdates.gananciaUSD = updates.gananciaUSD;

    return this.db.updateRentalIncome(id, dbUpdates);
  }

  deleteRentalIncome(id: number): boolean {
    return this.db.deleteRentalIncome(id);
  }
}

