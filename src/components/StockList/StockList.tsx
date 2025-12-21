import { StockListProps } from "./types";
import { useTranslation } from "../../i18n/hooks";

function StockList({
  stocks,
  selectedStock,
  onSelectStock,
  onDeleteStock,
}: StockListProps) {
  const { t } = useTranslation();

  return (
    <div className="stock-list">
      {stocks.length === 0 ? (
        <div className="empty-list">{t("stockList.empty")}</div>
      ) : (
        stocks.map((stock) => (
          <div
            key={stock.id}
            className={`stock-item ${
              selectedStock?.id === stock.id ? "selected" : ""
            }`}
            onClick={() => onSelectStock(stock)}
          >
            <div className="stock-info">
              <div className="stock-symbol">{stock.symbol}</div>
              <div className="stock-name">{stock.name}</div>
            </div>
            <button
              className="btn-delete-small"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStock(stock.id!);
              }}
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default StockList;

