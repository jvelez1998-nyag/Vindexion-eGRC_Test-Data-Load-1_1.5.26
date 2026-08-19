import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export function GlobalSuspense({ children }) {
  return (
    <Suspense fallback={<GlobalLoader />}>
      {children}
    </Suspense>
  );
}

function GlobalLoader() {
  return (
    <div className="min-h-screen bg-[#0f1623] flex items-center justify-center">
      <div className="text-center">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative p-6 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600">
            <Loader2 className="h-12 w-12 text-white animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Loading Vindexion eGRC</h3>
        <p className="text-sm text-slate-400">Preparing your workspace...</p>
      </div>
    </div>
  );
}