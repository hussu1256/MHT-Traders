import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";

// Define default fallback path
const FALLBACK_DB_PATH = path.join(process.cwd(), "db_fallback_data.json");

// Connection state track
let isConnected = false;
let dbMode: "mongodb" | "local" = "local";

// Define Mongoose Schema for Catalog
const CatalogSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    filePath: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Define Mongoose Schema for Product
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    model: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    description: { type: String },
    catalogId: { type: String, required: true, index: true },
    page: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Prevent re-compilation models
export const CatalogModel = (mongoose.models.Catalog || mongoose.model("Catalog", CatalogSchema)) as any;
export const ProductModel = (mongoose.models.Product || mongoose.model("Product", ProductSchema)) as any;

// Memory fallback cache if file reads are high or fs is slower
interface LocalCatalog {
  _id: string;
  name: string;
  filePath: string;
  uploadDate: string;
  createdAt: string;
  updatedAt: string;
}

interface LocalProduct {
  _id: string;
  name: string;
  model: string;
  price: number;
  description: string;
  catalogId: string;
  page: number;
  createdAt: string;
  updatedAt: string;
}

interface LocalDB {
  catalogs: LocalCatalog[];
  products: LocalProduct[];
}

// Read/Write Local DB Helpers
async function readLocalDB(): Promise<LocalDB> {
  try {
    const data = await fs.readFile(FALLBACK_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // Return empty if not found, write initial
    const initial: LocalDB = { catalogs: [], products: [] };
    await fs.writeFile(FALLBACK_DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
}

async function writeLocalDB(data: LocalDB): Promise<void> {
  await fs.writeFile(FALLBACK_DB_PATH, JSON.stringify(data, null, 2));
}

// Database Connection Orchestrator
export async function connectDB(): Promise<boolean> {
  if (isConnected) return true;

  const currentUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!currentUri) {
    dbMode = "local";
    return false;
  }

  try {
    // Attempt Mongoose connection with a 4-second timeout to check responsiveness quickly
    await mongoose.connect(currentUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isConnected = true;
    dbMode = "mongodb";
    console.log("🔌 Connected to MongoDB Atlas successfully.");
    return true;
  } catch (error) {
    // Silent transition to local file mode if cluster auth or connection is not fully completed
    dbMode = "local";
    return false;
  }
}

// Unified Database Helpers matching requested requirements
export interface ICatalog {
  id: string;
  name: string;
  filePath: string;
  uploadDate: Date;
}

export interface IProduct {
  id: string;
  name: string;
  model: string;
  price: number;
  description: string;
  catalogId: string;
  page: number;
  catalogName?: string;
  uploadDate?: Date;
}

export const dbService = {
  getMode: () => dbMode,
  isConnected: () => isConnected,

  // Get list of all catalogs
  async getCatalogs(): Promise<ICatalog[]> {
    await connectDB();
    if (dbMode === "mongodb") {
      const catalogs = await CatalogModel.find().sort({ uploadDate: -1 });
      return catalogs.map((c) => ({
        id: c._id.toString(),
        name: c.name,
        filePath: c.filePath,
        uploadDate: c.uploadDate,
      }));
    } else {
      const db = await readLocalDB();
      // Sort newest first
      const sorted = [...db.catalogs].sort(
        (a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      );
      return sorted.map((c) => ({
        id: c._id,
        name: c.name,
        filePath: c.filePath,
        uploadDate: new Date(c.uploadDate),
      }));
    }
  },

  // Save new catalog record
  async createCatalog(name: string, filePath: string): Promise<ICatalog> {
    await connectDB();
    const id = dbMode === "mongodb" ? new mongoose.Types.ObjectId().toString() : `cat_${Date.now()}`;
    const uploadDate = new Date();

    if (dbMode === "mongodb") {
      const catalog = new CatalogModel({
        _id: id,
        name,
        filePath,
        uploadDate,
      });
      await catalog.save();
      return {
        id: catalog._id.toString(),
        name: catalog.name,
        filePath: catalog.filePath,
        uploadDate: catalog.uploadDate,
      };
    } else {
      const db = await readLocalDB();
      const newCat: LocalCatalog = {
        _id: id,
        name,
        filePath,
        uploadDate: uploadDate.toISOString(),
        createdAt: uploadDate.toISOString(),
        updatedAt: uploadDate.toISOString(),
      };
      db.catalogs.push(newCat);
      await writeLocalDB(db);
      return {
        id,
        name,
        filePath,
        uploadDate,
      };
    }
  },

  // Batch insert products
  async createProducts(products: Omit<IProduct, "id">[]): Promise<number> {
    await connectDB();
    if (dbMode === "mongodb") {
      const docs = products.map((p) => ({
        name: p.name,
        model: p.model,
        price: p.price,
        description: p.description,
        catalogId: p.catalogId,
        page: p.page,
      }));
      const result = await ProductModel.insertMany(docs);
      return result.length;
    } else {
      const db = await readLocalDB();
      let count = 0;
      const now = new Date().toISOString();
      for (const p of products) {
        const newProd: LocalProduct = {
          _id: `prod_${Date.now()}_${count++}_${Math.floor(Math.random() * 1000)}`,
          name: p.name,
          model: p.model,
          price: p.price,
          description: p.description,
          catalogId: p.catalogId,
          page: p.page,
          createdAt: now,
          updatedAt: now,
        };
        db.products.push(newProd);
      }
      await writeLocalDB(db);
      return products.length;
    }
  },

  // Search products with query string (name / model)
  async searchProducts(queryStr: string): Promise<IProduct[]> {
    await connectDB();
    const cleanQuery = (queryStr || "").trim();

    if (dbMode === "mongodb") {
      const filter: any = {};
      if (cleanQuery) {
        const regex = new RegExp(cleanQuery, "i");
        filter.$or = [{ name: regex }, { model: regex }];
      }
      const products = await ProductModel.find(filter).limit(100);
      
      // Map and attach names
      const catalogIds = products.map((p) => p.catalogId);
      const catalogs = await CatalogModel.find({ _id: { $in: catalogIds } });
      const catalogMap = new Map(catalogs.map((c) => [c._id.toString(), c]));

      return products.map((p) => {
        const cat = catalogMap.get(p.catalogId.toString()) as any;
        return {
          id: p._id.toString(),
          name: p.name,
          model: p.model,
          price: p.price,
          description: p.description || "",
          catalogId: p.catalogId.toString(),
          page: p.page,
          catalogName: cat ? cat.name : "Unknown Catalog",
          uploadDate: cat ? cat.uploadDate : undefined,
        };
      });
    } else {
      const db = await readLocalDB();
      let results = db.products;
      if (cleanQuery) {
        const regex = new RegExp(cleanQuery, "i");
        results = db.products.filter((p) => regex.test(p.name) || regex.test(p.model));
      }

      // Fetch catalogs map
      const catalogMap = new Map(db.catalogs.map((c) => [c._id, c]));

      return results.map((p) => {
        const cat = catalogMap.get(p.catalogId);
        return {
          id: p._id,
          name: p.name,
          model: p.model,
          price: p.price,
          description: p.description || "",
          catalogId: p.catalogId,
          page: p.page,
          catalogName: cat ? cat.name : "Unknown Catalog",
          uploadDate: cat ? new Date(cat.uploadDate) : undefined,
        };
      });
    }
  },

  // Fetch standard limited list of products
  async getProductsList(limitVal = 50): Promise<IProduct[]> {
    await connectDB();
    if (dbMode === "mongodb") {
      const products = await ProductModel.find().sort({ createdAt: -1 }).limit(limitVal);
      const catalogIds = products.map((p) => p.catalogId);
      const catalogs = await CatalogModel.find({ _id: { $in: catalogIds } });
      const catalogMap = new Map(catalogs.map((c) => [c._id.toString(), c]));

      return products.map((p) => {
        const cat = catalogMap.get(p.catalogId.toString()) as any;
        return {
          id: p._id.toString(),
          name: p.name,
          model: p.model,
          price: p.price,
          description: p.description || "",
          catalogId: p.catalogId.toString(),
          page: p.page,
          catalogName: cat ? cat.name : "Unknown Catalog",
          uploadDate: cat ? cat.uploadDate : undefined,
        };
      });
    } else {
      const db = await readLocalDB();
      const results = [...db.products].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, limitVal);

      const catalogMap = new Map(db.catalogs.map((c) => [c._id, c]));

      return results.map((p) => {
        const cat = catalogMap.get(p.catalogId);
        return {
          id: p._id,
          name: p.name,
          model: p.model,
          price: p.price,
          description: p.description || "",
          catalogId: p.catalogId,
          page: p.page,
          catalogName: cat ? cat.name : "Unknown Catalog",
          uploadDate: cat ? new Date(cat.uploadDate) : undefined,
        };
      });
    }
  },

  // Fetch product detail by ID with catalog context and related products from same catalog
  async getProductDetail(productId: string): Promise<{ product: IProduct | null; related: IProduct[] }> {
    await connectDB();
    if (dbMode === "mongodb") {
      try {
        const product = await ProductModel.findById(productId);
        if (!product) return { product: null, related: [] };

        const catalog = await CatalogModel.findById(product.catalogId);
        const relatedDocs = await ProductModel.find({
          catalogId: product.catalogId,
          _id: { $ne: product._id },
        }).limit(6);

        const mappedProduct: IProduct = {
          id: product._id.toString(),
          name: product.name,
          model: product.model,
          price: product.price,
          description: product.description || "",
          catalogId: product.catalogId.toString(),
          page: product.page,
          catalogName: catalog ? catalog.name : "Unknown Catalog",
          uploadDate: catalog ? catalog.uploadDate : undefined,
        };

        const mappedRelated = relatedDocs.map((r) => ({
          id: r._id.toString(),
          name: r.name,
          model: r.model,
          price: r.price,
          description: r.description || "",
          catalogId: r.catalogId.toString(),
          page: r.page,
        }));

        return { product: mappedProduct, related: mappedRelated };
      } catch (err) {
        return { product: null, related: [] };
      }
    } else {
      const db = await readLocalDB();
      const productDoc = db.products.find((p) => p._id === productId);
      if (!productDoc) return { product: null, related: [] };

      const catalog = db.catalogs.find((c) => c._id === productDoc.catalogId);

      const mappedProduct: IProduct = {
        id: productDoc._id,
        name: productDoc.name,
        model: productDoc.model,
        price: productDoc.price,
        description: productDoc.description || "",
        catalogId: productDoc.catalogId,
        page: productDoc.page,
        catalogName: catalog ? catalog.name : "Unknown Catalog",
        uploadDate: catalog ? new Date(catalog.uploadDate) : undefined,
      };

      const relatedDocs = db.products
        .filter((p) => p.catalogId === productDoc.catalogId && p._id !== productDoc._id)
        .slice(0, 6);

      const mappedRelated = relatedDocs.map((r) => ({
        id: r._id,
        name: r.name,
        model: r.model,
        price: r.price,
        description: r.description || "",
        catalogId: r.catalogId,
        page: r.page,
      }));

      return { product: mappedProduct, related: mappedRelated };
    }
  },

  // Fast count query for stats
  async getStats(): Promise<{ catalogsCount: number; productsCount: number }> {
    await connectDB();
    if (dbMode === "mongodb") {
      try {
        const catalogsCount = await CatalogModel.countDocuments();
        const productsCount = await ProductModel.countDocuments();
        return { catalogsCount, productsCount };
      } catch {
        return { catalogsCount: 0, productsCount: 0 };
      }
    } else {
      const db = await readLocalDB();
      return {
        catalogsCount: db.catalogs.length,
        productsCount: db.products.length,
      };
    }
  },

  // Delete product by id in MongoDB or Local fallback
  async deleteProduct(productId: string): Promise<boolean> {
    await connectDB();
    if (dbMode === "mongodb") {
      try {
        const result = await ProductModel.deleteOne({ _id: productId });
        return result.deletedCount > 0;
      } catch (err) {
        console.error("Failed to delete product in Mongo:", err);
        return false;
      }
    } else {
      try {
        const db = await readLocalDB();
        const initialLen = db.products.length;
        db.products = db.products.filter((p) => p._id !== productId);
        await writeLocalDB(db);
        return db.products.length < initialLen;
      } catch (err) {
        console.error("Failed to delete product in LocalDB:", err);
        return false;
      }
    }
  },

  // Delete catalog by id (along with all cascade products and returning file path for disk removal)
  async deleteCatalog(catalogId: string): Promise<{ success: boolean; filePath: string | null }> {
    await connectDB();
    let filePath: string | null = null;
    if (dbMode === "mongodb") {
      try {
        const catalog = await CatalogModel.findById(catalogId);
        if (catalog) {
          filePath = catalog.filePath;
        }
        await CatalogModel.deleteOne({ _id: catalogId });
        await ProductModel.deleteMany({ catalogId: catalogId });
        return { success: true, filePath };
      } catch (err) {
        console.error("Failed to delete catalog dynamically in Mongo:", err);
        return { success: false, filePath: null };
      }
    } else {
      try {
        const db = await readLocalDB();
        const catalogIdx = db.catalogs.findIndex((c) => c._id === catalogId);
        if (catalogIdx !== -1) {
          filePath = db.catalogs[catalogIdx].filePath;
          db.catalogs.splice(catalogIdx, 1);
        }
        db.products = db.products.filter((p) => p.catalogId !== catalogId);
        await writeLocalDB(db);
        return { success: true, filePath };
      } catch (err) {
        console.error("Failed to delete catalog dynamically in LocalDB:", err);
        return { success: false, filePath: null };
      }
    }
  },
};
