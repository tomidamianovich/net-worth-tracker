import { useState, useEffect } from "react";
import { Asset } from "../../../electron/preload";
import { PortfolioAsset, AssetData, Category } from "./types";
import { useTranslation } from "../../i18n/hooks";
import "./AnalysisView.css";

function AnalysisView() {
  const { t } = useTranslation();
  const [assets, setAssets] = useState<PortfolioAsset[]>([]);
  const [loading, setLoading] = useState(true);
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
      if (!window.electronAPI?.getAssets) {
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

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatPercentage = (value: number): string => `${value.toFixed(1)}%`;

  const renderPieChart = (data: AssetData[]) => {
    if (data.length === 0) return null;

    const size = 450;
    const radius = size / 2 - 30;
    const centerX = size / 2;
    const centerY = size / 2;
    const labelRadius = radius * 0.65; // Position labels at 65% of radius

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

  if (loading) {
    return (
      <div className="analysis-loading">
        <div className="loading-spinner"></div>
        <p>{t("analysis.loading")}</p>
      </div>
    );
  }

  const assetDistribution = calculateAssetDistribution();
  const totalPortfolio = assets.reduce(
    (sum, asset) => sum + asset.totalActual,
    0
  );

  return (
    <div className="analysis-view">
      <div className="analysis-header">
        <h1>{t("analysis.title")}</h1>
        <p className="analysis-subtitle">{t("analysis.subtitle")}</p>
      </div>

      {assets.length === 0 ? (
        <div className="analysis-empty">
          <p>{t("analysis.empty")}</p>
        </div>
      ) : (
        <div className="analysis-content">
          <div className="analysis-chart-wrapper">
            <div className="analysis-chart-container">
              {renderPieChart(assetDistribution)}
            </div>
          </div>

          <div className="analysis-right-column">
            <div className="analysis-total">
              <div className="analysis-total-label">{t("analysis.totalPortfolio")}</div>
              <div className="analysis-total-value">
                {formatCurrency(totalPortfolio)}
              </div>
            </div>

            <div className="analysis-legend">
              <h2>{t("analysis.distribution")}</h2>
              <div className="legend-items">
                {assetDistribution.map((item) => (
                  <div key={item.tipo} className="analysis-legend-item">
                    <div
                      className="legend-color"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="legend-info">
                      <div className="legend-name">{item.concepto}</div>
                      <div className="legend-details">
                        {formatCurrency(item.total)} •{" "}
                        {formatPercentage(item.porcentaje)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalysisView;

