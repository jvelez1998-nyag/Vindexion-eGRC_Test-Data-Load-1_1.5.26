import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Target, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function RiskMitigationTracker({ risks, controls, onUpdate }) {
  const [selectedRisk, setSelectedRisk] = useState(null);

  const calculateMitigationProgress = (risk) => {
    const linkedControls = risk.linked_controls || [];
    if (linkedControls.length === 0) return 0;

    const effectiveControls = linkedControls.filter(controlId => {
      const control = controls.find(c => c.id === controlId);
      return control && (control.status === 'effective' || control.status === 'implemented');
    });

    return Math.round((effectiveControls.length / linkedControls.length) * 100);
  };

  const updateMitigationProgress = async (riskId, progress) => {
    try {
      await base44.entities.Risk.update(riskId, {
        mitigation_progress: progress
      });
      toast.success("Progress updated");
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const risksWithMitigation = risks.map(risk => ({
    ...risk,
    auto_progress: calculateMitigationProgress(risk),
    manual_progress: risk.mitigation_progress || 0
  }));

  const activeRisks = risksWithMitigation.filter(r => r.status !== 'closed' && r.status !== 'accepted');
  const inProgressRisks = activeRisks.filter(r => r.auto_progress > 0 && r.auto_progress < 100);
  const unmitgatedRisks = activeRisks.filter(r => r.auto_progress === 0);

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">In Progress</p>
                <p className="text-2xl font-bold text-blue-400">{inProgressRisks.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Unmitigated</p>
                <p className="text-2xl font-bold text-amber-400">{unmitgatedRisks.length}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Progress</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {activeRisks.length ? Math.round(activeRisks.reduce((sum, r) => sum + r.auto_progress, 0) / activeRisks.length) : 0}%
                </p>
              </div>
              <Target className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mitigation Tracking */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm">Risk Mitigation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {activeRisks.map(risk => {
                const riskScore = (risk.residual_likelihood || 0) * (risk.residual_impact || 0);
                const linkedControlsCount = risk.linked_controls?.length || 0;
                return (
                  <div key={risk.id} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-white mb-1">{risk.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{risk.category}</Badge>
                          <Badge className={`${
                            riskScore >= 16 ? 'bg-red-500/20 text-red-400' :
                            riskScore >= 9 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          } text-xs`}>
                            Score: {riskScore}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {linkedControlsCount} control(s)
                          </span>
                        </div>
                      </div>
                      <Badge className={`${
                        risk.auto_progress === 100 ? 'bg-emerald-500/20 text-emerald-400' :
                        risk.auto_progress > 50 ? 'bg-blue-500/20 text-blue-400' :
                        risk.auto_progress > 0 ? 'bg-amber-500/20 text-amber-400' :
                        'bg-slate-500/20 text-slate-400'
                      }`}>
                        {risk.auto_progress}%
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">Auto-calculated Progress</span>
                          <span className="text-xs text-white">{risk.auto_progress}%</span>
                        </div>
                        <Progress value={risk.auto_progress} className="h-2" />
                      </div>

                      {risk.mitigation_plan && (
                        <div className="p-2 rounded bg-[#1a2332] border border-[#2a3548]">
                          <p className="text-xs text-slate-400 mb-1">Mitigation Plan:</p>
                          <p className="text-xs text-slate-300">{risk.mitigation_plan}</p>
                        </div>
                      )}

                      {linkedControlsCount > 0 && (
                        <div className="pt-2 border-t border-[#2a3548]">
                          <p className="text-xs text-slate-400 mb-1">Linked Controls:</p>
                          <div className="flex flex-wrap gap-1">
                            {risk.linked_controls.map(controlId => {
                              const control = controls.find(c => c.id === controlId);
                              if (!control) return null;
                              return (
                                <Badge key={controlId} variant="outline" className="text-[10px]">
                                  {control.name} ({control.effectiveness}/5)
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}