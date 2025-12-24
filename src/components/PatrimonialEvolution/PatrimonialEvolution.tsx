import { useState, useEffect } from "react";
import {
  PatrimonialEvolution as PatrimonialEvolutionRecord,
  PatrimonialEvolutionFormData,
} from "./types";
import { useTranslation } from "../../i18n/hooks";
import { useBlur } from "../../contexts/BlurContext";
import "./PatrimonialEvolution.css";

function PatrimonialEvolution() {
  const { t } = useTranslation();
  const { isBlurred } = useBlur();
  const [records, setRecords] = useState<PatrimonialEvolutionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] =
    useState<PatrimonialEvolutionRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<PatrimonialEvolutionFormData>({
    año: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    dia: new Date().getDate(),
    patrimonio: "",
    detalle: "",
  });

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

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      if (!window.electronAPI?.getPatrimonialEvolution) {
        setLoading(false);
        setRecords([]);
        return;
      }
      const data = await window.electronAPI.getPatrimonialEvolution();
      setRecords(data);
    } catch (error) {
      console.error("Error loading patrimonial evolution:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: PatrimonialEvolutionRecord) => {
    setEditingRecord(record);
    setFormData({
      año: record.año,
      mes: record.mes,
      dia: record.dia,
      patrimonio: record.patrimonio.toString(),
      detalle: record.detalle || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("evolution.deleteConfirm"))) {
      return;
    }

    try {
      if (!window.electronAPI?.deletePatrimonialEvolution) {
        alert(t("messages.electronNotAvailable"));
        return;
      }
      await window.electronAPI.deletePatrimonialEvolution(id);
      await loadRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
      alert(
        `${t("evolution.errorDeleting")}: ${
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
      const patrimonioNum = parseFloat(formData.patrimonio);
      if (isNaN(patrimonioNum) || patrimonioNum < 0) {
        alert(t("evolution.patrimonyPositive"));
        return;
      }

      if (editingRecord?.id) {
        await window.electronAPI.updatePatrimonialEvolution(editingRecord.id, {
          año: formData.año,
          mes: formData.mes,
          dia: formData.dia,
          patrimonio: patrimonioNum,
          detalle: formData.detalle.trim() || undefined,
        });
      } else {
        await window.electronAPI.addPatrimonialEvolution({
          año: formData.año,
          mes: formData.mes,
          dia: formData.dia,
          patrimonio: patrimonioNum,
          detalle: formData.detalle.trim() || undefined,
        });
      }

      await loadRecords();
      setShowAddModal(false);
      setEditingRecord(null);
      setFormData({
        año: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        dia: new Date().getDate(),
        patrimonio: "",
        detalle: "",
      });
    } catch (error) {
      console.error("Error saving record:", error);
      alert(
        `${t("evolution.errorSaving")}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingRecord(null);
    setFormData({
      año: new Date().getFullYear(),
      mes: new Date().getMonth() + 1,
      dia: new Date().getDate(),
      patrimonio: "",
      detalle: "",
    });
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const calculateVariation = (
    current: number,
    previous: number | null
  ): number | null => {
    if (previous === null) return null;
    return current - previous;
  };

  const groupByYear = (records: PatrimonialEvolutionRecord[]) => {
    const grouped: { [key: number]: PatrimonialEvolutionRecord[] } = {};
    records.forEach((record) => {
      if (!grouped[record.año]) {
        grouped[record.año] = [];
      }
      grouped[record.año].push(record);
    });
    return grouped;
  };

  const calculateYearStats = (yearRecords: PatrimonialEvolutionRecord[]) => {
    const sorted = [...yearRecords].sort((a, b) => {
      if (a.mes !== b.mes) return a.mes - b.mes;
      return a.dia - b.dia;
    });

    const variations = sorted
      .map((record, index) => {
        if (index === 0) return null;
        return record.patrimonio - sorted[index - 1].patrimonio;
      })
      .filter((v): v is number => v !== null);

    const avgVariation =
      variations.length > 0
        ? variations.reduce((sum, v) => sum + v, 0) / variations.length
        : 0;

    const totalAccumulated =
      sorted.length > 0
        ? sorted[sorted.length - 1].patrimonio - sorted[0].patrimonio
        : 0;

    return { avgVariation, totalAccumulated };
  };

  const prepareChartData = () => {
    const sorted = [...records].sort((a, b) => {
      if (a.año !== b.año) return a.año - b.año;
      if (a.mes !== b.mes) return a.mes - b.mes;
      return a.dia - b.dia;
    });

    return sorted.map((record) => ({
      date: `${record.año}-${String(record.mes).padStart(2, "0")}-${String(
        record.dia
      ).padStart(2, "0")}`,
      label: `${MONTHS[record.mes - 1]} ${record.año}`,
      patrimonio: record.patrimonio,
    }));
  };

  const renderChart = () => {
    const chartData = prepareChartData();
    if (chartData.length === 0) return null;

    const width = 800;
    const height = 400;
    const padding = { top: 40, right: 40, bottom: 60, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const minPatrimonio = Math.min(...chartData.map((d) => d.patrimonio));
    const maxPatrimonio = Math.max(...chartData.map((d) => d.patrimonio));
    const range = maxPatrimonio - minPatrimonio || 1;
    const yMin = minPatrimonio - range * 0.1;

    const points = chartData.map((d, index) => {
      const x =
        (index / (chartData.length - 1 || 1)) * chartWidth + padding.left;
      const y =
        height -
        padding.bottom -
        ((d.patrimonio - yMin) / (maxPatrimonio - yMin || 1)) * chartHeight;
      return { x, y, ...d };
    });

    const pathData =
      points.length > 0
        ? `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`
        : "";

    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => {
      const value = yMin + (range * 1.1 * i) / (yTicks - 1);
      return value;
    });

    return (
      <div className="chart-container">
        <h2>{t("evolution.chartTitle")}</h2>
        <svg width={width} height={height} className="chart-svg">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#007aff" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#007aff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <g className="chart-grid">
            {yTickValues.map((value, i) => {
              const y =
                height -
                padding.bottom -
                ((value - yMin) / (maxPatrimonio - yMin || 1)) * chartHeight;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#666"
                    className={isBlurred ? "blur-values" : ""}
                  >
                    {formatCurrency(value)}
                  </text>
                </g>
              );
            })}
          </g>

          <g className="chart-area">
            {pathData && (
              <path
                d={`${pathData} L ${points[points.length - 1].x},${
                  height - padding.bottom
                } L ${padding.left},${height - padding.bottom} Z`}
                fill="url(#lineGradient)"
              />
            )}
          </g>

          <g className="chart-line">
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="#007aff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </g>

          <g className="chart-points">
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="5"
                  fill="#007aff"
                  stroke="#fff"
                  strokeWidth="2"
                />
                <title>
                  {point.label}: {formatCurrency(point.patrimonio)}
                </title>
              </g>
            ))}
          </g>

          <g className="chart-x-axis">
            {points.map((point, index) => {
              if (
                index % Math.ceil(points.length / 6) !== 0 &&
                index !== points.length - 1
              )
                return null;
              return (
                <g key={index}>
                  <line
                    x1={point.x}
                    y1={height - padding.bottom}
                    x2={point.x}
                    y2={height - padding.bottom + 5}
                    stroke="#666"
                    strokeWidth="1"
                  />
                  <text
                    x={point.x}
                    y={height - padding.bottom + 20}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#666"
                    transform={`rotate(-45, ${point.x}, ${
                      height - padding.bottom + 20
                    })`}
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="patrimonial-loading">
        <div className="loading-spinner"></div>
        <p>{t("evolution.loading")}</p>
      </div>
    );
  }

  const groupedRecords = groupByYear(records);
  const sortedYears = Object.keys(groupedRecords)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="patrimonial-evolution">
      <div className="view-header patrimonial-header">
        <div className="view-header-text patrimonial-header-text">
          <h1>{t("evolution.title")}</h1>
          <p className="view-subtitle">
            {t("evolution.subtitle") || t("portfolio.subtitle")}
          </p>
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

      {records.length === 0 ? (
        <div className="patrimonial-empty">
          <p>{t("evolution.empty")}</p>
        </div>
      ) : (
        <>
          <div className="patrimonial-table-container">
            <table className="patrimonial-table">
              <thead>
                <tr>
                  <th>{t("evolution.year")}</th>
                  <th>{t("evolution.day")}</th>
                  <th>{t("evolution.month")}</th>
                  <th>{t("evolution.patrimony")}</th>
                  <th>{t("evolution.variation")}</th>
                  <th>{t("evolution.avgMonthlyVariation")}</th>
                  <th>{t("evolution.totalAccumulated")}</th>
                  <th>{t("evolution.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sortedYears.map((year) => {
                  const yearRecords = groupedRecords[year].sort((a, b) => {
                    if (a.mes !== b.mes) return a.mes - b.mes;
                    return a.dia - b.dia;
                  });
                  const stats = calculateYearStats(yearRecords);
                  let previousPatrimonio: number | null = null;

                  return yearRecords.map((record, index) => {
                    const variation = calculateVariation(
                      record.patrimonio,
                      previousPatrimonio
                    );
                    previousPatrimonio = record.patrimonio;

                    const isFirstInYear = index === 0;
                    const rowSpan = yearRecords.length;

                    return (
                      <tr key={record.id}>
                        {isFirstInYear && (
                          <td rowSpan={rowSpan} className="year-cell">
                            {year}
                          </td>
                        )}
                        <td>{record.dia}</td>
                        <td>{MONTHS[record.mes - 1]}</td>
                        <td
                          className={`patrimonio-cell ${
                            isBlurred ? "blur-values" : ""
                          }`}
                        >
                          {formatCurrency(record.patrimonio)}
                        </td>
                        <td
                          className={`variation-cell ${
                            variation === null
                              ? ""
                              : variation >= 0
                              ? "positive"
                              : "negative"
                          } ${isBlurred ? "blur-values" : ""}`}
                        >
                          {variation === null ? "-" : formatCurrency(variation)}
                        </td>
                        {isFirstInYear && (
                          <>
                            <td
                              rowSpan={rowSpan}
                              className={`avg-variation-cell ${
                                isBlurred ? "blur-values" : ""
                              }`}
                            >
                              {formatCurrency(stats.avgVariation)}
                            </td>
                            <td
                              rowSpan={rowSpan}
                              className={`total-accumulated-cell ${
                                stats.totalAccumulated >= 0 ? "positive" : ""
                              } ${isBlurred ? "blur-values" : ""}`}
                            >
                              {formatCurrency(stats.totalAccumulated)}
                            </td>
                          </>
                        )}
                        <td className="actions-cell">
                          <button
                            className="icon-btn"
                            onClick={() => handleEdit(record)}
                            title={t("common.edit")}
                          >
                            <svg
                              width="14"
                              height="14"
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
                            className="icon-btn delete-btn"
                            onClick={() => handleDelete(record.id!)}
                            title={t("common.delete")}
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>
          {renderChart()}
        </>
      )}

      {showAddModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingRecord ? t("evolution.edit") : t("evolution.addNew")}
              </h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="año">{t("evolution.year")} *</label>
                <input
                  type="number"
                  id="año"
                  value={formData.año}
                  onChange={(e) =>
                    setFormData({ ...formData, año: parseInt(e.target.value) })
                  }
                  required
                  min="2000"
                  max="2100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mes">{t("evolution.month")} *</label>
                <select
                  id="mes"
                  value={formData.mes}
                  onChange={(e) =>
                    setFormData({ ...formData, mes: parseInt(e.target.value) })
                  }
                  required
                >
                  {MONTHS.map((month, index) => (
                    <option key={index} value={index + 1}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dia">{t("evolution.day")} *</label>
                <input
                  type="number"
                  id="dia"
                  value={formData.dia}
                  onChange={(e) =>
                    setFormData({ ...formData, dia: parseInt(e.target.value) })
                  }
                  required
                  min="1"
                  max="31"
                />
              </div>

              <div className="form-group">
                <label htmlFor="patrimonio">{t("evolution.patrimony")} *</label>
                <input
                  type="number"
                  id="patrimonio"
                  value={formData.patrimonio}
                  onChange={(e) =>
                    setFormData({ ...formData, patrimonio: e.target.value })
                  }
                  required
                  step="0.01"
                  min="0"
                  placeholder={t("evolution.placeholder")}
                />
              </div>

              <div className="form-group">
                <label htmlFor="detalle">{t("evolution.detail")}</label>
                <input
                  type="text"
                  id="detalle"
                  value={formData.detalle}
                  onChange={(e) =>
                    setFormData({ ...formData, detalle: e.target.value })
                  }
                  placeholder={t("common.optional")}
                />
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
                  {editingRecord ? t("common.update") : t("common.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatrimonialEvolution;
