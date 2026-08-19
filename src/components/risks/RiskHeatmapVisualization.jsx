import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TrendingUp } from "lucide-react";

export default function RiskHeatmapVisualization({ risks, detailed = false }) {
  const [selectedCell, setSelectedCell] = useState(null);

  // Create 5x5 matrix (impact vs likelihood)
  const matrix = Array(5).fill(null).map(() => Array(5).fill([]));
  
  risks.forEach(risk => {
    const likelihood = (risk.residual_likelihood || risk.likelihood || 1) - 1;
    const impact = (risk.residual_impact || risk.impact || 1) - 1;
    if (likelihood >= 0 && likelihood < 5 && impact >= 0 && impact < 5) {
      matrix[4 - impact][likelihood] = [...matrix[4 - impact][likelihood], risk];
    }
  });

  const getHeatColor = (likelihood, impact) => {
    const score = (likelihood + 1) * (impact + 1);
    if (score >= 16) return 'bg-red-500';
    if (score >= 12) return 'bg-rose-500';
    if (score >= 9) return 'bg-orange-500';
    if (score >= 6) return 'bg-amber-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const labels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          Risk Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="relative">
            {/* Impact Label (Y-axis) */}
            <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-semibold text-slate-400">
              Impact
            </div>
            
            <div className="grid grid-cols-5 gap-1">
              {matrix.map((row, impactIdx) => (
                row.map((cell, likelihoodIdx) => {
                  const riskCount = cell.length;
                  const cellScore = (likelihoodIdx + 1) * (5 - impactIdx);
                  return (
                    <div
                      key={`${impactIdx}-${likelihoodIdx}`}
                      className={`
                        aspect-square ${getHeatColor(likelihoodIdx, 4 - impactIdx)}
                        rounded-lg flex items-center justify-center
                        cursor-pointer hover:opacity-80 transition-all
                        relative group
                      `}
                      onClick={() => setSelectedCell(riskCount > 0 ? { risks: cell, likelihood: likelihoodIdx + 1, impact: 5 - impactIdx } : null)}
                    >
                      <span className="text-white font-bold text-sm">{riskCount}</span>
                      {riskCount > 0 && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                      )}
                    </div>
                  );
                })
              ))}
            </div>

            {/* Likelihood Label (X-axis) */}
            <div className="text-center text-xs font-semibold text-slate-400 mt-2">
              Likelihood
            </div>

            {/* Axis Labels */}
            <div className="flex justify-between mt-1 text-[10px] text-slate-500">
              {labels.map((label, idx) => (
                <span key={idx} className="w-1/5 text-center">{label}</span>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-400">Risk Level:</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-slate-400">Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span className="text-slate-400">Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" />
              <span className="text-slate-400">High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" />
              <span className="text-slate-400">Critical</span>
            </div>
          </div>

          {/* Selected Cell Details */}
          {selectedCell && (
            <div className="mt-4 p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">
                  Risks (L:{selectedCell.likelihood}, I:{selectedCell.impact})
                </h4>
                <Badge className="bg-indigo-500/20 text-indigo-400">
                  {selectedCell.risks.length} risk(s)
                </Badge>
              </div>
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {selectedCell.risks.map((risk, idx) => (
                    <div key={idx} className="text-xs text-slate-300 p-2 rounded bg-[#1a2332] hover:bg-[#1e2840]">
                      {risk.title}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}