import { useState, useEffect } from "react";
import { Stock, Movement, Asset } from "../electron/preload";
import PortfolioTable from "./components/PortfolioTable";
import AnalysisView from "./components/AnalysisView";
import CategoriesManager from "./components/CategoriesManager";
import PatrimonialEvolution from "./components/PatrimonialEvolution";
import AddStockModal from "./components/AddStockModal";
import AddMovementModal from "./components/AddMovementModal";
import Header from "./components/Header";
import { ViewType } from "./types/views";
import { useTranslation } from "./i18n/hooks";
import "./App.css";

declare global {
  interface Window {
    electronAPI: {
      getStocks: () => Promise<Stock[]>;
      addStock: (stock: Omit<Stock, "id" | "createdAt">) => Promise<Stock>;
      updateStock: (id: number, updates: Partial<Stock>) => Promise<boolean>;
      deleteStock: (id: number) => Promise<boolean>;
      addMovement: (
        movement: Omit<Movement, "id" | "createdAt">
      ) => Promise<Movement>;
      getMovements: (stockId: number) => Promise<Movement[]>;
      deleteMovement: (id: number) => Promise<boolean>;
      getStockSummary: (stockId: number) => Promise<any>;
      exportData: () => Promise<{ success: boolean; path?: string }>;
      importData: () => Promise<{ success: boolean }>;
      getAssets: () => Promise<Asset[]>;
      addAsset: (
        asset: Omit<Asset, "id" | "createdAt" | "updatedAt">
      ) => Promise<Asset>;
      updateAsset: (
        id: number,
        updates: Partial<Omit<Asset, "id" | "createdAt" | "updatedAt">>
      ) => Promise<boolean>;
      deleteAsset: (id: number) => Promise<boolean>;
      getCategories: () => Promise<any[]>;
      addCategory: (category: {
        tipo: string;
        nombre: string;
        color: string;
      }) => Promise<any>;
      updateCategory: (
        id: number,
        updates: { nombre?: string; color?: string }
      ) => Promise<boolean>;
      deleteCategory: (id: number) => Promise<boolean>;
    };
  }
}

function App() {
  const { t } = useTranslation();
  const [view, setView] = useState<ViewType>(ViewType.Portfolio);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      if (
        typeof window === "undefined" ||
        !window.electronAPI ||
        !window.electronAPI.getStocks
      ) {
        setLoading(false);
        setStocks([]);
        return;
      }
      const data = await window.electronAPI.getStocks();
      setStocks(data);
    } catch (error) {
      console.error("Error loading stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStock = async (stock: Omit<Stock, "id" | "createdAt">) => {
    try {
      if (!window.electronAPI?.addStock) {
        alert("electronAPI is not available");
        return;
      }
      const newStock = await window.electronAPI.addStock(stock);
      setStocks([...stocks, newStock]);
      setShowAddStock(false);
    } catch (error) {
      console.error("Error adding stock:", error);
      alert("Failed to add stock. Please try again.");
    }
  };

  const handleAddMovement = async (
    movement: Omit<Movement, "id" | "createdAt">
  ) => {
    try {
      if (!window.electronAPI?.addMovement) {
        alert("electronAPI is not available");
        return;
      }
      await window.electronAPI.addMovement(movement);
      setShowAddMovement(false);
    } catch (error) {
      console.error("Error adding movement:", error);
      alert("Failed to add movement. Please try again.");
    }
  };

  const handleExport = async () => {
    try {
      if (!window.electronAPI?.exportData) {
        alert(t("messages.electronNotAvailable"));
        return;
      }
      const result = await window.electronAPI.exportData();
      if (result.success) {
        alert(t("messages.dataExported", { path: result.path || "" }));
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert(t("messages.exportFailed"));
    }
  };

  const handleImport = async () => {
    if (!confirm(t("messages.importConfirm"))) {
      return;
    }
    try {
      if (!window.electronAPI?.importData) {
        alert(t("messages.electronNotAvailable"));
        return;
      }
      const result = await window.electronAPI.importData();
      if (result.success) {
        await loadStocks();
        setSelectedStock(null);
        alert(t("messages.dataImported"));
      }
    } catch (error) {
      console.error("Error importing data:", error);
      alert(t("messages.importFailed"));
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  const handleViewChange = (newView: ViewType) => {
    setView(newView);
  };

  const renderContent = () => {
    switch (view) {
      case ViewType.Portfolio:
        return <PortfolioTable />;
      case ViewType.Analysis:
        return <AnalysisView />;
      case ViewType.Categories:
        return <CategoriesManager />;
      case ViewType.Evolution:
        return <PatrimonialEvolution />;
      default:
        return <PortfolioTable />;
    }
  };

  return (
    <div className="app">
      <Header
        currentView={view}
        onViewChange={handleViewChange}
        onExport={handleExport}
        onImport={handleImport}
      />
      <div className="app-main-content">{renderContent()}</div>

      {showAddStock && (
        <AddStockModal
          onClose={() => setShowAddStock(false)}
          onSave={handleAddStock}
        />
      )}

      {showAddMovement && selectedStock && (
        <AddMovementModal
          stock={selectedStock}
          onClose={() => setShowAddMovement(false)}
          onSave={handleAddMovement}
        />
      )}
    </div>
  );
}

export default App;
