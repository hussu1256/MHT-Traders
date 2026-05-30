import React, { useState, useEffect } from "react";
import { 
  X, 
  Tag, 
  MapPin, 
  Layers, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Calculator,
  Trash2
} from "lucide-react";
import { Product, MarketComparison, ComparisonData } from "../types";

interface Props {
  productId: string | null;
  token: string;
  onClose: () => void;
  onSelectProduct: (id: string) => void; // for related clicks
  onDeleteSuccess?: () => void;
}

export default function ProductDetailsModal({ productId, token, onClose, onSelectProduct, onDeleteSuccess }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Price comparison states
  const [comparing, setComparing] = useState(false);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [compareError, setCompareError] = useState("");

  // Product Deletion State Managers
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteProduct = async () => {
    if (!productId || !product) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete product from database.");
      }

      setShowDeleteConfirm(false);
      if (onDeleteSuccess) {
        onDeleteSuccess();
      }
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete from server.");
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    if (!productId) return;

    async function loadData() {
      setLoading(true);
      setComparing(false);
      setComparison(null);
      setCompareError("");
      
      try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
          throw new Error("Unable to fetch product detail specs.");
        }
        const data = await response.json();
        setProduct(data.product);
        setRelated(data.related || []);
      } catch (err) {
        console.error("Failed to load product views:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [productId]);

  const handleComparePrice = async () => {
    if (!productId || !product) return;
    setComparing(true);
    setCompareError("");

    try {
      // Fetch mock pricing from Express API route handler
      const response = await fetch(`/api/products/compare/${productId}`);
      if (!response.ok) {
        throw new Error("Market comparison service temporarily unavailable.");
      }
      const data = await response.json();
      setComparison(data);
    } catch (e: any) {
      setCompareError(e.message || "Failed to load average comparisons.");
    } finally {
      setComparing(false);
    }
  };

  if (!productId) return null;

  return (
    <div className="fixed inset-0 z-55 overflow-y-auto font-sans text-left selection:bg-blue-200">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden animate-scale-up">
          {/* Modal Close buttons */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-slate-900 bg-gray-50 border border-gray-100 rounded-xl transition cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {loading ? (
            /* skeleton loader */
            <div className="p-8 space-y-6">
              <div className="h-6 bg-gray-100 rounded-lg w-1/3 animate-pulse"></div>
              <div className="h-10 bg-gray-100 rounded-lg w-3/4 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="h-16 bg-gray-50 rounded-xl animate-pulse"></div>
                ))}
              </div>
              <div className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
            </div>
          ) : !product ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold text-rose-600">Failed to load detailed product profile.</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Close Modal
              </button>
            </div>
          ) : (
            <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto">
              
              {/* Product Heading banner */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-2.5 text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-800 text-xs font-bold rounded-full border border-slate-200">
                    <Tag className="w-3.5 h-3.5 text-slate-500" />
                    Model: {product.model}
                  </span>

                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight pr-8 leading-tight">
                    {product.name}
                  </h2>
                </div>

                <div className="shrink-0 md:pt-2 flex flex-col items-start md:items-end gap-1.5">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(true);
                        setDeleteError("");
                      }}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-[11px] uppercase tracking-wider rounded-xl border border-red-200 hover:border-red-300 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Product</span>
                    </button>
                  ) : (
                    <div className="flex flex-col items-start md:items-end gap-1 bg-red-50 border border-red-150 rounded-2xl p-2.5 animate-scale-up">
                      <span className="text-[10px] font-bold text-red-750 uppercase tracking-wide">Confirm deletion?</span>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={handleDeleteProduct}
                          disabled={deleting}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] uppercase tracking-wide rounded-lg transition disabled:opacity-50 cursor-pointer"
                        >
                          {deleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={deleting}
                          className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-extrabold text-[10px] uppercase tracking-wide rounded-lg transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  {deleteError && (
                    <span className="text-[10px] text-red-600 font-semibold max-w-[150px] text-left md:text-right leading-tight block">
                      {deleteError}
                    </span>
                  )}
                </div>
              </div>

              {/* Major spec sheets grids */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Price */}
                <div className="bg-blue-50/50 border border-blue-105 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10.5px] text-blue-800 font-bold uppercase tracking-wider block">Your Base Price</span>
                  <span className="text-2xl font-extrabold text-blue-600 mt-1">₹{product.price.toLocaleString("en-IN")}</span>
                </div>

                {/* Page Source */}
                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between">
                  <span className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider block">Source Brochure Page</span>
                  <span className="text-lg font-extrabold text-slate-800 mt-1 flex items-center gap-1">
                    <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                    Page {product.page}
                  </span>
                </div>

                {/* Catalog Title */}
                <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 flex flex-col justify-between col-span-2">
                  <span className="text-[10.5px] text-gray-400 font-bold uppercase tracking-wider block">Sourced Catalog Brochure</span>
                  <span className="text-sm font-bold text-slate-800 mt-1 truncate block" title={product.catalogName}>
                    {product.catalogName || "Brochure Archive"}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 text-left">
                <h3 className="text-xs uppercase tracking-wider font-bold text-gray-400">Specification Description</h3>
                <div className="bg-zinc-50 border border-gray-100 rounded-2xl p-5 text-gray-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                  {product.description || "No specific detailed description parsing attributes supplied."}
                </div>
              </div>

              {/* MARKET PRICE COMPARISON MODULE */}
              <div className="border border-gray-150 rounded-2xl p-6 bg-slate-50/40 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Check Market Pricing</h3>
                    <p className="text-xs text-gray-500 font-medium">
                      Simulate direct online pricing matches relative to your base of <strong>₹{product.price}</strong>.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleComparePrice}
                    className="self-start px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-xs uppercase tracking-wider text-white rounded-xl transition flex items-center gap-2 cursor-pointer shrink-0 shadow-md shadow-blue-600/10"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Compare Market Price</span>
                  </button>
                </div>

                {/* Active fetch comparisons table */}
                {comparing && (
                  <div className="py-6 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500">
                    <span className="w-4 h-4 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></span>
                    <span>Querying market indexes...</span>
                  </div>
                )}

                {compareError && (
                  <div className="p-3 bg-rose-50 rounded-xl text-rose-700 text-xs font-semibold">
                    {compareError}
                  </div>
                )}

                {comparison && (
                  <div className="border border-gray-100 bg-white rounded-xl divide-y divide-gray-100 animate-fade-in overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 grid grid-cols-3 text-xs font-bold text-gray-400">
                      <div>Market Platform</div>
                      <div className="text-right">Platform Price</div>
                      <div className="text-right">Your Margin Advantage</div>
                    </div>

                    {comparison.marketComparisons.map((c, i) => {
                      const diffPrice = c.price - product.price;
                      const yourAdvantagePercent = (((c.price - product.price) / c.price) * 100).toFixed(1);
                      const isSafer = diffPrice > 0;

                      return (
                        <div key={i} className="px-4 py-3 grid grid-cols-3 text-sm font-medium text-gray-800 items-center">
                          <div className="font-bold flex items-center gap-1.5">
                            <ShoppingBag className="w-4 h-4 text-gray-400 shrink-0" />
                            {c.source}
                          </div>
                          <div className="text-right font-bold text-slate-900">
                            ₹{c.price.toLocaleString("en-IN")}
                          </div>
                          <div className="text-right">
                            {isSafer ? (
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                                You Save {yourAdvantagePercent}%
                              </span>
                            ) : (
                              <span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold">
                                Bulk Discount ({c.status})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RELATED PRODUCTS */}
              {related.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 text-slate-800 shrink-0" />
                    <h3 className="font-extrabold text-slate-900 text-base">More Products in this Catalog</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {related.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => onSelectProduct(item.id)}
                        className="p-4 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/10 cursor-pointer rounded-2xl flex items-center justify-between group transition duration-300 bg-white"
                      >
                        <div className="space-y-1 pr-4 text-left">
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{item.model}</p>
                          <h4 className="text-sm font-bold text-slate-800 truncate block max-w-[200px]" title={item.name}>
                            {item.name}
                          </h4>
                        </div>
                        <div className="text-right font-extrabold text-slate-900 hover:text-blue-600 transition flex items-center gap-1.5">
                          <span>₹{item.price.toLocaleString("en-IN")}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 shrink-0 transform group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
