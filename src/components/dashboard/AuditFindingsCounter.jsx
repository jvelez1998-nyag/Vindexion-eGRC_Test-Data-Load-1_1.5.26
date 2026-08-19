import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function AuditFindingsCounter({ audits = [], onAuditClick }) {
  const totalFindings = audits.reduce((sum, a) => sum + (a.findings_count || 0), 0);
  const criticalFindings = audits.reduce((sum, a) => sum + (a.critical_findings || 0), 0);
  const inProgressAudits = audits.filter(a => a.status === 'in_progress');
  const upcomingAudits = audits.filter(a => {
    if (!a.start_date) return false;
    const startDate = new Date(a.start_date);
    const now = new Date();
    const daysUntil = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  });

  const statusColors = {
    planned: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    follow_up: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5 text-violet-400" />
          Audit Findings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20">
            <div className="flex items-center gap-1 mb-0.5">
              <AlertCircle className="h-3 w-3 text-rose-400" />
              <span className="text-[10px] text-slate-400 uppercase">Critical</span>
            </div>
            <p className="text-xl font-bold text-rose-400">{criticalFindings}</p>
          </div>
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
            <div className="flex items-center gap-1 mb-0.5">
              <ClipboardCheck className="h-3 w-3 text-violet-400" />
              <span className="text-[10px] text-slate-400 uppercase">Total</span>
            </div>
            <p className="text-xl font-bold text-violet-400">{totalFindings}</p>
          </div>
        </div>

        {/* In Progress Audits */}
        {inProgressAudits.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase mb-1.5">In Progress ({inProgressAudits.length})</p>
            <div className="space-y-1.5">
              {inProgressAudits.slice(0, 2).map((audit) => (
                <div 
                  key={audit.id}
                  className="p-1.5 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-[#3a4558] transition-all cursor-pointer"
                  onClick={() => onAuditClick?.(audit)}
                >
                  <span className="text-xs text-white font-medium truncate block">{audit.title}</span>
                  {audit.findings_count > 0 && (
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                      <span>{audit.findings_count} findings</span>
                      {audit.critical_findings > 0 && (
                        <span className="text-rose-400">{audit.critical_findings} critical</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Audits */}
        {upcomingAudits.length > 0 && (
          <div>
            <p className="text-[10px] text-slate-500 uppercase mb-1.5">Upcoming ({upcomingAudits.length})</p>
            <div className="space-y-1.5">
              {upcomingAudits.slice(0, 2).map((audit) => (
                <div 
                  key={audit.id}
                  className="p-1.5 rounded-lg bg-[#151d2e] border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer"
                  onClick={() => onAuditClick?.(audit)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white font-medium truncate">{audit.title}</span>
                    <span className="text-[10px] text-amber-400">
                      {format(new Date(audit.start_date), 'MMM d')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {audits.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-3">No audits scheduled</p>
        )}
      </CardContent>
    </Card>
  );
}