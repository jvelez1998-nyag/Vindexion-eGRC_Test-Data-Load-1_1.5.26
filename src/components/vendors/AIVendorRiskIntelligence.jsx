import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { 
  Brain, 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Shield,
  Activity,
  Target,
  Bell,
  Eye,
  Zap,
  CheckCircle2,
  XCircle,
  AlertOctagon
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AIVendorRiskIntelligence({ onAlertGenerated }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list(),
  });

  const { data: vendorAssessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list(),
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list(),
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['audits'],
    queryFn: () => base44.entities.Audit.list(),
  });

  const { data: compliance = [] } = useQuery({
    queryKey: ['compliance'],
    queryFn: () => base44.entities.Compliance.list(),
  });

  useEffect(() => {
    if (monitoring && vendors.length > 0) {
      const interval = setInterval(() => {
        checkVendorRisks();
      }, 300000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [monitoring, vendors]);

  const runIntelligenceAnalysis = async () => {
    setLoading(true);
    try {
      // Prepare vendor intelligence data
      const vendorIntelligence = vendors.map(vendor => {
        const assessments = vendorAssessments.filter(a => a.vendor_id === vendor.id);
        const latestAssessment = assessments.sort((a, b) => 
          new Date(b.assessment_date) - new Date(a.assessment_date)
        )[0];

        const vendorIncidents = incidents.filter(i => 
          i.description?.toLowerCase().includes(vendor.vendor_name?.toLowerCase())
        );

        const vendorAudits = audits.filter(a => 
          a.scope?.toLowerCase().includes(vendor.vendor_name?.toLowerCase())
        );

        return {
          id: vendor.id,
          name: vendor.vendor_name,
          type: vendor.vendor_type,
          criticality: vendor.criticality,
          status: vendor.status,
          security_score: vendor.security_score || 0,
          compliance_status: vendor.compliance_status,
          certifications: vendor.certifications || [],
          data_access_level: vendor.data_access_level,
          contract_value: vendor.contract_value,
          latest_assessment: latestAssessment ? {
            date: latestAssessment.assessment_date,
            overall_score: latestAssessment.overall_score,
            risk_rating: latestAssessment.risk_rating,
            security_score: latestAssessment.security_controls_score,
            compliance_score: latestAssessment.compliance_score
          } : null,
          incident_count: vendorIncidents.length,
          recent_incidents: vendorIncidents.slice(0, 3).map(i => ({
            type: i.incident_type,
            severity: i.severity,
            date: i.reported_date
          })),
          audit_count: vendorAudits.length
        };
      });

      const prompt = `You are an expert in third-party risk management and vendor intelligence. Analyze this vendor ecosystem data and provide comprehensive risk intelligence.

VENDOR ECOSYSTEM DATA:
${JSON.stringify(vendorIntelligence.slice(0, 20), null, 2)}

PROVIDE COMPREHENSIVE INTELLIGENCE:

1. CONSOLIDATED RISK SCORES:
   For each vendor, calculate a comprehensive risk score (0-100) based on:
   - Security posture and assessment scores
   - Compliance status and certifications
   - Incident history and severity
   - Data access level and criticality
   - Contract value and business impact
   
   Return top 10 vendors by risk, each with:
   - vendor_id: ID
   - vendor_name: Name
   - consolidated_risk_score: 0-100 (higher = more risk)
   - risk_level: "critical", "high", "medium", or "low"
   - risk_trend: "increasing", "stable", or "decreasing"
   - primary_concerns: Array of top 3 concerns

2. KEY RISK INDICATORS (KRIs):
   Identify the most critical KRIs across the vendor ecosystem:
   - kri_name: Name of the indicator
   - description: What it measures
   - current_value: Current measurement
   - threshold: When it becomes concerning
   - affected_vendors: Number of vendors affected
   - severity: "critical", "high", "medium", or "low"

3. VULNERABILITY ANALYSIS:
   Identify systemic vulnerabilities and vendor-specific issues:
   - vulnerability_type: Type of vulnerability
   - description: Detailed description
   - affected_vendors: List of vendor names
   - exploitation_likelihood: "high", "medium", or "low"
   - impact_potential: "critical", "high", "medium", or "low"
   - remediation_priority: 1-5 (1 = highest)

4. THREAT INTELLIGENCE:
   Identify emerging threats relevant to the vendor ecosystem:
   - threat_name: Name/type of threat
   - description: What it is
   - relevant_vendors: Vendor types or specific vendors at risk
   - urgency: "immediate", "near_term", or "monitoring"
   - recommended_action: What to do

5. ALERT TRIGGERS:
   Define conditions that should generate automated alerts:
   - trigger_condition: What to watch for
   - severity: Alert severity level
   - notification_priority: "critical", "high", "medium", or "low"
   - recommended_recipients: Who should be notified

Be data-driven and specific. Use actual vendor names and numbers from the data.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            vendor_risk_scores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vendor_id: { type: "string" },
                  vendor_name: { type: "string" },
                  consolidated_risk_score: { type: "number" },
                  risk_level: { type: "string" },
                  risk_trend: { type: "string" },
                  primary_concerns: { type: "array", items: { type: "string" } }
                }
              }
            },
            key_risk_indicators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  kri_name: { type: "string" },
                  description: { type: "string" },
                  current_value: { type: "string" },
                  threshold: { type: "string" },
                  affected_vendors: { type: "number" },
                  severity: { type: "string" }
                }
              }
            },
            vulnerabilities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  vulnerability_type: { type: "string" },
                  description: { type: "string" },
                  affected_vendors: { type: "array", items: { type: "string" } },
                  exploitation_likelihood: { type: "string" },
                  impact_potential: { type: "string" },
                  remediation_priority: { type: "number" }
                }
              }
            },
            threat_intelligence: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  threat_name: { type: "string" },
                  description: { type: "string" },
                  relevant_vendors: { type: "string" },
                  urgency: { type: "string" },
                  recommended_action: { type: "string" }
                }
              }
            },
            alert_triggers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  trigger_condition: { type: "string" },
                  severity: { type: "string" },
                  notification_priority: { type: "string" },
                  recommended_recipients: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAnalysis(result);
      toast.success("Vendor risk intelligence analysis complete");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate vendor intelligence");
    } finally {
      setLoading(false);
    }
  };

  const checkVendorRisks = async () => {
    if (!analysis) return;

    try {
      // Check for significant changes in vendor risk posture
      const alerts = [];

      analysis.vendor_risk_scores?.forEach(vendorScore => {
        if (vendorScore.risk_level === 'critical' && vendorScore.risk_trend === 'increasing') {
          alerts.push({
            type: 'critical_risk_increase',
            vendor: vendorScore.vendor_name,
            message: `Critical risk increase detected for ${vendorScore.vendor_name}`,
            severity: 'critical'
          });
        }
      });

      // Check KRI thresholds
      analysis.key_risk_indicators?.forEach(kri => {
        if (kri.severity === 'critical' && kri.affected_vendors > 2) {
          alerts.push({
            type: 'kri_threshold_breach',
            message: `${kri.kri_name} breached threshold - affecting ${kri.affected_vendors} vendors`,
            severity: 'high'
          });
        }
      });

      // Generate notifications for critical alerts
      if (alerts.length > 0) {
        for (const alert of alerts) {
          await base44.entities.Notification.create({
            title: alert.type === 'critical_risk_increase' 
              ? '🚨 Critical Vendor Risk Alert' 
              : '⚠️ Vendor KRI Threshold Breach',
            message: alert.message,
            type: 'vendor_risk',
            priority: alert.severity,
            entity_type: 'vendor',
            read: false
          });
        }
        toast.warning(`Generated ${alerts.length} vendor risk alerts`);
        if (onAlertGenerated) onAlertGenerated(alerts);
      }
    } catch (error) {
      console.error('Error checking vendor risks:', error);
    }
  };

  const riskLevelColors = {
    critical: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  };

  const getRiskScoreColor = (score) => {
    if (score >= 75) return 'text-rose-400';
    if (score >= 50) return 'text-orange-400';
    if (score >= 25) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-[#1a2332] via-[#1e2840] to-purple-950/20 border border-purple-500/20">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

      <CardHeader className="relative">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                AI Vendor Risk Intelligence
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">Real-time vendor risk analysis, KRIs & threat monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm"
              onClick={() => setMonitoring(!monitoring)}
              className={monitoring ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"}
            >
              <Bell className={`h-4 w-4 mr-2 ${monitoring ? 'animate-pulse' : ''}`} />
              {monitoring ? 'Monitoring Active' : 'Start Monitoring'}
            </Button>
            <Button 
              onClick={runIntelligenceAnalysis} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              Analyze
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {!analysis && !loading && (
          <div className="text-center py-12">
            <Shield className="h-16 w-16 text-purple-400/30 mx-auto mb-4" />
            <p className="text-sm text-slate-400 mb-2">Ready to analyze vendor risk intelligence</p>
            <p className="text-xs text-slate-500">Click "Analyze" to generate comprehensive vendor risk insights</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-4" />
            <p className="text-sm text-slate-400">Analyzing vendor ecosystem...</p>
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Vendor Risk Scores */}
            {analysis.vendor_risk_scores?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    <h3 className="text-sm font-bold text-white">Consolidated Risk Scores</h3>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Top {analysis.vendor_risk_scores.length} Vendors
                  </Badge>
                </div>
                <div className="space-y-2">
                  {analysis.vendor_risk_scores.map((vendor, i) => (
                    <div 
                      key={i}
                      className="group p-3 bg-[#0f1623]/60 rounded-lg border border-[#2a3548] hover:border-purple-500/40 transition-all cursor-pointer"
                      onClick={() => setSelectedVendor(selectedVendor === i ? null : i)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-xs font-bold text-purple-400">
                              {i + 1}
                            </span>
                            <p className="text-sm font-semibold text-white">{vendor.vendor_name}</p>
                            <Badge className={riskLevelColors[vendor.risk_level?.toLowerCase()]}>
                              {vendor.risk_level}
                            </Badge>
                            {vendor.risk_trend === 'increasing' && (
                              <TrendingUp className="h-4 w-4 text-rose-400" />
                            )}
                            {vendor.risk_trend === 'decreasing' && (
                              <TrendingDown className="h-4 w-4 text-emerald-400" />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1">
                              <Progress value={vendor.consolidated_risk_score} className="h-2" />
                            </div>
                            <span className={`text-sm font-bold ${getRiskScoreColor(vendor.consolidated_risk_score)}`}>
                              {vendor.consolidated_risk_score}/100
                            </span>
                          </div>

                          {selectedVendor === i && vendor.primary_concerns?.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-[#2a3548] space-y-1">
                              <p className="text-xs font-semibold text-rose-400 mb-2">Primary Concerns:</p>
                              {vendor.primary_concerns.map((concern, j) => (
                                <div key={j} className="flex items-start gap-2 text-xs text-slate-300">
                                  <AlertTriangle className="h-3 w-3 text-rose-400 mt-0.5 flex-shrink-0" />
                                  <span>{concern}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Risk Indicators */}
            {analysis.key_risk_indicators?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-orange-400" />
                  <h3 className="text-sm font-bold text-white">Key Risk Indicators</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {analysis.key_risk_indicators.map((kri, i) => (
                    <div key={i} className="p-3 bg-[#0f1623]/60 rounded-lg border border-orange-500/20">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-white">{kri.kri_name}</p>
                        <Badge className={riskLevelColors[kri.severity?.toLowerCase()]}>
                          {kri.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{kri.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Current: <span className="text-orange-400 font-semibold">{kri.current_value}</span></span>
                        <span className="text-slate-500">Threshold: <span className="text-rose-400 font-semibold">{kri.threshold}</span></span>
                        <span className="text-slate-500">Affected: <span className="text-white font-semibold">{kri.affected_vendors}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vulnerabilities */}
            {analysis.vulnerabilities?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-rose-500/10 to-rose-500/5 border border-rose-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <AlertOctagon className="h-5 w-5 text-rose-400" />
                  <h3 className="text-sm font-bold text-white">Vulnerability Analysis</h3>
                </div>
                <div className="space-y-2">
                  {analysis.vulnerabilities.slice(0, 5).map((vuln, i) => (
                    <div key={i} className="p-3 bg-[#0f1623]/60 rounded-lg border border-rose-500/20">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-white">{vuln.vulnerability_type}</p>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                            P{vuln.remediation_priority}
                          </Badge>
                          <Badge className={riskLevelColors[vuln.impact_potential?.toLowerCase()]}>
                            {vuln.impact_potential} impact
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{vuln.description}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Likelihood:</span>
                        <Badge className={vuln.exploitation_likelihood === 'high' ? riskLevelColors.high : riskLevelColors.medium}>
                          {vuln.exploitation_likelihood}
                        </Badge>
                        <span className="text-slate-500 ml-2">Affected: {vuln.affected_vendors?.length || 0} vendors</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Threat Intelligence */}
            {analysis.threat_intelligence?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-red-400" />
                  <h3 className="text-sm font-bold text-white">Threat Intelligence</h3>
                </div>
                <div className="space-y-2">
                  {analysis.threat_intelligence.map((threat, i) => (
                    <div key={i} className="p-3 bg-[#0f1623]/60 rounded-lg border border-red-500/20">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-semibold text-white">{threat.threat_name}</p>
                        <Badge className={
                          threat.urgency === 'immediate' ? riskLevelColors.critical :
                          threat.urgency === 'near_term' ? riskLevelColors.high :
                          riskLevelColors.medium
                        }>
                          {threat.urgency}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mb-2">{threat.description}</p>
                      <div className="text-xs">
                        <span className="text-slate-500">Relevant to: </span>
                        <span className="text-red-300">{threat.relevant_vendors}</span>
                      </div>
                      {threat.recommended_action && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded border border-red-500/20">
                          <p className="text-xs text-red-300">
                            <strong>Action:</strong> {threat.recommended_action}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alert Triggers */}
            {analysis.alert_triggers?.length > 0 && (
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Automated Alert Triggers</h3>
                </div>
                <div className="space-y-2">
                  {analysis.alert_triggers.map((trigger, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-[#0f1623]/60 rounded-lg border border-emerald-500/20">
                      {trigger.notification_priority === 'critical' ? (
                        <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-white mb-1">{trigger.trigger_condition}</p>
                        <div className="flex items-center gap-2">
                          <Badge className={riskLevelColors[trigger.notification_priority?.toLowerCase()]}>
                            {trigger.notification_priority}
                          </Badge>
                          <span className="text-[10px] text-slate-500">→ {trigger.recommended_recipients}</span>
                        </div>
                      </div>
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