import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Search, Loader2, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AnomalyDetectionEngine({ data }) {
  const [anomalies, setAnomalies] = useState(null);
  const [loading, setLoading] = useState(false);

  const detectAnomalies = async () => {
    setLoading(true);
    try {
      const riskPatterns = data.risks.map(r => ({
        score: (r.residual_likelihood || 0) * (r.residual_impact || 0),
        category: r.category,
        status: r.status,
        age_days: Math.floor((new Date() - new Date(r.created_date)) / (1000 * 60 * 60 * 24))
      }));

      const controlPatterns = data.controls.map(c => ({
        effectiveness: c.effectiveness,
        frequency: c.frequency,
        last_test_days_ago: c.last_test_date ? Math.floor((new Date() - new Date(c.last_test_date)) / (1000 * 60 * 60 * 24)) : 999
      }));

      const incidentPatterns = data.incidents.map(i => ({
        severity: i.severity,
        status: i.status,
        response_time_hours: i.response_time || 0
      }));

      const vendorPatterns = data.vendors.map(v => ({
        risk_tier: v.risk_tier,
        security_score: v.security_score || 0,
        last_assessment_days: v.last_assessment_date ? Math.floor((new Date() - new Date(v.last_assessment_date)) / (1000 * 60 * 60 * 24)) : 999
      }));

      const prompt = `You are an AI anomaly detection system. Analyze the following enterprise data for statistical anomalies, outliers, and unusual patterns.

RISK SCORE PATTERNS (n=${riskPatterns.length}):
${JSON.stringify(riskPatterns.slice(0, 30), null, 2)}

CONTROL EFFECTIVENESS PATTERNS (n=${controlPatterns.length}):
${JSON.stringify(controlPatterns.slice(0, 20), null, 2)}

INCIDENT RESPONSE PATTERNS (n=${incidentPatterns.length}):
${JSON.stringify(incidentPatterns.slice(0, 20), null, 2)}

VENDOR RISK PATTERNS (n=${vendorPatterns.length}):
${JSON.stringify(vendorPatterns.slice(0, 15), null, 2)}

DETECT ANOMALIES:
1. Identify 6-8 statistical anomalies across all data types
2. For each anomaly: type, description, severity (critical/high/medium), affected_count, deviation_percentage, potential_impact
3. Provide root cause hypotheses
4. Suggest immediate actions

Return JSON:
{
  "anomalies": [{"type": "...", "description": "...", "severity": "high", "affected_count": 5, "deviation": 45, "impact": "...", "root_cause": "...", "action": "..."}],
  "summary": {"total_anomalies": 8, "critical": 2, "high": 3, "medium": 3}
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            anomalies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  description: { type: "string" },
                  severity: { type: "string" },
                  affected_count: { type: "number" },
                  deviation: { type: "number" },
                  impact: { type: "string" },
                  root_cause: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            summary: {
              type: "object",
              properties: {
                total_anomalies: { type: "number" },
                critical: { type: "number" },
                high: { type: "number" },
                medium: { type: "number" }
              }
            }
          }
        }
      });

      setAnomalies(response);
      toast.success(`Detected ${response.summary?.total_anomalies || 0} anomalies`);
    } catch (error) {
      console.error(error);
      toast.error("Anomaly detection failed");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    critical: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
    high: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    medium: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-400" />
              Real-Time Anomaly Detection Engine
            </CardTitle>
            <Button 
              onClick={detectAnomalies}
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
              Scan for Anomalies
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400">
            Advanced statistical analysis identifies outliers, unusual patterns, and deviations from baseline behavior across all risk data
          </p>
        </CardContent>
      </Card>

      {anomalies && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white mb-1">{anomalies.summary?.total_anomalies || 0}</div>
                <div className="text-xs text-slate-400">Total Anomalies</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-rose-400 mb-1">{anomalies.summary?.critical || 0}</div>
                <div className="text-xs text-slate-400">Critical</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-amber-400 mb-1">{anomalies.summary?.high || 0}</div>
                <div className="text-xs text-slate-400">High Severity</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-400 mb-1">{anomalies.summary?.medium || 0}</div>
                <div className="text-xs text-slate-400">Medium Severity</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {anomalies.anomalies?.map((anomaly, idx) => (
              <Card key={idx} className={`bg-gradient-to-br ${severityColors[anomaly.severity] || severityColors.medium}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-black/20">
                      <AlertTriangle className={`h-5 w-5 ${
                        anomaly.severity === 'critical' ? 'text-rose-400' :
                        anomaly.severity === 'high' ? 'text-amber-400' :
                        'text-yellow-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-semibold text-white mb-1">{anomaly.type}</h4>
                          <p className="text-sm text-slate-300 mb-2">{anomaly.description}</p>
                        </div>
                        <Badge className={`${
                          anomaly.severity === 'critical' ? 'bg-rose-500/30 text-rose-300 border-rose-400/50' :
                          anomaly.severity === 'high' ? 'bg-amber-500/30 text-amber-300 border-amber-400/50' :
                          'bg-yellow-500/30 text-yellow-300 border-yellow-400/50'
                        }`}>
                          {anomaly.severity}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-black/20">
                          <div className="text-xs text-slate-400">Affected Items</div>
                          <div className="text-lg font-bold text-white">{anomaly.affected_count}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-black/20">
                          <div className="text-xs text-slate-400">Deviation</div>
                          <div className="text-lg font-bold text-white">{anomaly.deviation}%</div>
                        </div>
                        <div className="p-2 rounded-lg bg-black/20">
                          <div className="text-xs text-slate-400">Impact</div>
                          <div className="text-xs font-medium text-white mt-1">{anomaly.impact}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 rounded-lg bg-black/20">
                          <div className="text-xs font-semibold text-slate-300 mb-1">Potential Root Cause:</div>
                          <div className="text-sm text-slate-200">{anomaly.root_cause}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                          <div className="text-xs font-semibold text-emerald-300 mb-1">Recommended Action:</div>
                          <div className="text-sm text-slate-200">{anomaly.action}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}