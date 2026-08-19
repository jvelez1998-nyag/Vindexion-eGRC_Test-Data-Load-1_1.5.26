import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { memo } from "react";

const RiskHeatMap = memo(function RiskHeatMap({ risks = [], onCellClick, controls = [] }) {
  const navigate = useNavigate();
  const matrix = Array(5).fill(null).map(() => Array(5).fill(null).map(() => []));
  
  if (Array.isArray(risks)) {
    risks.forEach(risk => {
      if (!risk) return;
      const likelihood = risk.likelihood || risk.residual_likelihood || risk.inherent_likelihood;
      const impact = risk.impact || risk.residual_impact || risk.inherent_impact;
      if (likelihood && impact) {
        matrix[5 - impact][likelihood - 1].push(risk);
      }
    });
  }

  const getCellColor = (impact, likelihood) => {
    const score = impact * likelihood;
    if (score >= 16) return "bg-rose-500/80 hover:bg-rose-500";
    if (score >= 9) return "bg-amber-500/80 hover:bg-amber-500";
    if (score >= 4) return "bg-yellow-500/80 hover:bg-yellow-500";
    return "bg-emerald-500/80 hover:bg-emerald-500";
  };

  const impactLabels = ["Critical", "High", "Medium", "Low", "Very Low"];
  const likelihoodLabels = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-white">Risk Heat Map</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Impact vs Likelihood Matrix</p>
          </div>
          <div className="flex items-center gap-3 text-[10px]">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
              <span className="text-slate-400">Low</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
              <span className="text-slate-400">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
              <span className="text-slate-400">High</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
              <span className="text-slate-400">Critical</span>
            </div>
          </div>
        </div>
        <div className="mt-3 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
          <p className="text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-indigo-400">Impact</span> measures potential damage or consequences if a risk occurs (vertical axis). 
            <span className="font-semibold text-indigo-400 ml-2">Likelihood</span> measures the probability of occurrence (horizontal axis). 
            Risk severity is calculated by multiplying these values—higher scores demand immediate attention.
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex">
          <div className="flex flex-col justify-around pr-3 text-[10px] text-slate-500 font-medium">
            {impactLabels.map((label, i) => (
              <span key={i} className="h-10 flex items-center justify-end">{label}</span>
            ))}
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-5 gap-1">
              {matrix.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  const impact = 5 - rowIndex;
                  const likelihood = colIndex + 1;
                  return (
                    <TooltipProvider key={`${rowIndex}-${colIndex}`}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`h-10 rounded-md flex items-center justify-center text-white font-semibold text-xs cursor-pointer transition-all duration-200 ${getCellColor(impact, likelihood)}`}
                            onClick={() => cell.length > 0 && onCellClick && onCellClick(cell, impact, likelihood)}
                          >
                            {cell.length > 0 ? cell.length : ""}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#1a2332] border-[#2a3548] text-white max-w-sm p-0" sideOffset={5}>
                          <div className="p-3 border-b border-[#2a3548]">
                            <p className="font-semibold text-xs text-indigo-400">{impactLabels[rowIndex]} Impact | {likelihoodLabels[colIndex]}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Risk Score: {impact * likelihood}</p>
                          </div>
                          {cell.length > 0 ? (
                            <div className="max-h-64 overflow-y-auto">
                              {cell.slice(0, 5).map(risk => {
                                if (!risk) return null;
                                const linkedControls = Array.isArray(controls) ? controls.filter(c => 
                                  c && (risk.linked_controls?.includes(c.id) || c.linked_risks?.includes(risk.id))
                                ) : [];
                                const hasEffectiveControls = linkedControls.some(c => 
                                  c && (c.status === 'effective' || c.effectiveness >= 4)
                                );
                                
                                return (
                                  <div 
                                    key={risk.id} 
                                    className="p-3 border-b border-[#2a3548] hover:bg-[#151d2e] transition-colors cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(createPageUrl('RiskManagement') + '?riskId=' + risk.id);
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h4 className="text-xs font-semibold text-white flex-1 leading-tight">{risk.title}</h4>
                                      <Badge className={`text-[9px] flex-shrink-0 ${
                                        risk.status === 'mitigating' ? 'bg-blue-500/20 text-blue-400' :
                                        risk.status === 'monitoring' ? 'bg-emerald-500/20 text-emerald-400' :
                                        'bg-amber-500/20 text-amber-400'
                                      }`}>
                                        {risk.status}
                                      </Badge>
                                    </div>
                                    {risk.description && (
                                      <p className="text-[10px] text-slate-400 mb-2 line-clamp-2">{risk.description}</p>
                                    )}
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {risk.category && (
                                        <Badge className="text-[9px] bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                          {risk.category}
                                        </Badge>
                                      )}
                                      {linkedControls.length > 0 ? (
                                        <div className="flex items-center gap-1 text-[10px]">
                                          {hasEffectiveControls ? (
                                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                          ) : (
                                            <Shield className="h-3 w-3 text-amber-400" />
                                          )}
                                          <span className={hasEffectiveControls ? 'text-emerald-400' : 'text-amber-400'}>
                                            {linkedControls.length} control{linkedControls.length !== 1 ? 's' : ''}
                                          </span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-[10px] text-rose-400">
                                          <XCircle className="h-3 w-3" />
                                          <span>No controls</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                              {cell.length > 5 && (
                                <div className="p-2 text-center text-[10px] text-slate-500">
                                  +{cell.length - 5} more risk{cell.length - 5 !== 1 ? 's' : ''} (click cell to view all)
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-3 text-center text-[10px] text-slate-500">
                              No risks in this cell
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })
              )}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-medium">
              {likelihoodLabels.map(label => (
                <span key={label} className="text-center flex-1">{label}</span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default RiskHeatMap;