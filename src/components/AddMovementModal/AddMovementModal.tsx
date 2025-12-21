import { useState } from "react";
import { AddMovementModalProps } from "./types";
import { useTranslation } from "../../i18n/hooks";

function AddMovementModal({ stock, onClose, onSave }: AddMovementModalProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<"buy" | "sell">("buy");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [fees, setFees] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      stockId: stock.id!,
      type,
      quantity: parseFloat(quantity),
      price: parseFloat(price),
      date,
      fees: fees ? parseFloat(fees) : 0,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{t("movementModal.addWithSymbol", { symbol: stock.symbol })}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="type">{t("movementModal.type")} *</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as "buy" | "sell")}
              required
            >
              <option value="buy">{t("movementModal.typeBuy")}</option>
              <option value="sell">{t("movementModal.typeSell")}</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">{t("movementModal.quantity")} *</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              step="any"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">{t("movementModal.price")} *</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">{t("movementModal.date")} *</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="fees">{t("movementModal.fees")}</label>
            <input
              type="number"
              id="fees"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              step="0.01"
              min="0"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">{t("movementModal.notes")}</label>
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

export default AddMovementModal;

