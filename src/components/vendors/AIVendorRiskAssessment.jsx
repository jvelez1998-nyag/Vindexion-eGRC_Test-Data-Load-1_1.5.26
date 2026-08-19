import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, AlertTriangle, Shield, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AIVendorRiskAssessment({ vendor }) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(false);

  const assessVendorRisk = async () => {
    setLoading(true);
    try {
      const prompt = `Perform a comprehensive AI-powered risk assessment for the following vendor:

**VENDOR DETAILS:**
- Name: ${vendor.name}
- Category: ${vendor.vendor_category || 'Not specified'}
- Tier: ${vendor.tier || 'Not specified'}
- Status: ${vendor.status}
- Criticality: ${vendor.criticality || 'Not specified'}
- Services: ${vendor.services_provided || 'Not specified'}
- Contract Value: ${vendor.contract_value || 'Not specified'}
- Contract End Date: ${vendor.contract_end_date || 'Not specified'}
- Data Access Level: ${vendor.data_access_level || 'Not specified'}

**SECURITY & COMPLIANCE:**
- Security Rating: ${vendor.security_rating || 'Not assessed'}
- Certifications: ${vendor.certifications?.join(', ') || 'None'}
- Last Audit: ${vendor.last_audit_date || 'Never'}
- Compliance Status: ${vendor.compliance_status || 'Unknown'}

**RISK INDICATORS:**
- Financial Health: ${vendor.financial_health || 'Unknown'}
- Past Issues: ${vendor.past_issues || 'None documented'}

Analyze and provide:
1. **Overall Risk Score** (0-100, where 100 is highest risk)
2. **Risk Level** (Low/Medium/High/Critical)
3. **Category-Specific Risk Scores**:
   - Security Risk (0-100)
   - Compliance Risk (0-100)
   - Financial Risk (0-100)
   - Operational Risk (0-100)
   - Data Privacy Risk (0-100)
   - Reputational Risk (0-100)

4. **Key Risk Factors** - Identify top 5 concerns
5. **Strengths** - Positive factors reducing risk
6. **Recommendations** - Specific actions to mitigate risks
7. **Red Flags** - Critical issues requiring immediate attention
8. **Monitoring Priorities** - What to watch closely`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_risk_score: { type: "number" },
            risk_level: { type: "string" },
            risk_summary: { type: "string" },
            category_scores: {
              type: "object",
              properties: {
                security: { type: "number" },
                compliance: { type: "number" },
                financial: { type: "number" },
                operational: { type: "number" },
                data_privacy: { type: "number" },
                reputational: { type: "number" }
              }
            },
            key_risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  severity: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            strengths: {
              type: "array",
              items: { type: "string" }
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  priority: { type: "string" },
                  timeframe: { type: "string" }
                }
              }
            },
            red_flags: {
              type: "array",
              items: { type: "string" }
            },
            monitoring_priorities: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Update vendor with AI risk score
      await base44.entities.Vendor.update(vendor.id, {
        ai_risk_score: result.overall_risk_score,
        ai_risk_level: result.risk_level,
        last_risk_assessment: new Date().toISOString()
      });

      setAssessment(result);
      toast.success("Risk assessment completed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to assess vendor risk");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-rose-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <Card className="bg-[#1a2332] border-[#2a3548]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Risk Assessment
          </CardTitle>
          <Button
            onClick={assessVendorRisk}
            disabled={loading}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</>
            ) : (
              <><Brain className="h-4 w-4 mr-2" /> Assess Risk</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!assessment ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Click "Assess Risk" for AI-powered vendor risk analysis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overall Risk Score */}
            <Card className={`p-4 ${getRiskColor(assessment.risk_level)}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Overall Risk Assessment</h4>
                  <Badge className={getRiskColor(assessment.risk_level)}>
                    {assessment.risk_level} Risk
                  </Badge>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(assessment.overall_risk_score)}`}>
                    {assessment.overall_risk_score}
                  </div>
                  <div className="text-xs text-slate-400">Risk Score</div>
                </div>
              </div>
              <p className="text-sm text-slate-300 mt-3">{assessment.risk_summary}</p>
            </Card>

            {/* Category Scores */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Risk Breakdown</h4>
              <div className="space-y-3">
                {Object.entries(assessment.category_scores || {}).map(([category, score]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300 capitalize">{category.replace('_', ' ')}</span>
                      <span className={`font-semibold ${getScoreColor(score)}`}>{score}/100</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>
            </div>

            {/* Red Flags */}
            {assessment.red_flags?.length > 0 && (
              <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30 p-4">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  Critical Red Flags
                </h4>
                <div className="space-y-2">
                  {assessment.red_flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-300">{flag}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Key Risk Factors */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Key Risk Factors</h4>
              <div className="space-y-2">
                {assessment.key_risk_factors?.map((factor, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548] p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="text-sm font-medium text-white flex-1">{factor.factor}</h5>
                      <Badge className={getRiskColor(factor.severity)}>
                        {factor.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{factor.impact}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {assessment.strengths?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Strengths
                </h4>
                <div className="space-y-1">
                  {assessment.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-1 flex-shrink-0" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Recommendations</h4>
              <div className="space-y-2">
                {assessment.recommendations?.map((rec, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-blue-500/30 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm text-white flex-1">{rec.action}</p>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">Timeframe: {rec.timeframe}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Monitoring Priorities */}
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30 p-4">
              <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-400" />
                Monitoring Priorities
              </h4>
              <div className="space-y-1">
                {assessment.monitoring_priorities?.map((priority, idx) => (
                  <div key={idx} className="text-sm text-slate-300">• {priority}</div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}