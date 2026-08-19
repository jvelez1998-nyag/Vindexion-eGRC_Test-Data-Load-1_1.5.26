import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { Brain, RefreshCw, Loader2, TrendingDown, TrendingUp, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function AutomatedRiskAssessment({ risks, controls, incidents }) {
  const [assessing, setAssessing] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);

  const calculateDynamicScore = (risk, linkedControls, relatedIncidents) => {
    const baseScore = (risk.likelihood || 3) * (risk.impact || 3);
    
    // Control effectiveness factor (0-1)
    const controlEffectiveness = linkedControls.length > 0
      ? linkedControls.filter(c => c.status === 'effective').length / linkedControls.length
      : 0;
    
    // Incident history factor (increases risk if recent incidents)
    const recentIncidents = relatedIncidents.filter(i => {
      const incidentDate = new Date(i.created_date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return incidentDate >= sixMonthsAgo;
    });
    const incidentFactor = Math.min(recentIncidents.length * 0.2, 1);
    
    // Dynamic score: base * (1 - control effectiveness * 0.5) * (1 + incident factor * 0.3)
    const dynamicScore = baseScore * (1 - controlEffectiveness * 0.5) * (1 + incidentFactor * 0.3);
    
    return {
      dynamicScore: Math.round(dynamicScore * 10) / 10,
      controlEffectiveness,
      incidentFactor,
      linkedControlsCount: linkedControls.length,
      effectiveControlsCount: linkedControls.filter(c => c.status === 'effective').length,
      recentIncidentsCount: recentIncidents.length
    };
  };

  const runAutomatedAssessment = async () => {
    setAssessing(true);
    try {
      const results = [];
      
      for (const risk of risks) {
        const linkedControls = controls.filter(c => 
          risk.linked_controls?.includes(c.id)
        );
        
        const relatedIncidents = incidents.filter(i =>
          risk.linked_incidents?.includes(i.id) ||
          i.title?.toLowerCase().includes(risk.title?.toLowerCase().split(' ')[0])
        );
        
        const scores = calculateDynamicScore(risk, linkedControls, relatedIncidents);
        
        // Update risk with new scores
        await base44.entities.Risk.update(risk.id, {
          dynamic_score: scores.dynamicScore,
          control_effectiveness_factor: scores.controlEffectiveness,
          incident_history_factor: scores.incidentFactor,
          last_assessment_date: new Date().toISOString()
        });
        
        results.push({
          risk,
          ...scores
        });
      }
      
      setAssessmentResults(results);
      toast.success(`Assessed ${results.length} risks with dynamic scoring`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to run automated assessment");
    } finally {
      setAssessing(false);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 20) return { label: 'Critical', color: 'bg-rose-500', textColor: 'text-rose-400' };
    if (score >= 12) return { label: 'High', color: 'bg-orange-500', textColor: 'text-orange-400' };
    if (score >= 6) return { label: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-400' };
    return { label: 'Low', color: 'bg-emerald-500', textColor: 'text-emerald-400' };
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                <Brain className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-white">Automated Risk Assessment</CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  AI-powered dynamic scoring based on control effectiveness and incident history
                </p>
              </div>
            </div>
            <Button
              onClick={runAutomatedAssessment}
              disabled={assessing}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {assessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {assessing ? 'Assessing...' : 'Run Assessment'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!assessmentResults ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-indigo-400/30 mx-auto mb-4" />
              <p className="text-slate-400">Click "Run Assessment" to analyze all risks with dynamic scoring</p>
              <p className="text-xs text-slate-500 mt-2">
                Assessment considers control effectiveness, incident history, and risk trends
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <p className="text-xs text-slate-500 mb-1">Total Assessed</p>
                  <p className="text-2xl font-bold text-white">{assessmentResults.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <p className="text-xs text-slate-500 mb-1">Critical/High</p>
                  <p className="text-2xl font-bold text-rose-400">
                    {assessmentResults.filter(r => r.dynamicScore >= 12).length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <p className="text-xs text-slate-500 mb-1">Avg Control Coverage</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(assessmentResults.reduce((acc, r) => acc + r.controlEffectiveness, 0) / assessmentResults.length * 100)}%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <p className="text-xs text-slate-500 mb-1">Incident Impact</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {assessmentResults.filter(r => r.recentIncidentsCount > 0).length}
                  </p>
                </div>
              </div>

              {/* Risk List */}
              <div className="space-y-2">
                {assessmentResults
                  .sort((a, b) => b.dynamicScore - a.dynamicScore)
                  .map((result, idx) => {
                    const level = getRiskLevel(result.dynamicScore);
                    const baseScore = (result.risk.likelihood || 3) * (result.risk.impact || 3);
                    const scoreChange = result.dynamicScore - baseScore;
                    
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-indigo-500/40 transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">{result.risk.title}</h4>
                              <Badge className={`${level.color} text-white border-0 text-xs`}>
                                {level.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-400">{result.risk.category}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white mb-1">
                              {result.dynamicScore}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              {scoreChange > 0 ? (
                                <>
                                  <TrendingUp className="h-3 w-3 text-rose-400" />
                                  <span className="text-rose-400">+{scoreChange.toFixed(1)}</span>
                                </>
                              ) : scoreChange < 0 ? (
                                <>
                                  <TrendingDown className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-400">{scoreChange.toFixed(1)}</span>
                                </>
                              ) : (
                                <span className="text-slate-500">No change</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-3 w-3 text-blue-400" />
                              <span className="text-xs text-slate-400">Control Coverage</span>
                            </div>
                            <Progress 
                              value={result.controlEffectiveness * 100} 
                              className="h-2 mb-1"
                            />
                            <p className="text-xs text-slate-500">
                              {result.effectiveControlsCount}/{result.linkedControlsCount} effective
                            </p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-3 w-3 text-amber-400" />
                              <span className="text-xs text-slate-400">Recent Incidents</span>
                            </div>
                            <div className="text-xl font-bold text-white">
                              {result.recentIncidentsCount}
                            </div>
                            <p className="text-xs text-slate-500">Last 6 months</p>
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                              <span className="text-xs text-slate-400">Base Score</span>
                            </div>
                            <div className="text-xl font-bold text-slate-400">
                              {baseScore}
                            </div>
                            <p className="text-xs text-slate-500">Before adjustment</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}