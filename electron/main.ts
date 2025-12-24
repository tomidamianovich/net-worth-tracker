import { app, BrowserWindow, ipcMain, dialog, Menu } from "electron";
import * as path from "path";
import * as fs from "fs";
import { StockDatabase } from "./database";
import { StockService } from "./services/stockService";
import { AssetService } from "./services/assetService";
import { CategoryService } from "./services/categoryService";
import { PatrimonialEvolutionService } from "./services/patrimonialEvolutionService";
import { RentalIncomeService } from "./services/rentalIncomeService";
import { AuthService } from "./services/authService";

// Suppress GLib-GObject warnings (common on Linux, harmless)
// These errors come from Chromium's browser process and are safe to ignore
if (process.platform === "linux") {
  // Suppress stderr output for GLib errors
  const originalWrite = process.stderr.write;
  process.stderr.write = function (
    chunk: any,
    encoding?: any,
    callback?: any
  ): boolean {
    if (typeof chunk === "string" || Buffer.isBuffer(chunk)) {
      const message = chunk.toString();
      // Filter out GLib-GObject warnings and browser_main_loop errors
      if (
        message.includes("GLib-GObject") ||
        message.includes("gsignal.c") ||
        message.includes("has no handler with id") ||
        message.includes("browser_main_loop.cc") ||
        message.includes("ERROR:browser_main_loop")
      ) {
        if (typeof callback === "function") {
          callback();
        }
        return true;
      }
    }
    return originalWrite.call(process.stderr, chunk, encoding, callback);
  };

  // Also suppress console.error for GLib messages
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const message = args.map((arg) => String(arg)).join(" ");
    if (
      message.includes("GLib-GObject") ||
      message.includes("gsignal.c") ||
      message.includes("has no handler with id") ||
      message.includes("browser_main_loop.cc") ||
      message.includes("ERROR:browser_main_loop")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// Configure Electron to suppress GLib warnings
// Note: These errors come from Chromium's browser process and are harmless
// They cannot be completely suppressed, but we try to minimize them
if (process.platform === "linux") {
  // Reduce logging verbosity (0 = only fatal, 1 = errors, 2 = warnings, 3 = info)
  // Setting to 1 will show errors but reduce GLib warnings
  app.commandLine.appendSwitch("log-level", "1");
}

if (!app.isPackaged) {
  app.setName("net-worth-tracker");
}

let mainWindow: BrowserWindow | null = null;
let db: StockDatabase;
let stockService: StockService;
let assetService: AssetService;
let categoryService: CategoryService;
let patrimonialEvolutionService: PatrimonialEvolutionService;
let rentalIncomeService: RentalIncomeService;
let authService: AuthService;

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");

  const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Show menu bar in development, hide in production
  if (isDev) {
    mainWindow.setMenuBarVisibility(true);
  } else {
    mainWindow.setMenuBarVisibility(false);
    Menu.setApplicationMenu(null);
  }

  mainWindow.webContents.on("did-fail-load", () => {});

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, "../index.html");
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "stock-tracker.db");
  db = new StockDatabase(dbPath);
  stockService = new StockService(db);
  assetService = new AssetService(db);
  categoryService = new CategoryService(db);
  patrimonialEvolutionService = new PatrimonialEvolutionService(db);
  rentalIncomeService = new RentalIncomeService(db);
  authService = new AuthService(db);

  registerIpcHandlers();

  assetService.updateAllCryptoAssetsOnStartup().catch((error) => {
    console.error("Error updating crypto assets on startup:", error);
  });

  assetService.updateAllGoldAssetsOnStartup().catch((error) => {
    console.error("Error updating gold assets on startup:", error);
  });

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function registerIpcHandlers() {
  ipcMain.handle("get-stocks", () => {
    return stockService.getAllStocks();
  });

  ipcMain.handle("add-stock", (_, stock) => {
    return stockService.addStock(stock);
  });

  ipcMain.handle("update-stock", (_, id, updates) => {
    return stockService.updateStock(id, updates);
  });

  ipcMain.handle("delete-stock", (_, id) => {
    return stockService.deleteStock(id);
  });

  ipcMain.handle("add-movement", (_, movement) => {
    return stockService.addMovement(movement);
  });

  ipcMain.handle("get-movements", (_, stockId) => {
    return stockService.getMovements(stockId);
  });

  ipcMain.handle("delete-movement", (_, id) => {
    return stockService.deleteMovement(id);
  });

  ipcMain.handle("get-stock-summary", (_, stockId) => {
    return stockService.getStockSummary(stockId);
  });

  ipcMain.handle("export-data", async () => {
    try {
      const data = stockService.exportAllData();
      console.log("Export data structure:", {
        hasStocks: Array.isArray(data.stocks),
        hasMovements: Array.isArray(data.movements),
        hasAssets: Array.isArray(data.assets),
        hasCategories: Array.isArray(data.categories),
        hasPatrimonialEvolution: Array.isArray(data.patrimonialEvolution),
        hasRentalIncomes: Array.isArray(data.rentalIncomes),
        hasPropertyConfig: !!data.propertyConfig,
      });

      const result = await dialog.showSaveDialog(mainWindow!, {
        title: "Export Data",
        defaultPath: "net-worth-tracker-export.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      if (!result.filePath) {
        return { success: false, error: "No file path provided" };
      }

      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(result.filePath, jsonData);
      console.log("File written successfully to:", result.filePath);
      console.log("File size:", jsonData.length, "bytes");

      return { success: true, path: result.filePath };
    } catch (error) {
      console.error("Export error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("import-data", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        title: "Import Data",
        filters: [{ name: "JSON", extensions: ["json"] }],
        properties: ["openFile"],
      });

      if (result.canceled) {
        return { success: false };
      }

      const fileContent = fs.readFileSync(result.filePaths[0], "utf-8");
      const data = JSON.parse(fileContent);
      stockService.importData(data);
      return { success: true };
    } catch (error) {
      console.error("Import error:", error);
      return { success: false };
    }
  });

  ipcMain.handle("get-assets", () => {
    return assetService.getAllAssets();
  });

  ipcMain.handle("add-asset", async (_, asset) => {
    try {
      return await assetService.addAsset(asset);
    } catch (error) {
      console.error("Error in add-asset handler:", error);
      throw error;
    }
  });

  ipcMain.handle("update-asset", (_, id, updates) => {
    return assetService.updateAsset(id, updates);
  });

  ipcMain.handle("delete-asset", (_, id) => {
    try {
      const result = assetService.deleteAsset(id);
      if (!result) {
        throw new Error(`Failed to delete asset with id ${id}`);
      }
      return result;
    } catch (error) {
      console.error("Error in delete-asset handler:", error);
      throw error;
    }
  });

  ipcMain.handle("update-asset-with-btc-price", async (_, assetId) => {
    try {
      return await assetService.updateAssetWithBtcPrice(assetId);
    } catch (error) {
      console.error("Error updating asset with BTC price:", error);
      throw error;
    }
  });

  ipcMain.handle("update-asset-with-crypto-price", async (_, assetId) => {
    try {
      return await assetService.updateAssetWithDetectedCryptoPrice(assetId);
    } catch (error) {
      console.error("Error updating asset with crypto price:", error);
      throw error;
    }
  });

  ipcMain.handle("fetch-btc-price", async () => {
    try {
      return await assetService.fetchBtcPriceFromKraken();
    } catch (error) {
      console.error("Error fetching BTC price:", error);
      throw error;
    }
  });

  ipcMain.handle("fetch-crypto-price", async (_, cryptoType) => {
    try {
      return await assetService.fetchCryptoPrice(cryptoType);
    } catch (error) {
      console.error(`Error fetching ${cryptoType} price:`, error);
      throw error;
    }
  });

  ipcMain.handle("fetch-gold-price", async () => {
    try {
      return await assetService.fetchGoldPrice();
    } catch (error) {
      console.error("Error fetching gold price:", error);
      throw error;
    }
  });

  ipcMain.handle("update-asset-with-gold-price", async (_, assetId) => {
    try {
      return await assetService.updateAssetWithGoldPrice(assetId);
    } catch (error) {
      console.error("Error updating asset with gold price:", error);
      throw error;
    }
  });

  ipcMain.handle("get-categories", () => {
    return categoryService.getAllCategories();
  });

  ipcMain.handle("add-category", async (_, category) => {
    try {
      return await categoryService.addCategory(
        category.tipo,
        category.nombre,
        category.color
      );
    } catch (error) {
      console.error("Error in add-category handler:", error);
      throw error;
    }
  });

  ipcMain.handle("update-category", async (_, id, updates) => {
    try {
      return await categoryService.updateCategory(id, updates);
    } catch (error) {
      console.error("Error in update-category handler:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-category", (_, id) => {
    try {
      const result = categoryService.deleteCategory(id);
      if (!result) {
        throw new Error(`Failed to delete category with id ${id}`);
      }
      return result;
    } catch (error) {
      console.error("Error in delete-category handler:", error);
      throw error;
    }
  });

  ipcMain.handle("get-patrimonial-evolution", () => {
    return patrimonialEvolutionService.getAllPatrimonialEvolution();
  });

  ipcMain.handle("add-patrimonial-evolution", async (_, evolution) => {
    try {
      return await patrimonialEvolutionService.addPatrimonialEvolution(
        evolution
      );
    } catch (error) {
      console.error("Error in add-patrimonial-evolution handler:", error);
      throw error;
    }
  });

  ipcMain.handle("update-patrimonial-evolution", async (_, id, updates) => {
    try {
      return await patrimonialEvolutionService.updatePatrimonialEvolution(
        id,
        updates
      );
    } catch (error) {
      console.error("Error in update-patrimonial-evolution handler:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-patrimonial-evolution", (_, id) => {
    try {
      const result = patrimonialEvolutionService.deletePatrimonialEvolution(id);
      if (!result) {
        throw new Error(`Failed to delete patrimonial evolution with id ${id}`);
      }
      return result;
    } catch (error) {
      console.error("Error in delete-patrimonial-evolution handler:", error);
      throw error;
    }
  });

  // Rental Income handlers
  ipcMain.handle("get-rental-incomes", () => {
    return rentalIncomeService.getAllRentalIncomes();
  });

  ipcMain.handle("add-rental-income", async (_, income) => {
    try {
      return await rentalIncomeService.addRentalIncome(income);
    } catch (error) {
      console.error("Error in add-rental-income handler:", error);
      throw error;
    }
  });

  ipcMain.handle("update-rental-income", async (_, id, updates) => {
    try {
      return await rentalIncomeService.updateRentalIncome(id, updates);
    } catch (error) {
      console.error("Error in update-rental-income handler:", error);
      throw error;
    }
  });

  ipcMain.handle("delete-rental-income", (_, id) => {
    try {
      const result = rentalIncomeService.deleteRentalIncome(id);
      if (!result) {
        throw new Error(`Failed to delete rental income with id ${id}`);
      }
      return result;
    } catch (error) {
      console.error("Error in delete-rental-income handler:", error);
      throw error;
    }
  });

  ipcMain.handle("get-property-initial-investment", () => {
    try {
      return rentalIncomeService.getPropertyInitialInvestment();
    } catch (error) {
      console.error("Error in get-property-initial-investment handler:", error);
      throw error;
    }
  });

  ipcMain.handle("update-property-initial-investment", (_, investment) => {
    try {
      const result =
        rentalIncomeService.updatePropertyInitialInvestment(investment);
      if (!result) {
        throw new Error("Failed to update property initial investment");
      }
      return result;
    } catch (error) {
      console.error(
        "Error in update-property-initial-investment handler:",
        error
      );
      throw error;
    }
  });

  // Backup and restore handlers
  ipcMain.handle("create-backup", async () => {
    try {
      const userDataPath = app.getPath("userData");
      const backupsDir = path.join(userDataPath, "backups");

      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupsDir)) {
        fs.mkdirSync(backupsDir, { recursive: true });
      }

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `stock-tracker-backup-${timestamp}.db`;
      const backupPath = path.join(backupsDir, backupFileName);

      // Create the backup
      const success = db.createBackup(backupPath);

      if (success) {
        return { success: true, path: backupPath };
      } else {
        return { success: false, error: "Failed to create backup" };
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("save-backup-as", async () => {
    try {
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: "Guardar Backup",
        defaultPath: `stock-tracker-backup-${
          new Date().toISOString().split("T")[0]
        }.db`,
        filters: [{ name: "Database Files", extensions: ["db"] }],
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      const success = db.createBackup(result.filePath!);

      if (success) {
        return { success: true, path: result.filePath };
      } else {
        return { success: false, error: "Failed to create backup" };
      }
    } catch (error) {
      console.error("Error saving backup:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("restore-from-backup", async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow!, {
        title: "Restaurar desde Backup",
        filters: [{ name: "Database Files", extensions: ["db"] }],
        properties: ["openFile"],
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      const backupPath = result.filePaths[0];
      const success = db.restoreFromBackup(backupPath);

      if (success) {
        // Reinitialize services with the restored database
        stockService = new StockService(db);
        assetService = new AssetService(db);
        categoryService = new CategoryService(db);
        patrimonialEvolutionService = new PatrimonialEvolutionService(db);
        rentalIncomeService = new RentalIncomeService(db);

        return { success: true };
      } else {
        return { success: false, error: "Failed to restore from backup" };
      }
    } catch (error) {
      console.error("Error restoring from backup:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  // Authentication handlers
  ipcMain.handle("login", async (_, username: string, password: string) => {
    try {
      const isValid = await authService.login(username, password);
      return { success: isValid };
    } catch (error) {
      console.error("Error in login handler:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  });

  ipcMain.handle("has-users", () => {
    return authService.hasUsers();
  });

  ipcMain.handle(
    "setup-initial-user",
    async (_, username: string, password: string) => {
      try {
        const success = await authService.setupInitialUser(username, password);
        return { success };
      } catch (error) {
        console.error("Error in setup-initial-user handler:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );

  ipcMain.handle(
    "change-password",
    async (_, username: string, oldPassword: string, newPassword: string) => {
      try {
        const success = await authService.changePassword(
          username,
          oldPassword,
          newPassword
        );
        return { success };
      } catch (error) {
        console.error("Error in change-password handler:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }
  );
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (db) {
      db.close();
    }
    app.quit();
  }
});
