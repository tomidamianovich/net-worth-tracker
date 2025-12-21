import { StockDatabase } from "../database";
import { Asset } from "../preload";

export class AssetService {
  constructor(private db: StockDatabase) {}

  getAllAssets(): Asset[] {
    const assets = this.db.getAllAssets();
    return assets.map((asset: any) => {
      const tipo =
        asset.tipo && asset.tipo.trim() !== ""
          ? asset.tipo.trim().toUpperCase()
          : "ACCION";

      return {
        id: asset.id,
        concepto: asset.concepto,
        cantidad: asset.cantidad,
        valor: asset.valor,
        valor_unitario: asset.valor_unitario,
        tipo: tipo as "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO",
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      };
    });
  }

  addAsset(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">): Asset {
    if (!asset.concepto || typeof asset.concepto !== "string") {
      throw new Error("Concepto is required and must be a string");
    }
    if (typeof asset.cantidad !== "number" || asset.cantidad <= 0) {
      throw new Error("Cantidad must be a positive number");
    }
    if (typeof asset.valor !== "number" || asset.valor < 0) {
      throw new Error("Valor must be a non-negative number");
    }
    if (typeof asset.valor_unitario !== "number" || asset.valor_unitario < 0) {
      throw new Error("Valor unitario must be a non-negative number");
    }
    if (
      !asset.tipo ||
      !["ACCION", "ETF", "CRIPTO", "FIAT", "DEPOSITO"].includes(asset.tipo)
    ) {
      throw new Error("Tipo must be ACCION, ETF, CRIPTO, FIAT, or DEPOSITO");
    }

    const newAsset = this.db.getAssetById(
      this.db.insertAsset(
        asset.concepto,
        asset.cantidad,
        asset.valor,
        asset.valor_unitario,
        asset.tipo
      )
    );
    if (!newAsset) throw new Error("Failed to create asset");

    return {
      id: newAsset.id,
      concepto: newAsset.concepto,
      cantidad: newAsset.cantidad,
      valor: newAsset.valor,
      valor_unitario: newAsset.valor_unitario,
      tipo: (newAsset.tipo || "ACCION") as Asset["tipo"],
      createdAt: newAsset.created_at,
      updatedAt: newAsset.updated_at,
    };
  }

  updateAsset(
    id: number,
    updates: Partial<Omit<Asset, "id" | "createdAt" | "updatedAt">>
  ): boolean {
    return this.db.updateAsset(id, {
      concepto: updates.concepto,
      cantidad: updates.cantidad,
      valor: updates.valor,
      valorUnitario: updates.valor_unitario,
      tipo: updates.tipo,
    });
  }

  deleteAsset(id: number): boolean {
    return this.db.deleteAsset(id);
  }
}
