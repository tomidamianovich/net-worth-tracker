import { useState } from "react";
import { AddStockModalProps } from "./types";
import { useTranslation } from "../../i18n/hooks";

function AddStockModal({ onClose, onSave }: AddStockModalProps) {
  const { t } = useTranslation();
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [exchange, setExchange] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      symbol: symbol.trim(),
      name: name.trim(),
      exchange: exchange.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("stockModal.add")}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="symbol">{t("stockModal.symbol")} *</label>
            <input
              type="text"
              id="symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">{t("stockModal.name")} *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="exchange">{t("stockModal.exchange")}</label>
            <input
              type="text"
              id="exchange"
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">{t("stockModal.notes")}</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-save">
              {t("common.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddStockModal;

