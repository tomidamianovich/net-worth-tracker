import { useState, useEffect } from "react";
import { Asset } from "../../../electron/preload";
import { FaBitcoin, FaEuroSign, FaEthereum } from "react-icons/fa";
import { AiOutlineGold } from "react-icons/ai";
import { CiBank } from "react-icons/ci";
import EditAssetModal from "../EditAssetModal";
import { PortfolioAsset, FilterType, Category } from "./types";
import { useTranslation } from "../../i18n/hooks";
import "./PortfolioTable.css";

function PortfolioTable() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadAssets();
    loadCategories();
  }, []);

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

  const loadAssets = async () => {
    try {
      if (typeof window === "undefined" || !window.electronAPI?.getAssets) {
        setLoading(false);
        setAssets([]);
        return;
      }
      const data = await window.electronAPI.getAssets();
      setAssets(calculatePortfolioData(data));
    } catch (error) {
      console.error("Error loading assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetSymbol = (concepto: string): string => {
    const match = concepto.match(/\(([^)]+)\)/);
    return match ? match[1] : concepto.substring(0, 4).toUpperCase();
  };

  const isBitcoin = (
    tipo: string,
    symbol: string,
    concepto: string
  ): boolean => {
    const upperSymbol = symbol.toUpperCase();
    const upperConcepto = concepto.toUpperCase();
    return (
      tipo === "CRIPTO" &&
      (upperSymbol === "BTC" ||
        upperConcepto.includes("BITCOIN") ||
        upperConcepto.includes("BTC"))
    );
  };

  const isEthereum = (
    tipo: string,
    symbol: string,
    concepto: string
  ): boolean => {
    const upperSymbol = symbol.toUpperCase();
    const upperConcepto = concepto.toUpperCase();
    return (
      tipo === "CRIPTO" &&
      (upperSymbol === "ETH" ||
        upperConcepto.includes("ETHEREUM") ||
        upperConcepto.includes("ETH"))
    );
  };

  const isGold = (symbol: string, concepto: string): boolean => {
    const upperSymbol = symbol.toUpperCase();
    const upperConcepto = concepto.toUpperCase();
    return (
      upperSymbol === "GOLD" ||
      upperSymbol === "ORO" ||
      upperConcepto.includes("GOLD") ||
      upperConcepto.includes("ORO")
    );
  };

  const isBank = (symbol: string, concepto: string): boolean => {
    const upperSymbol = symbol.toUpperCase();
    const upperConcepto = concepto.toUpperCase();
    return (
      upperSymbol === "BANK" ||
      upperConcepto.includes("BANCO") ||
      upperConcepto.includes("BANK") ||
      upperConcepto.includes("DEPOSITO") ||
      upperConcepto.includes("DEPÓSITO")
    );
  };

  const getAssetName = (concepto: string): string => {
    const match = concepto.match(/^([^(]+)/);
    return match ? match[1].trim() : concepto;
  };

  const getAssetIconColor = (
    tipo: "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO",
    symbol: string,
    concepto: string
  ): string => {
    if (isEthereum(tipo, symbol, concepto)) return "#497493";
    const category = categories.find((cat) => cat.tipo === tipo);
    if (category) return category.color;
    if (symbol === "TSLA") return "#5ac8fa";
    return "#808080";
  };

  const getTipoDisplayName = (tipo: string): string => {
    if (tipo === "Todos") return t("portfolio.filters.all");
    const category = categories.find((cat) => cat.tipo === tipo);
    return category ? category.nombre : tipo;
  };

  const calculatePortfolioData = (rawAssets: Asset[]): PortfolioAsset[] => {
    const totalPortfolio = rawAssets.reduce(
      (sum, asset) => sum + asset.cantidad * asset.valor_unitario,
      0
    );

    return rawAssets.map((asset) => {
      const totalActual = asset.cantidad * asset.valor_unitario;
      const valorInicial = asset.cantidad * asset.valor;
      const variacionEur = totalActual - valorInicial;
      const variacion =
        valorInicial !== 0 ? (variacionEur / valorInicial) * 100 : 0;
      const porcentajeCartera =
        totalPortfolio !== 0 ? (totalActual / totalPortfolio) * 100 : 0;

      return {
        ...asset,
        variacion,
        variacionEur,
        totalActual,
        porcentajeCartera,
      };
    });
  };

  const handleEdit = (asset: PortfolioAsset) => {
    setEditingAsset(asset);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("portfolio.asset.deleteConfirm"))) return;

    try {
      if (!window.electronAPI?.deleteAsset) {
        alert("electronAPI is not available");
        return;
      }
      await window.electronAPI.deleteAsset(id);
      await loadAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert(t("assetModal.errorDeleting"));
    }
  };

  const handleSave = async (
    asset: Omit<Asset, "id" | "createdAt" | "updatedAt"> | Asset
  ) => {
    if (
      !asset.concepto?.trim() ||
      asset.cantidad <= 0 ||
      asset.valor < 0 ||
      asset.valor_unitario < 0
    ) {
      alert(t("assetModal.validation.allFieldsRequired"));
      return;
    }

    if (!window.electronAPI) {
      alert(t("messages.electronNotAvailable"));
      return;
    }

    try {
      const assetData = {
        concepto: asset.concepto,
        cantidad: asset.cantidad,
        valor: asset.valor,
        valor_unitario: asset.valor_unitario,
        tipo: asset.tipo,
      };

      if ("id" in asset && asset.id) {
        await window.electronAPI.updateAsset(asset.id, assetData);
      } else {
        await window.electronAPI.addAsset(assetData);
      }
      await loadAssets();
      setEditingAsset(null);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error saving asset:", error);
      alert(
        `${t("assetModal.errorSaving")}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatCurrencyWithSign = (value: number): string =>
    `${value > 0 ? "+" : ""}${formatCurrency(value)}`;

  const formatNumber = (value: number, decimals: number = 2): string =>
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

  const formatPercentage = (value: number): string =>
    `${value > 0 ? "+" : ""}${formatNumber(value, 2)}%`;

  const filteredAssets = assets.filter((asset) => {
    if (filter === "Todos") return true;
    return (
      (asset.tipo || "ACCION").trim().toUpperCase() ===
      filter.trim().toUpperCase()
    );
  });

  const getCategoryCount = (filterType: FilterType): number => {
    if (filterType === "Todos") return assets.length;
    return assets.filter(
      (asset) =>
        (asset.tipo || "ACCION").trim().toUpperCase() ===
        filterType.trim().toUpperCase()
    ).length;
  };

  const totalVariacion = filteredAssets.reduce(
    (sum, asset) => sum + asset.variacionEur,
    0
  );
  const totalValorInicial = filteredAssets.reduce(
    (sum, asset) => sum + asset.cantidad * asset.valor,
    0
  );
  const totalVariacionPercentCalc =
    totalValorInicial !== 0 ? (totalVariacion / totalValorInicial) * 100 : 0;
  const totalPortfolio = filteredAssets.reduce(
    (sum, asset) => sum + asset.totalActual,
    0
  );

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <div className="portfolio-header-text">
          <h1>{t("portfolio.title")}</h1>
          <p className="portfolio-subtitle">{t("portfolio.subtitle")}</p>
        </div>
        <button
          className="btn-add-circular"
          onClick={() => setShowAddModal(true)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      <div className="portfolio-summary-card">
        <div className="summary-main">
          <div className="summary-label">{t("portfolio.totalValue")}</div>
          <div className="summary-value">{formatCurrency(totalPortfolio)}</div>
          <div
            className={`summary-change ${
              totalVariacionPercentCalc > 0
                ? "positive"
                : totalVariacionPercentCalc < 0
                ? "negative"
                : ""
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            {formatPercentage(totalVariacionPercentCalc)}
          </div>
        </div>
        <div className="summary-details">
          <div className="summary-detail">
            <span className="detail-label">{t("portfolio.variation")}</span>
            <span
              className={`detail-value ${
                totalVariacion > 0
                  ? "positive"
                  : totalVariacion < 0
                  ? "negative"
                  : ""
              }`}
            >
              {formatCurrencyWithSign(totalVariacion)}
            </span>
          </div>
          <div className="summary-detail">
            <span className="detail-label">
              {t("portfolio.portfolioPercentage")}
            </span>
            <span className="detail-value">100,00%</span>
          </div>
        </div>
      </div>

      <div className="portfolio-filters">
        {(
          [
            "Todos",
            "ACCION",
            "ETF",
            "CRIPTO",
            "FIAT",
            "DEPOSITO",
          ] as FilterType[]
        ).map((filterType) => {
          const count = getCategoryCount(filterType);
          const isDisabled = count === 0;
          return (
            <button
              key={filterType}
              className={`filter-btn ${filter === filterType ? "active" : ""} ${
                isDisabled ? "disabled" : ""
              }`}
              onClick={() => setFilter(filterType)}
              disabled={isDisabled}
            >
              {filterType === "Todos"
                ? `${t("portfolio.filters.all")} (${count})`
                : `${getTipoDisplayName(filterType)} (${count})`}
            </button>
          );
        })}
      </div>

      <div className="portfolio-assets">
        {filteredAssets.map((asset) => {
          const symbol = getAssetSymbol(asset.concepto);
          const name = getAssetName(asset.concepto);
          const iconColor = getAssetIconColor(
            asset.tipo,
            symbol,
            asset.concepto
          );

          return (
            <div key={asset.id} className="asset-card">
              <div className="asset-card-left">
                <div
                  className="asset-icon"
                  style={{ backgroundColor: iconColor }}
                >
                  {isBitcoin(asset.tipo, symbol, asset.concepto) ? (
                    <FaBitcoin size={24} />
                  ) : isEthereum(asset.tipo, symbol, asset.concepto) ? (
                    <FaEthereum size={24} />
                  ) : isGold(symbol, asset.concepto) ? (
                    <AiOutlineGold size={24} />
                  ) : asset.tipo === "FIAT" ? (
                    <FaEuroSign size={24} />
                  ) : asset.tipo === "DEPOSITO" ||
                    isBank(symbol, asset.concepto) ? (
                    <CiBank size={24} />
                  ) : (
                    symbol
                  )}
                </div>
                <div className="asset-info">
                  <div className="asset-name">{name}</div>
                  {asset.cantidad !== 1 && (
                    <div className="asset-details">
                      {formatNumber(
                        asset.cantidad,
                        asset.tipo === "CRIPTO" ? 5 : asset.cantidad < 1 ? 2 : 0
                      )}{" "}
                      {symbol} • {formatCurrency(asset.valor_unitario)}
                    </div>
                  )}
                </div>
              </div>
              <div className="asset-card-right">
                <div className="asset-value">
                  {formatCurrency(asset.totalActual)}
                </div>
                <div
                  className={`asset-change ${
                    asset.variacion > 0
                      ? "positive"
                      : asset.variacion < 0
                      ? "negative"
                      : ""
                  }`}
                >
                  {asset.variacion > 0 ? "• " : ""}
                  {formatPercentage(asset.variacion)}
                </div>
                <div className="asset-metrics">
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.portfolioPercentage")}
                    </span>
                    <span className="metric-value">
                      {formatNumber(asset.porcentajeCartera, 1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.cost")}
                    </span>
                    <span className="metric-value">
                      {formatCurrency(asset.cantidad * asset.valor)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.purchaseValue")}
                    </span>
                    <span className="metric-value">
                      {formatCurrency(asset.valor)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.currentValue")}
                    </span>
                    <span className="metric-value">
                      {formatCurrency(asset.valor_unitario)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.variation")}
                    </span>
                    <span
                      className={`metric-value ${
                        asset.variacionEur > 0
                          ? "positive"
                          : asset.variacionEur < 0
                          ? "negative"
                          : ""
                      }`}
                    >
                      {formatCurrencyWithSign(asset.variacionEur)}
                    </span>
                  </div>
                </div>
                <div className="asset-actions">
                  <button
                    className="asset-action-btn"
                    onClick={() => handleEdit(asset)}
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    className="asset-action-btn delete"
                    onClick={() => handleDelete(asset.id!)}
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {filteredAssets.length === 0 && (
          <div className="empty-portfolio">
            <p>{t("portfolio.empty")}</p>
          </div>
        )}
      </div>

      {editingAsset && (
        <EditAssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onSave={handleSave}
        />
      )}

      {showAddModal && (
        <EditAssetModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default PortfolioTable;
