import { useState, useEffect } from "react";
import { useTranslation } from "../../i18n/hooks";
import { useBlur } from "../../contexts/BlurContext";
import { RentalIncome, RentalSummary } from "./types";
import AddRentalIncomeModal from "./AddRentalIncomeModal";
import "./PropertyInvestment.css";

function PropertyInvestment() {
  const { t } = useTranslation();
  const { isBlurred } = useBlur();
  const [incomes, setIncomes] = useState<RentalIncome[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<RentalIncome | null>(null);
  const [initialInvestment, setInitialInvestment] = useState<number>(0);
  const [isEditingInvestment, setIsEditingInvestment] = useState(false);
  const [tempInvestmentValue, setTempInvestmentValue] = useState<string>("");

  useEffect(() => {
    loadIncomes();
    loadInitialInvestment();
  }, []);

  const loadInitialInvestment = async () => {
    try {
      if (
        typeof window === "undefined" ||
        !window.electronAPI ||
        !window.electronAPI.getPropertyInitialInvestment
      ) {
        return;
      }
      const investment =
        await window.electronAPI.getPropertyInitialInvestment();
      setInitialInvestment(investment || 0);
    } catch (error) {
      console.error("Error loading initial investment:", error);
    }
  };

  const handleInvestmentClick = () => {
    setIsEditingInvestment(true);
    setTempInvestmentValue(initialInvestment.toString());
  };

  const handleInvestmentChange = (value: string) => {
    setTempInvestmentValue(value);
  };

  const handleInvestmentBlur = async () => {
    try {
      const numValue = parseFloat(tempInvestmentValue) || 0;
      setInitialInvestment(numValue);
      setIsEditingInvestment(false);

      if (
        typeof window === "undefined" ||
        !window.electronAPI ||
        !window.electronAPI.updatePropertyInitialInvestment
      ) {
        return;
      }
      await window.electronAPI.updatePropertyInitialInvestment(numValue);
    } catch (error) {
      console.error("Error updating initial investment:", error);
      alert(
        t("propertyInvestment.errorUpdatingInvestment") ||
          "Error al actualizar la inversión inicial"
      );
      setTempInvestmentValue(initialInvestment.toString());
      setIsEditingInvestment(false);
    }
  };

  const handleInvestmentKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      handleInvestmentBlur();
    } else if (e.key === "Escape") {
      setTempInvestmentValue(initialInvestment.toString());
      setIsEditingInvestment(false);
    }
  };

  const loadIncomes = async () => {
    try {
      if (
        typeof window === "undefined" ||
        !window.electronAPI ||
        !window.electronAPI.getRentalIncomes
      ) {
        setLoading(false);
        setIncomes([]);
        return;
      }
      const data = await window.electronAPI.getRentalIncomes();
      setIncomes(data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading rental incomes:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const formatARS = (value: number): string =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatNumber = (value: number, decimals: number = 2): string =>
    new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);

  const formatPercentage = (value: number): string =>
    `${value > 0 ? "+" : ""}${formatNumber(value, 2)}%`;

  const MONTHS_SHORT = [
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

  const getMonthName = (mes: number): string => {
    return MONTHS_SHORT[mes - 1] || "";
  };

  const groupByYear = (
    incomes: RentalIncome[]
  ): Map<number, RentalIncome[]> => {
    const grouped = new Map<number, RentalIncome[]>();
    incomes.forEach((income) => {
      const year = income.año;
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push(income);
    });
    grouped.forEach((yearIncomes) => {
      yearIncomes.sort((a, b) => a.mes - b.mes);
    });
    return grouped;
  };

  const calculateTotalAverage = (summaries: RentalSummary[]): number => {
    const total = summaries.reduce(
      (sum, summary) => sum + summary.promedioMensualUSD,
      0
    );
    return summaries.length > 0 ? total / summaries.length : 0;
  };

  const groupedIncomes = groupByYear(incomes);

  // Calculate summaries with annual growth percentage
  // If we don't have all 12 months, multiply the average by 12 to project the full year
  const summaries = Array.from(groupedIncomes.entries()).map(
    ([year, yearIncomes]) => {
      const gananciasAnualesUSD = yearIncomes.reduce(
        (sum, income) => sum + income.gananciaUSD,
        0
      );
      const promedioMensualUSD =
        yearIncomes.length > 0 ? gananciasAnualesUSD / yearIncomes.length : 0;

      // Project annual gains: if we don't have all 12 months, multiply average by 12
      const monthsCount = yearIncomes.length;
      const projectedAnnualGains =
        monthsCount < 12 ? promedioMensualUSD * 12 : gananciasAnualesUSD;

      // Calculate annual growth percentage based on initial investment
      const gananciaAnualizada =
        initialInvestment > 0
          ? (projectedAnnualGains / initialInvestment) * 100
          : 0;

      return {
        año: year,
        promedioMensualUSD,
        gananciasAnualesUSD,
        gananciaAnualizada,
      };
    }
  );
  const totalAverage = calculateTotalAverage(summaries);
  const totalFinal = summaries.reduce(
    (sum, summary) => sum + summary.gananciasAnualesUSD,
    0
  );

  // Get the most recent income for default values
  const getLastIncome = (): RentalIncome | null => {
    if (incomes.length === 0) return null;
    // Since incomes are now ordered ASC (año ASC, mes ASC), the last item is the most recent
    return incomes[incomes.length - 1];
  };

  const lastIncome = getLastIncome();

  if (loading) {
    return (
      <div className="property-loading">
        <div className="loading-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="property-container">
      <div className="view-header property-header">
        <div className="view-header-text property-header-text">
          <h1>{t("propertyInvestment.title")}</h1>
          <p className="view-subtitle property-subtitle">
            {t("propertyInvestment.subtitle")}
          </p>
          <div className="property-investment-input">
            <label>{t("propertyInvestment.initialInvestment")}:</label>
            {isEditingInvestment ? (
              <input
                type="number"
                value={tempInvestmentValue}
                onChange={(e) => handleInvestmentChange(e.target.value)}
                onBlur={handleInvestmentBlur}
                onKeyDown={handleInvestmentKeyDown}
                autoFocus
                step="0.01"
                min="0"
                className="investment-input"
              />
            ) : (
              <span
                className="investment-display"
                onClick={handleInvestmentClick}
                title={
                  t("propertyInvestment.clickToEdit") || "Click para editar"
                }
              >
                <span className={isBlurred ? "blur-values" : ""}>
                  {formatCurrency(initialInvestment)}
                </span>
              </span>
            )}
          </div>
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

      <div className="property-table-container">
        <table className="property-table">
          <thead>
            <tr>
              <th>{t("propertyInvestment.table.year")}</th>
              <th>{t("propertyInvestment.table.month")}</th>
              <th>{t("propertyInvestment.table.rentPrice")}</th>
              <th>{t("propertyInvestment.table.valueUSD")}</th>
              <th>{t("propertyInvestment.table.profitUSD")}</th>
              <th>{t("propertyInvestment.table.monthlyAverageUSD")}</th>
              <th>{t("propertyInvestment.table.annualProfitsUSD")}</th>
              <th>{t("propertyInvestment.table.annualizedProfit")}</th>
              <th>{t("propertyInvestment.table.totalAverage")}</th>
              <th>{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from(groupedIncomes.entries()).map(([year, yearIncomes]) => {
              const summary = summaries.find((s) => s.año === year);
              return (
                <>
                  {yearIncomes.map((income, index) => (
                    <tr key={`${year}-${income.mes}`}>
                      {index === 0 && (
                        <td rowSpan={yearIncomes.length} className="year-cell">
                          {year}
                        </td>
                      )}
                      <td>{getMonthName(income.mes)}</td>
                      <td className={isBlurred ? "blur-values" : ""}>
                        {formatARS(income.precioAlquilerARS)}
                      </td>
                      <td className={isBlurred ? "blur-values" : ""}>
                        {formatCurrency(income.valorUSD)}
                      </td>
                      <td className={isBlurred ? "blur-values" : ""}>
                        {formatCurrency(income.gananciaUSD)}
                      </td>
                      {index === 0 && (
                        <>
                          <td
                            rowSpan={yearIncomes.length}
                            className={`summary-cell ${
                              isBlurred ? "blur-values" : ""
                            }`}
                          >
                            {formatCurrency(summary?.promedioMensualUSD || 0)}
                          </td>
                          <td
                            rowSpan={yearIncomes.length}
                            className={`summary-cell ${
                              isBlurred ? "blur-values" : ""
                            }`}
                          >
                            {formatCurrency(summary?.gananciasAnualesUSD || 0)}
                          </td>
                          <td
                            rowSpan={yearIncomes.length}
                            className={`summary-cell ${
                              isBlurred ? "blur-values" : ""
                            }`}
                          >
                            {summary?.gananciaAnualizada
                              ? formatPercentage(summary.gananciaAnualizada)
                              : "-"}
                          </td>
                          <td
                            rowSpan={yearIncomes.length}
                            className={`summary-cell ${
                              isBlurred ? "blur-values" : ""
                            }`}
                          >
                            {year === summaries[summaries.length - 1]?.año
                              ? formatCurrency(totalAverage)
                              : "-"}
                          </td>
                        </>
                      )}
                      <td className="actions-cell">
                        <button
                          className="icon-btn"
                          onClick={() => {
                            setEditingIncome(income);
                            setShowAddModal(true);
                          }}
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
                          onClick={async () => {
                            if (
                              !confirm(
                                t("propertyInvestment.deleteConfirm") ||
                                  "¿Estás seguro de que quieres eliminar este ingreso?"
                              )
                            ) {
                              return;
                            }

                            if (!income.id) {
                              alert(
                                t("propertyInvestment.errorDeleting") ||
                                  "Error al eliminar"
                              );
                              return;
                            }

                            try {
                              if (
                                !window.electronAPI ||
                                !window.electronAPI.deleteRentalIncome
                              ) {
                                alert("electronAPI is not available");
                                return;
                              }
                              const result =
                                await window.electronAPI.deleteRentalIncome(
                                  income.id
                                );
                              if (!result) {
                                throw new Error(
                                  "Failed to delete rental income"
                                );
                              }
                              await loadIncomes();
                            } catch (error) {
                              console.error(
                                "Error deleting rental income:",
                                error
                              );
                              alert(
                                t("propertyInvestment.errorDeleting") ||
                                  "Error al eliminar ingreso"
                              );
                            }
                          }}
                          title={t("common.delete")}
                          disabled={!income.id}
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
                  ))}
                </>
              );
            })}
            {incomes.length === 0 && (
              <tr>
                <td colSpan={9} className="empty-cell">
                  {t("propertyInvestment.empty")}
                </td>
              </tr>
            )}
          </tbody>
          {incomes.length > 0 && (
            <tfoot>
              <tr className="total-row">
                <td colSpan={5} className="total-label">
                  {t("propertyInvestment.table.total")}
                </td>
                <td
                  className={`total-value ${isBlurred ? "blur-values" : ""}`}
                  colSpan={4}
                >
                  {formatCurrency(totalFinal)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {showAddModal && (
        <AddRentalIncomeModal
          rentalIncome={editingIncome || undefined}
          defaultValues={
            !editingIncome && lastIncome
              ? {
                  precioAlquilerARS: lastIncome.precioAlquilerARS,
                  valorUSD: lastIncome.valorUSD,
                }
              : undefined
          }
          onClose={() => {
            setShowAddModal(false);
            setEditingIncome(null);
          }}
          onSave={async (rentalIncome) => {
            try {
              if (!window.electronAPI) {
                alert("electronAPI is not available");
                return;
              }

              if (editingIncome?.id) {
                if (!window.electronAPI.updateRentalIncome) {
                  alert("updateRentalIncome is not available");
                  return;
                }
                await window.electronAPI.updateRentalIncome(
                  editingIncome.id,
                  rentalIncome
                );
              } else {
                if (!window.electronAPI.addRentalIncome) {
                  alert(
                    "addRentalIncome is not available. Please restart the application."
                  );
                  console.error(
                    "addRentalIncome function:",
                    window.electronAPI.addRentalIncome
                  );
                  return;
                }
                await window.electronAPI.addRentalIncome(rentalIncome);
              }
              await loadIncomes();
              setShowAddModal(false);
              setEditingIncome(null);
            } catch (error) {
              console.error("Error saving rental income:", error);
              alert(
                t("propertyInvestment.errorSaving") ||
                  "Error al guardar ingreso"
              );
            }
          }}
        />
      )}
    </div>
  );
}

export default PropertyInvestment;
