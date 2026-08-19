import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShimmerCard, ShimmerStats, ShimmerChart, ShimmerHeatmap, ShimmerList } from "@/components/ui/shimmer-skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0f1623] p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-14 w-14 rounded-xl bg-[#1a2332]" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-[#1a2332]" />
          <Skeleton className="h-4 w-96 bg-[#1a2332]" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 bg-[#1a2332] rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 bg-[#1a2332] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 bg-[#1a2332] rounded-xl" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-20 bg-[#1a2332] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="h-48 bg-[#1a2332] rounded-xl" />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 bg-[#1a2332] rounded-lg" />
      <Skeleton className="h-24 bg-[#1a2332] rounded-lg" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 bg-[#1a2332] rounded-lg" />
        <Skeleton className="h-10 bg-[#1a2332] rounded-lg" />
      </div>
      <Skeleton className="h-32 bg-[#1a2332] rounded-lg" />
      <Skeleton className="h-10 w-32 bg-[#1a2332] rounded-lg" />
    </div>
  );
}