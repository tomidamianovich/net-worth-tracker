import { Stock, Movement } from "../../../electron/preload";

export interface StockDetailProps {
  stock: Stock;
  movements: Movement[];
  onAddMovement: () => void;
  onDeleteMovement: (id: number) => void;
}

