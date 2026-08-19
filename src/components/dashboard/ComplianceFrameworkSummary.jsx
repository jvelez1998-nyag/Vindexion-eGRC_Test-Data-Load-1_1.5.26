import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileCheck, ChevronRight } from "lucide-react";

export default function ComplianceFrameworkSummary({ compliance = [], onFrameworkClick }) {
  const byFramework = compliance.reduce((acc, item) => {
    const framework = item.framework || 'Other';
    if (!acc[framework]) {
      acc[framework] = { total: 0, verified: 0, implemented: 0, in_progress: 0, not_started: 0, non_compliant: 0 };
    }
    acc[framework].total++;
    acc[framework][item.status] = (acc[framework][item.status] || 0) + 1;
    return acc;
  }, {});

  const frameworks = Object.entries(byFramework)
    .map(([name, data]) => ({
      name,
      ...data,
      compliant: data.verified + data.implemented,
      rate: Math.round(((data.verified + data.implemented) / data.total) * 100)
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-400" />
          Compliance by Framework
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {frameworks.length > 0 ? frameworks.slice(0, 4).map((fw) => (
          <div 
            key={fw.name}
            className="p-2 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-[#3a4558] transition-all cursor-pointer"
            onClick={() => onFrameworkClick?.(fw.name)}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-white truncate">{fw.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{fw.compliant}/{fw.total}</span>
                <span className={`text-xs font-bold ${
                  fw.rate >= 80 ? 'text-emerald-400' : 
                  fw.rate >= 50 ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {fw.rate}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Progress value={fw.rate} className="h-1.5 flex-1" />
              <ChevronRight className="h-3 w-3 text-slate-500" />
            </div>
            {(fw.in_progress > 0 || fw.non_compliant > 0) && (
              <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500">
                {fw.in_progress > 0 && <span>{fw.in_progress} in progress</span>}
                {fw.non_compliant > 0 && <span className="text-rose-400">{fw.non_compliant} non-compliant</span>}
              </div>
            )}
          </div>
        )) : (
          <p className="text-xs text-slate-500 text-center py-3">No compliance data available</p>
        )}
      </CardContent>
    </Card>
  );
}