import { Asset, AssetType } from "../../../electron/preload";

export interface EditAssetModalProps {
  asset?: Asset;
  onClose: () => void;
  onSave: (
    asset: Omit<Asset, "id" | "createdAt" | "updatedAt"> | Asset
  ) => void;
}

export interface Category {
  id: number;
  tipo: string;
  nombre: string;
  color: string;
}

