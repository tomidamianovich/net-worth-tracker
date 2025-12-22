import { StockDatabase } from "../database";
import { Asset } from "../preload";
import * as https from "https";

type CryptoType =
  | "BTC"
  | "ETH"
  | "LTC"
  | "XRP"
  | "ADA"
  | "DOT"
  | "SOL"
  | "MATIC";

interface CryptoConfig {
  symbol: string;
  krakenPair: string;
  krakenResultKey: string;
  keywords: string[];
}

const CRYPTO_CONFIGS: Record<CryptoType, CryptoConfig> = {
  BTC: {
    symbol: "BTC",
    krakenPair: "XBTEUR",
    krakenResultKey: "XXBTZEUR",
    keywords: ["BTC", "BITCOIN"],
  },
  ETH: {
    symbol: "ETH",
    krakenPair: "ETHEUR",
    krakenResultKey: "XETHZEUR",
    keywords: ["ETH", "ETHEREUM"],
  },
  LTC: {
    symbol: "LTC",
    krakenPair: "LTCEUR",
    krakenResultKey: "XLTCZEUR",
    keywords: ["LTC", "LITECOIN"],
  },
  XRP: {
    symbol: "XRP",
    krakenPair: "XRPEUR",
    krakenResultKey: "XXRPZEUR",
    keywords: ["XRP", "RIPPLE"],
  },
  ADA: {
    symbol: "ADA",
    krakenPair: "ADAEUR",
    krakenResultKey: "ADAEUR",
    keywords: ["ADA", "CARDANO"],
  },
  DOT: {
    symbol: "DOT",
    krakenPair: "DOTEUR",
    krakenResultKey: "DOTEUR",
    keywords: ["DOT", "POLKADOT"],
  },
  SOL: {
    symbol: "SOL",
    krakenPair: "SOLEUR",
    krakenResultKey: "SOLEUR",
    keywords: ["SOL", "SOLANA"],
  },
  MATIC: {
    symbol: "MATIC",
    krakenPair: "MATICEUR",
    krakenResultKey: "MATICEUR",
    keywords: ["MATIC", "POLYGON"],
  },
};

function identifyCrypto(asset: any): CryptoType | null {
  if (asset.tipo !== "CRIPTO") {
    return null;
  }

  const concepto = (asset.concepto || "").toUpperCase();
  const match = concepto.match(/\(([^)]+)\)/);
  const symbol = match
    ? match[1].toUpperCase()
    : concepto.substring(0, 4).toUpperCase();

  for (const [cryptoType, config] of Object.entries(CRYPTO_CONFIGS)) {
    if (symbol === config.symbol) {
      return cryptoType as CryptoType;
    }
    if (config.keywords.some((keyword) => concepto.includes(keyword))) {
      return cryptoType as CryptoType;
    }
  }

  return null;
}

function identifyGold(asset: any): boolean {
  const concepto = (asset.concepto || "").toUpperCase();
  const match = concepto.match(/\(([^)]+)\)/);
  const symbol = match ? match[1].toUpperCase() : "";

  const goldKeywords = ["GOLD", "ORO", "AU"];
  return (
    goldKeywords.some((keyword) => concepto.includes(keyword)) ||
    symbol === "GOLD" ||
    symbol === "ORO" ||
    symbol === "AU"
  );
}

export class AssetService {
  constructor(private db: StockDatabase) {}

  getAllAssets(): Asset[] {
    const assets = this.db.getAllAssets();
    return assets.map((asset: any) => {
      const tipo =
        asset.tipo && asset.tipo.trim() !== ""
          ? asset.tipo.trim().toUpperCase()
          : "ACCION";

      return {
        id: asset.id,
        concepto: asset.concepto,
        cantidad: asset.cantidad,
        valor: asset.valor,
        valor_unitario: asset.valor_unitario,
        tipo: tipo as "ACCION" | "ETF" | "CRIPTO" | "FIAT" | "DEPOSITO",
        createdAt: asset.created_at,
        updatedAt: asset.updated_at,
      };
    });
  }

  addAsset(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">): Asset {
    if (!asset.concepto || typeof asset.concepto !== "string") {
      throw new Error("Concepto is required and must be a string");
    }
    if (typeof asset.cantidad !== "number" || asset.cantidad <= 0) {
      throw new Error("Cantidad must be a positive number");
    }
    if (typeof asset.valor !== "number" || asset.valor < 0) {
      throw new Error("Valor must be a non-negative number");
    }
    if (typeof asset.valor_unitario !== "number" || asset.valor_unitario < 0) {
      throw new Error("Valor unitario must be a non-negative number");
    }
    if (
      !asset.tipo ||
      !["ACCION", "ETF", "CRIPTO", "FIAT", "DEPOSITO"].includes(asset.tipo)
    ) {
      throw new Error("Tipo must be ACCION, ETF, CRIPTO, FIAT, or DEPOSITO");
    }

    const newAsset = this.db.getAssetById(
      this.db.insertAsset(
        asset.concepto,
        asset.cantidad,
        asset.valor,
        asset.valor_unitario,
        asset.tipo
      )
    );
    if (!newAsset) throw new Error("Failed to create asset");

    return {
      id: newAsset.id,
      concepto: newAsset.concepto,
      cantidad: newAsset.cantidad,
      valor: newAsset.valor,
      valor_unitario: newAsset.valor_unitario,
      tipo: (newAsset.tipo || "ACCION") as Asset["tipo"],
      createdAt: newAsset.created_at,
      updatedAt: newAsset.updated_at,
    };
  }

