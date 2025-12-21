import { StockDatabase } from "../database";

export interface Category {
  id: number;
  tipo: string;
  nombre: string;
  color: string;
  createdAt?: string;
  updatedAt?: string;
}

export class CategoryService {
  constructor(private db: StockDatabase) {}

  getAllCategories(): Category[] {
    const categories = this.db.getAllCategories();
    return categories.map((cat: any) => ({
      id: cat.id,
      tipo: cat.tipo,
      nombre: cat.nombre,
      color: cat.color,
      createdAt: cat.created_at,
      updatedAt: cat.updated_at,
    }));
  }

  getCategoryByTipo(tipo: string): Category | null {
    const category = this.db.getCategoryByTipo(tipo);
    if (!category) return null;

    return {
      id: category.id,
      tipo: category.tipo,
      nombre: category.nombre,
      color: category.color,
      createdAt: category.created_at,
      updatedAt: category.updated_at,
    };
  }

  addCategory(tipo: string, nombre: string, color: string): Category {
    if (!tipo || tipo.trim() === "") {
      throw new Error("Tipo is required");
    }
    if (!nombre || nombre.trim() === "") {
      throw new Error("Nombre is required");
    }
    if (!color || color.trim() === "") {
      throw new Error("Color is required");
    }

    // Validate color format (hex)
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
      throw new Error("Color must be a valid hex color (e.g., #FF0000)");
    }

    this.db.insertCategory(tipo.trim().toUpperCase(), nombre.trim(), color);
    const newCategory = this.db.getCategoryByTipo(tipo.trim().toUpperCase());
    if (!newCategory)
      throw new Error(
        "Failed to create category: category not found after insertion"
      );

    return {
      id: newCategory.id,
      tipo: newCategory.tipo,
      nombre: newCategory.nombre,
      color: newCategory.color,
      createdAt: newCategory.created_at,
      updatedAt: newCategory.updated_at,
    };
  }

  updateCategory(
    id: number,
    updates: { nombre?: string; color?: string }
  ): boolean {
    const nombreTrim = updates.nombre?.trim();
    const colorTrim = updates.color?.trim();

    if (nombreTrim !== undefined && nombreTrim === "") {
      throw new Error("Nombre cannot be empty");
    }
    if (colorTrim !== undefined) {
      if (colorTrim === "" || !/^#[0-9A-Fa-f]{6}$/.test(colorTrim)) {
        throw new Error("Color must be a valid hex color (e.g., #FF0000)");
      }
    }

    return this.db.updateCategory(id, nombreTrim, colorTrim);
  }

  deleteCategory(id: number): boolean {
    return this.db.deleteCategory(id);
  }
}
