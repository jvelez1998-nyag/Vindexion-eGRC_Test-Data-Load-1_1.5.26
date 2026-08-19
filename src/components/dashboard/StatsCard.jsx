import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = "blue", onClick }) {
  const colorMap = {
    indigo: { bg: "from-indigo-500 to-purple-500", border: "border-purple-500/20" },
    emerald: { bg: "from-emerald-500 to-teal-500", border: "border-teal-500/20" },
    amber: { bg: "from-amber-500 to-orange-500", border: "border-orange-500/20" },
    rose: { bg: "from-rose-500 to-red-500", border: "border-red-500/20" },
    violet: { bg: "from-violet-500 to-purple-500", border: "border-purple-500/20" },
    blue: { bg: "from-blue-500 to-cyan-500", border: "border-cyan-500/20" },
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <Card 
      className={cn(
        `bg-gradient-to-br ${colors.bg}/10 ${colors.border} hover:brightness-110 transition-all`,
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">{title}</span>
          {trend && (
            <Badge className={trend === 'up' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}>
              {trendValue || trend}
            </Badge>
          )}
        </div>
        <div className="text-3xl font-bold text-white">{value}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}