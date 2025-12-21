import { StockDatabase } from "../database";

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

export class PatrimonialEvolutionService {
  constructor(private db: StockDatabase) {}

  getAllPatrimonialEvolution(): PatrimonialEvolution[] {
    const records = this.db.getAllPatrimonialEvolution();
    return records.map((record: any) => ({
      id: record.id,
      año: record.año,
      mes: record.mes,
      dia: record.dia,
      patrimonio: record.patrimonio,
      detalle: record.detalle,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));
  }

  getPatrimonialEvolutionById(id: number): PatrimonialEvolution | null {
    const record = this.db.getPatrimonialEvolutionById(id);
    if (!record) return null;
    return {
      id: record.id,
      año: record.año,
      mes: record.mes,
      dia: record.dia,
      patrimonio: record.patrimonio,
      detalle: record.detalle,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  addPatrimonialEvolution(
    evolution: Omit<PatrimonialEvolution, "id" | "createdAt" | "updatedAt">
  ): PatrimonialEvolution {
    if (
      typeof evolution.año !== "number" ||
      evolution.año < 2000 ||
      evolution.año > 2100
    ) {
      throw new Error("Año inválido");
    }
    if (
      typeof evolution.mes !== "number" ||
      evolution.mes < 1 ||
      evolution.mes > 12
    ) {
      throw new Error("Mes inválido (debe ser entre 1 y 12)");
    }
    if (
      typeof evolution.dia !== "number" ||
      evolution.dia < 1 ||
      evolution.dia > 31
    ) {
      throw new Error("Día inválido (debe ser entre 1 y 31)");
    }
    if (typeof evolution.patrimonio !== "number" || evolution.patrimonio < 0) {
      throw new Error("Patrimonio debe ser un número positivo");
    }

    const id = this.db.insertPatrimonialEvolution(
      evolution.año,
      evolution.mes,
      evolution.dia,
      evolution.patrimonio,
      evolution.detalle
    );
    const newRecord = this.db.getPatrimonialEvolutionById(id);
    if (!newRecord) throw new Error("Failed to create patrimonial evolution");

    return {
      id: newRecord.id,
      año: newRecord.año,
      mes: newRecord.mes,
      dia: newRecord.dia,
      patrimonio: newRecord.patrimonio,
      detalle: newRecord.detalle,
      createdAt: newRecord.created_at,
      updatedAt: newRecord.updated_at,
    };
  }

  updatePatrimonialEvolution(
    id: number,
    updates: Partial<
      Omit<PatrimonialEvolution, "id" | "createdAt" | "updatedAt">
    >
  ): boolean {
    if (
      updates.año !== undefined &&
      (updates.año < 2000 || updates.año > 2100)
    ) {
      throw new Error("Año inválido");
    }
    if (updates.mes !== undefined && (updates.mes < 1 || updates.mes > 12)) {
      throw new Error("Mes inválido (debe ser entre 1 y 12)");
    }
    if (updates.dia !== undefined && (updates.dia < 1 || updates.dia > 31)) {
      throw new Error("Día inválido (debe ser entre 1 y 31)");
    }
    if (
      updates.patrimonio !== undefined &&
      (typeof updates.patrimonio !== "number" || updates.patrimonio < 0)
    ) {
      throw new Error("Patrimonio debe ser un número positivo");
    }

    return this.db.updatePatrimonialEvolution(id, updates);
  }

  deletePatrimonialEvolution(id: number): boolean {
    return this.db.deletePatrimonialEvolution(id);
  }
}