  updateAsset(
    id: number,
    updates: Partial<Omit<Asset, "id" | "createdAt" | "updatedAt">>
  ): boolean {
    return this.db.updateAsset(id, {
      concepto: updates.concepto,
      cantidad: updates.cantidad,
      valor: updates.valor,
      valorUnitario: updates.valor_unitario,
      tipo: updates.tipo,
    });
  }

  deleteAsset(id: number): boolean {
    return this.db.deleteAsset(id);
  }

  async fetchCryptoPriceFromKraken(cryptoType: CryptoType): Promise<number> {
    const config = CRYPTO_CONFIGS[cryptoType];
    if (!config) {
      throw new Error(`Unsupported crypto type: ${cryptoType}`);
    }

    return new Promise((resolve, reject) => {
      const url = `https://api.kraken.com/0/public/Ticker?pair=${config.krakenPair}`;

      https
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const jsonData = JSON.parse(data);

              if (jsonData.error && jsonData.error.length > 0) {
                reject(
                  new Error(`Kraken API error: ${jsonData.error.join(", ")}`)
                );
                return;
              }

              const ticker = jsonData.result?.[config.krakenResultKey];
              if (!ticker) {
                reject(
                  new Error(
                    `${cryptoType} price data not found in Kraken response`
                  )
                );
                return;
              }

              const lastPrice = parseFloat(ticker.c[0]);
              if (isNaN(lastPrice) || lastPrice <= 0) {
                reject(
                  new Error(`Invalid ${cryptoType} price received from Kraken`)
                );
                return;
              }

              resolve(lastPrice);
            } catch (error) {
              console.error("Error parsing Kraken response:", error);
              reject(error);
            }
          });
        })
        .on("error", (error) => {
          console.error(
            `Error fetching ${cryptoType} price from Kraken:`,
            error
          );
          reject(error);
        });
    });
  }

  async fetchGoldPrice(): Promise<number> {
    return new Promise((resolve, reject) => {
      const url =
        "https://www.justetf.com/api/etfs/IE00B4ND3602/quote?currency=EUR&locale=es";

      https
        .get(url, (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              const jsonData = JSON.parse(data);

              // Extract price from latestQuote.raw
              const price = jsonData.latestQuote?.raw;

              if (price === undefined || price === null) {
                reject(new Error("Gold price not found in API response"));
                return;
              }

              const goldPrice = parseFloat(price);
              if (isNaN(goldPrice) || goldPrice <= 0) {
                reject(new Error("Invalid gold price received from API"));
                return;
              }

              resolve(goldPrice);
            } catch (error) {
              console.error("Error parsing gold price response:", error);
              reject(error);
            }
          });
        })
        .on("error", (error) => {
          console.error("Error fetching gold price:", error);
          reject(error);
        });
    });
  }

  async fetchBtcPriceFromKraken(): Promise<number> {
    return this.fetchCryptoPriceFromKraken("BTC");
  }

  async updateAssetWithCryptoPrice(
    assetId: number,
    cryptoType: CryptoType
  ): Promise<Asset> {
    const asset = this.db.getAssetById(assetId);
    if (!asset) {
      throw new Error(`Asset with id ${assetId} not found`);
    }

    const cryptoPrice = await this.fetchCryptoPriceFromKraken(cryptoType);
    const newValorUnitario = cryptoPrice;
    const updated = this.db.updateAsset(assetId, {
      valorUnitario: newValorUnitario,
    });

    if (!updated) {
      throw new Error(`Failed to update asset with ${cryptoType} price`);
    }

    const updatedAsset = this.db.getAssetById(assetId);
    if (!updatedAsset) {
      throw new Error("Failed to retrieve updated asset");
    }

    return {
      id: updatedAsset.id,
      concepto: updatedAsset.concepto,
      cantidad: updatedAsset.cantidad,
      valor: updatedAsset.valor,
      valor_unitario: updatedAsset.valor_unitario,
      tipo: (updatedAsset.tipo || "ACCION") as Asset["tipo"],
      createdAt: updatedAsset.created_at,
      updatedAt: updatedAsset.updated_at,
    };
  }

  async updateAssetWithBtcPrice(assetId: number): Promise<Asset> {
    return this.updateAssetWithCryptoPrice(assetId, "BTC");
  }

  async updateAllCryptoAssetsOnStartup(): Promise<void> {
    try {
      const assets = this.db.getAllAssets();
      const cryptoAssets = assets
        .map((asset) => ({
          asset,
          cryptoType: identifyCrypto(asset),
        }))
        .filter((item) => item.cryptoType !== null);

      if (cryptoAssets.length === 0) {
        console.log("No crypto assets found to update");
        return;
      }

      console.log(`Found ${cryptoAssets.length} crypto asset(s) to update`);

      const assetsByCrypto = new Map<CryptoType, any[]>();
      for (const { asset, cryptoType } of cryptoAssets) {
        if (!assetsByCrypto.has(cryptoType!)) {
          assetsByCrypto.set(cryptoType!, []);
        }
        assetsByCrypto.get(cryptoType!)!.push(asset);
      }

      for (const [cryptoType, assetsList] of assetsByCrypto.entries()) {
        try {
          const price = await this.fetchCryptoPriceFromKraken(cryptoType);

          for (const asset of assetsList) {
            try {
              const newValorUnitario = price;

              const updated = this.db.updateAsset(asset.id, {
                valorUnitario: newValorUnitario,
              });

              if (updated) {
                console.log(
                  `Updated ${cryptoType} asset: ${asset.concepto} (ID: ${asset.id})`
                );
              } else {
                console.error(
                  `Failed to update ${cryptoType} asset: ${asset.concepto} (ID: ${asset.id})`
                );
              }
            } catch (error) {
              console.error(
                `Error updating ${cryptoType} asset ${asset.concepto} (ID: ${asset.id}):`,
                error
              );
            }
          }
        } catch (error) {
          console.error(
            `Error fetching ${cryptoType} price, skipping ${assetsList.length} asset(s):`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Error updating crypto assets on startup:", error);
    }
  }

  async updateAllGoldAssetsOnStartup(): Promise<void> {
    try {
      const assets = this.db.getAllAssets();
      const goldAssets = assets.filter((asset) => identifyGold(asset));

      if (goldAssets.length === 0) {
        console.log("No gold assets found to update");
        return;
      }

      console.log(`Found ${goldAssets.length} gold asset(s) to update`);

      try {
        const goldPrice = await this.fetchGoldPrice();

        for (const asset of goldAssets) {
          try {
            const updated = this.db.updateAsset(asset.id, {
              valorUnitario: goldPrice,
            });

            if (updated) {
              console.log(
                `Updated gold asset: ${asset.concepto} (ID: ${asset.id})`
              );
            } else {
              console.error(
                `Failed to update gold asset: ${asset.concepto} (ID: ${asset.id})`
              );
            }
          } catch (error) {
            console.error(
              `Error updating gold asset ${asset.concepto} (ID: ${asset.id}):`,
              error
            );
          }
        }
      } catch (error) {
        console.error(
          `Error fetching gold price, skipping ${goldAssets.length} asset(s):`,
          error
        );
      }
    } catch (error) {
      console.error("Error updating gold assets on startup:", error);
    }
  }

  async updateAssetWithGoldPrice(assetId: number): Promise<Asset> {
    const asset = this.db.getAssetById(assetId);
    if (!asset) {
      throw new Error(`Asset with id ${assetId} not found`);
    }

    if (!identifyGold(asset)) {
      throw new Error(
        `Asset ${assetId} is not a gold asset or could not be identified`
      );
    }

    const goldPrice = await this.fetchGoldPrice();
    const updated = this.db.updateAsset(assetId, {
      valorUnitario: goldPrice,
    });

    if (!updated) {
      throw new Error(`Failed to update asset with gold price`);
    }

    const updatedAsset = this.db.getAssetById(assetId);
    if (!updatedAsset) {
      throw new Error("Failed to retrieve updated asset");
    }

    return {
      id: updatedAsset.id,
      concepto: updatedAsset.concepto,
      cantidad: updatedAsset.cantidad,
      valor: updatedAsset.valor,
      valor_unitario: updatedAsset.valor_unitario,
      tipo: (updatedAsset.tipo || "ACCION") as Asset["tipo"],
      createdAt: updatedAsset.created_at,
      updatedAt: updatedAsset.updated_at,
    };
  }

  async updateAllBtcAssetsOnStartup(): Promise<void> {
    return this.updateAllCryptoAssetsOnStartup();
  }

  async fetchCryptoPrice(cryptoType: CryptoType): Promise<number> {
    return this.fetchCryptoPriceFromKraken(cryptoType);
  }

  async updateAssetWithDetectedCryptoPrice(assetId: number): Promise<Asset> {
    const asset = this.db.getAssetById(assetId);
    if (!asset) {
      throw new Error(`Asset with id ${assetId} not found`);
    }

    const cryptoType = identifyCrypto(asset);
    if (!cryptoType) {
      throw new Error(
        `Asset ${assetId} is not a supported crypto asset or could not be identified`
      );
    }

    return this.updateAssetWithCryptoPrice(assetId, cryptoType);
  }
}
