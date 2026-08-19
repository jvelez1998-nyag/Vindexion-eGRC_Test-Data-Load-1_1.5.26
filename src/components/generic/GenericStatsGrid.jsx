import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function GenericStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend > 0 ? TrendingUp : stat.trend < 0 ? TrendingDown : Minus;
        
        return (
          <Card 
            key={idx} 
            className={`bg-gradient-to-br ${stat.gradient || 'from-indigo-500/10 to-purple-500/10'} border-${stat.color || 'indigo'}-500/20 p-4`}
          >
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`p-2 rounded-lg bg-${stat.color || 'indigo'}-500/20`}>
                  <Icon className={`h-5 w-5 text-${stat.color || 'indigo'}-400`} />
                </div>
              )}
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
                {stat.trend !== undefined && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${
                    stat.trend > 0 ? 'text-emerald-400' : 
                    stat.trend < 0 ? 'text-rose-400' : 'text-slate-400'
                  }`}>
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}