import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThermometerSun, TrendingUp, Shield, AlertTriangle, Info } from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ControlEffectivenessHeatmap({ controls, risks }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const domains = [...new Set(controls.map(c => c.domain))].filter(Boolean);
  const categories = [...new Set(risks.map(r => r.category))].filter(Boolean);

  const getHeatmapValue = (domain, category) => {
    const domainControls = controls.filter(c => c.domain === domain);
    const categoryRisks = risks.filter(r => r.category === category);
    
    if (domainControls.length === 0 || categoryRisks.length === 0) return null;

    let totalEffectiveness = 0;
    let totalRiskScore = 0;
    let count = 0;

    domainControls.forEach(control => {
      const linkedRisks = categoryRisks.filter(r => 
        control.linked_risks?.includes(r.id)
      );
      
      linkedRisks.forEach(risk => {
        totalEffectiveness += (control.effectiveness || 3);
        totalRiskScore += ((risk.likelihood || 0) * (risk.impact || 0));
        count++;
      });
    });

    if (count === 0) return null;

    const avgEffectiveness = totalEffectiveness / count;
    const avgRiskScore = totalRiskScore / count;
    
    // Calculate coverage score (effectiveness vs risk)
    const coverageScore = (avgEffectiveness / 5) * 100 - (avgRiskScore / 25) * 100;
    
    return {
      effectiveness: avgEffectiveness,
      riskScore: avgRiskScore,
      coverageScore,
      count
    };
  };

  const getCellColor = (value) => {
    if (!value) return {
      bg: 'bg-slate-800/50',
      border: 'border-slate-700/50',
      gradient: 'from-slate-800/50 to-slate-900/50',
      text: 'text-slate-600'
    };
    
    const score = value.coverageScore;
    if (score >= 50) return {
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-400/40',
      gradient: 'from-emerald-500/20 via-emerald-600/10 to-emerald-700/5',
      text: 'text-emerald-300'
    };
    if (score >= 25) return {
      bg: 'bg-green-500/20',
      border: 'border-green-400/40',
      gradient: 'from-green-500/20 via-green-600/10 to-green-700/5',
      text: 'text-green-300'
    };
    if (score >= 0) return {
      bg: 'bg-blue-500/20',
      border: 'border-blue-400/40',
      gradient: 'from-blue-500/20 via-blue-600/10 to-blue-700/5',
      text: 'text-blue-300'
    };
    if (score >= -25) return {
      bg: 'bg-amber-500/20',
      border: 'border-amber-400/40',
      gradient: 'from-amber-500/20 via-amber-600/10 to-amber-700/5',
      text: 'text-amber-300'
    };
    if (score >= -50) return {
      bg: 'bg-orange-500/20',
      border: 'border-orange-400/40',
      gradient: 'from-orange-500/20 via-orange-600/10 to-orange-700/5',
      text: 'text-orange-300'
    };
    return {
      bg: 'bg-rose-500/20',
      border: 'border-rose-400/40',
      gradient: 'from-rose-500/20 via-rose-600/10 to-rose-700/5',
      text: 'text-rose-300'
    };
  };

  const getScoreLabel = (score) => {
    if (score >= 50) return 'Excellent';
    if (score >= 25) return 'Good';
    if (score >= 0) return 'Adequate';
    if (score >= -25) return 'Weak';
    if (score >= -50) return 'Poor';
    return 'Critical';
  };

  const getTotalStats = () => {
    let totalCells = 0;
    let excellentCount = 0;
    let criticalCount = 0;
    
    domains.forEach(domain => {
      categories.forEach(category => {
        const value = getHeatmapValue(domain, category);
        if (value) {
          totalCells++;
          if (value.coverageScore >= 50) excellentCount++;
          if (value.coverageScore < -50) criticalCount++;
        }
      });
    });
    
    return { totalCells, excellentCount, criticalCount };
  };

  const stats = getTotalStats();

  return (
    <Card className="bg-gradient-to-br from-[#1a2332] via-[#1a2332] to-indigo-500/5 border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
              <ThermometerSun className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-base">Control Effectiveness vs Risk Exposure</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Interactive coverage analysis across domains and risk categories</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.excellentCount} Excellent
            </Badge>
            {stats.criticalCount > 0 && (
              <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.criticalCount} Critical
              </Badge>
            )}
            <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/50">
              {stats.totalCells} Coverage Areas
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TooltipProvider>
            <div className="overflow-x-auto scrollbar-thin">
              <div className="inline-block min-w-full">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-gradient-to-r from-[#1a2332] to-[#1a2332]/95 p-3 text-left z-10 border-b-2 border-indigo-500/20">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="text-xs font-bold text-white">Control Domain</span>
                        </div>
                      </th>
                      {categories.map(category => (
                        <th key={category} className="p-3 border-b-2 border-indigo-500/20">
                          <div className="flex flex-col items-center gap-1">
                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide whitespace-nowrap transform -rotate-45 origin-center">
                              {category.replace(/_/g, ' ')}
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {domains.map((domain, domainIdx) => (
                      <tr key={domain} className="group">
                        <td className="sticky left-0 bg-gradient-to-r from-[#1a2332] to-[#1a2332]/95 p-3 border-r-2 border-[#2a3548] z-10">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                            <span className="text-xs font-semibold text-white whitespace-nowrap">
                              {domain.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                        </td>
                        {categories.map((category, categoryIdx) => {
                          const value = getHeatmapValue(domain, category);
                          const colors = getCellColor(value);
                          return (
                            <td key={`${domain}-${category}`} className="p-2">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`relative h-20 w-20 border-2 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer
                                      hover:scale-110 hover:z-20 hover:shadow-xl
                                      ${colors.border} bg-gradient-to-br ${colors.gradient}
                                      ${selectedCell === `${domain}-${category}` ? 'ring-2 ring-indigo-400 scale-105' : ''}`}
                                    onClick={() => setSelectedCell(selectedCell === `${domain}-${category}` ? null : `${domain}-${category}`)}
                                  >
                                    {value ? (
                                      <>
                                        <div className="absolute top-1 right-1">
                                          <Badge className={`text-[8px] px-1 py-0 ${colors.bg} ${colors.text} border-none`}>
                                            {getScoreLabel(value.coverageScore)}
                                          </Badge>
                                        </div>
                                        <div className="flex flex-col items-center gap-1">
                                          <div className="flex items-center gap-1">
                                            <Shield className={`h-3 w-3 ${colors.text}`} />
                                            <span className={`text-base font-bold ${colors.text}`}>
                                              {value.effectiveness.toFixed(1)}
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-white/50 font-medium">
                                            vs
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <AlertTriangle className={`h-3 w-3 ${colors.text}`} />
                                            <span className={`text-sm font-semibold ${colors.text}`}>
                                              {value.riskScore.toFixed(1)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                                          <Badge className="text-[8px] px-1 py-0 bg-slate-900/60 text-slate-300 border-none">
                                            {value.count} {value.count === 1 ? 'link' : 'links'}
                                          </Badge>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-xs text-slate-600">—</div>
                                    )}
                                  </div>
                                </TooltipTrigger>
                                {value && (
                                  <TooltipContent className="bg-[#0f1623] border-[#2a3548] p-3 max-w-xs">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-white text-xs border-b border-slate-700 pb-2">
                                        {domain.replace(/_/g, ' ').toUpperCase()} × {category.toUpperCase()}
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <div>
                                          <div className="text-slate-500">Effectiveness</div>
                                          <div className="text-emerald-400 font-bold">{value.effectiveness.toFixed(2)}/5</div>
                                        </div>
                                        <div>
                                          <div className="text-slate-500">Risk Score</div>
                                          <div className="text-rose-400 font-bold">{value.riskScore.toFixed(2)}/25</div>
                                        </div>
                                        <div>
                                          <div className="text-slate-500">Coverage</div>
                                          <div className={`font-bold ${colors.text}`}>{getScoreLabel(value.coverageScore)}</div>
                                        </div>
                                        <div>
                                          <div className="text-slate-500">Linkages</div>
                                          <div className="text-blue-400 font-bold">{value.count}</div>
                                        </div>
                                      </div>
                                      <div className="text-[9px] text-slate-400 pt-2 border-t border-slate-700">
                                        Coverage Score: {value.coverageScore.toFixed(1)}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TooltipProvider>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Legend */}
            <div className="p-4 bg-gradient-to-br from-[#0f1623] to-indigo-950/20 rounded-lg border border-[#2a3548]">
              <div className="flex items-center gap-2 mb-3">
                <Info className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">Coverage Score Legend</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <div>
                    <div className="text-[10px] font-semibold text-emerald-400">Excellent</div>
                    <div className="text-[9px] text-slate-500">50+</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded border border-green-500/20">
                  <div className="w-3 h-3 rounded bg-green-500"></div>
                  <div>
                    <div className="text-[10px] font-semibold text-green-400">Good</div>
                    <div className="text-[9px] text-slate-500">25-50</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded border border-blue-500/20">
                  <div className="w-3 h-3 rounded bg-blue-500"></div>
                  <div>
                    <div className="text-[10px] font-semibold text-blue-400">Adequate</div>
                    <div className="text-[9px] text-slate-500">0-25</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                  <div className="w-3 h-3 rounded bg-amber-500"></div>
                  <div>
                    <div className="text-[10px] font-semibold text-amber-400">Weak</div>
                    <div className="text-[9px] text-slate-500">-25-0</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded border border-orange-500/20">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <div>
                    <div className="text-[10px] font-semibold text-orange-400">Poor</div>
                    <div className="text-[9px] text-slate-500">-50--25</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 bg-rose-500/10 rounded border border-rose-500/20">
                  <div className="w-3 h-3 rounded bg-rose-500"></div>
                  <div>
                    <div className="text-[10px] font-semibold text-rose-400">Critical</div>
                    <div className="text-[9px] text-slate-500">&lt;-50</div>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Read */}
            <div className="p-4 bg-gradient-to-br from-[#0f1623] to-purple-950/20 rounded-lg border border-[#2a3548]">
              <div className="flex items-center gap-2 mb-3">
                <ThermometerSun className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-bold text-white">How to Read</span>
              </div>
              <div className="space-y-2 text-[10px] text-slate-300">
                <div className="flex items-start gap-2">
                  <Shield className="h-3 w-3 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div><strong>Top number:</strong> Average control effectiveness (1-5 scale)</div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div><strong>Bottom number:</strong> Average risk exposure score (0-25 scale)</div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div><strong>Badge:</strong> Number of control-risk linkages</div>
                </div>
                <div className="pt-2 border-t border-slate-700 text-slate-400">
                  <strong className="text-white">Coverage Score:</strong> Calculated as (effectiveness/5 × 100) - (risk/25 × 100). 
                  Higher effectiveness and lower risk = better coverage.
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}