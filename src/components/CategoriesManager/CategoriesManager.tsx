import { useState, useEffect } from "react";
import { Asset } from "../../../electron/preload";
import { Category, CategoryFormData } from "./types";
import { useTranslation } from "../../i18n/hooks";
import "./CategoriesManager.css";

function CategoriesManager() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    tipo: "",
    nombre: "",
    color: "#808080",
  });

  useEffect(() => {
    loadCategories();
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      if (!window.electronAPI?.getAssets) {
        return;
      }
      const data = await window.electronAPI.getAssets();
      setAssets(data);
    } catch (error) {
      console.error("Error loading assets:", error);
    }
  };

  const getAssetCountByTipo = (tipo: string): number => {
    return assets.filter((asset) => (asset.tipo || "ACCION") === tipo).length;
  };

  const loadCategories = async () => {
    try {
      if (
        typeof window === "undefined" ||
        !window.electronAPI ||
        !window.electronAPI.getCategories
      ) {
        setLoading(false);
        setCategories([]);
        return;
      }
      const data = await window.electronAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      alert(t("categories.errorLoading"));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      tipo: category.tipo,
      nombre: category.nombre,
      color: category.color,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("categories.deleteConfirm"))) {
      return;
    }

    try {
      if (!window.electronAPI?.deleteCategory) {
        alert(t("messages.electronNotAvailable"));
        return;
      }
      await window.electronAPI.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(
        `${t("categories.errorDeleting")}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!window.electronAPI) {
      alert(t("messages.electronNotAvailable"));
      return;
    }

    try {
      if (editingCategory) {
        await window.electronAPI.updateCategory(editingCategory.id, {
          nombre: formData.nombre.trim(),
          color: formData.color,
        });
      } else {
        await window.electronAPI.addCategory({
          tipo: formData.tipo.trim().toUpperCase(),
          nombre: formData.nombre.trim(),
          color: formData.color,
        });
      }

      await loadCategories();
      await loadAssets();
      setShowAddModal(false);
      setEditingCategory(null);
      setFormData({ tipo: "", nombre: "", color: "#808080" });
    } catch (error) {
      console.error("Error saving category:", error);
      alert(
        `${t("categories.errorSaving")}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCategory(null);
    setFormData({ tipo: "", nombre: "", color: "#808080" });
  };

  if (loading) {
    return (
      <div className="categories-loading">
        <div className="loading-spinner"></div>
        <p>{t("categories.loading")}</p>
      </div>
    );
  }

  return (
    <div className="categories-manager">
      <div className="categories-header">
        <h1>{t("categories.title")}</h1>
        <button
          className="btn-add-category"
          onClick={() => {
            setEditingCategory(null);
            setFormData({ tipo: "", nombre: "", color: "#808080" });
            setShowAddModal(true);
          }}
        >
          + {t("categories.addNew")}
        </button>
      </div>

      <div className="categories-list">
        {categories.length === 0 ? (
          <div className="categories-empty">
            <p>{t("categories.empty")}</p>
          </div>
        ) : (
          categories.map((category) => {
            const assetCount = getAssetCountByTipo(category.tipo);
            const hasAssets = assetCount > 0;
            return (
              <div key={category.id} className="category-card">
                <div
                  className="category-color"
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className="category-info">
                  <div className="category-name">{category.nombre}</div>
                  <div className="category-tipo">
                    {category.tipo} {hasAssets && `(${assetCount})`}
                  </div>
                </div>
                <div className="category-actions">
                  <button
                    className="icon-btn"
                    onClick={() => handleEdit(category)}
                    title={t("common.edit")}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className={`icon-btn delete-btn ${
                      hasAssets ? "disabled" : ""
                    }`}
                    onClick={() => !hasAssets && handleDelete(category.id)}
                    disabled={hasAssets}
                    title={
                      hasAssets
                        ? t("categories.cannotDelete", {
                            count: assetCount,
                            plural: assetCount,
                          })
                        : t("common.delete")
                    }
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingCategory
                  ? t("categories.edit")
                  : t("categories.addNew")}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {!editingCategory && (
                <div className="form-group">
                  <label htmlFor="tipo">{t("categories.code")} *</label>
                  <input
                    type="text"
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo: e.target.value.toUpperCase(),
                      })
                    }
                    required
                    placeholder={t("categories.codePlaceholder")}
                    maxLength={20}
                  />
                  <small>{t("categories.codeMaxLength")}</small>
                </div>
              )}

              {editingCategory && (
                <div className="form-group">
                  <label>{t("categories.code")}</label>
                  <input
                    type="text"
                    value={formData.tipo}
                    disabled
                    className="disabled-input"
                  />
                  <small>{t("categories.codeReadonly")}</small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="nombre">{t("categories.name")} *</label>
                <input
                  type="text"
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                  placeholder={t("categories.namePlaceholder")}
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">{t("categories.color")} *</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                        setFormData({ ...formData, color: value });
                      }
                    }}
                    placeholder={t("categories.colorPlaceholder")}
                    maxLength={7}
                  />
                  <div
                    className="color-preview"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn-save">
                  {editingCategory ? t("common.update") : t("common.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CategoriesManager;
