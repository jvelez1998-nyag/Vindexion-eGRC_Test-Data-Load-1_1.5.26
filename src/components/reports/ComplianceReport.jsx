import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";

export default function ComplianceReport({ compliance, onDrillDown }) {
  const byFramework = compliance.reduce((acc, item) => {
    const framework = item.framework || 'Other';
    if (!acc[framework]) {
      acc[framework] = { total: 0, compliant: 0 };
    }
    acc[framework].total++;
    if (item.status === 'verified' || item.status === 'implemented') {
      acc[framework].compliant++;
    }
    return acc;
  }, {});

  const statusCounts = compliance.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const total = compliance.length || 1;
  const compliant = (statusCounts.implemented || 0) + (statusCounts.verified || 0);
  const overallRate = Math.round((compliant / total) * 100);

  const statusItems = [
    { key: 'verified', label: 'Verified', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: 'implemented', label: 'Implemented', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { key: 'not_started', label: 'Not Started', icon: AlertCircle, color: 'text-slate-400', bg: 'bg-slate-500/10' },
    { key: 'non_compliant', label: 'Non-Compliant', icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/10' }
  ];

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDrillDown?.('All Compliance Items', compliance)}
          >
            <CardTitle className="text-base font-semibold text-white">Compliance Status</CardTitle>
            <p className="text-xs text-slate-500">{compliance.length} requirements tracked</p>
          </div>
          <div 
            className="text-right cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onDrillDown?.('Compliant Items', compliance.filter(c => c.status === 'verified' || c.status === 'implemented'))}
          >
            <p className="text-2xl font-bold text-emerald-400">{overallRate}%</p>
            <p className="text-[10px] text-slate-500 uppercase">Overall</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {statusItems.map(item => {
            const count = statusCounts[item.key] || 0;
            const Icon = item.icon;
            return (
              <div 
                key={item.key} 
                className={`p-2 rounded-lg ${item.bg} text-center cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => onDrillDown?.(`${item.label} Items`, compliance.filter(c => c.status === item.key))}
              >
                <Icon className={`h-4 w-4 ${item.color} mx-auto mb-1`} />
                <p className="text-lg font-bold text-white">{count}</p>
                <p className="text-[9px] text-slate-400 uppercase">{item.label}</p>
              </div>
            );
          })}
        </div>

        <div className="space-y-3 pt-3 border-t border-[#2a3548]">
          <p className="text-xs text-slate-500 uppercase tracking-wider">By Framework</p>
          {Object.entries(byFramework).map(([framework, data]) => {
            const rate = Math.round((data.compliant / data.total) * 100);
            return (
              <div 
                key={framework} 
                className="cursor-pointer hover:bg-[#151d2e] p-2 -mx-2 rounded-lg transition-colors"
                onClick={() => onDrillDown?.(`${framework} Requirements`, compliance.filter(c => c.framework === framework))}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-white">{framework}</span>
                  <span className="text-xs text-slate-400">{data.compliant}/{data.total} ({rate}%)</span>
                </div>
                <div className="h-1.5 bg-[#2a3548] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}