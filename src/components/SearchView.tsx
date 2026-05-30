import React, { useEffect, useState, useRef } from "react";
import { 
  Search, 
  Layers, 
  Tag, 
  HelpCircle, 
  Sparkles,
  ArrowRight,
  PackageX,
  RefreshCcw,
  Loader2
} from "lucide-react";
import { Product } from "../types";
import ProductDetailsModal from "./ProductDetailsModal";

interface Props {
  token: string;
  onNavigate: (view: "dashboard" | "upload" | "search") => void;
}

export default function SearchView({ token, onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Keep track of active query transitions to prevent race conditions
  const queryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchSearchResults = async (searchVal: string) => {
    setLoading(true);
    try {
      const url = searchVal.trim() 
        ? `/api/products/search?q=${encodeURIComponent(searchVal)}` 
        : "/api/products";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Unable to fetch catalog rows.");
      }
      const data = await response.json();
      setProducts(data);
    } catch (e) {
      console.error("Search query failed:", e);
    } finally {
      setLoading(false);
    }
  };

  // Debounced live typing match
  useEffect(() => {
    if (queryTimerRef.current) {
      clearTimeout(queryTimerRef.current);
    }

    // Debounce state mutations for 300ms to reduce database spikes
    queryTimerRef.current = setTimeout(() => {
      fetchSearchResults(query);
    }, 300);

    return () => {
      if (queryTimerRef.current) {
        clearTimeout(queryTimerRef.current);
      }
    };
  }, [query]);

  return (
    <div className="space-y-8 font-sans text-left animate-fade-in relative selection:bg-blue-200">
      
      {/* Title Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Search Hardware Catalogues</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            Query across imported manufacturers, models, and specifications with instantaneous live queries.
          </p>
        </div>
        
        <button
          onClick={() => {
            setQuery("");
            fetchSearchResults("");
          }}
          className="self-start px-4 py-2 bg-gray-50 hover:bg-gray-100 ring-1 ring-gray-200 hover:ring-gray-300 transition rounded-xl text-xs font-bold text-gray-600 flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Reset Filter</span>
        </button>
      </div>

      {/* Modern Large Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pr-3 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition duration-300">
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        <input
          id="product-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type hardware name or model (e.g., 'drill', 'wrench', 'valve', 'APW')..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-150 rounded-2xl text-sm font-medium outline-none transition duration-300 shadow-sm shadow-gray-100/50 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 placeholder-gray-400"
        />
      </div>

      {/* Grid Content Listings */}
      {loading && products.length === 0 ? (
        /* Skeletons */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4 shadow-sm">
              <div className="h-4 bg-gray-100 rounded w-1/4 animate-pulse"></div>
              <div className="h-6 bg-gray-100 rounded w-3/4 animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded w-full animate-pulse"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                <div className="h-6 bg-gray-100 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty states */
        <div className="bg-white border border-gray-100 rounded-3xl py-16 px-6 text-center shadow-sm space-y-4">
          <div className="inline-flex p-4 bg-slate-50 text-slate-400 rounded-2xl">
            <PackageX className="w-12 h-12 text-slate-300" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-800">No Match Found</h3>
            <p className="text-sm text-gray-500 font-medium">
              We couldn't find any products matching <strong className="text-slate-800 font-semibold">"{query}"</strong>. Try checking your spelling or search terms.
            </p>
          </div>

          <div className="pt-4 flex justify-center gap-4">
            <button
              onClick={() => onNavigate("upload")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs uppercase tracking-wider text-white rounded-xl transition cursor-pointer shadow-lg shadow-blue-600/10"
            >
              Upload Brand Catalog
            </button>
            <button
              onClick={() => setQuery("")}
              className="px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-gray-200 cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        </div>
      ) : (
        /* Real Product Display Bento Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProductId(product.id)}
              className="bg-white rounded-2xl border border-gray-150 hover:border-blue-600 shadow-sm hover:shadow-xl hover:shadow-gray-200/40 p-5 flex flex-col justify-between group transition-all duration-300 cursor-pointer hover:transform hover:-translate-y-0.5"
            >
              <div className="space-y-3.5 text-left">
                {/* ID & Model labels */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2.5 py-0.5 rounded-md bg-slate-55 border border-slate-200 text-slate-800 font-mono text-[10.5px] font-bold tracking-tight">
                    {product.model}
                  </span>
                  {product.page && (
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3 text-gray-300 shrink-0" />
                      Page {product.page}
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-extrabold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition truncate-2-lines line-clamp-2 h-12" title={product.name}>
                  {product.name}
                </h3>

                {/* Shortened Description */}
                <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2 min-h-8">
                  {product.description || "Hardware catalogue specification profile details matches."}
                </p>
              </div>

              {/* Bottom stats price tagging */}
              <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9.5px] uppercase tracking-wider font-bold text-gray-400 block font-sans">Business Price</span>
                  <span className="text-base font-bold text-blue-600">₹{product.price.toLocaleString("en-IN")}</span>
                </div>

                <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition duration-300 shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL (Overlay injection) */}
      <ProductDetailsModal
        productId={selectedProductId}
        token={token}
        onClose={() => setSelectedProductId(null)}
        onSelectProduct={(id) => setSelectedProductId(id)}
        onDeleteSuccess={() => {
          setSelectedProductId(null);
          fetchSearchResults(query);
        }}
      />
    </div>
  );
}
