import { Stock, Movement } from "../../../electron/preload";

export interface AddMovementModalProps {
  stock: Stock;
  onClose: () => void;
  onSave: (movement: Omit<Movement, "id" | "createdAt">) => void;
}

