import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertTriangle, Loader2, Brain, FileCheck } from "lucide-react";
import { toast } from "sonner";

export default function AIComplianceChecker({ complianceItems, controls, risks, incidents }) {
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);

  const frameworks = ["GDPR", "HIPAA", "SOC2", "ISO27001", "PCI-DSS", "CCPA", "NIST", "SOX"];

  const runComplianceCheck = async () => {
    setChecking(true);
    try {
      const relevantItems = selectedFramework === "all" 
        ? complianceItems 
        : complianceItems.filter(item => item.framework === selectedFramework);

      const prompt = `Perform automated compliance check against ${selectedFramework === "all" ? "all frameworks" : selectedFramework}:

**COMPLIANCE DATA:**
Total Requirements: ${relevantItems.length}
- Implemented: ${relevantItems.filter(i => i.status === 'implemented').length}
- In Progress: ${relevantItems.filter(i => i.status === 'in_progress').length}
- Not Started: ${relevantItems.filter(i => i.status === 'not_started').length}
- Non-Compliant: ${relevantItems.filter(i => i.status === 'non_compliant').length}

**CONTROL ENVIRONMENT:**
Total Controls: ${controls.length}
- Effective: ${controls.filter(c => c.status === 'effective').length}
- Ineffective: ${controls.filter(c => c.status === 'ineffective').length}

**RISK CONTEXT:**
Total Risks: ${risks.length}
- Critical/High: ${risks.filter(r => ['critical', 'high'].includes(r.overall_risk_rating?.toLowerCase())).length}

**INCIDENTS:**
Recent Incidents: ${incidents.filter(i => {
  const date = new Date(i.reported_date);
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  return date > sixMonthsAgo;
}).length} (last 6 months)

Analyze compliance status and provide:
1. Overall compliance score (0-100)
2. Framework-by-framework assessment
3. Critical gaps requiring immediate attention
4. Control deficiencies affecting compliance
5. Risk-related compliance issues
6. Incident patterns indicating non-compliance
7. Automated compliance status determination`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_score: { type: "number" },
            compliance_status: { type: "string" },
            summary: { type: "string" },
            framework_results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  score: { type: "number" },
                  status: { type: "string" },
                  compliant_count: { type: "number" },
                  non_compliant_count: { type: "number" },
                  issues: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            },
            critical_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  framework: { type: "string" },
                  severity: { type: "string" },
                  risk_level: { type: "string" }
                }
              }
            },
            control_deficiencies: {
              type: "array",
              items: { type: "string" }
            },
            risk_issues: {
              type: "array",
              items: { type: "string" }
            },
            incident_patterns: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setResults(result);
      toast.success("Compliance check completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to run compliance check");
    } finally {
      setChecking(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'compliant': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default: return <XCircle className="h-5 w-5 text-rose-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'compliant': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'partial': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Compliance Checker
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-[180px] bg-[#0f1623] border-[#2a3548]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                <SelectItem value="all">All Frameworks</SelectItem>
                {frameworks.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={runComplianceCheck}
              disabled={checking}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {checking ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Run Check</>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!results ? (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Run automated compliance check against regulations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Status */}
            <Card className={`p-4 ${getStatusColor(results.compliance_status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(results.compliance_status)}
                  <div>
                    <h4 className="text-sm font-semibold text-white">Overall Compliance</h4>
                    <Badge className={getStatusColor(results.compliance_status)}>
                      {results.compliance_status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{results.overall_score}%</div>
                  <div className="text-xs text-slate-400">Compliance Score</div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{results.summary}</p>
            </Card>

            {/* Framework Results */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Framework Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.framework_results?.map((fw, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fw.status)}
                        <h5 className="text-sm font-semibold text-white">{fw.framework}</h5>
                      </div>
                      <Badge className={getStatusColor(fw.status)}>
                        {fw.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {fw.compliant_count} compliant
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-rose-400" />
                        {fw.non_compliant_count} gaps
                      </span>
                    </div>
                    {fw.issues?.length > 0 && (
                      <div className="space-y-1 mt-2">
                        {fw.issues.slice(0, 2).map((issue, i) => (
                          <div key={i} className="text-xs text-slate-400">• {issue}</div>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Critical Gaps */}
            {results.critical_gaps?.length > 0 && (
              <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Critical Gaps
                </h4>
                <div className="space-y-2">
                  {results.critical_gaps.map((gap, idx) => (
                    <div key={idx} className="p-2 bg-[#151d2e] rounded border border-rose-500/30">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm text-white flex-1">{gap.gap}</p>
                        <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30">
                          {gap.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{gap.framework} • Risk: {gap.risk_level}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Control Deficiencies */}
            {results.control_deficiencies?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Control Deficiencies</h4>
                <div className="space-y-1">
                  {results.control_deficiencies.map((def, idx) => (
                    <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <XCircle className="h-3 w-3 text-amber-400 mt-1 flex-shrink-0" />
                      <span>{def}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}