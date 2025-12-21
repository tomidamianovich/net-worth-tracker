import { StockDetailProps } from "./types";
import { useTranslation } from "../../i18n/hooks";

function StockDetail({
  stock,
  movements,
  onAddMovement,
  onDeleteMovement,
}: StockDetailProps) {
  const { t } = useTranslation();

  return (
    <div className="stock-detail">
      <div className="stock-detail-header">
        <h2>
          {stock.symbol} - {stock.name}
        </h2>
        <button className="btn btn-primary" onClick={onAddMovement}>
          + {t("stockDetail.addMovement")}
        </button>
      </div>
      <div className="movements-list">
        <h3>{t("stockDetail.movements")}</h3>
        {movements.length === 0 ? (
          <p>{t("stockDetail.empty")}</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>{t("stockDetail.date")}</th>
                <th>{t("stockDetail.type")}</th>
                <th>{t("stockDetail.quantity")}</th>
                <th>{t("stockDetail.price")}</th>
                <th>{t("stockDetail.fees")}</th>
                <th>{t("stockDetail.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>{movement.date}</td>
                  <td>
                    {movement.type === "buy"
                      ? t("movementModal.typeBuy")
                      : t("movementModal.typeSell")}
                  </td>
                  <td>{movement.quantity}</td>
                  <td>{movement.price.toFixed(2)} €</td>
                  <td>{movement.fees?.toFixed(2) || "0.00"} €</td>
                  <td>
                    <button
                      onClick={() => onDeleteMovement(movement.id!)}
                      className="btn-delete-small"
                    >
                      {t("common.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default StockDetail;

