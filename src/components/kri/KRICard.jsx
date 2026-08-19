import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Edit, Eye } from "lucide-react";

export default function KRICard({ kri, risks, controls, onEdit, onViewDetails, onRefresh }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'green': return 'bg-emerald-500';
      case 'amber': return 'bg-amber-500';
      case 'red': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  const getProgressToTarget = () => {
    if (!kri.target_value) return 0;
    const progress = (kri.current_value / kri.target_value) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const linkedRisks = kri.linked_risks?.map(id => risks.find(r => r.id === id)).filter(Boolean) || [];
  const linkedControls = kri.linked_controls?.map(id => controls.find(c => c.id === id)).filter(Boolean) || [];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548] hover:border-indigo-500/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(kri.traffic_light_status)}`} />
              <Badge className={
                kri.indicator_type === 'kri' ? 'bg-rose-500/20 text-rose-400' :
                kri.indicator_type === 'kci' ? 'bg-blue-500/20 text-blue-400' :
                'bg-emerald-500/20 text-emerald-400'
              }>
                {kri.indicator_type.toUpperCase()}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{kri.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-2">{kri.description}</p>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
              <Edit className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onViewDetails} className="h-7 w-7 p-0">
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-3 bg-[#0f1623] rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Current</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-white">{kri.current_value}</span>
              {kri.unit && <span className="text-xs text-slate-400">{kri.unit}</span>}
            </div>
          </div>
          <div className="p-3 bg-[#0f1623] rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Target</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-indigo-400">{kri.target_value}</span>
              {kri.unit && <span className="text-xs text-slate-400">{kri.unit}</span>}
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-500">Progress to Target</span>
            <span className="text-slate-400">{getProgressToTarget().toFixed(0)}%</span>
          </div>
          <Progress value={getProgressToTarget()} className="h-2" />
        </div>

        <div className="space-y-2 text-xs">
          {linkedRisks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Risks:</span>
              <span className="text-rose-400">{linkedRisks.length} linked</span>
            </div>
          )}
          {linkedControls.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Controls:</span>
              <span className="text-blue-400">{linkedControls.length} linked</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Frequency:</span>
            <span className="text-slate-400">{kri.frequency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}