import { Stock } from "../../../electron/preload";

export interface AddStockModalProps {
  onClose: () => void;
  onSave: (stock: Omit<Stock, "id" | "createdAt">) => void;
}

