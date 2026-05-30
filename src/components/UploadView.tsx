import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  BadgeCheck,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Catalog } from "../types";

interface Props {
  token: string;
  onNavigate: (view: "dashboard" | "upload" | "search") => void;
  onUploadCompleted?: () => void;
}

export default function UploadView({ token, onNavigate, onUploadCompleted }: Props) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [catalogName, setCatalogName] = useState("");
  
  // Status states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorLocal, setErrorLocal] = useState("");
  
  // Results states
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    catalog: Catalog;
    productsCount: number;
    totalPages: number;
    parsingMethod?: "pdf-parse" | "fallback";
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag handers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorLocal("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorLocal("");
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorLocal("Invalid file format. Please select or drop a valid PDF brochure catalog.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorLocal("File size exceeds our 15MB limit. Please compress your PDF and try again.");
      return;
    }

    setSelectedFile(file);
    // Autofill name if empty
    if (!catalogName) {
      const formatted = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[\-_]+/g, " ")
        .slice(0, 50);
      setCatalogName(formatted);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCatalogName("");
    setUploadResult(null);
    setErrorLocal("");
    setUploadPercent(0);
    setIsUploading(false);
    setStatusMessage("");
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorLocal("Please select a PDF file to upload.");
      return;
    }

    setIsUploading(true);
    setErrorLocal("");
    setStatusMessage("Packaging catalog archive...");
    setUploadPercent(15);

    try {
      const formData = new FormData();
      formData.append("catalog", selectedFile);
      formData.append("name", catalogName.trim());

      // Simulate a multi-stage upload progress for better UX
      const progressTimer1 = setTimeout(() => {
        setStatusMessage("Reading binary catalog buffers...");
        setUploadPercent(40);
      }, 700);

      const progressTimer2 = setTimeout(() => {
        setStatusMessage("Extracting digital PDF contents page-by-page...");
        setUploadPercent(75);
      }, 2000);

      const response = await fetch("/api/catalog/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);

      let data: any = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textText = await response.text();
        console.error("HTML response received instead of JSON:", textText);
        if (response.status === 403) {
          throw new Error("Administrative session expired or invalid. To resolve this, simply click 'Sign Out Session' at the bottom-left of the page, then log in again with 'admin@gmail.com' / 'admin12345' to refresh your session keys.");
        }
        const titleMatch = textText.match(/<title>(.*?)<\/title>/i);
        const titleMsg = titleMatch ? titleMatch[1] : "HTML Error Page";
        const bodySnippet = textText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").substring(0, 200).trim();
        throw new Error(`Server returned HTML (${response.status} ${response.statusText}): ${titleMsg}. Snip: ${bodySnippet}`);
      }

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Administrative session expired or invalid. To resolve this, simply click 'Sign Out Session' at the bottom-left of the page, then log in again with 'admin@gmail.com' / 'admin12345' to refresh your session keys.");
        }
        throw new Error(data.error || "Catalog processing and database index insertion failed.");
      }

      setUploadPercent(100);
      setStatusMessage("Saving products and writing catalogue specs to database...");
      
      setTimeout(() => {
        setUploadResult({
          success: true,
          catalog: data.catalog,
          productsCount: data.productsCount,
          totalPages: data.totalPages,
          parsingMethod: data.parsingMethod,
        });
        setIsUploading(false);
        if (onUploadCompleted) onUploadCompleted();
      }, 500);

    } catch (err: any) {
      setErrorLocal(err.message || "Network transfer fail. Verify MongoDB cluster accessibility.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 font-sans text-left animate-fade-in">
      {/* Title block */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Upload Product Brochures</h1>
        <p className="text-sm text-gray-500 font-medium">
          Upload PDF brochures, parse specification keys, and automatically load newly extracted hardware products into MongoDB.
        </p>
      </div>

      {/* Main Upload Box */}
      {uploadResult ? (
        /* Success Screen */
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-8 space-y-8 animate-scale-up">
          <div className="text-center space-y-3">
            <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Brochure Parsed Successfully</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your uploaded PDF was correctly processed. Hardware products were extracted and mapped under their respective database references.
            </p>
          </div>

          {/* Catalog Metadata Details */}
          <div className="bg-slate-50 border border-gray-100 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-left">
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Catalog Name</span>
              <span className="text-sm font-semibold text-gray-800">{uploadResult.catalog.name}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Extracted Count</span>
              <span className="text-sm font-bold text-blue-600 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-4 h-4" />
                {uploadResult.productsCount} Hardware Products
              </span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Total Brochure Pages</span>
              <span className="text-sm font-semibold text-gray-800">{uploadResult.totalPages} Pages</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">Extraction Intelligence</span>
              {uploadResult.parsingMethod === "pdf-parse" ? (
                <span className="text-xs font-bold bg-blue-50 text-blue-700 border border-blue-150 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-0.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  Offline Tabular PDF Parser
                </span>
              ) : (
                <span className="text-xs font-bold bg-amber-55/10 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mt-0.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  Standard Text Fallback
                </span>
              )}
            </div>
            <div className="md:col-span-2">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider block">System Database ID</span>
              <span className="text-xs font-mono bg-white border border-gray-150 px-2 py-0.5 rounded text-gray-600 select-all inline-block mt-0.5">
                {uploadResult.catalog.id}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-gray-50">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition cursor-pointer"
            >
              Parse Another PDF
            </button>
            <button
              onClick={() => onNavigate("search")}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/10"
            >
              <span>Explore Extracted Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form Drop Area */
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6">
            {errorLocal && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold block mb-0.5">Upload Error</strong>
                  <span>{errorLocal}</span>
                </div>
              </div>
            )}

            {/* Catalog Name Field */}
            <div>
              <label htmlFor="cat-name-field" className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                1. Custom Catalog Title / Business Name
              </label>
              <input
                id="cat-name-field"
                type="text"
                required
                value={catalogName}
                onChange={(e) => setCatalogName(e.target.value)}
                placeholder="e.g., Bosch Electric Hardware Catalog - Summer 2026"
                className="w-full px-4 py-3 bg-gray-55/40 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-blue-600 rounded-xl text-sm font-medium outline-none transition focus:ring-1 focus:ring-blue-600/20"
              />
            </div>

            {/* Drag Area */}
            <div>
              <span className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                2. Select or Drop PDF Brochure Catalog
              </span>

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerSelect}
                className={`w-full py-12 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-blue-600 bg-blue-50/20"
                    : "border-gray-200 hover:border-blue-400 hover:bg-gray-50/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className={`p-4 rounded-xl ${selectedFile ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"}`}>
                  {selectedFile ? (
                    <FileText className="w-8 h-8 text-blue-600" />
                  ) : (
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                  )}
                </div>

                <div className="text-center">
                  <span className="text-sm font-bold text-gray-800 block">
                    {selectedFile ? selectedFile.name : "Click to select or drag PDF catalog file here"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {selectedFile
                      ? `Size: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : "Strictly pdf files, maximum size 15MB limits"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom active parsing loading panels */}
          {isUploading ? (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  {statusMessage}
                </span>
                <span className="font-bold text-blue-600 font-mono">{uploadPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${uploadPercent}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 text-center font-medium italic">
                Our parser reads digital text tables page-by-page. Please do not close this container.
              </p>
            </div>
          ) : (
            <button
              id="upload-catalog-submit-btn"
              type="submit"
              disabled={!selectedFile}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-tight transition shadow-lg flex items-center justify-center gap-2 border cursor-pointer ${
                selectedFile
                  ? "bg-slate-900 hover:bg-blue-600 border-slate-950 hover:border-blue-500 text-white shadow-slate-900/10"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
              }`}
            >
              <BadgeCheck className="w-5 h-5" />
              <span>Validate and Start PDF Extraction</span>
            </button>
          )}
        </form>
      )}
    </div>
  );
}
