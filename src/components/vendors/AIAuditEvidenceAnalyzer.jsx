import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Loader2, Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AIAuditEvidenceAnalyzer({ audit, vendor }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return { name: file.name, url: file_url };
      });

      const uploaded = await Promise.all(uploadPromises);
      setEvidenceFiles(prev => [...prev, ...uploaded]);
      toast.success(`${files.length} file(s) uploaded`);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const analyzeEvidence = async () => {
    if (evidenceFiles.length === 0) {
      toast.error("Please upload evidence files first");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Analyze vendor audit evidence and identify compliance gaps and control deficiencies:

**VENDOR:** ${vendor.name}
**AUDIT:** ${audit.audit_name}
**AUDIT SCOPE:** ${audit.scope}

**EVIDENCE FILES:**
${evidenceFiles.map(f => `- ${f.name}`).join('\n')}

Analyze the uploaded evidence and provide:
1. **Evidence Summary** - Overview of documents reviewed
2. **Compliance Gaps** - Areas not meeting requirements
3. **Control Deficiencies** - Weaknesses in controls
4. **Positive Findings** - Strong controls and practices
5. **Risk Assessment** - Risk level of identified issues
6. **Recommendations** - Specific remediation actions
7. **Follow-up Items** - Additional evidence or clarifications needed

Categorize findings by:
- Severity (Critical, High, Medium, Low)
- Domain (Security, Compliance, Operations, Financial, Privacy)
- Status (Open, Closed, In Progress)`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: evidenceFiles.map(f => f.url),
        response_json_schema: {
          type: "object",
          properties: {
            evidence_summary: { type: "string" },
            compliance_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  gap: { type: "string" },
                  severity: { type: "string" },
                  domain: { type: "string" },
                  requirement: { type: "string" },
                  current_state: { type: "string" },
                  expected_state: { type: "string" }
                }
              }
            },
            control_deficiencies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  control_area: { type: "string" },
                  deficiency: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" },
                  recommendation: { type: "string" }
                }
              }
            },
            positive_findings: {
              type: "array",
              items: { type: "string" }
            },
            risk_assessment: {
              type: "object",
              properties: {
                overall_risk: { type: "string" },
                critical_issues: { type: "number" },
                high_issues: { type: "number" },
                medium_issues: { type: "number" },
                summary: { type: "string" }
              }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  recommendation: { type: "string" },
                  priority: { type: "string" },
                  timeline: { type: "string" },
                  owner: { type: "string" }
                }
              }
            },
            follow_up_items: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Evidence analyzed");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Evidence Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Section */}
        <div>
          <label className="block text-sm text-slate-400 mb-2">Upload Audit Evidence</label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="bg-[#0f1623] border-[#2a3548]"
            />
            <Button
              onClick={analyzeEvidence}
              disabled={loading || evidenceFiles.length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Brain className="h-4 w-4 mr-2" /> Analyze</>
              )}
            </Button>
          </div>
          {evidenceFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {evidenceFiles.map((file, idx) => (
                <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                  <FileText className="h-3 w-3" />
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {!analysis ? (
          <div className="text-center py-8">
            <Upload className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Upload evidence files for AI analysis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Risk Assessment */}
            <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
              <h4 className="text-sm font-semibold text-white mb-2">Risk Assessment</h4>
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400">Overall Risk:</span>
                <Badge className={getSeverityColor(analysis.risk_assessment?.overall_risk)}>
                  {analysis.risk_assessment?.overall_risk}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 bg-rose-500/10 rounded">
                  <div className="text-lg font-bold text-rose-400">{analysis.risk_assessment?.critical_issues || 0}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
                <div className="text-center p-2 bg-orange-500/10 rounded">
                  <div className="text-lg font-bold text-orange-400">{analysis.risk_assessment?.high_issues || 0}</div>
                  <div className="text-xs text-slate-400">High</div>
                </div>
                <div className="text-center p-2 bg-amber-500/10 rounded">
                  <div className="text-lg font-bold text-amber-400">{analysis.risk_assessment?.medium_issues || 0}</div>
                  <div className="text-xs text-slate-400">Medium</div>
                </div>
              </div>
              <p className="text-sm text-slate-300">{analysis.risk_assessment?.summary}</p>
            </Card>

            {/* Compliance Gaps */}
            {analysis.compliance_gaps?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  Compliance Gaps ({analysis.compliance_gaps.length})
                </h4>
                <div className="space-y-2">
                  {analysis.compliance_gaps.map((gap, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-medium text-white flex-1">{gap.gap}</h5>
                        <Badge className={getSeverityColor(gap.severity)}>
                          {gap.severity}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-slate-500">Domain:</span>
                          <p className="text-slate-300">{gap.domain}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Requirement:</span>
                          <p className="text-slate-300">{gap.requirement}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-500">Current:</span>
                          <p className="text-slate-300">{gap.current_state}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Expected:</span>
                          <p className="text-emerald-400">{gap.expected_state}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Control Deficiencies */}
            {analysis.control_deficiencies?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Control Deficiencies</h4>
                <div className="space-y-2">
                  {analysis.control_deficiencies.map((def, idx) => (
                    <Card key={idx} className="bg-[#151d2e] border-orange-500/30 p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="text-sm font-medium text-white">{def.control_area}</h5>
                        <Badge className={getSeverityColor(def.severity)}>
                          {def.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{def.deficiency}</p>
                      <div className="text-xs">
                        <span className="text-slate-500">Impact: </span>
                        <span className="text-slate-300">{def.impact}</span>
                      </div>
                      <div className="mt-2 p-2 bg-blue-500/10 rounded text-xs text-blue-300">
                        💡 {def.recommendation}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Positive Findings */}
            {analysis.positive_findings?.length > 0 && (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Positive Findings
                </h4>
                <div className="space-y-1">
                  {analysis.positive_findings.map((finding, idx) => (
                    <div key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{finding}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}