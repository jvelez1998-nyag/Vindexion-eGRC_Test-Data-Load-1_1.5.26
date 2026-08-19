import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function ModuleLoader({ type = "card", count = 1, className = "" }) {
  if (type === "stats") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(count || 4)].map((_, i) => (
          <Card key={i} className="bg-[#1a2332] border-[#2a3548]">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-20 bg-[#2a3548]" />
                <Skeleton className="h-8 w-16 bg-[#2a3548]" />
                <Skeleton className="h-3 w-24 bg-[#2a3548]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
        {[...Array(count || 2)].map((_, i) => (
          <Card key={i} className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <Skeleton className="h-5 w-32 bg-[#2a3548]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full bg-[#2a3548]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === "list") {
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] ${className}`}>
        <CardHeader>
          <Skeleton className="h-5 w-40 bg-[#2a3548]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(count || 5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#151d2e]">
                <Skeleton className="h-10 w-10 rounded-full bg-[#2a3548]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-[#2a3548]" />
                  <Skeleton className="h-3 w-1/2 bg-[#2a3548]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "table") {
    return (
      <Card className={`bg-[#1a2332] border-[#2a3548] ${className}`}>
        <CardHeader>
          <Skeleton className="h-5 w-32 bg-[#2a3548]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(count || 8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b border-[#2a3548]">
                <Skeleton className="h-4 w-1/4 bg-[#2a3548]" />
                <Skeleton className="h-4 w-1/3 bg-[#2a3548]" />
                <Skeleton className="h-4 w-1/6 bg-[#2a3548]" />
                <Skeleton className="h-4 w-1/5 bg-[#2a3548]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "spinner") {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading data...</p>
        </div>
      </div>
    );
  }

  // Default card type
  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <Skeleton className="h-5 w-40 bg-[#2a3548]" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-[#2a3548]" />
              <Skeleton className="h-4 w-5/6 bg-[#2a3548]" />
              <Skeleton className="h-4 w-4/6 bg-[#2a3548]" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function PageLoader({ title = "Loading...", subtitle = null }) {
  return (
    <div className="min-h-screen bg-[#0f1623] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[#1a2332]" />
          {subtitle && <Skeleton className="h-4 w-96 bg-[#1a2332]" />}
        </div>
        <ModuleLoader type="stats" count={4} />
        <ModuleLoader type="chart" count={2} />
        <ModuleLoader type="list" count={5} />
      </div>
    </div>
  );
}

export function DashboardLoader() {
  return (
    <div className="min-h-screen bg-[#0f1623] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64 bg-[#1a2332]" />
        <ModuleLoader type="stats" count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModuleLoader type="chart" count={1} />
          <ModuleLoader type="chart" count={1} />
        </div>
        <ModuleLoader type="list" count={6} />
      </div>
    </div>
  );
}