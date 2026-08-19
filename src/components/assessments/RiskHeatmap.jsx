import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle } from "lucide-react";

export default function RiskHeatmap({ riskLibrary }) {
  // Group risks by likelihood and impact
  const heatmapData = [];
  for (let impact = 5; impact >= 1; impact--) {
    for (let likelihood = 1; likelihood <= 5; likelihood++) {
      const risks = riskLibrary.filter(
        r => r.likelihood === likelihood && r.impact === impact
      );
      heatmapData.push({
        likelihood,
        impact,
        count: risks.length,
        risks: risks,
        score: likelihood * impact
      });
    }
  }

  const getCellColor = (score, count) => {
    if (count === 0) return 'bg-slate-800/30 border-slate-700/30';
    if (score >= 20) return 'bg-rose-500/40 border-rose-500/60';
    if (score >= 15) return 'bg-orange-500/40 border-orange-500/60';
    if (score >= 10) return 'bg-amber-500/40 border-amber-500/60';
    if (score >= 5) return 'bg-yellow-500/40 border-yellow-500/60';
    return 'bg-blue-500/40 border-blue-500/60';
  };

  const getLegendColor = (level) => {
    const colors = {
      critical: 'bg-rose-500',
      high: 'bg-orange-500',
      medium: 'bg-amber-500',
      low: 'bg-yellow-500',
      minimal: 'bg-blue-500'
    };
    return colors[level];
  };

  // Calculate statistics
  const totalRisks = riskLibrary.length;
  const criticalRisks = riskLibrary.filter(r => (r.likelihood * r.impact) >= 20).length;
  const highRisks = riskLibrary.filter(r => {
    const score = r.likelihood * r.impact;
    return score >= 15 && score < 20;
  }).length;
  const mediumRisks = riskLibrary.filter(r => {
    const score = r.likelihood * r.impact;
    return score >= 10 && score < 15;
  }).length;

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 p-4">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <div className="text-2xl font-bold text-white">{criticalRisks}</div>
          </div>
          <div className="text-xs text-slate-400 mt-1">Critical (≥20)</div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20 p-4">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <div className="text-2xl font-bold text-white">{highRisks}</div>
          </div>
          <div className="text-xs text-slate-400 mt-1">High (15-19)</div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 p-4">
          <div className="flex items-center justify-between">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <div className="text-2xl font-bold text-white">{mediumRisks}</div>
          </div>
          <div className="text-xs text-slate-400 mt-1">Medium (10-14)</div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-4">
          <div className="flex items-center justify-between">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            <div className="text-2xl font-bold text-white">{totalRisks}</div>
          </div>
          <div className="text-xs text-slate-400 mt-1">Total Risks</div>
        </Card>
      </div>

      {/* Heatmap */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            Risk Distribution Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="text-slate-400">Risk Level:</span>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getLegendColor('critical')}`}></div>
                <span className="text-slate-300">Critical (≥20)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getLegendColor('high')}`}></div>
                <span className="text-slate-300">High (15-19)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getLegendColor('medium')}`}></div>
                <span className="text-slate-300">Medium (10-14)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getLegendColor('low')}`}></div>
                <span className="text-slate-300">Low (5-9)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded ${getLegendColor('minimal')}`}></div>
                <span className="text-slate-300">Minimal (1-4)</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="flex gap-1">
                  {/* Y-axis label */}
                  <div className="flex flex-col justify-center items-center w-16">
                    <div className="text-xs font-medium text-slate-400 transform -rotate-90 whitespace-nowrap">
                      IMPACT →
                    </div>
                  </div>

                  {/* Grid */}
                  <div>
                    {/* Column headers */}
                    <div className="flex gap-1 mb-1 pl-12">
                      {[1, 2, 3, 4, 5].map(l => (
                        <div key={l} className="w-20 text-center text-xs font-medium text-slate-400">
                          {l}
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    {[5, 4, 3, 2, 1].map(impact => (
                      <div key={impact} className="flex gap-1 mb-1">
                        {/* Row header */}
                        <div className="w-12 flex items-center justify-end pr-2">
                          <span className="text-xs font-medium text-slate-400">{impact}</span>
                        </div>
                        
                        {/* Cells */}
                        {[1, 2, 3, 4, 5].map(likelihood => {
                          const cell = heatmapData.find(
                            d => d.likelihood === likelihood && d.impact === impact
                          );
                          return (
                            <div
                              key={`${likelihood}-${impact}`}
                              className={`w-20 h-20 rounded border-2 flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getCellColor(cell.score, cell.count)}`}
                              title={cell.risks.map(r => r.risk_name).join(', ')}
                            >
                              <div className="text-lg font-bold text-white">{cell.count}</div>
                              <div className="text-[10px] text-slate-300">{cell.score}</div>
                            </div>
                          );
                        })}
                      </div>
                    ))}

                    {/* X-axis label */}
                    <div className="text-center text-xs font-medium text-slate-400 mt-2">
                      ← LIKELIHOOD →
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 mt-4">
              <strong>How to read:</strong> Cell color indicates risk level. Numbers show count of risks (top) and risk score (bottom). 
              Hover over cells to see risk names.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}