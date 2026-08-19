import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Network, CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";

export default function CrossWalkMatrixView({ mappings = [], frameworks = [] }) {
  // Build matrix
  const matrix = {};
  frameworks.forEach(source => {
    matrix[source] = {};
    frameworks.forEach(target => {
      if (source !== target) {
        const mapping = mappings.find(m => 
          m.source_framework === source && m.target_framework === target
        );
        matrix[source][target] = mapping || null;
      }
    });
  });

  const getCoverageColor = (coverage) => {
    if (!coverage) return 'bg-slate-500/10 border-slate-500/30';
    if (coverage >= 90) return 'bg-emerald-500/20 border-emerald-500/40';
    if (coverage >= 70) return 'bg-blue-500/20 border-blue-500/40';
    if (coverage >= 50) return 'bg-amber-500/20 border-amber-500/40';
    return 'bg-rose-500/20 border-rose-500/40';
  };

  const getCoverageIcon = (coverage) => {
    if (!coverage) return <MinusCircle className="h-3 w-3 text-slate-500" />;
    if (coverage >= 80) return <CheckCircle2 className="h-3 w-3 text-emerald-400" />;
    return <AlertCircle className="h-3 w-3 text-amber-400" />;
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Network className="h-5 w-5 text-violet-400" />
          Cross-Walk Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[800px]">
            {/* Header Row */}
            <div className="flex mb-2">
              <div className="w-32 flex-shrink-0" />
              {frameworks.map(fw => (
                <div key={fw} className="w-28 flex-shrink-0 px-2">
                  <Badge className="text-[10px] w-full justify-center bg-violet-500/20 text-violet-400">
                    {fw}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {frameworks.map(source => (
              <div key={source} className="flex mb-2">
                <div className="w-32 flex-shrink-0 pr-2">
                  <Badge className="text-[10px] w-full justify-center bg-blue-500/20 text-blue-400">
                    {source}
                  </Badge>
                </div>
                {frameworks.map(target => {
                  if (source === target) {
                    return (
                      <div key={target} className="w-28 flex-shrink-0 px-2">
                        <div className="h-16 rounded-lg bg-slate-700/30 border border-slate-600/50 flex items-center justify-center">
                          <span className="text-[10px] text-slate-600">—</span>
                        </div>
                      </div>
                    );
                  }

                  const mapping = matrix[source][target];
                  const coverage = mapping?.coverage_percentage || 0;

                  return (
                    <div key={target} className="w-28 flex-shrink-0 px-2">
                      <div 
                        className={`h-16 rounded-lg border ${getCoverageColor(coverage)} flex flex-col items-center justify-center p-2 hover:scale-105 transition-transform cursor-pointer group`}
                        title={`${source} → ${target}${mapping ? `\nCoverage: ${coverage}%\nStatus: ${mapping.status}` : '\nNo mapping'}`}
                      >
                        {mapping ? (
                          <>
                            <div className="flex items-center gap-1 mb-1">
                              {getCoverageIcon(coverage)}
                              <span className="text-xs font-bold text-white">{coverage}%</span>
                            </div>
                            <Badge className={`text-[9px] ${
                              mapping.status === 'complete' ? 'bg-emerald-500/30 text-emerald-400' :
                              mapping.status === 'in_progress' ? 'bg-amber-500/30 text-amber-400' :
                              'bg-slate-500/30 text-slate-400'
                            }`}>
                              {mapping.status}
                            </Badge>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-500">No data</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-[#2a3548]">
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span className="text-slate-400">High Coverage (≥90%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/40" />
              <span className="text-slate-400">Good Coverage (70-89%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-amber-500/20 border border-amber-500/40" />
              <span className="text-slate-400">Partial Coverage (50-69%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-rose-500/20 border border-rose-500/40" />
              <span className="text-slate-400">Low Coverage (&lt;50%)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}