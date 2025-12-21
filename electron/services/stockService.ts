import { StockDatabase } from "../database";
import { Stock, Movement, StockSummary } from "../preload";

export class StockService {
  constructor(private db: StockDatabase) {}

  getAllStocks(): Stock[] {
    return this.db.getAllStocks() as Stock[];
  }

  addStock(stock: Omit<Stock, "id" | "createdAt">): Stock {
    const id = this.db.insertStock(
      stock.symbol,
      stock.name,
      stock.exchange,
      stock.notes
    );
    const newStock = this.db.getStockById(id);
    if (!newStock) throw new Error("Failed to create stock");
    return newStock as Stock;
  }

  updateStock(id: number, updates: Partial<Stock>): boolean {
    return this.db.updateStock(id, updates);
  }

  deleteStock(id: number): boolean {
    return this.db.deleteStock(id);
  }

  addMovement(movement: Omit<Movement, "id" | "createdAt">): Movement {
    const id = this.db.insertMovement(
      movement.stockId,
      movement.type,
      movement.quantity,
      movement.price,
      movement.date,
      movement.fees,
      movement.notes
    );
    const movements = this.db.getMovementsByStockId(movement.stockId);
    const newMovement = movements.find((m) => m.id === id);
    if (!newMovement) throw new Error("Failed to create movement");
    return newMovement as Movement;
  }

  getMovements(stockId: number): Movement[] {
    return this.db.getMovementsByStockId(stockId) as Movement[];
  }

  deleteMovement(id: number): boolean {
    return this.db.deleteMovement(id);
  }

  getStockSummary(stockId: number): StockSummary {
    return this.db.getStockSummary(stockId) as StockSummary;
  }

  exportAllData() {
    return this.db.exportAllData();
  }

  importData(data: { stocks: any[]; movements: any[] }) {
    return this.db.importData(data);
  }
}
