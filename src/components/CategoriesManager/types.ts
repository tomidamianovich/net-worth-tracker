import { Asset } from "../../../electron/preload";

export interface Category {
  id: number;
  tipo: string;
  nombre: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryFormData {
  tipo: string;
  nombre: string;
  color: string;
}

