import { useState, useEffect } from "react";
import { Stock, Movement, Asset } from "../electron/preload";
import PortfolioTable from "./components/PortfolioTable";
import PatrimonialEvolution from "./components/PatrimonialEvolution";
import PropertyInvestment from "./components/PropertyInvestment";
import AddStockModal from "./components/AddStockModal";
import AddMovementModal from "./components/AddMovementModal";
import Header from "./components/Header";
import Login from "./components/Login";
import ChangePasswordModal from "./components/ChangePasswordModal";
import CategoriesManagerModal from "./components/CategoriesManagerModal";
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
      updateAssetWithBtcPrice: (assetId: number) => Promise<Asset>;
      updateAssetWithCryptoPrice: (assetId: number) => Promise<Asset>;
      fetchBtcPrice: () => Promise<number>;
      fetchCryptoPrice: (cryptoType: string) => Promise<number>;
      fetchGoldPrice: () => Promise<number>;
      updateAssetWithGoldPrice: (assetId: number) => Promise<Asset>;
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
      getRentalIncomes: () => Promise<any[]>;
      addRentalIncome: (income: {
        año: number;
        mes: number;
        precioAlquilerARS: number;
        valorUSD: number;
        gananciaUSD: number;
      }) => Promise<any>;
      updateRentalIncome: (
        id: number,
        updates: {
          año?: number;
          mes?: number;
          precioAlquilerARS?: number;
          valorUSD?: number;
          gananciaUSD?: number;
        }
      ) => Promise<boolean>;
      deleteRentalIncome: (id: number) => Promise<boolean>;
      createBackup: () => Promise<{ success: boolean; path?: string; error?: string }>;
      saveBackupAs: () => Promise<{ success: boolean; path?: string; error?: string; canceled?: boolean }>;
      restoreFromBackup: () => Promise<{ success: boolean; error?: string; canceled?: boolean }>;
      login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
      hasUsers: () => Promise<boolean>;
      setupInitialUser: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
      changePassword: (username: string, oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    };
  }
}

function App() {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>("");
  const [view, setView] = useState<ViewType>(ViewType.Portfolio);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
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

  const handleBackup = async () => {
    try {
      if (!window.electronAPI?.saveBackupAs) {
        alert(t("messages.electronNotAvailable"));
        return;
      }
      const result = await window.electronAPI.saveBackupAs();
      if (result.success && result.path) {
        alert(t("messages.backupCreated", { path: result.path }));
      } else if (!result.canceled) {
        alert(t("messages.backupFailed") || "Error al crear el backup");
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      alert(t("messages.backupFailed") || "Error al crear el backup");
    }
  };

  const handleRestore = async () => {
    if (
      !confirm(
        t("messages.restoreConfirm") ||
          "¿Estás seguro de que quieres restaurar desde un backup? Esto reemplazará todos los datos actuales."
      )
    ) {
      return;
    }
    try {
      if (!window.electronAPI?.restoreFromBackup) {
        alert(t("messages.electronNotAvailable"));
        return;
      }
      const result = await window.electronAPI.restoreFromBackup();
      if (result.success) {
        await loadStocks();
        setSelectedStock(null);
        alert(t("messages.dataRestored") || "Datos restaurados exitosamente");
        // Reload the page to refresh all data
        window.location.reload();
      } else if (!result.canceled) {
        alert(
          t("messages.restoreFailed") ||
            "Error al restaurar desde el backup"
        );
      }
    } catch (error) {
      console.error("Error restoring from backup:", error);
      alert(t("messages.restoreFailed") || "Error al restaurar desde el backup");
    }
  };

  const handleLogin = (username: string) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
    // Save username to localStorage for next time
    localStorage.setItem("lastUsername", username);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
      case ViewType.Evolution:
        return <PatrimonialEvolution />;
      case ViewType.PropertyInvestment:
        return <PropertyInvestment />;
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
        onBackup={handleBackup}
        onRestore={handleRestore}
        onChangePassword={() => setShowChangePassword(true)}
        onCategories={() => setShowCategoriesModal(true)}
        currentUser={currentUser}
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

      {showChangePassword && currentUser && (
        <ChangePasswordModal
          username={currentUser}
          onClose={() => setShowChangePassword(false)}
        />
      )}

      {showCategoriesModal && (
        <CategoriesManagerModal
          onClose={() => setShowCategoriesModal(false)}
        />
      )}
    </div>
  );
}

export default App;
