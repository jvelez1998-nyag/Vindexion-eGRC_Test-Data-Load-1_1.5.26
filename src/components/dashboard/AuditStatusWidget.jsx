import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck, CheckCircle2, Clock, AlertCircle, FileSearch, TrendingUp } from "lucide-react";

export default function AuditStatusWidget({ audits }) {
  const safeAudits = Array.isArray(audits) ? audits.filter(a => a) : [];
  
  const planned = safeAudits.filter(a => a.status === 'planned').length;
  const inProgress = safeAudits.filter(a => a.status === 'in_progress').length;
  const completed = safeAudits.filter(a => a.status === 'completed').length;
  const totalFindings = safeAudits.reduce((sum, a) => sum + (a.findings_count || 0), 0);
  const criticalFindings = safeAudits.reduce((sum, a) => sum + (a.critical_findings || 0), 0);
  
  const completionRate = safeAudits.length ? Math.round((completed / safeAudits.length) * 100) : 0;
  const activeAudits = safeAudits.filter(a => a.status === 'in_progress' || a.status === 'planned');

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-indigo-400" />
          Audit Program Status
        </CardTitle>
        <p className="text-xs text-slate-500 mt-1">Audit progress and findings summary</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Completion Rate */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Completion Rate</p>
                  <p className="text-2xl font-bold text-white">{completionRate}%</p>
                </div>
              </div>
              <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                {completed} / {safeAudits.length}
              </Badge>
            </div>
            <Progress value={completionRate} className="h-2 [&>div]:bg-indigo-500" />
          </div>

          {/* Status Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gradient-to-br from-slate-500/10 to-slate-600/10 border border-slate-500/20 rounded-lg p-3 text-center">
              <Clock className="h-5 w-5 text-slate-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{planned}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Planned</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
              <AlertCircle className="h-5 w-5 text-blue-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{inProgress}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Active</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-xl font-bold text-white">{completed}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Done</p>
            </div>
          </div>

          {/* Findings Summary */}
          <div className="bg-[#0f1623] rounded-lg p-4 border border-[#2a3548]">
            <div className="flex items-center gap-2 mb-3">
              <FileSearch className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-medium text-white">Total Findings</p>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-3xl font-bold text-white">{totalFindings}</p>
              {criticalFindings > 0 && (
                <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 mb-1">
                  {criticalFindings} critical
                </Badge>
              )}
            </div>
          </div>

          {/* Active Audits */}
          {activeAudits.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400">Active Audits</p>
              {activeAudits.slice(0, 3).map(audit => (
                <div key={audit.id} className="bg-[#0f1623] rounded-lg p-3 border border-[#2a3548]">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-medium text-white flex-1 min-w-0 truncate">{audit.title}</p>
                    <Badge className={`text-[10px] ml-2 flex-shrink-0 ${
                      audit.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      audit.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      'bg-slate-500/20 text-slate-400 border-slate-500/30'
                    }`}>
                      {audit.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">{audit.type || 'General Audit'}</span>
                    {audit.findings_count > 0 && (
                      <span className="text-[10px] text-amber-400">• {audit.findings_count} findings</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}