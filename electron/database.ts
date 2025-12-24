import Database from "better-sqlite3";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

export class StockDatabase {
  private db: Database.Database;
  private encryptionKey: Buffer;
  private dbPath: string;

  constructor(dbPath: string) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.dbPath = dbPath;
    this.db = new Database(dbPath);
    this.encryptionKey = this.getOrCreateEncryptionKey();
    this.initializeTables();
  }

  private getOrCreateEncryptionKey(): Buffer {
    const keyPath = path.join(path.dirname(this.db.name), ".encryption_key");

    if (fs.existsSync(keyPath)) {
      return Buffer.from(fs.readFileSync(keyPath, "utf-8").trim(), "hex");
    }

    const key = crypto.randomBytes(32);
    fs.writeFileSync(keyPath, key.toString("hex"), { mode: 0o600 });
    return key;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.encryptionKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      this.encryptionKey,
      iv
    );
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  private initializeTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        exchange TEXT,
        notes_encrypted TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_id INTEGER NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('buy', 'sell')),
        quantity REAL NOT NULL,
        price REAL NOT NULL,
        date TEXT NOT NULL,
        fees REAL DEFAULT 0,
        notes_encrypted TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stock_id) REFERENCES stocks(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_movements_stock_id ON movements(stock_id);
      CREATE INDEX IF NOT EXISTS idx_movements_date ON movements(date);

      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        concepto TEXT NOT NULL,
        cantidad REAL NOT NULL,
        valor REAL NOT NULL,
        valor_unitario REAL NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'ACCION' CHECK(tipo IN ('ACCION', 'ETF', 'CRIPTO', 'FIAT', 'DEPOSITO')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_assets_concepto ON assets(concepto);

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL UNIQUE,
        nombre TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_categories_tipo ON categories(tipo);

      CREATE TABLE IF NOT EXISTS patrimonial_evolution (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        año INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        dia INTEGER NOT NULL DEFAULT 1,
        patrimonio REAL NOT NULL,
        detalle TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(año, mes, dia)
      );

      CREATE INDEX IF NOT EXISTS idx_patrimonial_evolution_año_mes ON patrimonial_evolution(año, mes);

      CREATE TABLE IF NOT EXISTS rental_incomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        año INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        precio_alquiler_ars REAL NOT NULL,
        valor_usd REAL NOT NULL,
        ganancia_usd REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_rental_incomes_año_mes ON rental_incomes(año, mes);

      CREATE TABLE IF NOT EXISTS property_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        initial_investment REAL DEFAULT 0,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK(id = 1)
      );

      -- Initialize property_config if it doesn't exist
      INSERT OR IGNORE INTO property_config (id, initial_investment) VALUES (1, 0);

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    try {
      const tableInfo = this.db
        .prepare("PRAGMA table_info(assets)")
        .all() as any[];
      const hasTipoColumn = tableInfo.some((col: any) => col.name === "tipo");

      if (!hasTipoColumn) {
        this.db.exec(
          "ALTER TABLE assets ADD COLUMN tipo TEXT NOT NULL DEFAULT 'ACCION'"
        );
      }

      this.db
        .prepare(
          `UPDATE assets SET tipo = 'ACCION' WHERE tipo IS NULL OR tipo = ''`
        )
        .run();

      const existingCategories = this.db
        .prepare("SELECT COUNT(*) as count FROM categories")
        .get() as { count: number };

      const defaultCategories = [
        { tipo: "ACCION", nombre: "Acciones", color: "#808080" },
        { tipo: "ETF", nombre: "ETFs", color: "#5ac8fa" },
        { tipo: "CRIPTO", nombre: "Cripto", color: "#ff9500" },
        { tipo: "FIAT", nombre: "Fiat", color: "#34c759" },
        { tipo: "DEPOSITO", nombre: "Depósitos", color: "#007aff" },
      ];

      const insertStmt = this.db.prepare(`
        INSERT ${
          existingCategories.count === 0 ? "" : "OR IGNORE"
        } INTO categories (tipo, nombre, color)
        VALUES (?, ?, ?)
      `);

      if (existingCategories.count === 0) {
        const transaction = this.db.transaction(
          (categories: typeof defaultCategories) => {
            for (const cat of categories) {
              insertStmt.run(cat.tipo, cat.nombre, cat.color);
            }
          }
        );
        transaction(defaultCategories);
      } else {
        for (const cat of defaultCategories) {
          insertStmt.run(cat.tipo, cat.nombre, cat.color);
        }
      }

      const existingPatrimonial = this.db
        .prepare("SELECT COUNT(*) as count FROM patrimonial_evolution")
        .get() as { count: number };

      if (existingPatrimonial.count === 0) {
        const initialData = [
          { año: 2025, mes: 6, dia: 1, patrimonio: 83624.72 },
          { año: 2025, mes: 7, dia: 1, patrimonio: 82835.0 },
          { año: 2025, mes: 8, dia: 1, patrimonio: 87232.96 },
          { año: 2025, mes: 9, dia: 4, patrimonio: 88819.24 },
          { año: 2025, mes: 10, dia: 4, patrimonio: 93777.67 },
          { año: 2025, mes: 11, dia: 1, patrimonio: 92930.4 },
          { año: 2025, mes: 12, dia: 1, patrimonio: 93144.4 },
        ];

        const patrimonialStmt = this.db.prepare(`
        INSERT INTO patrimonial_evolution (año, mes, dia, patrimonio)
        VALUES (?, ?, ?, ?)
      `);

        const patrimonialTransaction = this.db.transaction(
          (data: typeof initialData) => {
            for (const item of data) {
              patrimonialStmt.run(
                item.año,
                item.mes,
                item.dia,
                item.patrimonio
              );
            }
          }
        );

        patrimonialTransaction(initialData);
      }
    } catch (error) {
      // Silent migration error
    }
  }

  // Stock operations
  insertStock(
    symbol: string,
    name: string,
    exchange?: string,
    notes?: string
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO stocks (symbol, name, exchange, notes_encrypted)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      symbol,
      name,
      exchange || null,
      notes ? this.encrypt(notes) : null
    );
    return Number(result.lastInsertRowid);
  }

  getAllStocks() {
    const stmt = this.db.prepare("SELECT * FROM stocks ORDER BY symbol");
    const stocks = stmt.all() as any[];
    return stocks.map((stock) => ({
      ...stock,
      notes: stock.notes_encrypted ? this.decrypt(stock.notes_encrypted) : null,
      notes_encrypted: undefined,
    }));
  }

  getStockById(id: number) {
    const stmt = this.db.prepare("SELECT * FROM stocks WHERE id = ?");
    const stock = stmt.get(id) as any;
    if (stock) {
      return {
        ...stock,
        notes: stock.notes_encrypted
          ? this.decrypt(stock.notes_encrypted)
          : null,
        notes_encrypted: undefined,
      };
    }
    return null;
  }

  updateStock(
    id: number,
    updates: {
      symbol?: string;
      name?: string;
      exchange?: string;
      notes?: string;
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.symbol !== undefined) {
      fields.push("symbol = ?");
      values.push(updates.symbol);
    }
    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.exchange !== undefined) {
      fields.push("exchange = ?");
      values.push(updates.exchange || null);
    }
    if (updates.notes !== undefined) {
      fields.push("notes_encrypted = ?");
      values.push(updates.notes ? this.encrypt(updates.notes) : null);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE stocks SET ${fields.join(", ")} WHERE id = ?`
    );
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deleteStock(id: number) {
    const stmt = this.db.prepare("DELETE FROM stocks WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Movement operations
  insertMovement(
    stockId: number,
    type: "buy" | "sell",
    quantity: number,
    price: number,
    date: string,
    fees?: number,
    notes?: string
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO movements (stock_id, type, quantity, price, date, fees, notes_encrypted)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      stockId,
      type,
      quantity,
      price,
      date,
      fees || 0,
      notes ? this.encrypt(notes) : null
    );
    return Number(result.lastInsertRowid);
  }

  getMovementsByStockId(stockId: number) {
    const stmt = this.db.prepare(
      "SELECT * FROM movements WHERE stock_id = ? ORDER BY date DESC, created_at DESC"
    );
    const movements = stmt.all(stockId) as any[];
    return movements.map((movement) => ({
      ...movement,
      notes: movement.notes_encrypted
        ? this.decrypt(movement.notes_encrypted)
        : null,
      notes_encrypted: undefined,
    }));
  }

  deleteMovement(id: number) {
    const stmt = this.db.prepare("DELETE FROM movements WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Summary operations
  getStockSummary(stockId: number) {
    const stmt = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) as total_quantity,
        SUM(CASE WHEN type = 'buy' THEN quantity * price + COALESCE(fees, 0) ELSE -(quantity * price + COALESCE(fees, 0)) END) as total_invested
      FROM movements
      WHERE stock_id = ?
    `);
    const result = stmt.get(stockId) as {
      total_quantity: number | null;
      total_invested: number | null;
    };

    const totalQuantity = result.total_quantity || 0;
    const totalInvested = result.total_invested || 0;
    const averagePrice = totalQuantity > 0 ? totalInvested / totalQuantity : 0;

    return {
      totalQuantity,
      averagePrice,
      totalInvested,
    };
  }

  // Export/Import
  exportAllData() {
    try {
    const stocks = this.getAllStocks();
    const movements = this.db
      .prepare("SELECT * FROM movements ORDER BY stock_id, date")
      .all() as any[];
      const assets = this.getAllAssets();
      const categories = this.getAllCategories();
      const patrimonialEvolution = this.getAllPatrimonialEvolution();
      const rentalIncomes = this.getAllRentalIncomes();
      const propertyConfig = this.db
        .prepare("SELECT initial_investment FROM property_config WHERE id = 1")
        .get() as { initial_investment: number } | undefined;

      console.log("Export data counts:", {
        stocks: stocks.length,
        movements: movements.length,
        assets: assets.length,
        categories: categories.length,
        patrimonialEvolution: patrimonialEvolution.length,
        rentalIncomes: rentalIncomes.length,
        propertyConfig: propertyConfig?.initial_investment || 0,
      });

    return {
      stocks: stocks.map((s) => ({ ...s, notes_encrypted: undefined })),
      movements: movements.map((m) => ({
        ...m,
        notes: m.notes_encrypted ? this.decrypt(m.notes_encrypted) : null,
        notes_encrypted: undefined,
      })),
        assets: assets.map((a) => ({
          concepto: a.concepto,
          cantidad: a.cantidad,
          valor: a.valor,
          valor_unitario: a.valor_unitario,
          tipo: a.tipo,
        })),
        categories: categories.map((c) => ({
          tipo: c.tipo,
          nombre: c.nombre,
          color: c.color,
        })),
        patrimonialEvolution: patrimonialEvolution.map((p) => ({
          año: p.año,
          mes: p.mes,
          dia: p.dia,
          patrimonio: p.patrimonio,
          detalle: p.detalle,
        })),
        rentalIncomes: rentalIncomes.map((r) => ({
          año: r.año,
          mes: r.mes,
          precio_alquiler_ars: r.precio_alquiler_ars,
          valor_usd: r.valor_usd,
          ganancia_usd: r.ganancia_usd,
        })),
        propertyConfig: {
          initialInvestment: propertyConfig?.initial_investment || 0,
        },
      exportDate: new Date().toISOString(),
    };
    } catch (error) {
      console.error("Error in exportAllData:", error);
      throw error;
    }
  }

  importData(data: {
    stocks?: any[];
    movements?: any[];
    assets?: any[];
    categories?: any[];
    patrimonialEvolution?: any[];
    rentalIncomes?: any[];
    propertyConfig?: { initialInvestment?: number };
  }) {
    const transaction = this.db.transaction(() => {
      // Clear existing data
      if (data.movements) {
      this.db.prepare("DELETE FROM movements").run();
      }
      if (data.stocks) {
      this.db.prepare("DELETE FROM stocks").run();
      }
      if (data.assets) {
        this.db.prepare("DELETE FROM assets").run();
      }
      if (data.categories) {
        this.db.prepare("DELETE FROM categories").run();
      }
      if (data.patrimonialEvolution) {
        this.db.prepare("DELETE FROM patrimonial_evolution").run();
      }
      if (data.rentalIncomes) {
        this.db.prepare("DELETE FROM rental_incomes").run();
      }

      // Import stocks
      if (data.stocks) {
      for (const stock of data.stocks) {
        this.insertStock(stock.symbol, stock.name, stock.exchange, stock.notes);
        }
      }

      // Import movements (need to map old stock IDs to new ones)
      if (data.movements && data.stocks) {
      const stockMap = new Map<string, number>();
      const allStocks = this.getAllStocks();
      for (const stock of allStocks) {
        stockMap.set(stock.symbol, stock.id!);
      }

      for (const movement of data.movements) {
        const stock = data.stocks.find((s) => s.id === movement.stock_id);
        if (stock) {
          const newStockId = stockMap.get(stock.symbol);
          if (newStockId) {
            this.insertMovement(
              newStockId,
              movement.type,
              movement.quantity,
              movement.price,
              movement.date,
              movement.fees,
              movement.notes
            );
          }
        }
        }
      }

      // Import assets
      if (data.assets) {
        for (const asset of data.assets) {
          this.insertAsset(
            asset.concepto,
            asset.cantidad,
            asset.valor,
            asset.valor_unitario,
            asset.tipo || "ACCION"
          );
        }
      }

      // Import categories
      if (data.categories) {
        for (const category of data.categories) {
          this.insertCategory(category.tipo, category.nombre, category.color);
        }
      }

      // Import patrimonial evolution
      if (data.patrimonialEvolution) {
        for (const evolution of data.patrimonialEvolution) {
          this.insertPatrimonialEvolution(
            evolution.año,
            evolution.mes,
            evolution.dia || 1,
            evolution.patrimonio,
            evolution.detalle
          );
        }
      }

      // Import rental incomes
      if (data.rentalIncomes) {
        for (const income of data.rentalIncomes) {
          this.insertRentalIncome(
            income.año,
            income.mes,
            income.precio_alquiler_ars,
            income.valor_usd,
            income.ganancia_usd
          );
        }
      }

      // Import property config
      if (data.propertyConfig?.initialInvestment !== undefined) {
        this.updatePropertyInitialInvestment(data.propertyConfig.initialInvestment);
      }
    });

    transaction();
    return { success: true };
  }

  // Asset operations
  insertAsset(
    concepto: string,
    cantidad: number,
    valor: number,
    valorUnitario: number,
    tipo: "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO" = "ACCION"
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO assets (concepto, cantidad, valor, valor_unitario, tipo)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(concepto, cantidad, valor, valorUnitario, tipo);
    return Number(result.lastInsertRowid);
  }

  getAllAssets() {
    const stmt = this.db.prepare("SELECT * FROM assets ORDER BY concepto");
    return stmt.all() as any[];
  }

  getAssetById(id: number) {
    const stmt = this.db.prepare("SELECT * FROM assets WHERE id = ?");
    return stmt.get(id) as any;
  }

  updateAsset(
    id: number,
    updates: {
      concepto?: string;
      cantidad?: number;
      valor?: number;
      valorUnitario?: number;
      tipo?: "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO";
    }
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.concepto !== undefined) {
      fields.push("concepto = ?");
      values.push(updates.concepto);
    }
    if (updates.cantidad !== undefined) {
      fields.push("cantidad = ?");
      values.push(updates.cantidad);
    }
    if (updates.valor !== undefined) {
      fields.push("valor = ?");
      values.push(updates.valor);
    }
    if (updates.valorUnitario !== undefined) {
      fields.push("valor_unitario = ?");
      values.push(updates.valorUnitario);
    }
    if (updates.tipo !== undefined) {
      fields.push("tipo = ?");
      values.push(updates.tipo);
    }

    if (fields.length === 0) return false;

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE assets SET ${fields.join(", ")} WHERE id = ?`
    );
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deleteAsset(id: number) {
    const stmt = this.db.prepare("DELETE FROM assets WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Category operations
  getAllCategories() {
    const stmt = this.db.prepare("SELECT * FROM categories ORDER BY tipo");
    return stmt.all() as any[];
  }

  getCategoryByTipo(tipo: string) {
    const stmt = this.db.prepare("SELECT * FROM categories WHERE tipo = ?");
    return stmt.get(tipo) as any;
  }

  insertCategory(tipo: string, nombre: string, color: string): number {
    const stmt = this.db.prepare(`
      INSERT INTO categories (tipo, nombre, color)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(tipo, nombre, color);
    return Number(result.lastInsertRowid);
  }

  updateCategory(id: number, nombre?: string, color?: string): boolean {
    const updates: string[] = [];
    const values: any[] = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (color !== undefined) {
      updates.push("color = ?");
      values.push(color);
    }

    if (updates.length === 0) return false;

    values.push(id);
    const stmt = this.db.prepare(`
      UPDATE categories 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deleteCategory(id: number): boolean {
    const stmt = this.db.prepare("DELETE FROM categories WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getAllPatrimonialEvolution() {
    const stmt = this.db.prepare(
      "SELECT * FROM patrimonial_evolution ORDER BY año DESC, mes DESC, dia DESC"
    );
    return stmt.all() as any[];
  }

  getPatrimonialEvolutionById(id: number) {
    const stmt = this.db.prepare(
      "SELECT * FROM patrimonial_evolution WHERE id = ?"
    );
    return stmt.get(id) as any;
  }

  insertPatrimonialEvolution(
    año: number,
    mes: number,
    dia: number,
    patrimonio: number,
    detalle?: string
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO patrimonial_evolution (año, mes, dia, patrimonio, detalle)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(año, mes, dia, patrimonio, detalle || null);
    return Number(result.lastInsertRowid);
  }

  updatePatrimonialEvolution(
    id: number,
    updates: {
      año?: number;
      mes?: number;
      dia?: number;
      patrimonio?: number;
      detalle?: string;
    }
  ): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.año !== undefined) {
      fields.push("año = ?");
      values.push(updates.año);
    }
    if (updates.mes !== undefined) {
      fields.push("mes = ?");
      values.push(updates.mes);
    }
    if (updates.dia !== undefined) {
      fields.push("dia = ?");
      values.push(updates.dia);
    }
    if (updates.patrimonio !== undefined) {
      fields.push("patrimonio = ?");
      values.push(updates.patrimonio);
    }
    if (updates.detalle !== undefined) {
      fields.push("detalle = ?");
      values.push(updates.detalle);
    }

    if (fields.length === 0) return false;

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE patrimonial_evolution SET ${fields.join(", ")} WHERE id = ?`
    );
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deletePatrimonialEvolution(id: number): boolean {
    const stmt = this.db.prepare(
      "DELETE FROM patrimonial_evolution WHERE id = ?"
    );
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Rental Income operations
  insertRentalIncome(
    año: number,
    mes: number,
    precioAlquilerARS: number,
    valorUSD: number,
    gananciaUSD: number
  ): number {
    const stmt = this.db.prepare(`
      INSERT INTO rental_incomes (año, mes, precio_alquiler_ars, valor_usd, ganancia_usd)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      año,
      mes,
      precioAlquilerARS,
      valorUSD,
      gananciaUSD
    );
    return Number(result.lastInsertRowid);
  }

  getAllRentalIncomes() {
    const stmt = this.db.prepare(
      "SELECT * FROM rental_incomes ORDER BY año ASC, mes ASC"
    );
    return stmt.all() as any[];
  }

  getRentalIncomeById(id: number) {
    const stmt = this.db.prepare("SELECT * FROM rental_incomes WHERE id = ?");
    return stmt.get(id) as any;
  }

  updateRentalIncome(
    id: number,
    updates: {
      año?: number;
      mes?: number;
      precioAlquilerARS?: number;
      valorUSD?: number;
      gananciaUSD?: number;
    }
  ): boolean {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.año !== undefined) {
      fields.push("año = ?");
      values.push(updates.año);
    }
    if (updates.mes !== undefined) {
      fields.push("mes = ?");
      values.push(updates.mes);
    }
    if (updates.precioAlquilerARS !== undefined) {
      fields.push("precio_alquiler_ars = ?");
      values.push(updates.precioAlquilerARS);
    }
    if (updates.valorUSD !== undefined) {
      fields.push("valor_usd = ?");
      values.push(updates.valorUSD);
    }
    if (updates.gananciaUSD !== undefined) {
      fields.push("ganancia_usd = ?");
      values.push(updates.gananciaUSD);
    }

    if (fields.length === 0) return false;

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);
    const stmt = this.db.prepare(
      `UPDATE rental_incomes SET ${fields.join(", ")} WHERE id = ?`
    );
    const result = stmt.run(...values);
    return result.changes > 0;
  }

  deleteRentalIncome(id: number): boolean {
    const stmt = this.db.prepare("DELETE FROM rental_incomes WHERE id = ?");
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Backup and restore operations
  createBackup(backupPath: string): boolean {
    try {
      // Close the database connection to ensure all data is written
      this.db.close();
      
      // Copy the database file
      fs.copyFileSync(this.dbPath, backupPath);
      
      // Also copy the encryption key if it exists
      const keyPath = path.join(path.dirname(this.dbPath), ".encryption_key");
      if (fs.existsSync(keyPath)) {
        const backupKeyPath = path.join(
          path.dirname(backupPath),
          `.encryption_key_${path.basename(backupPath)}`
        );
        fs.copyFileSync(keyPath, backupKeyPath);
      }
      
      // Reopen the database connection
      this.db = new Database(this.dbPath);
      
      return true;
    } catch (error) {
      console.error("Error creating backup:", error);
      // Try to reopen the database even if backup failed
      try {
        this.db = new Database(this.dbPath);
      } catch (reopenError) {
        console.error("Error reopening database:", reopenError);
      }
      return false;
    }
  }

  restoreFromBackup(backupPath: string): boolean {
    try {
      // Close the current database connection
      this.db.close();
      
      // Backup the current database before restoring (safety measure)
      const safetyBackupPath = `${this.dbPath}.safety-backup-${Date.now()}`;
      if (fs.existsSync(this.dbPath)) {
        fs.copyFileSync(this.dbPath, safetyBackupPath);
      }
      
      // Copy the backup file to the database location
      fs.copyFileSync(backupPath, this.dbPath);
      
      // Try to restore the encryption key if it exists
      const backupKeyPath = path.join(
        path.dirname(backupPath),
        `.encryption_key_${path.basename(backupPath)}`
      );
      if (fs.existsSync(backupKeyPath)) {
        const keyPath = path.join(path.dirname(this.dbPath), ".encryption_key");
        fs.copyFileSync(backupKeyPath, keyPath);
        // Reload the encryption key
        this.encryptionKey = this.getOrCreateEncryptionKey();
      }
      
      // Reopen the database connection
      this.db = new Database(this.dbPath);
      
      // Reinitialize tables in case of schema changes
      this.initializeTables();
      
      return true;
    } catch (error) {
      console.error("Error restoring from backup:", error);
      // Try to reopen the database even if restore failed
      try {
        this.db = new Database(this.dbPath);
      } catch (reopenError) {
        console.error("Error reopening database:", reopenError);
      }
      return false;
    }
  }

  getDatabasePath(): string {
    return this.dbPath;
  }

  // User operations
  insertUser(username: string, passwordHash: string): number {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, password_hash)
      VALUES (?, ?)
    `);
    const result = stmt.run(username, passwordHash);
    return Number(result.lastInsertRowid);
  }

  getUserByUsername(username: string) {
    const stmt = this.db.prepare("SELECT * FROM users WHERE username = ?");
    return stmt.get(username) as any;
  }

  updateUserPassword(username: string, passwordHash: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `);
    const result = stmt.run(passwordHash, username);
    return result.changes > 0;
  }

  hasUsers(): boolean {
    const stmt = this.db.prepare("SELECT COUNT(*) as count FROM users");
    const result = stmt.get() as { count: number };
    return result.count > 0;
  }

  // Property config operations
  getPropertyInitialInvestment(): number {
    const stmt = this.db.prepare("SELECT initial_investment FROM property_config WHERE id = 1");
    const result = stmt.get() as { initial_investment: number } | undefined;
    return result?.initial_investment || 0;
  }

  updatePropertyInitialInvestment(investment: number): boolean {
    const stmt = this.db.prepare(
      "UPDATE property_config SET initial_investment = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1"
    );
    const result = stmt.run(investment);
    return result.changes > 0;
  }

  close() {
    this.db.close();
  }
}

// Export as Database for backward compatibility
export { StockDatabase as Database };
