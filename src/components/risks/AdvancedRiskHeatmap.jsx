import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter, ZoomIn, Maximize2, Info } from "lucide-react";
import { toast } from "sonner";
import DrillDownModal from "@/components/ui/drill-down-modal";
import html2canvas from "html2canvas";

export default function AdvancedRiskHeatmap({ risks = [], onExport }) {
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCell, setSelectedCell] = useState(null);
  const [drillDown, setDrillDown] = useState({ open: false, title: '', data: null });

  // Filter risks
  const filteredRisks = useMemo(() => {
    return risks.filter(risk => {
      const categoryMatch = filterCategory === "all" || risk.category === filterCategory;
      const statusMatch = filterStatus === "all" || risk.status === filterStatus;
      return categoryMatch && statusMatch;
    });
  }, [risks, filterCategory, filterStatus]);

  // Build heatmap matrix (5x5 for likelihood vs impact)
  const heatmapData = useMemo(() => {
    const matrix = Array.from({ length: 5 }, () => Array(5).fill(0).map(() => []));
    
    filteredRisks.forEach(risk => {
      const likelihood = (risk.residual_likelihood || risk.likelihood || 3) - 1;
      const impact = (risk.residual_impact || risk.impact || 3) - 1;
      if (likelihood >= 0 && likelihood < 5 && impact >= 0 && impact < 5) {
        matrix[4 - likelihood][impact].push(risk);
      }
    });

    return matrix;
  }, [filteredRisks]);

  const getRiskColor = (riskCount, score) => {
    if (riskCount === 0) return "bg-slate-800/30 border-slate-700/50";
    if (score >= 20) return "bg-rose-500/80 border-rose-400 shadow-lg shadow-rose-500/50";
    if (score >= 15) return "bg-rose-500/60 border-rose-400/80";
    if (score >= 12) return "bg-orange-500/60 border-orange-400/80";
    if (score >= 9) return "bg-amber-500/60 border-amber-400/80";
    if (score >= 6) return "bg-yellow-500/50 border-yellow-400/70";
    return "bg-emerald-500/50 border-emerald-400/70";
  };

  const handleCellClick = (cellRisks, likelihood, impact) => {
    if (cellRisks.length > 0) {
      setSelectedCell({ risks: cellRisks, likelihood: likelihood + 1, impact: impact + 1 });
      setDrillDown({
        open: true,
        title: `Risks: Likelihood ${likelihood + 1} × Impact ${impact + 1}`,
        data: cellRisks,
        type: 'risk'
      });
    }
  };

  const handleExportPNG = async () => {
    try {
      const element = document.getElementById('heatmap-container');
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f1623',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `risk-heatmap-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success("Heatmap exported successfully");
    } catch (error) {
      toast.error("Failed to export heatmap");
    }
  };

  const categories = [...new Set(risks.map(r => r.category))].filter(Boolean);
  const statuses = [...new Set(risks.map(r => r.status))].filter(Boolean);

  return (
    <>
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-orange-500/20">
                <ZoomIn className="h-4 w-4 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Interactive Risk Heatmap</CardTitle>
                <p className="text-xs text-slate-400 mt-0.5">
                  {filteredRisks.length} risks mapped by likelihood and impact
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleExportPNG}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PNG
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">Filters:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 h-8 bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-xs text-white hover:from-violet-500/30 hover:to-purple-500/30">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-8 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-xs text-white hover:from-blue-500/30 hover:to-cyan-500/30">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(filterCategory !== "all" || filterStatus !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterCategory("all");
                  setFilterStatus("all");
                }}
                className="h-8 text-xs text-slate-400 hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Heatmap Grid */}
          <div id="heatmap-container" className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
              <Info className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              <p className="text-xs text-slate-300">
                Click on any cell to view detailed risk information. Color intensity represents risk severity and count.
              </p>
            </div>

            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                <div className="flex items-start gap-2">
                  {/* Y-axis label */}
                  <div className="flex flex-col items-center justify-center" style={{ height: '500px', width: '40px' }}>
                    <div className="transform -rotate-90 whitespace-nowrap">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Likelihood →
                      </span>
                    </div>
                  </div>

                  {/* Main grid */}
                  <div className="flex-1">
                    <div className="space-y-1">
                      {heatmapData.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex items-center gap-1">
                          {/* Y-axis number */}
                          <div className="w-8 flex items-center justify-center">
                            <Badge variant="outline" className="text-xs bg-[#0f1623] border-[#2a3548]">
                              {5 - rowIndex}
                            </Badge>
                          </div>

                          {/* Cells */}
                          {row.map((cellRisks, colIndex) => {
                            const score = (5 - rowIndex) * (colIndex + 1);
                            return (
                              <button
                                key={colIndex}
                                onClick={() => handleCellClick(cellRisks, 4 - rowIndex, colIndex)}
                                className={`flex-1 h-20 rounded-lg border-2 transition-all hover:scale-105 hover:z-10 hover:shadow-2xl cursor-pointer group relative ${getRiskColor(cellRisks.length, score)}`}
                              >
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <div className="text-2xl font-bold text-white mb-1">
                                    {cellRisks.length}
                                  </div>
                                  <div className="text-[10px] text-slate-200 opacity-80">
                                    Score: {score}
                                  </div>
                                </div>
                                {cellRisks.length > 0 && (
                                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded-lg" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}

                      {/* X-axis */}
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-8" />
                        {[1, 2, 3, 4, 5].map(num => (
                          <div key={num} className="flex-1 flex justify-center">
                            <Badge variant="outline" className="text-xs bg-[#0f1623] border-[#2a3548]">
                              {num}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          ← Impact
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 flex-wrap p-4 bg-[#0f1623] rounded-lg border border-[#2a3548]">
              <span className="text-xs font-semibold text-slate-400">Risk Level:</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/50 border border-emerald-400/70"></div>
                <span className="text-xs text-slate-300">Low (1-5)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-amber-500/60 border border-amber-400/80"></div>
                <span className="text-xs text-slate-300">Medium (6-11)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-orange-500/60 border border-orange-400/80"></div>
                <span className="text-xs text-slate-300">High (12-15)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-rose-500/80 border border-rose-400"></div>
                <span className="text-xs text-slate-300">Critical (16+)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DrillDownModal
        open={drillDown.open}
        onClose={() => setDrillDown({ open: false, title: '', data: null })}
        title={drillDown.title}
        data={drillDown.data}
        type="risk"
      />
    </>
  );
}