import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function RiskHeatmap({ risks, expanded }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const matrixSize = 5;
  const matrix = Array.from({ length: matrixSize }, () => Array(matrixSize).fill([]));

  // Populate matrix with risks
  risks.forEach(risk => {
    const likelihood = (risk.residual_likelihood || risk.likelihood || 1) - 1;
    const impact = (risk.residual_impact || risk.impact || 1) - 1;
    if (likelihood >= 0 && likelihood < matrixSize && impact >= 0 && impact < matrixSize) {
      matrix[matrixSize - 1 - impact][likelihood] = [...matrix[matrixSize - 1 - impact][likelihood], risk];
    }
  });

  const getColor = (likelihood, impact) => {
    const score = (likelihood + 1) * (impact + 1);
    if (score >= 20) return 'bg-rose-600 hover:bg-rose-700';
    if (score >= 15) return 'bg-rose-500 hover:bg-rose-600';
    if (score >= 10) return 'bg-amber-500 hover:bg-amber-600';
    if (score >= 6) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-emerald-500 hover:bg-emerald-600';
  };

  const handleCellClick = (cellRisks, likelihood, impact) => {
    if (cellRisks.length > 0) {
      setSelectedCell({ risks: cellRisks, likelihood: likelihood + 1, impact: impact + 1 });
      setDrillDownOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-8 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded"></div>
            <span>Low (1-5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium (6-9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span>High (10-14)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-rose-500 rounded"></div>
            <span>Critical (15+)</span>
          </div>
        </div>

        <div className="relative">
          {/* Y-axis label */}
          <div className="absolute -left-16 top-1/2 -translate-y-1/2 -rotate-90">
            <span className="text-sm font-medium text-slate-400">Impact</span>
          </div>

          {/* Heatmap Grid */}
          <div className="grid grid-cols-5 gap-2">
            {matrix.map((row, rowIndex) => (
              row.map((cellRisks, colIndex) => {
                const impact = matrixSize - 1 - rowIndex;
                const likelihood = colIndex;
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(cellRisks, likelihood, impact)}
                    className={cn(
                      "aspect-square rounded-lg transition-all cursor-pointer flex items-center justify-center relative group",
                      getColor(likelihood, impact),
                      cellRisks.length === 0 && "opacity-30"
                    )}
                  >
                    <span className="text-white font-bold text-xl">{cellRisks.length}</span>
                    {cellRisks.length > 0 && (
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors" />
                    )}
                  </div>
                );
              })
            ))}
          </div>

          {/* X-axis label */}
          <div className="text-center mt-3">
            <span className="text-sm font-medium text-slate-400">Likelihood</span>
          </div>

          {/* Axis values */}
          <div className="flex justify-between mt-2 px-1">
            {[1, 2, 3, 4, 5].map(val => (
              <span key={val} className="text-xs text-slate-500 w-[20%] text-center">{val}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-down Dialog */}
      <Dialog open={drillDownOpen} onOpenChange={setDrillDownOpen}>
        <DialogContent className="max-w-3xl bg-[#1a2332] border-[#2a3548] text-white">
          <DialogHeader>
            <DialogTitle>
              Risks - Likelihood {selectedCell?.likelihood} × Impact {selectedCell?.impact}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            {selectedCell?.risks.map(risk => (
              <div key={risk.id} className="bg-[#151d2e] rounded-lg p-4 border border-[#2a3548]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-white">{risk.title}</h3>
                  <Badge className={cn(
                    "text-[10px]",
                    risk.category === 'operational' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                    risk.category === 'financial' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                    risk.category === 'strategic' && "bg-violet-500/10 text-violet-400 border-violet-500/20",
                    risk.category === 'compliance' && "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  )}>
                    {risk.category}
                  </Badge>
                </div>
                <p className="text-sm text-slate-400 mb-3">{risk.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Owner: {risk.owner || 'Unassigned'}</span>
                  <span>Status: {risk.status}</span>
                  {risk.due_date && <span>Due: {new Date(risk.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}