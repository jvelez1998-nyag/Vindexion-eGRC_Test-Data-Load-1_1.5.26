import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid, Loader2, Filter, Download } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function InteractiveRiskHeatmap({ data }) {
  const [loading, setLoading] = useState(false);
  const [heatmapData, setHeatmapData] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [viewMode, setViewMode] = useState("likelihood-impact");
  const [filterCategory, setFilterCategory] = useState("all");

  const generateHeatmap = async () => {
    setLoading(true);
    try {
      const categories = [...new Set(data.risks.map(r => r.category).filter(Boolean))];
      
      if (viewMode === "correlation") {
        // Generate correlation matrix
        const matrix = [];
        for (let i = 0; i < Math.min(categories.length, 10); i++) {
          const row = [];
          for (let j = 0; j < Math.min(categories.length, 10); j++) {
            const risksA = data.risks.filter(r => r.category === categories[i]);
            const risksB = data.risks.filter(r => r.category === categories[j]);
            
            // Calculate correlation based on shared controls
            let correlation = 0;
            if (i === j) {
              correlation = 100;
            } else {
              const sharedControls = risksA.filter(ra => 
                risksB.some(rb => 
                  ra.linked_controls?.some(c => rb.linked_controls?.includes(c))
                )
              ).length;
              correlation = Math.min(100, (sharedControls / Math.max(risksA.length, risksB.length)) * 100);
            }
            
            row.push({
              value: Math.round(correlation),
              categoryA: categories[i],
              categoryB: categories[j],
              count: i === j ? risksA.length : sharedControls
            });
          }
          matrix.push(row);
        }
        setHeatmapData({ matrix, labels: categories.slice(0, 10), type: "correlation" });
      } else {
        // Generate likelihood-impact matrix
        const matrix = Array(5).fill(null).map(() => Array(5).fill(null).map(() => ({ risks: [], value: 0 })));
        
        data.risks
          .filter(r => filterCategory === "all" || r.category === filterCategory)
          .forEach(risk => {
            const likelihood = Math.min(4, Math.max(0, Math.floor(risk.residual_likelihood || 0) - 1));
            const impact = Math.min(4, Math.max(0, Math.floor(risk.residual_impact || 0) - 1));
            matrix[4 - impact][likelihood].risks.push(risk);
            matrix[4 - impact][likelihood].value++;
          });
        
        setHeatmapData({ matrix, type: "likelihood-impact" });
      }
      
      toast.success("Heatmap generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate heatmap");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data.risks.length > 0) {
      generateHeatmap();
    }
  }, [viewMode, filterCategory]);

  const getColorForValue = (value, max) => {
    const intensity = value / max;
    if (intensity >= 0.8) return "bg-rose-600";
    if (intensity >= 0.6) return "bg-orange-500";
    if (intensity >= 0.4) return "bg-amber-500";
    if (intensity >= 0.2) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const categories = [...new Set(data.risks.map(r => r.category).filter(Boolean))];

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Grid className="h-5 w-5 text-indigo-400" />
              Interactive Risk Correlation Heatmap
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger className="w-[180px] bg-[#151d2e] border-[#2a3548]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="likelihood-impact" className="text-white hover:bg-[#2a3548]">Likelihood × Impact</SelectItem>
                  <SelectItem value="correlation" className="text-white hover:bg-[#2a3548]">Category Correlation</SelectItem>
                </SelectContent>
              </Select>
              
              {viewMode === "likelihood-impact" && (
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[150px] bg-[#151d2e] border-[#2a3548]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                    <SelectItem value="all" className="text-white hover:bg-[#2a3548]">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat} className="text-white hover:bg-[#2a3548]">{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              <Button 
                onClick={() => toast.success("Exporting heatmap...")}
                size="sm"
                variant="outline"
                className="border-[#2a3548]"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : heatmapData ? (
            <div className="space-y-4">
              {heatmapData.type === "likelihood-impact" ? (
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div className="flex items-center mb-2">
                      <div className="w-24"></div>
                      <div className="flex-1 grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="text-center text-xs text-slate-400 font-medium">L{i}</div>
                        ))}
                      </div>
                    </div>
                    {heatmapData.matrix.map((row, i) => (
                      <div key={i} className="flex items-center gap-1 mb-1">
                        <div className="w-24 text-right text-xs text-slate-400 font-medium pr-2">
                          Impact {5 - i}
                        </div>
                        <div className="flex-1 grid grid-cols-5 gap-1">
                          {row.map((cell, j) => {
                            const maxValue = Math.max(...heatmapData.matrix.flat().map(c => c.value));
                            return (
                              <div
                                key={j}
                                onClick={() => cell.risks.length > 0 && setSelectedCell(cell)}
                                className={`aspect-square ${getColorForValue(cell.value, maxValue)} rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-all hover:scale-105`}
                              >
                                <span className="text-white font-bold text-sm">{cell.value || 0}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
                    <span className="font-medium">Legend:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <span>Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-rose-600 rounded"></div>
                      <span>Critical</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full">
                    <div className="flex items-center mb-2">
                      <div className="w-32"></div>
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${heatmapData.labels.length}, minmax(80px, 1fr))` }}>
                        {heatmapData.labels.map(label => (
                          <div key={label} className="text-center text-xs text-slate-400 font-medium truncate">
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                    {heatmapData.matrix.map((row, i) => (
                      <div key={i} className="flex items-center gap-1 mb-1">
                        <div className="w-32 text-right text-xs text-slate-400 font-medium pr-2 truncate">
                          {heatmapData.labels[i]}
                        </div>
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${heatmapData.labels.length}, minmax(80px, 1fr))` }}>
                          {row.map((cell, j) => (
                            <div
                              key={j}
                              onClick={() => cell.value > 0 && cell.value < 100 && setSelectedCell(cell)}
                              className={`aspect-square ${getColorForValue(cell.value, 100)} rounded flex items-center justify-center cursor-pointer hover:opacity-80 transition-all hover:scale-105`}
                            >
                              <span className="text-white font-bold text-xs">{cell.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedCell && (
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                {heatmapData.type === "likelihood-impact" 
                  ? `Risks in Selected Cell (${selectedCell.risks.length})`
                  : `Correlation Details`
                }
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedCell(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {heatmapData.type === "likelihood-impact" ? (
              <div className="space-y-2">
                {selectedCell.risks.slice(0, 10).map(risk => (
                  <div key={risk.id} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-medium text-white mb-1">{risk.risk_title}</div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-rose-500/20 text-rose-400 text-xs">
                            Score: {(risk.residual_likelihood || 0) * (risk.residual_impact || 0)}
                          </Badge>
                          {risk.category && (
                            <Badge className="bg-indigo-500/20 text-indigo-400 text-xs">{risk.category}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {selectedCell.risks.length > 10 && (
                  <div className="text-xs text-slate-400 text-center">
                    + {selectedCell.risks.length - 10} more risks
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-1">Correlation Strength</div>
                  <div className="text-lg font-bold text-white">{selectedCell.value}%</div>
                </div>
                <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-1">Categories</div>
                  <div className="text-sm text-white">{selectedCell.categoryA} ↔ {selectedCell.categoryB}</div>
                </div>
                <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-1">Shared Risk Count</div>
                  <div className="text-sm text-white">{selectedCell.count}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}