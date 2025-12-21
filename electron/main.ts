import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { StockDatabase } from "./database";
import { StockService } from "./services/stockService";
import { AssetService } from "./services/assetService";
import { CategoryService } from "./services/categoryService";
import { PatrimonialEvolutionService } from "./services/patrimonialEvolutionService";

let mainWindow: BrowserWindow | null = null;
let db: StockDatabase;
let stockService: StockService;
let assetService: AssetService;
let categoryService: CategoryService;
let patrimonialEvolutionService: PatrimonialEvolutionService;

function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.webContents.on("did-fail-load", () => {});

  const isDev = !app.isPackaged && process.env.NODE_ENV !== "production";

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

app.whenReady().then(() => {
  const userDataPath = app.getPath("userData");
  const dbPath = path.join(userDataPath, "stock-tracker.db");
  db = new StockDatabase(dbPath);
  stockService = new StockService(db);
  assetService = new AssetService(db);
  categoryService = new CategoryService(db);
  patrimonialEvolutionService = new PatrimonialEvolutionService(db);

  registerIpcHandlers();

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

function registerIpcHandlers() {
  // Stock IPC handlers
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
      const result = await dialog.showSaveDialog(mainWindow!, {
        title: "Export Data",
        defaultPath: "stock-tracker-export.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (result.canceled) {
        return { success: false };
      }

      fs.writeFileSync(result.filePath!, JSON.stringify(data, null, 2));
      return { success: true, path: result.filePath };
    } catch (error) {
      console.error("Export error:", error);
      return { success: false };
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

  // Asset IPC handlers
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
    return assetService.deleteAsset(id);
  });

  // Category IPC handlers
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
    return categoryService.deleteCategory(id);
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
    return patrimonialEvolutionService.deletePatrimonialEvolution(id);
  });
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (db) {
      db.close();
    }
    app.quit();
  }
});
