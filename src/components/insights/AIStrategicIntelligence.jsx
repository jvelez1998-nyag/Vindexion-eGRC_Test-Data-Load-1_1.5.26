import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, TrendingUp, AlertTriangle, Shield, Target, Users, DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AIStrategicIntelligence({ data }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const hasData = data && (
      (Array.isArray(data.risks) && data.risks.length > 0) ||
      (Array.isArray(data.controls) && data.controls.length > 0) ||
      (Array.isArray(data.incidents) && data.incidents.length > 0)
    );
    
    if (hasData && !insights && !loading) {
      const timer = setTimeout(() => {
        generateInsights();
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const generateInsights = async () => {
    if (!data) {
      toast.error("No data available for analysis");
      return;
    }
    
    setLoading(true);
    try {
      const safeData = data || {};
      const risks = Array.isArray(safeData.risks) ? safeData.risks : [];
      const controls = Array.isArray(safeData.controls) ? safeData.controls : [];
      const incidents = Array.isArray(safeData.incidents) ? safeData.incidents : [];
      const compliance = Array.isArray(safeData.compliance) ? safeData.compliance : [];
      const vendors = Array.isArray(safeData.vendors) ? safeData.vendors : [];
      const audits = Array.isArray(safeData.audits) ? safeData.audits : [];
      const assessments = Array.isArray(safeData.assessments) ? safeData.assessments : [];

      if (risks.length === 0 && controls.length === 0 && incidents.length === 0) {
        toast.error("Insufficient data for strategic analysis. Please add risks, controls, or incidents first.");
        setLoading(false);
        return;
      }

      // Calculate risk scores
      const criticalRisks = risks.filter(r => {
        const score = (r?.likelihood || 0) * (r?.impact || 0);
        return score >= 16;
      });

      const highRisks = risks.filter(r => {
        const score = (r?.likelihood || 0) * (r?.impact || 0);
        return score >= 9 && score < 16;
      });

      const criticalIncidents = incidents.filter(i => i?.severity === 'critical' || i?.severity === 'high');
      const activeControls = controls.filter(c => c?.status === 'active' || c?.status === 'effective');
      const compliantItems = compliance.filter(c => c?.status === 'implemented' || c?.status === 'verified');
      const criticalVendors = vendors.filter(v => v?.risk_rating === 'critical' || v?.risk_rating === 'high');
      const inProgressAudits = audits.filter(a => a?.status === 'in_progress');
      const controlGaps = controls.filter(c => (c?.effectiveness || 0) < 3);

      const prompt = `Analyze this comprehensive enterprise risk and compliance data and provide strategic AI-powered insights:

ENTERPRISE DATA SUMMARY:
- Risks: ${risks.length} total (${criticalRisks.length + highRisks.length} high/critical)
- Controls: ${controls.length} total (${activeControls.length} active/effective)
- Incidents: ${incidents.length} total (${criticalIncidents.length} high/critical)
- Compliance Policies: ${compliance.length} total (${compliantItems.length} compliant)
- Vendors: ${vendors.length} total (${criticalVendors.length} high criticality)
- Audits: ${audits.length} total (${inProgressAudits.length} in progress)
- Risk Assessments: ${assessments.length} total

DETAILED DATA:
${JSON.stringify({
  critical_risks: criticalRisks.slice(0, 5).map(r => ({
    title: r?.title,
    category: r?.category,
    score: (r?.likelihood || 0) * (r?.impact || 0)
  })),
  high_incidents: criticalIncidents.slice(0, 5).map(i => ({
    title: i?.title,
    type: i?.incident_type,
    severity: i?.severity
  })),
  non_compliant: compliance.filter(c => c?.status === 'non_compliant').slice(0, 5).map(c => ({
    framework: c?.framework,
    requirement: c?.requirement
  })),
  high_risk_vendors: criticalVendors.slice(0, 5).map(v => ({
    name: v?.name,
    risk_rating: v?.risk_rating
  })),
  control_gaps: controlGaps.slice(0, 5).map(c => ({
    name: c?.name,
    effectiveness: c?.effectiveness
  }))
}, null, 2).slice(0, 3000)}

Provide a comprehensive strategic analysis with:

{
  "executive_summary": "2-3 sentence overall assessment of organizational risk posture and maturity",
  "risk_score": 1-100,
  "maturity_level": "initial/developing/defined/managed/optimized",
  "critical_threats": [
    {
      "threat": "threat name",
      "severity": "critical/high/medium",
      "probability": 1-100,
      "impact": "business impact description",
      "affected_areas": ["area1", "area2"]
    }
  ],
  "top_recommendations": [
    {
      "priority": "critical/high/medium",
      "recommendation": "specific actionable recommendation",
      "category": "risk/control/compliance/vendor/incident",
      "estimated_effort": "low/medium/high",
      "expected_impact": "risk reduction description",
      "timeline": "immediate/1-3 months/3-6 months/6-12 months"
    }
  ],
  "remediation_roadmap": [
    {
      "phase": "phase name",
      "duration": "timeframe",
      "actions": ["action1", "action2"],
      "resources_needed": ["resource1", "resource2"],
      "success_metrics": ["metric1", "metric2"]
    }
  ],
  "resource_allocation": {
    "immediate_actions": ["action1", "action2"],
    "staff_requirements": "description",
    "budget_estimate": "estimate range",
    "technology_needs": ["tech1", "tech2"]
  },
  "prioritization_matrix": [
    {
      "initiative": "initiative name",
      "priority_score": 1-100,
      "urgency": "immediate/urgent/normal/low",
      "complexity": "low/medium/high",
      "roi_potential": "low/medium/high"
    }
  ],
  "trend_analysis": {
    "improving_areas": ["area1", "area2"],
    "declining_areas": ["area1", "area2"],
    "stable_areas": ["area1", "area2"],
    "emerging_concerns": ["concern1", "concern2"]
  },
  "compliance_status": {
    "overall_health": "excellent/good/fair/poor",
    "at_risk_frameworks": ["framework1", "framework2"],
    "upcoming_deadlines": ["deadline1", "deadline2"]
  }
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            risk_score: { type: "number" },
            maturity_level: { type: "string" },
            critical_threats: { type: "array" },
            top_recommendations: { type: "array" },
            remediation_roadmap: { type: "array" },
            resource_allocation: { type: "object" },
            prioritization_matrix: { type: "array" },
            trend_analysis: { type: "object" },
            compliance_status: { type: "object" }
          }
        }
      });

      setInsights(response);
      toast.success("Strategic insights generated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  const severityColors = {
    critical: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  };

  const priorityColors = {
    immediate: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    urgent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    normal: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    low: "bg-slate-500/10 text-slate-400 border-slate-500/20"
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <Brain className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <CardTitle className="text-base">AI Strategic Intelligence Engine</CardTitle>
                <p className="text-sm text-slate-400 mt-1">Comprehensive analysis with prioritized recommendations and remediation roadmap</p>
              </div>
            </div>
            <Button 
              onClick={generateInsights} 
              disabled={loading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Generate Insights
            </Button>
          </div>
        </CardHeader>
      </Card>

      {insights && (
        <div className="space-y-6">
          {/* Executive Summary */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border-violet-500/20">
            <CardHeader>
              <CardTitle className="text-base">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300 leading-relaxed">{insights.executive_summary}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-1">Overall Risk Score</div>
                  <div className="text-3xl font-bold text-white">{insights.risk_score}/100</div>
                  <div className={`text-xs mt-1 ${insights.risk_score >= 70 ? 'text-emerald-400' : insights.risk_score >= 50 ? 'text-yellow-400' : 'text-rose-400'}`}>
                    {insights.risk_score >= 70 ? 'Strong' : insights.risk_score >= 50 ? 'Moderate' : 'Needs Improvement'}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-1">Maturity Level</div>
                  <Badge className="bg-indigo-500/20 text-indigo-400 mt-2">
                    {insights.maturity_level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Threats */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                Critical Threats Requiring Immediate Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.critical_threats?.map((threat, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white mb-2">{threat.threat}</h4>
                          <p className="text-sm text-slate-400 mb-3">{threat.impact}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge className={`border ${severityColors[threat.severity]}`}>
                            {threat.severity}
                          </Badge>
                          <div className="text-xs text-slate-500">
                            Probability: {threat.probability}%
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {threat.affected_areas?.map((area, i) => (
                          <Badge key={i} className="bg-slate-500/10 text-slate-400 text-xs border border-slate-500/20">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Recommendations */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Prioritized Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {insights.top_recommendations?.map((rec, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`border ${severityColors[rec.priority]}`}>
                              {rec.priority} priority
                            </Badge>
                            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {rec.category}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-white mb-2">{rec.recommendation}</h4>
                          <p className="text-sm text-slate-400 mb-3">{rec.expected_impact}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-slate-500" />
                              <span className="text-slate-400">Timeline: {rec.timeline}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-3 w-3 text-slate-500" />
                              <span className="text-slate-400">Effort: {rec.estimated_effort}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Remediation Roadmap */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                Remediation Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.remediation_roadmap?.map((phase, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-white">{phase.phase}</h4>
                        <Badge className="bg-indigo-500/20 text-indigo-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {phase.duration}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-slate-500 mb-2">Actions:</div>
                          <ul className="space-y-1">
                            {phase.actions?.map((action, i) => (
                              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                                <CheckCircle2 className="h-3 w-3 text-emerald-400 mt-1 flex-shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 mb-2">Resources Needed:</div>
                          <div className="flex flex-wrap gap-2">
                            {phase.resources_needed?.map((resource, i) => (
                              <Badge key={i} className="bg-amber-500/10 text-amber-400 text-xs border border-amber-500/20">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs text-slate-500 mb-2">Success Metrics:</div>
                          <div className="flex flex-wrap gap-2">
                            {phase.success_metrics?.map((metric, i) => (
                              <Badge key={i} className="bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                                {metric}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resource Allocation */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Resource Allocation & Planning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <h5 className="text-sm font-semibold text-rose-400 mb-2">Immediate Actions Required:</h5>
                <ul className="space-y-1">
                  {insights.resource_allocation?.immediate_actions?.map((action, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                      <AlertTriangle className="h-3 w-3 text-rose-400 mt-1 flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-2">Staff Requirements</div>
                  <p className="text-sm text-slate-300">{insights.resource_allocation?.staff_requirements}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-2">Budget Estimate</div>
                  <p className="text-sm text-slate-300">{insights.resource_allocation?.budget_estimate}</p>
                </div>
                <div className="p-4 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-2">Technology Needs</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {insights.resource_allocation?.technology_needs?.map((tech, i) => (
                      <Badge key={i} className="bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prioritization Matrix */}
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-400" />
                Initiative Prioritization Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {insights.prioritization_matrix?.map((item, idx) => (
                  <Card key={idx} className="bg-[#151d2e] border-[#2a3548]">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-white mb-2">{item.initiative}</h5>
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`border text-xs ${priorityColors[item.urgency]}`}>
                              {item.urgency}
                            </Badge>
                            <Badge className="bg-slate-500/10 text-slate-400 text-xs border border-slate-500/20">
                              Complexity: {item.complexity}
                            </Badge>
                            <Badge className="bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                              ROI: {item.roi_potential}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xs text-slate-500">Priority Score</div>
                          <div className="text-2xl font-bold text-white">{item.priority_score}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Trend Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs text-slate-400">Improving Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.trend_analysis?.improving_areas?.map((area, i) => (
                      <Badge key={i} className="bg-emerald-500/10 text-emerald-400 text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-rose-400" />
                    <span className="text-xs text-slate-400">Declining Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.trend_analysis?.declining_areas?.map((area, i) => (
                      <Badge key={i} className="bg-rose-500/10 text-rose-400 text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-slate-400">Emerging Concerns</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {insights.trend_analysis?.emerging_concerns?.map((concern, i) => (
                      <Badge key={i} className="bg-amber-500/10 text-amber-400 text-xs">
                        {concern}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-sm">Compliance Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                  <div className="text-xs text-slate-400 mb-1">Overall Health</div>
                  <Badge className={`${
                    insights.compliance_status?.overall_health === 'excellent' ? 'bg-emerald-500/20 text-emerald-400' :
                    insights.compliance_status?.overall_health === 'good' ? 'bg-blue-500/20 text-blue-400' :
                    insights.compliance_status?.overall_health === 'fair' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {insights.compliance_status?.overall_health}
                  </Badge>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">At-Risk Frameworks</div>
                  <div className="flex flex-wrap gap-2">
                    {insights.compliance_status?.at_risk_frameworks?.map((framework, i) => (
                      <Badge key={i} className="bg-rose-500/10 text-rose-400 text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 mb-2">Upcoming Deadlines</div>
                  <ul className="space-y-1">
                    {insights.compliance_status?.upcoming_deadlines?.map((deadline, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-amber-400" />
                        {deadline}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}