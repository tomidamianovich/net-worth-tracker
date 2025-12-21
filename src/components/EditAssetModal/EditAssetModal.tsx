import { useState, useEffect } from "react";
import { AssetType } from "../../../electron/preload";
import { EditAssetModalProps, Category } from "./types";
import { useTranslation } from "../../i18n/hooks";
import "./EditAssetModal.css";

function EditAssetModal({ asset, onClose, onSave }: EditAssetModalProps) {
  const { t } = useTranslation();
  const [concepto, setConcepto] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [valor, setValor] = useState("");
  const [valorUnitario, setValorUnitario] = useState("");
  const [tipo, setTipo] = useState<AssetType>("ACCION");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (asset) {
      setConcepto(asset.concepto);
      setCantidad(asset.cantidad.toString());
      setValor(asset.valor.toString());
      setValorUnitario(asset.valor_unitario.toString());
      setTipo(asset.tipo || "ACCION");
    } else {
      setConcepto("");
      setCantidad("");
      setValor("");
      setValorUnitario("");
      setTipo("ACCION");
    }
  }, [asset]);

  const loadCategories = async () => {
    try {
      if (
        typeof window === "undefined" ||
        !window.electronAPI ||
        !window.electronAPI.getCategories
      ) {
        return;
      }
      const data = await window.electronAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const assetData = {
      concepto: concepto.trim(),
      cantidad: parseFloat(cantidad),
      valor: parseFloat(valor),
      valor_unitario: parseFloat(valorUnitario),
      tipo: tipo,
    };

    if (!assetData.concepto) {
      alert(t("assetModal.validation.conceptRequired"));
      return;
    }

    if (isNaN(assetData.cantidad) || assetData.cantidad <= 0) {
      alert(t("assetModal.validation.quantityPositive"));
      return;
    }

    if (isNaN(assetData.valor) || assetData.valor < 0) {
      alert(t("assetModal.validation.valuePositive"));
      return;
    }

    if (isNaN(assetData.valor_unitario) || assetData.valor_unitario < 0) {
      alert(t("assetModal.validation.unitValuePositive"));
      return;
    }

    if (asset && asset.id) {
      onSave({ ...assetData, id: asset.id });
    } else {
      onSave(assetData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{asset ? t("assetModal.edit") : t("assetModal.add")}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="concepto">{t("assetModal.concept")} *</label>
            <input
              type="text"
              id="concepto"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              required
              placeholder={t("assetModal.conceptPlaceholder")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="cantidad">{t("assetModal.quantity")} *</label>
            <input
              type="number"
              id="cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              step={tipo === "CRIPTO" ? "0.00001" : "any"}
              min="0"
              required
              placeholder={
                tipo === "CRIPTO"
                  ? t("assetModal.placeholderCrypto")
                  : t("assetModal.placeholderDefault")
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="valor">{t("assetModal.value")} *</label>
            <input
              type="number"
              id="valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder={t("assetModal.placeholderDefault")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="valorUnitario">{t("assetModal.unitValue")} *</label>
            <input
              type="number"
              id="valorUnitario"
              value={valorUnitario}
              onChange={(e) => setValorUnitario(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder={t("assetModal.placeholderDefault")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">{t("assetModal.type")} *</label>
            <select
              id="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as AssetType)}
              required
            >
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.tipo}>
                    {cat.nombre}
                  </option>
                ))
              ) : (
                <>
                  <option value="ACCION">{t("assetModal.assetTypes.action")}</option>
                  <option value="ETF">{t("assetModal.assetTypes.etf")}</option>
                  <option value="CRIPTO">{t("assetModal.assetTypes.crypto")}</option>
                  <option value="FIAT">{t("assetModal.assetTypes.fiat")}</option>
                  <option value="DEPOSITO">{t("assetModal.assetTypes.deposit")}</option>
                </>
              )}
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-save">
              {asset ? t("common.update") : t("common.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAssetModal;

