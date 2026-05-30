import React from "react";
import { Database, AlertTriangle, ShieldCheck } from "lucide-react";
import { DBStatus } from "../types";

interface Props {
  status: DBStatus | null;
}

export default function DBStatusBadge({ status }: Props) {
  if (!status) return null;

  const isMongo = status.mode === "mongodb";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-300 ${
        isMongo
          ? "bg-emerald-50/80 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
          : "bg-amber-50/80 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400"
      }`}
    >
      {isMongo ? (
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      )}
      <Database className="w-3 h-3 shrink-0" />
      <span>
        Mode: <strong className="font-semibold">{isMongo ? "MongoDB Atlas" : "Local Fallback"}</strong>
      </span>
      <span className="inline-flex w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
    </div>
  );
}
