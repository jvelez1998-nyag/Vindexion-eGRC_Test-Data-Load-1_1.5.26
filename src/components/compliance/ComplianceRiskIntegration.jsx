import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Shield, Link, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function ComplianceRiskIntegration({ compliance, risks, controls, onRefresh }) {
  const [linkingMode, setLinkingMode] = useState(false);

  // Calculate compliance risk scores
  const complianceWithRisks = compliance.map(req => {
    // Find risks related to this compliance requirement
    const relatedRisks = risks.filter(risk => 
      risk.related_regulations?.includes(req.framework) ||
      risk.category === 'compliance'
    );

    const avgRiskScore = relatedRisks.length ? 
      relatedRisks.reduce((sum, r) => sum + ((r.residual_likelihood || 0) * (r.residual_impact || 0)), 0) / relatedRisks.length : 0;

    // Find controls that address this requirement
    const relatedControls = controls.filter(control => 
      control.framework_mappings?.[req.framework]?.length > 0 ||
      control.regulatory_mappings?.includes(req.framework)
    );

    const avgControlEffectiveness = relatedControls.length ?
      relatedControls.reduce((sum, c) => sum + (c.effectiveness || 0), 0) / relatedControls.length : 0;

    // Calculate compliance risk score (0-100)
    const complianceRiskScore = Math.round(
      (avgRiskScore * 4) + // Risk contribution (max 100)
      ((5 - avgControlEffectiveness) * 10) + // Control gap contribution (max 50)
      (req.status === 'non_compliant' ? 25 : req.status === 'not_started' ? 15 : 0) // Status contribution
    );

    return {
      ...req,
      relatedRisks,
      relatedControls,
      avgRiskScore: avgRiskScore.toFixed(1),
      avgControlEffectiveness: avgControlEffectiveness.toFixed(1),
      complianceRiskScore: Math.min(complianceRiskScore, 100)
    };
  });

  const criticalComplianceRisks = complianceWithRisks.filter(c => c.complianceRiskScore >= 70);
  const highComplianceRisks = complianceWithRisks.filter(c => c.complianceRiskScore >= 50 && c.complianceRiskScore < 70);

  const linkRiskToCompliance = async (complianceId, riskId) => {
    try {
      const req = compliance.find(c => c.id === complianceId);
      const linkedRisks = req.linked_risks || [];
      
      if (!linkedRisks.includes(riskId)) {
        await base44.entities.Compliance.update(complianceId, {
          linked_risks: [...linkedRisks, riskId]
        });
        toast.success("Risk linked to compliance requirement");
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      toast.error("Failed to link risk");
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Critical Risk</p>
                <p className="text-2xl font-bold text-red-400">{criticalComplianceRisks.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">High Risk</p>
                <p className="text-2xl font-bold text-amber-400">{highComplianceRisks.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Risk Score</p>
                <p className="text-2xl font-bold text-blue-400">
                  {complianceWithRisks.length ? 
                    Math.round(complianceWithRisks.reduce((sum, c) => sum + c.complianceRiskScore, 0) / complianceWithRisks.length) : 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Risk Scores */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm">Compliance Risk Scores</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {complianceWithRisks
                .sort((a, b) => b.complianceRiskScore - a.complianceRiskScore)
                .map(req => (
                  <div key={req.id} className="p-4 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className="text-xs">{req.framework}</Badge>
                          <Badge variant="outline" className="text-xs">{req.status}</Badge>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{req.requirement}</h4>
                      </div>
                      <Badge className={`${
                        req.complianceRiskScore >= 70 ? 'bg-red-500/20 text-red-400' :
                        req.complianceRiskScore >= 50 ? 'bg-amber-500/20 text-amber-400' :
                        req.complianceRiskScore >= 30 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        Risk: {req.complianceRiskScore}
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">Compliance Risk Score</span>
                        <span className="text-xs text-white">{req.complianceRiskScore}/100</span>
                      </div>
                      <Progress value={req.complianceRiskScore} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                        <p className="text-xs text-slate-400 mb-1">Related Risks</p>
                        <p className="text-sm font-semibold text-rose-400">
                          {req.relatedRisks.length} ({req.avgRiskScore} avg score)
                        </p>
                      </div>
                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20">
                        <p className="text-xs text-slate-400 mb-1">Related Controls</p>
                        <p className="text-sm font-semibold text-blue-400">
                          {req.relatedControls.length} ({req.avgControlEffectiveness}/5 avg)
                        </p>
                      </div>
                    </div>

                    {req.relatedRisks.length > 0 && (
                      <div className="pt-2 border-t border-[#2a3548]">
                        <p className="text-xs text-slate-400 mb-1">Linked Risks:</p>
                        <div className="flex flex-wrap gap-1">
                          {req.relatedRisks.slice(0, 3).map(risk => (
                            <Badge key={risk.id} variant="outline" className="text-xs">
                              {risk.title}
                            </Badge>
                          ))}
                          {req.relatedRisks.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{req.relatedRisks.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}