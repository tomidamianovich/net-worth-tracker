import { useState, useEffect } from "react";
import { Asset } from "../../../electron/preload";
import { FaBitcoin, FaEuroSign, FaEthereum } from "react-icons/fa";
import { AiOutlineGold } from "react-icons/ai";
import { CiBank } from "react-icons/ci";
import EditAssetModal from "../EditAssetModal";
import { PortfolioAsset, FilterType, Category, AssetData } from "./types";
import { useTranslation } from "../../i18n/hooks";
import { useBlur } from "../../contexts/BlurContext";
import "./PortfolioTable.css";

function PortfolioTable() {
  const { t } = useTranslation();
  const { isBlurred } = useBlur();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("Todos");
  const [categories, setCategories] = useState<Category[]>([]);
  const [updatingAssetId, setUpdatingAssetId] = useState<number | null>(null);

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

  const getTipoColor = (tipo: string): string => {
    const category = categories.find((cat) => cat.tipo === tipo);
    return category ? category.color : "#808080";
  };

  const getTipoName = (tipo: string): string => {
    const category = categories.find((cat) => cat.tipo === tipo);
    return category ? category.nombre : tipo;
  };

  const calculateAssetDistribution = (): AssetData[] => {
    const totalPortfolio = assets.reduce(
      (sum, asset) => sum + asset.totalActual,
      0
    );
    const tipoMap = new Map<string, number>();

    assets.forEach((asset) => {
      const tipo = asset.tipo || "ACCION";
      tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + asset.totalActual);
    });

    return Array.from(tipoMap.entries())
      .map(([tipo, total]) => ({
        concepto: getTipoName(tipo),
        tipo: tipo as AssetData["tipo"],
        total,
        porcentaje: totalPortfolio > 0 ? (total / totalPortfolio) * 100 : 0,
        color: getTipoColor(tipo),
      }))
      .sort((a, b) => b.total - a.total);
  };

  const renderPieChart = (data: AssetData[]) => {
    if (data.length === 0) return null;

    const size = 250;
    const radius = size / 2 - 30;
    const centerX = size / 2;
    const centerY = size / 2;
    const labelRadius = radius * 0.65;

    let currentAngle = -90;

    const segments = data.map((item) => {
      const angle = (item.porcentaje / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      const midAngle = (startAngle + endAngle) / 2;
      currentAngle = endAngle;

      const startAngleRad = (startAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;
      const midAngleRad = (midAngle * Math.PI) / 180;

      const x1 = centerX + radius * Math.cos(startAngleRad);
      const y1 = centerY + radius * Math.sin(startAngleRad);
      const x2 = centerX + radius * Math.cos(endAngleRad);
      const y2 = centerY + radius * Math.sin(endAngleRad);

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}`,
        "Z",
      ].join(" ");

      const labelX = centerX + labelRadius * Math.cos(midAngleRad);
      const labelY = centerY + labelRadius * Math.sin(midAngleRad);
      let textRotation = midAngle;
      if (textRotation > 90 && textRotation < 270) textRotation += 180;

      const label =
        item.concepto.length > 15
          ? item.concepto.substring(0, 12) + "..."
          : item.concepto;

      const showLabel = item.porcentaje > 2;

      return {
        path: (
          <path
            key={item.tipo}
            d={pathData}
            fill={item.color}
            stroke="#ffffff"
            strokeWidth="2"
          />
        ),
        label: showLabel ? (
          <text
            key={`label-${item.tipo}`}
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#1d1d1f"
            fontSize="12"
            fontWeight="500"
            transform={`rotate(${textRotation}, ${labelX}, ${labelY})`}
            style={{ pointerEvents: "none" }}
          >
            {label}
          </text>
        ) : null,
      };
    });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((s) => s.path)}
        {segments.map((s) => s.label)}
      </svg>
    );
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

  const handleDelete = async (id: number | undefined) => {
    if (!id) {
      alert(t("assetModal.errorDeleting"));
      return;
    }

    if (!confirm(t("portfolio.asset.deleteConfirm"))) return;

    try {
      if (!window.electronAPI?.deleteAsset) {
        alert("electronAPI is not available");
        return;
      }
      const result = await window.electronAPI.deleteAsset(id);
      if (!result) {
        throw new Error("Failed to delete asset");
      }
      await loadAssets();
    } catch (error) {
      console.error("Error deleting asset:", error);
      alert(t("assetModal.errorDeleting"));
    }
  };

  const canUpdateAsset = (asset: PortfolioAsset): boolean => {
    if (asset.tipo === "CRIPTO") {
      const symbol = getAssetSymbol(asset.concepto);
      const concepto = asset.concepto.toUpperCase();
      return (
        isBitcoin(asset.tipo, symbol, asset.concepto) ||
        isEthereum(asset.tipo, symbol, asset.concepto) ||
        concepto.includes("LTC") ||
        concepto.includes("XRP") ||
        concepto.includes("ADA") ||
        concepto.includes("DOT") ||
        concepto.includes("SOL") ||
        concepto.includes("MATIC")
      );
    }
    if (asset.tipo === "ETF" || asset.tipo === "ACCION") {
      const symbol = getAssetSymbol(asset.concepto);
      return isGold(symbol, asset.concepto);
    }
    return false;
  };

  const handleUpdateAsset = async (asset: PortfolioAsset) => {
    if (!asset.id) {
      alert(t("assetModal.errorUpdating") || "Error: Asset ID not found");
      return;
    }

    setUpdatingAssetId(asset.id);

    try {
      if (!window.electronAPI) {
        alert(t("messages.electronNotAvailable"));
        return;
      }

      if (asset.tipo === "CRIPTO") {
        if (!window.electronAPI.updateAssetWithCryptoPrice) {
          alert(
            t("assetModal.updateNotSupported") || "Crypto update not available"
          );
          return;
        }
        await window.electronAPI.updateAssetWithCryptoPrice(asset.id);
      } else if (isGold(getAssetSymbol(asset.concepto), asset.concepto)) {
        if (!window.electronAPI.updateAssetWithGoldPrice) {
          alert(
            t("assetModal.updateNotSupported") || "Gold update not available"
          );
          return;
        }
        await window.electronAPI.updateAssetWithGoldPrice(asset.id);
      } else {
        alert(
          t("assetModal.updateNotSupported") ||
            "Update not supported for this asset type"
        );
        return;
      }

      await loadAssets();
    } catch (error) {
      console.error("Error updating asset:", error);
      alert(
        t("assetModal.errorUpdating") ||
          `Error updating asset: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
      );
    } finally {
      setUpdatingAssetId(null);
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

  const totalPortfolioFiltered = filteredAssets.reduce(
    (sum, asset) => sum + asset.totalActual,
    0
  );

  const filteredAssetsWithRecalculatedPercentage = filteredAssets
    .map((asset) => ({
      ...asset,
      porcentajeCartera:
        totalPortfolioFiltered !== 0
          ? (asset.totalActual / totalPortfolioFiltered) * 100
          : 0,
    }))
    .sort((a, b) => b.porcentajeCartera - a.porcentajeCartera);

  const getCategoryCount = (filterType: FilterType): number => {
    if (filterType === "Todos") return assets.length;
    return assets.filter(
      (asset) =>
        (asset.tipo || "ACCION").trim().toUpperCase() ===
        filterType.trim().toUpperCase()
    ).length;
  };

  const totalPortfolioCompleto = assets.reduce(
    (sum, asset) => sum + asset.totalActual,
    0
  );

  const totalVariacion = filteredAssetsWithRecalculatedPercentage.reduce(
    (sum, asset) => sum + asset.variacionEur,
    0
  );
  const totalValorInicial = filteredAssetsWithRecalculatedPercentage.reduce(
    (sum, asset) => sum + asset.cantidad * asset.valor,
    0
  );
  const totalVariacionPercentCalc =
    totalValorInicial !== 0 ? (totalVariacion / totalValorInicial) * 100 : 0;
  const totalPortfolio = totalPortfolioFiltered;
  const portfolioPercentage =
    filter === "Todos"
      ? 100
      : totalPortfolioCompleto !== 0
      ? (totalPortfolioFiltered / totalPortfolioCompleto) * 100
      : 0;

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
      <div className="view-header portfolio-header">
        <div className="view-header-text portfolio-header-text">
          <h1>{t("portfolio.title")}</h1>
          <p className="view-subtitle portfolio-subtitle">
            {t("portfolio.subtitle")}
          </p>
        </div>
      </div>
      <div className="portfolio-summary-section">
        <div className="portfolio-summary-card">
          <div className="summary-main">
            <div className="summary-label">{t("portfolio.totalValue")}</div>
            <div className={`summary-value ${isBlurred ? "blur-values" : ""}`}>
              {formatCurrency(totalPortfolio)}
            </div>
          </div>
          <div className="summary-details-row">
            <div className="summary-detail">
              <span className="detail-label">{t("portfolio.variation")} %</span>
              <div
                className={`detail-value variation-percent ${
                  totalVariacionPercentCalc > 0
                    ? "positive"
                    : totalVariacionPercentCalc < 0
                    ? "negative"
                    : ""
                } ${isBlurred ? "blur-values" : ""}`}
              >
                <svg
                  width="14"
                  height="14"
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
            <div className="summary-detail">
              <span className="detail-label">{t("portfolio.variation")} €</span>
              <span
                className={`detail-value ${
                  totalVariacion > 0
                    ? "positive"
                    : totalVariacion < 0
                    ? "negative"
                    : ""
                } ${isBlurred ? "blur-values" : ""}`}
              >
                {formatCurrencyWithSign(totalVariacion)}
              </span>
            </div>
            <div className="summary-detail">
              <span className="detail-label">
                {t("portfolio.portfolioPercentage")}
              </span>
              <span className="detail-value">
                {formatNumber(portfolioPercentage, 2)}%
              </span>
            </div>
          </div>
        </div>

        {assets.length > 0 && (
          <div className="portfolio-analysis-section">
            <div className="analysis-right-column">
              <div className="analysis-legend">
                <h2>{t("analysis.distribution")}</h2>
                <div className="legend-items">
                  {calculateAssetDistribution().map((item) => (
                    <div key={item.tipo} className="analysis-legend-item">
                      <div
                        className="legend-color"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <div className="legend-info">
                        <div className="legend-name">{item.concepto}</div>
                        <div
                          className={`legend-details ${
                            isBlurred ? "blur-values" : ""
                          }`}
                        >
                          {formatCurrency(item.total)} •{" "}
                          {formatNumber(item.porcentaje, 1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="analysis-chart-wrapper">
              <div className="analysis-chart-container">
                {renderPieChart(calculateAssetDistribution())}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="portfolio-actions-container">
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
                className={`filter-btn ${
                  filter === filterType ? "active" : ""
                } ${isDisabled ? "disabled" : ""}`}
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

      <div className="portfolio-assets">
        {filteredAssetsWithRecalculatedPercentage.map((asset) => {
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
                    <div
                      className={`asset-details ${
                        isBlurred ? "blur-values" : ""
                      }`}
                    >
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
                <div className="asset-metrics">
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.portfolioPercentage")}
                    </span>
                    <span
                      className={`metric-value ${
                        isBlurred ? "blur-values" : ""
                      }`}
                    >
                      {formatNumber(asset.porcentajeCartera, 1)}%
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.initialInvestment")}
                    </span>
                    <span
                      className={`metric-value ${
                        isBlurred ? "blur-values" : ""
                      }`}
                    >
                      {formatCurrency(asset.cantidad * asset.valor)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.purchaseValue")}
                    </span>
                    <span
                      className={`metric-value ${
                        isBlurred ? "blur-values" : ""
                      }`}
                    >
                      {formatCurrency(asset.valor)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.currentValue")}
                    </span>
                    <span
                      className={`metric-value ${
                        isBlurred ? "blur-values" : ""
                      }`}
                    >
                      {formatCurrency(asset.valor_unitario)}
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.variation")} %
                    </span>
                    <div className="metric-value-row">
                      <span
                        className={`metric-value ${
                          asset.variacion > 0
                            ? "positive"
                            : asset.variacion < 0
                            ? "negative"
                            : ""
                        } ${isBlurred ? "blur-values" : ""}`}
                      >
                        {asset.variacion > 0 ? "+" : ""}
                        {formatNumber(asset.variacion, 2)}%
                      </span>
                    </div>
                  </div>
                  <div className="metric">
                    <span className="metric-label">
                      {t("portfolio.asset.variation")} €
                    </span>
                    <div className="metric-value-row">
                      <span
                        className={`metric-value ${
                          asset.variacionEur > 0
                            ? "positive"
                            : asset.variacionEur < 0
                            ? "negative"
                            : ""
                        } ${isBlurred ? "blur-values" : ""}`}
                      >
                        {formatCurrencyWithSign(asset.variacionEur)}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`asset-value ${isBlurred ? "blur-values" : ""}`}
                >
                  {formatCurrency(asset.totalActual)}
                </div>
                <div className="asset-actions">
                  <button
                    className="asset-action-btn-icon"
                    onClick={() => handleUpdateAsset(asset)}
                    disabled={
                      updatingAssetId === asset.id ||
                      !asset.id ||
                      !canUpdateAsset(asset)
                    }
                    title={
                      t("portfolio.asset.updatePrice") || "Actualizar precio"
                    }
                  >
                    {updatingAssetId === asset.id ? (
                      <div className="loading-spinner-small"></div>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                      </svg>
                    )}
                  </button>
                  <button
                    className="asset-action-btn-icon"
                    onClick={() => handleEdit(asset)}
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
                    className="asset-action-btn-icon delete"
                    onClick={() => handleDelete(asset.id)}
                    disabled={!asset.id}
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
            </div>
          );
        })}
        {filteredAssetsWithRecalculatedPercentage.length === 0 && (
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
