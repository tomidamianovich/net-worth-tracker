import { useState, useEffect } from "react";
import { RentalIncome } from "./types";
import { useTranslation } from "../../i18n/hooks";
import "./AddRentalIncomeModal.css";

interface AddRentalIncomeModalProps {
  rentalIncome?: RentalIncome;
  defaultValues?: {
    precioAlquilerARS: number;
    valorUSD: number;
  };
  onClose: () => void;
  onSave: (
    rentalIncome: Omit<RentalIncome, "id" | "createdAt" | "updatedAt">
  ) => void;
}

function AddRentalIncomeModal({
  rentalIncome,
  defaultValues,
  onClose,
  onSave,
}: AddRentalIncomeModalProps) {
  const { t } = useTranslation();
  const [año, setAño] = useState<number>(new Date().getFullYear());
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [precioAlquilerARS, setPrecioAlquilerARS] = useState<string>("");
  const [valorUSD, setValorUSD] = useState<string>("");

  useEffect(() => {
    if (rentalIncome) {
      setAño(rentalIncome.año);
      setMes(rentalIncome.mes);
      setPrecioAlquilerARS(rentalIncome.precioAlquilerARS.toString());
      setValorUSD(rentalIncome.valorUSD.toString());
    } else if (defaultValues) {
      // Use default values when adding a new income (not editing)
      setPrecioAlquilerARS(defaultValues.precioAlquilerARS.toString());
      setValorUSD(defaultValues.valorUSD.toString());
    }
  }, [rentalIncome, defaultValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const precio = parseFloat(precioAlquilerARS);
    const valor = parseFloat(valorUSD);

    if (isNaN(precio) || precio <= 0) {
      alert("El precio de alquiler debe ser mayor a 0");
      return;
    }

    if (isNaN(valor) || valor <= 0) {
      alert("El valor USD debe ser mayor a 0");
      return;
    }

    const gananciaUSD = precio / valor;

    onSave({
      año,
      mes,
      precioAlquilerARS: precio,
      valorUSD: valor,
      gananciaUSD,
    });
  };

  const MONTHS = [
    t("evolution.months.january"),
    t("evolution.months.february"),
    t("evolution.months.march"),
    t("evolution.months.april"),
    t("evolution.months.may"),
    t("evolution.months.june"),
    t("evolution.months.july"),
    t("evolution.months.august"),
    t("evolution.months.september"),
    t("evolution.months.october"),
    t("evolution.months.november"),
    t("evolution.months.december"),
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {rentalIncome
              ? t("propertyInvestment.modal.edit")
              : t("propertyInvestment.modal.add")}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="año">{t("propertyInvestment.modal.year")} *</label>
            <select
              id="año"
              value={año}
              onChange={(e) => setAño(parseInt(e.target.value))}
              required
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="mes">{t("propertyInvestment.modal.month")} *</label>
            <select
              id="mes"
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              required
            >
              {MONTHS.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="precioAlquilerARS">
              {t("propertyInvestment.modal.rentPrice")} * (ARS)
            </label>
            <input
              type="number"
              id="precioAlquilerARS"
              value={precioAlquilerARS}
              onChange={(e) => setPrecioAlquilerARS(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder="300000"
            />
          </div>

          <div className="form-group">
            <label htmlFor="valorUSD">
              {t("propertyInvestment.modal.valueUSD")} * (USD/ARS)
            </label>
            <input
              type="number"
              id="valorUSD"
              value={valorUSD}
              onChange={(e) => setValorUSD(e.target.value)}
              step="0.01"
              min="0"
              required
              placeholder="1225.00"
            />
            <small className="form-hint">
              Tipo de cambio USD/ARS para calcular la ganancia
            </small>
          </div>

          {precioAlquilerARS &&
            valorUSD &&
            !isNaN(parseFloat(precioAlquilerARS)) &&
            !isNaN(parseFloat(valorUSD)) &&
            parseFloat(valorUSD) > 0 && (
              <div className="form-preview">
                <strong>Ganancia calculada:</strong>{" "}
                {new Intl.NumberFormat("es-ES", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(parseFloat(precioAlquilerARS) / parseFloat(valorUSD))}
              </div>
            )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              {t("common.cancel")}
            </button>
            <button type="submit" className="btn-save">
              {rentalIncome ? t("common.update") : t("common.add")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRentalIncomeModal;
