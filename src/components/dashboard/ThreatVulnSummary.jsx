import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, TrendingDown } from "lucide-react";

export default function ThreatVulnSummary() {
  // Mock data - replace with actual API call
  const stats = {
    criticalCVEs: 3,
    activeThreats: 7,
    vulnerabilities: 24,
    remediatedThisWeek: 12
  };

  const summary = stats.criticalCVEs === 0 
    ? `${stats.vulnerabilities} open vulnerabilities tracked. ${stats.remediatedThisWeek} remediated this week. Strong security posture.`
    : `${stats.criticalCVEs} critical CVEs require immediate attention. ${stats.activeThreats} active threats monitored. Remediation pace: ${stats.remediatedThisWeek}/week.`;

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-rose-400" />
          Threat & Vulnerability
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-slate-300 leading-relaxed mb-3 p-2 bg-rose-500/10 rounded-lg">{summary}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <p className="text-xs text-slate-400 mb-1">Critical CVEs</p>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span className="text-xl font-bold text-white">{stats.criticalCVEs}</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-slate-400 mb-1">Active Threats</p>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-400" />
              <span className="text-xl font-bold text-white">{stats.activeThreats}</span>
            </div>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-xs text-slate-400 mb-1">Open Vulns</p>
            <span className="text-xl font-bold text-white">{stats.vulnerabilities}</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-slate-400 mb-1">Remediated</p>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-emerald-400" />
              <span className="text-xl font-bold text-white">{stats.remediatedThisWeek}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}