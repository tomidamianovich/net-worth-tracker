import { Stock } from "../../../electron/preload";

export interface StockListProps {
  stocks: Stock[];
  selectedStock: Stock | null;
  onSelectStock: (stock: Stock) => void;
  onDeleteStock: (id: number) => void;
}

