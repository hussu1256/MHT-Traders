export interface User {
  email: string;
  name: string;
}

export interface Catalog {
  id: string;
  name: string;
  filePath: string;
  uploadDate: string;
}

export interface Product {
  id: string;
  name: string;
  model: string;
  price: number;
  description: string;
  catalogId: string;
  page: number;
  catalogName?: string;
  uploadDate?: string;
}

export interface MarketComparison {
  source: string;
  price: number;
  status: string;
}

export interface ComparisonData {
  yourPrice: number;
  marketComparisons: MarketComparison[];
}

export interface DBStatus {
  mode: "mongodb" | "local";
  connected: boolean;
  dbPath: string;
}
