import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default function CompactAuditFindings({ audits, onAuditClick }) {
  const allFindings = audits.flatMap(a => a.findings || []);
  const criticalFindings = allFindings.filter(f => f.severity === 'critical').length;
  const highFindings = allFindings.filter(f => f.severity === 'high').length;
  const openFindings = allFindings.filter(f => f.status !== 'resolved').length;

  const recentAudits = audits
    .filter(a => a.findings && a.findings.length > 0)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 3);

  const summary = allFindings.length === 0 
    ? "No audit findings. Maintain audit cadence."
    : `${allFindings.length} total findings across ${audits.length} audits. ${criticalFindings} critical requiring immediate remediation. ${openFindings} remain open.`;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Audit Findings Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed p-2 bg-amber-500/10 rounded-lg">{summary}</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <p className="text-base font-bold text-white">{criticalFindings}</p>
              <p className="text-[10px] text-slate-400">Critical</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-base font-bold text-white">{highFindings}</p>
              <p className="text-[10px] text-slate-400">High</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <p className="text-base font-bold text-white">{openFindings}</p>
              <p className="text-[10px] text-slate-400">Open</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}