import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Loader2, CheckCircle2, AlertCircle, FileText, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AIComplianceAnalyzer({ vendor }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeCompliance = async () => {
    setLoading(true);
    try {
      const prompt = `Analyze vendor compliance posture:

**VENDOR:** ${vendor.name}
**INDUSTRY:** ${vendor.industry || 'Not specified'}
**SERVICES:** ${vendor.services_provided}
**DATA ACCESS:** ${vendor.data_access_level || 'Unknown'}
**CERTIFICATIONS:** ${vendor.certifications?.join(', ') || 'None'}
**COMPLIANCE STATUS:** ${vendor.compliance_status || 'Unknown'}

Analyze compliance across:
1. **SOC 2** - Service Organization Controls
2. **ISO 27001** - Information Security Management
3. **GDPR** - Data Protection (if applicable)
4. **HIPAA** - Healthcare data (if applicable)
5. **PCI DSS** - Payment card data (if applicable)
6. **CCPA** - California privacy (if applicable)
7. **SOX** - Financial controls (if applicable)

For each framework, provide:
- Compliance status (Compliant/Partial/Non-Compliant/Not Applicable)
- Evidence strength (Strong/Moderate/Weak/None)
- Gaps identified
- Required actions
- Priority level

Also identify:
- Missing certifications critical for this vendor type
- Expiring certifications
- Compliance timeline recommendations`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_compliance_score: { type: "number" },
            compliance_status: { type: "string" },
            summary: { type: "string" },
            framework_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  framework: { type: "string" },
                  status: { type: "string" },
                  evidence_strength: { type: "string" },
                  gaps: {
                    type: "array",
                    items: { type: "string" }
                  },
                  required_actions: {
                    type: "array",
                    items: { type: "string" }
                  },
                  priority: { type: "string" }
                }
              }
            },
            missing_certifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  certification: { type: "string" },
                  importance: { type: "string" },
                  rationale: { type: "string" }
                }
              }
            },
            expiring_soon: {
              type: "array",
              items: { type: "string" }
            },
            timeline_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  milestone: { type: "string" },
                  deadline: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Compliance analysis completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze compliance");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'compliant': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'partial': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'non-compliant': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-blue-400" />
            AI Compliance Analyzer
          </CardTitle>
          <Button
            onClick={analyzeCompliance}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><FileCheck className="h-4 w-4 mr-2" /> Analyze Compliance</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!analysis ? (
          <div className="text-center py-8">
            <FileCheck className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Analyze vendor compliance across multiple frameworks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Status */}
            <Card className={`p-4 ${getStatusColor(analysis.compliance_status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Overall Compliance</h4>
                  <Badge className={getStatusColor(analysis.compliance_status)}>
                    {analysis.compliance_status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    {analysis.overall_compliance_score}%
                  </div>
                  <div className="text-xs text-slate-400">Compliance Score</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mt-3">{analysis.summary}</p>
            </Card>

            {/* Framework Analysis */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Framework Analysis</h4>
              <div className="space-y-3">
                {analysis.framework_analysis?.map((framework, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className="text-sm font-semibold text-white mb-2">{framework.framework}</h5>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(framework.status)}>
                            {framework.status}
                          </Badge>
                          <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                            Evidence: {framework.evidence_strength}
                          </Badge>
                          <Badge className={
                            framework.priority === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            framework.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                            'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          }>
                            {framework.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {framework.gaps?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-slate-400 mb-1 font-medium">Identified Gaps:</p>
                        <div className="space-y-1">
                          {framework.gaps.map((gap, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <AlertCircle className="h-3 w-3 text-amber-400 mt-1 flex-shrink-0" />
                              <span>{gap}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {framework.required_actions?.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1 font-medium">Required Actions:</p>
                        <div className="space-y-1">
                          {framework.required_actions.map((action, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-blue-300">
                              <CheckCircle2 className="h-3 w-3 text-blue-400 mt-1 flex-shrink-0" />
                              <span>{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>

            {/* Missing Certifications */}
            {analysis.missing_certifications?.length > 0 && (
              <Card className="bg-gradient-to-br from-orange-500/10 to-rose-500/10 border-orange-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                  Missing Critical Certifications
                </h4>
                <div className="space-y-2">
                  {analysis.missing_certifications.map((cert, idx) => (
                    <div key={idx} className="p-2 bg-[#151d2e] rounded border border-orange-500/30">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-sm font-medium text-white">{cert.certification}</h5>
                        <Badge className={
                          cert.importance === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                          'bg-amber-500/20 text-amber-400 border-amber-500/30'
                        }>
                          {cert.importance}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{cert.rationale}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Timeline Recommendations */}
            {analysis.timeline_recommendations?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  Compliance Timeline
                </h4>
                <div className="space-y-2">
                  {analysis.timeline_recommendations.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-[#151d2e] rounded border border-[#2a3548]">
                      <span className="text-sm text-slate-300">{item.milestone}</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {item.deadline}
                      </Badge>
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