import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, AlertTriangle, TrendingDown, Clock, Loader2, Zap, Shield, FileText } from "lucide-react";
import { toast } from "sonner";
import { differenceInDays, format } from "date-fns";

export default function AIVendorFailurePrediction() {
  const [predicting, setPredicting] = useState(false);
  const [predictions, setPredictions] = useState({});

  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-created_date')
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list()
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['vendor-reviews'],
    queryFn: () => base44.entities.VendorReview.list()
  });

  const { data: performanceMetrics = [] } = useQuery({
    queryKey: ['vendor-performance-metrics'],
    queryFn: () => base44.entities.VendorPerformanceMetric.list()
  });

  const predictVendorFailure = async (vendor) => {
    setPredicting(true);
    
    try {
      const vendorAssessments = assessments.filter(a => a.vendor_id === vendor.id);
      const vendorReviews = reviews.filter(r => r.vendor_id === vendor.id);
      const vendorMetrics = performanceMetrics.filter(m => m.vendor_id === vendor.id);

      const contractDaysRemaining = vendor.contract_end_date 
        ? differenceInDays(new Date(vendor.contract_end_date), new Date())
        : null;

      const prompt = `You are an AI predictive analytics expert. Analyze this vendor and predict potential failure scenarios or security incidents:

VENDOR PROFILE:
- Name: ${vendor.vendor_name}
- Type: ${vendor.vendor_type}
- Criticality: ${vendor.criticality}
- Security Score: ${vendor.security_score || 'N/A'}
- Compliance Status: ${vendor.compliance_status}
- Contract Days Remaining: ${contractDaysRemaining || 'N/A'}

ASSESSMENT HISTORY:
- Total Assessments: ${vendorAssessments.length}
- Latest Overall Score: ${vendorAssessments[0]?.overall_score || 'N/A'}/100
- Security Controls: ${vendorAssessments[0]?.security_controls_score || 'N/A'}/100
- Incident Response: ${vendorAssessments[0]?.incident_response_score || 'N/A'}/100
- Trend: ${vendorAssessments.length >= 2 ? 
  (vendorAssessments[0]?.overall_score > vendorAssessments[1]?.overall_score ? 'Improving' : 'Declining') : 'Insufficient data'}

PERFORMANCE & REVIEWS:
- Number of Reviews: ${vendorReviews.length}
- Latest Rating: ${vendorReviews[0]?.overall_rating || 'N/A'}/5
- Performance Metrics: ${vendorMetrics.length} recorded
- Recent Issues: ${vendorReviews[0]?.issues_raised?.length || 0}

Provide a JSON response with this exact structure:
{
  "failure_probability": <number 0-100>,
  "risk_level": "<critical|high|medium|low>",
  "confidence": <number 0-100>,
  "predicted_scenarios": [
    {
      "scenario": "<scenario name>",
      "probability": <number 0-100>,
      "impact": "<critical|high|medium|low>",
      "timeframe": "<immediate|30_days|90_days|6_months|12_months>",
      "description": "<detailed description>"
    }
  ],
  "warning_signs": [
    {"indicator": "<indicator name>", "severity": "<critical|high|medium|low>", "evidence": "<description>"}
  ],
  "risk_factors": [
    {"factor": "<factor name>", "contribution": <number 0-100>}
  ],
  "early_warning_indicators": [
    "<indicator to monitor>"
  ],
  "recommended_monitoring": [
    {"metric": "<metric name>", "frequency": "<daily|weekly|monthly>", "threshold": "<threshold description>"}
  ],
  "prediction_rationale": "<explanation of the prediction>"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            failure_probability: { type: "number" },
            risk_level: { type: "string" },
            confidence: { type: "number" },
            predicted_scenarios: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  scenario: { type: "string" },
                  probability: { type: "number" },
                  impact: { type: "string" },
                  timeframe: { type: "string" },
                  description: { type: "string" }
                }
              }
            },
            warning_signs: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  indicator: { type: "string" },
                  severity: { type: "string" },
                  evidence: { type: "string" }
                }
              }
            },
            risk_factors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  factor: { type: "string" },
                  contribution: { type: "number" }
                }
              }
            },
            early_warning_indicators: {
              type: "array",
              items: { type: "string" }
            },
            recommended_monitoring: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  metric: { type: "string" },
                  frequency: { type: "string" },
                  threshold: { type: "string" }
                }
              }
            },
            prediction_rationale: { type: "string" }
          }
        }
      });

      setPredictions(prev => ({
        ...prev,
        [vendor.id]: response
      }));

      toast.success(`Prediction complete: ${response.failure_probability}% failure risk`);
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate prediction");
    } finally {
      setPredicting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const criticalVendors = vendors.filter(v => v.criticality === 'critical' || v.risk_tier === 'tier_1');

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/20">
              <Brain className="h-7 w-7 text-rose-400" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">AI Failure Prediction Engine</CardTitle>
              <p className="text-sm text-slate-400 mt-1">
                Predictive analytics for vendor failures, security incidents, and service disruptions
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
              <p className="text-xs text-slate-400">Critical Vendors</p>
            </div>
            <p className="text-2xl font-bold text-white">{criticalVendors.length}</p>
            <p className="text-xs text-slate-500 mt-1">High priority</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-purple-400" />
              <p className="text-xs text-slate-400">Predictions Run</p>
            </div>
            <p className="text-2xl font-bold text-white">{Object.keys(predictions).length}</p>
            <p className="text-xs text-slate-500 mt-1">Vendors analyzed</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-amber-400" />
              <p className="text-xs text-slate-400">High Risk</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(predictions).filter(p => p.failure_probability >= 60).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">≥60% probability</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <p className="text-xs text-slate-400">Immediate Risk</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {Object.values(predictions).filter(p => 
                p.predicted_scenarios?.some(s => s.timeframe === 'immediate' || s.timeframe === '30_days')
              ).length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Vendors with Predictions */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base text-white">Vendor Failure Predictions</CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            AI-powered prediction of potential vendor failures and security incidents
          </p>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4 pr-4">
              {vendors.map(vendor => {
                const prediction = predictions[vendor.id];
                
                return (
                  <div key={vendor.id} className="p-4 rounded-lg bg-gradient-to-br from-[#151d2e] to-[#0f1623] border border-[#2a3548]">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-white">{vendor.vendor_name}</h4>
                          <Badge className={getSeverityColor(vendor.criticality)}>
                            {vendor.criticality}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500">{vendor.vendor_type}</p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => predictVendorFailure(vendor)}
                        disabled={predicting}
                        className="bg-rose-600 hover:bg-rose-700"
                      >
                        {predicting ? (
                          <><Loader2 className="h-3 w-3 animate-spin mr-2" /> Analyzing...</>
                        ) : (
                          <><Zap className="h-3 w-3 mr-2" /> Predict Risk</>
                        )}
                      </Button>
                    </div>

                    {prediction && (
                      <div className="space-y-4">
                        {/* Failure Probability */}
                        <div className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-slate-400">Failure Probability</p>
                            <Badge className={getSeverityColor(prediction.risk_level)}>
                              {prediction.risk_level} risk
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`text-3xl font-bold ${
                              prediction.failure_probability >= 70 ? 'text-rose-400' :
                              prediction.failure_probability >= 40 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {prediction.failure_probability}%
                            </p>
                            <div className="flex-1">
                              <Progress value={prediction.failure_probability} className="h-2" />
                              <p className="text-xs text-slate-500 mt-1">
                                {prediction.confidence}% confidence
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Predicted Scenarios */}
                        {prediction.predicted_scenarios?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-amber-400" />
                              Predicted Scenarios
                            </p>
                            <div className="space-y-2">
                              {prediction.predicted_scenarios.map((scenario, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-[#0f1623] border border-[#2a3548]">
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-xs font-medium text-white">{scenario.scenario}</p>
                                    <Badge className={getSeverityColor(scenario.impact)}>
                                      {scenario.probability}%
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-400 mb-2">{scenario.description}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-2.5 w-2.5 mr-1" />
                                      {scenario.timeframe?.replace(/_/g, ' ')}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {scenario.impact} impact
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Warning Signs */}
                        {prediction.warning_signs?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
                              <Shield className="h-3 w-3 text-rose-400" />
                              Warning Signs Detected
                            </p>
                            <div className="space-y-1">
                              {prediction.warning_signs.map((sign, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-2 rounded bg-[#0f1623]">
                                  <Badge className={getSeverityColor(sign.severity)}>
                                    {sign.severity}
                                  </Badge>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-white">{sign.indicator}</p>
                                    <p className="text-xs text-slate-400">{sign.evidence}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rationale */}
                        <div className="p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                          <p className="text-xs font-semibold text-indigo-400 mb-1 flex items-center gap-2">
                            <FileText className="h-3 w-3" />
                            Analysis Rationale
                          </p>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {prediction.prediction_rationale}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}