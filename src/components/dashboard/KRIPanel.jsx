import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";

export default function KRIPanel({ indicators = [], risks = [] }) {
  const safeIndicators = Array.isArray(indicators) ? indicators.filter(i => i) : [];
  const safeRisks = Array.isArray(risks) ? risks.filter(r => r) : [];
  
  const kriData = safeIndicators.filter(i => i.indicator_type === 'kri' && i.status === 'active');

  const getStatus = (indicator) => {
    const value = indicator.current_value || 0;
    const isHigherBetter = indicator.direction === 'higher_better';
    
    if (isHigherBetter) {
      if (value >= indicator.threshold_green) return 'green';
      if (value >= indicator.threshold_amber) return 'amber';
      return 'red';
    } else {
      if (value <= indicator.threshold_green) return 'green';
      if (value <= indicator.threshold_amber) return 'amber';
      return 'red';
    }
  };

  const statusColors = {
    green: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    red: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', dot: 'bg-rose-500' }
  };

  // Calculate summary metrics
  const criticalRisks = safeRisks.filter(r => (r.likelihood || 0) * (r.impact || 0) >= 16).length;
  const highRisks = safeRisks.filter(r => { const s = (r.likelihood || 0) * (r.impact || 0); return s >= 9 && s < 16; }).length;
  const openRisks = safeRisks.filter(r => r.status !== 'closed').length;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-400" />
          Key Risk Indicators (KRIs)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Quick Summary */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
            <p className="text-[10px] text-slate-500 uppercase mb-0.5">Critical</p>
            <p className="text-lg font-bold text-rose-400">{criticalRisks}</p>
          </div>
          <div className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
            <p className="text-[10px] text-slate-500 uppercase mb-0.5">High</p>
            <p className="text-lg font-bold text-amber-400">{highRisks}</p>
          </div>
          <div className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548]">
            <p className="text-[10px] text-slate-500 uppercase mb-0.5">Open</p>
            <p className="text-lg font-bold text-blue-400">{openRisks}</p>
          </div>
        </div>

        {/* Custom KRIs */}
        {kriData.length > 0 ? (
          <div className="space-y-1.5">
            {kriData.slice(0, 3).map((kri) => {
              const status = getStatus(kri);
              const colors = statusColors[status];
              return (
                <div key={kri.id} className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                      <span className="text-xs font-medium text-white">{kri.name}</span>
                    </div>
                    <span className={`text-sm font-bold ${colors.text}`}>
                      {kri.current_value}{kri.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">Target: {kri.target_value}{kri.unit}</span>
                    <Badge className={`${colors.bg} ${colors.text} border-0 text-[9px] h-4 px-1.5`}>
                      {status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-3">No KRIs configured</p>
        )}
      </CardContent>
    </Card>
  );
}