import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ListChecks,
  Users,
  Lock,
} from "lucide-react";
import { qualifyVulnerabilities } from "@/lib/delegatedAuthority/qualifyVulnerability";
import { MOCK_DELEGATED_AUTHORITIES, MOCK_VULNERABILITIES } from "@/lib/delegatedAuthority/mockData";

function StatTile({ label, value, icon: Icon, tone }) {
  return (
    <Card className={`bg-gradient-to-br ${tone.bg} ${tone.border}`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-slate-400">{label}</div>
          </div>
          <Icon className={`h-8 w-8 ${tone.icon}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function GateRow({ gate }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {gate.passed ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
      )}
      <span className={gate.passed ? "text-slate-300" : "text-rose-300"}>{gate.label}</span>
    </div>
  );
}

function QualificationCase({ result }) {
  const { vulnerability: vuln, decision, gates, reason } = result;
  const isAutoRemediate = decision === "AUTO_REMEDIATE";

  return (
    <Card className={`bg-[#151d2e] border-2 ${isAutoRemediate ? "border-emerald-500/30" : "border-rose-500/30"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white">{vuln.id}</CardTitle>
          <Badge className={isAutoRemediate ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}>
            {isAutoRemediate ? "Auto-Remediate" : "Human Review"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-sm text-white font-medium">{vuln.title}</div>
          <div className="text-xs text-slate-500 mt-0.5">{vuln.asset_name}</div>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400">
          <div>Severity: <span className="text-slate-200">{vuln.severity.toFixed(1)} / 10</span></div>
          <div>Asset Criticality: <span className="text-slate-200">{vuln.asset_criticality} / 100</span></div>
          <div>Patch: <span className="text-slate-200">{vuln.patch_status}</span></div>
          <div>Pre-Test: <span className="text-slate-200">{vuln.pre_test_status}</span></div>
        </div>

        {gates.length > 0 ? (
          <div className="pt-2 border-t border-[#2a3548] space-y-1.5">
            {gates.map((gate) => (
              <GateRow key={gate.key} gate={gate} />
            ))}
          </div>
        ) : (
          <div className="pt-2 border-t border-[#2a3548] flex items-center gap-2 text-sm text-rose-300">
            <XCircle className="h-4 w-4 shrink-0" />
            No delegated authority in scope
          </div>
        )}

        <div className="text-xs text-slate-500 pt-1">{reason}</div>
      </CardContent>
    </Card>
  );
}

export default function RemediationQualificationDashboard() {
  const [vulnerabilities] = useState(MOCK_VULNERABILITIES);
  const [authorities] = useState(MOCK_DELEGATED_AUTHORITIES);

  const results = useMemo(
    () => qualifyVulnerabilities(vulnerabilities, authorities),
    [vulnerabilities, authorities]
  );

  const autoRemediateCount = results.filter((r) => r.decision === "AUTO_REMEDIATE").length;
  const humanReviewCount = results.length - autoRemediateCount;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatTile
          label="Open Vulnerabilities"
          value={results.length}
          icon={ListChecks}
          tone={{ bg: "from-slate-500/10 to-slate-600/10", border: "border-slate-500/20", icon: "text-slate-400" }}
        />
        <StatTile
          label="Auto-Remediated"
          value={autoRemediateCount}
          icon={ShieldCheck}
          tone={{ bg: "from-emerald-500/10 to-green-500/10", border: "border-emerald-500/20", icon: "text-emerald-400" }}
        />
        <StatTile
          label="Human Review"
          value={humanReviewCount}
          icon={Users}
          tone={{ bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-500/20", icon: "text-amber-400" }}
        />
        <StatTile
          label="Active Authorities"
          value={authorities.filter((a) => a.is_active).length}
          icon={Lock}
          tone={{ bg: "from-indigo-500/10 to-purple-500/10", border: "border-indigo-500/20", icon: "text-indigo-400" }}
        />
      </div>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            Qualification Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {results.map((result) => (
              <QualificationCase key={result.vulnerability.id} result={result} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base">Authority Boundaries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {authorities.map((authority) => (
            <div key={authority.id} className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
              <div>
                <div className="text-sm font-medium text-white">{authority.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Max severity {authority.max_severity} · Max asset criticality {authority.max_asset_criticality} ·{" "}
                  {authority.allowed_environments.join(", ")}
                </div>
              </div>
              <Badge className={authority.is_active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-slate-500/20 text-slate-400"}>
                {authority.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
