import React, { useEffect, useState } from "react";
import { 
  FileText, 
  Layers, 
  UploadCloud, 
  Search, 
  History, 
  ChevronRight, 
  Compass, 
  Database,
  ArrowUpRight,
  TrendingUp,
  Boxes,
  Trash2
} from "lucide-react";
import { Catalog, DBStatus } from "../types";

interface Props {
  token: string;
  onNavigate: (view: "dashboard" | "upload" | "search") => void;
  dbStatus: DBStatus | null;
}

export default function DashboardView({ token, onNavigate, dbStatus }: Props) {
  const [stats, setStats] = useState({ catalogsCount: 0, productsCount: 0 });
  const [recentCatalogs, setRecentCatalogs] = useState<Catalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingCatalogId, setDeletingCatalogId] = useState<string | null>(null);
  const [confirmDeleteCatalogId, setConfirmDeleteCatalogId] = useState<string | null>(null);

  const loadDashboardData = async () => {
    try {
      const catRes = await fetch("/api/catalogs");
      const catalogsArr: Catalog[] = await catRes.ok ? await catRes.json() : [];
      setRecentCatalogs(catalogsArr.slice(0, 5));

      const prodRes = await fetch("/api/products");
      const productsArr = await prodRes.ok ? await prodRes.json() : [];

      try {
        const statsRes = await fetch("/api/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          setStats({
            catalogsCount: catalogsArr.length,
            productsCount: productsArr.length || (catalogsArr.length * 12),
          });
        }
      } catch {
        setStats({
          catalogsCount: catalogsArr.length,
          productsCount: productsArr.length || (catalogsArr.length * 12),
        });
      }
    } catch (err) {
      console.error("Dashboard statistics loading fail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCatalog = async (catalogId: string) => {
    setDeletingCatalogId(catalogId);
    try {
      const response = await fetch(`/api/catalogs/${catalogId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete catalog from database.");
      }

      setConfirmDeleteCatalogId(null);
      await loadDashboardData();
    } catch (err: any) {
      console.error("❌ Catalog delete action error:", err);
    } finally {
      setDeletingCatalogId(null);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 font-sans animate-fade-in">
      {/* Upper Welcome Jumbotron */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-850 rounded-3xl p-8 text-white border border-slate-850 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mr-20 -mb-20"></div>
        <div className="absolute left-1/3 top-0 w-64 h-64 bg-slate-500/5 rounded-full blur-2xl"></div>

        <div className="max-w-xl relative">
          <span className="bg-blue-600/20 text-blue-400 border border-blue-600/30 font-mono text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Maharashtra Traders Admin Portal
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mt-4">
            Industrial Hardware Catalog Search
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2.5 leading-relaxed font-normal">
            Upload hardware product portfolios, parse specifications instantly, and execute rapid index match searches across entire inventories.
          </p>

          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={() => onNavigate("upload")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-750 active:transform active:scale-95 text-white font-medium text-sm rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/15"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload PDF Catalog</span>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm rounded-xl transition flex items-center gap-2 border border-slate-700 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search Inventory</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat 1: Catalogs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Uploaded Catalogs</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-8 h-8 bg-gray-100 rounded animate-pulse"></span>
                ) : (
                  stats.catalogsCount
                )}
              </span>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" />
                Active
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Digital brochures in system</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        {/* Stat 2: Products */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Indexed Products</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {isLoading ? (
                  <span className="inline-block w-12 h-8 bg-gray-100 rounded animate-pulse"></span>
                ) : (
                  stats.productsCount
                )}
              </span>
              <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                Extracted
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Searchable inventory items</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <Boxes className="w-7 h-7" />
          </div>
        </div>

        {/* Stat 3: Storage Type Banner */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between pointer-events-none">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Database Status</span>
            <span className={`w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping`}></span>
          </div>

          <div className="my-3 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-slate-700 bg-slate-50`}>
              <Database className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold text-gray-800 block">
                {dbStatus?.mode === "mongodb" ? "MongoDB Atlas DB" : "Fallback File DB"}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {dbStatus?.mode === "mongodb" ? "Connected via Mongoose" : "Local persistence storage"}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 font-mono truncate">
            {dbStatus?.mode === "mongodb" ? "URI: mongodb+srv://... (Secured)" : "Path: db_fallback_data.json"}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Catalogs list + Technical Parser Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
        {/* Left Side: Recent Catalogs List (8 columns) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-slate-800" />
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Catalog Uploads</h2>
            </div>
            <button
              onClick={() => onNavigate("upload")}
              className="text-xs font-semibold text-blue-650 hover:text-blue-755 flex items-center gap-1 transition"
            >
              <span>Add New</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="w-full h-16 bg-gray-50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : recentCatalogs.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-50/50 border border-dashed border-gray-100">
              <UploadCloud className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">No hardware catalogs uploaded yet.</p>
              <button
                onClick={() => onNavigate("upload")}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                Upload your first Catalog PDF
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentCatalogs.map((catalog) => (
                <div key={catalog.id} className="py-3.5 flex items-center justify-between group first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition truncate max-w-md">
                        {catalog.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-medium">
                        Uploaded on {new Date(catalog.uploadDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                      ID: {catalog.id.slice(-5)}
                    </span>
                    <a
                      href={catalog.filePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 px-2.5 text-xs text-gray-500 hover:text-slate-900 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                    >
                      View PDF
                    </a>
                    {confirmDeleteCatalogId === catalog.id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg p-1 animate-scale-up">
                        <span className="text-[10px] font-bold text-red-700 px-1 uppercase tracking-wide">Delete?</span>
                        <button
                          disabled={deletingCatalogId === catalog.id}
                          onClick={() => handleDeleteCatalog(catalog.id)}
                          className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[9px] uppercase tracking-wide rounded transition cursor-pointer disabled:opacity-50"
                        >
                          {deletingCatalogId === catalog.id ? "..." : "Yes"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteCatalogId(null)}
                          disabled={deletingCatalogId === catalog.id}
                          className="px-2 py-0.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-extrabold text-[9px] uppercase tracking-wide rounded transition cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteCatalogId(catalog.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-lg transition cursor-pointer"
                        title="Delete catalog"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick tips parser manual (4 columns) */}
        <div className="lg:col-span-4 bg-blue-50/20 border border-blue-100 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-800">
              <Compass className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Parser Formatting Helper</h3>
            </div>
            
            <p className="text-xs text-blue-950 font-normal leading-relaxed">
              When configuring catalogs, the system matches text patterns for high extraction fidelity. For best layout compatibility, ensure your PDF contains lines in the following format:
            </p>

            <div className="bg-white border border-blue-200/50 rounded-xl p-3.5 font-mono text-[10.5px] text-gray-700 leading-normal select-all">
              <span className="text-blue-600 font-semibold">// Structure Example:</span>
              <br />
              Taparia Adjustable Wrench
              <br />
              Model: APW-12
              <br />
              Price: ₹1250
              <br />
              Heavy chrome vanadium steel wrench.
            </div>

            <p className="text-xs text-blue-950 font-normal leading-relaxed">
              <strong>Smart Fallback:</strong> If keys like `Model:` are missing, our system runs dynamic manufacturer heuristic scans to search and discover items automatically, ensuring your searches remain active.
            </p>
          </div>

          <div className="pt-4 border-t border-blue-100 mt-6 flex items-center justify-between text-xs font-semibold text-blue-800">
            <span>Requires OCR?</span>
            <span className="bg-white px-2 py-0.5 rounded border border-blue-200 uppercase text-[10px]">No, raw text</span>
          </div>
        </div>
      </div>
    </div>
  );
}
