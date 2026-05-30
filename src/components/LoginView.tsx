import React, { useState } from "react";
import { Lock, FileText, ArrowRight, Store, AlertCircle } from "lucide-react";
import { User } from "../types";

interface Props {
  onLoginSuccess: (token: string, user: User) => void;
}

export default function LoginView({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Trigger login success handler
      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 font-sans selection:bg-blue-200">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-150 shadow-xl shadow-gray-100/40 overflow-hidden transition-all duration-300">
        {/* Visual Brand Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs uppercase tracking-wider font-semibold opacity-90 text-blue-400">Maharashtra Traders</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Catalog Search System</h2>
          <p className="text-sm opacity-80 mt-1 font-medium text-slate-300">Administrative Dashboard Access</p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-rose-800 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 text-rose-600 shrink-0" />
              <div>
                <strong className="font-semibold block mb-0.5">Login attempt failed</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-gray-50/50 hover:bg-gray-55 focus:bg-white border border-gray-200 rounded-xl text-gray-800 text-sm transition-all outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                  placeholder="admin@gmail.com"
                />
                <span className="absolute right-3.5 top-3 text-gray-400">@</span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-gray-50/50 hover:bg-gray-55 focus:bg-white border border-gray-200 rounded-xl text-gray-800 text-sm transition-all outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                  placeholder="••••••••••••"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-blue-600 text-white font-medium text-sm rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Log In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
