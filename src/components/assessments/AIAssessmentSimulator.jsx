import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Play, RefreshCw, AlertTriangle, TrendingUp, Shield, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function AIAssessmentSimulator({ onSimulationComplete }) {
  const [scenario, setScenario] = useState("");
  const [riskCategory, setRiskCategory] = useState("cyber");
  const [industryContext, setIndustryContext] = useState("");
  const [simulationCount, setSimulationCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const runSimulation = async () => {
    if (!scenario) {
      toast.error("Please describe the assessment scenario");
      return;
    }

    setLoading(true);
    try {
      const prompt = `Run ${simulationCount} AI-powered risk assessment simulation(s) for the following scenario:

SCENARIO: ${scenario}
RISK CATEGORY: ${riskCategory}
INDUSTRY CONTEXT: ${industryContext || "General"}

For each simulation, provide a comprehensive risk assessment with:

{
  "simulations": [
    {
      "simulation_id": 1,
      "assessment_name": "descriptive name",
      "inherent_likelihood": 1-5,
      "inherent_impact": 1-5,
      "inherent_score": "calculated",
      "control_recommendations": ["control1", "control2"],
      "residual_likelihood": 1-5,
      "residual_impact": 1-5,
      "residual_score": "calculated",
      "risk_level": "critical/high/medium/low",
      "risk_treatment": "accept/mitigate/transfer/avoid",
      "key_risk_indicators": ["kri1", "kri2"],
      "threat_analysis": "analysis of threats",
      "vulnerability_analysis": "analysis of vulnerabilities",
      "impact_analysis": "business impact description",
      "mitigation_strategies": ["strategy1", "strategy2"],
      "estimated_cost": "cost estimate",
      "timeline": "implementation timeline",
      "success_probability": 85,
      "confidence_level": "high/medium/low",
      "assumptions": ["assumption1", "assumption2"],
      "limitations": ["limitation1", "limitation2"]
    }
  ],
  "aggregate_insights": {
    "common_themes": ["theme1", "theme2"],
    "average_risk_score": 12,
    "recommended_priority": "critical/high/medium/low",
    "strategic_recommendations": ["rec1", "rec2"]
  },
  "executive_summary": "brief summary of all simulations"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            simulations: { type: "array" },
            aggregate_insights: { type: "object" },
            executive_summary: { type: "string" }
          }
        }
      });

      setResults(response);
      toast.success(`Generated ${response.simulations?.length || 0} simulation(s)`);
    } catch (error) {
      console.error(error);
      toast.error("Simulation failed");
    } finally {
      setLoading(false);
    }
  };

  const createTestAssessment = async (simulation) => {
    try {
      const assessmentData = {
        assessment_name: simulation.assessment_name,
        assessment_type: riskCategory,
        risk_category: riskCategory,
        description: `AI-Simulated Assessment: ${scenario}`,
        inherent_likelihood: simulation.inherent_likelihood,
        inherent_impact: simulation.inherent_impact,
        residual_likelihood: simulation.residual_likelihood,
        residual_impact: simulation.residual_impact,
        risk_treatment: simulation.risk_treatment,
        control_effectiveness: Math.max(1, Math.min(5, 5 - (simulation.residual_likelihood - 1))),
        lifecycle_status: "draft",
        notes: `Simulation ID: ${simulation.simulation_id}\nConfidence: ${simulation.confidence_level}\n\nThreat Analysis: ${simulation.threat_analysis}\n\nMitigation: ${simulation.mitigation_strategies?.join(", ")}`,
        is_test: true
      };

      await base44.entities.RiskAssessment.create(assessmentData);
      toast.success("Test assessment created");
      
      if (onSimulationComplete) {
        onSimulationComplete(assessmentData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create test assessment");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Play className="h-5 w-5 text-purple-400" />
            AI Assessment Simulator
          </CardTitle>
          <p className="text-sm text-slate-400 mt-2">
            Run AI-powered simulations to test risk assessment scenarios
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Assessment Scenario</label>
            <Textarea
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              placeholder="Describe the risk scenario to simulate... e.g., 'Ransomware attack on critical infrastructure' or 'Supply chain disruption from major vendor'"
              className="bg-[#151d2e] border-[#2a3548] text-white min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Risk Category</label>
              <Select value={riskCategory} onValueChange={setRiskCategory}>
                <SelectTrigger className="bg-[#151d2e] border-[#2a3548] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2332] border-[#2a3548]">
                  <SelectItem value="cyber" className="text-white">Cybersecurity</SelectItem>
                  <SelectItem value="operational" className="text-white">Operational</SelectItem>
                  <SelectItem value="financial" className="text-white">Financial</SelectItem>
                  <SelectItem value="strategic" className="text-white">Strategic</SelectItem>
                  <SelectItem value="compliance" className="text-white">Compliance</SelectItem>
                  <SelectItem value="reputational" className="text-white">Reputational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-slate-400 mb-2 block">Number of Simulations</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={simulationCount}
                onChange={(e) => setSimulationCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                className="bg-[#151d2e] border-[#2a3548] text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Industry Context (Optional)</label>
            <Input
              value={industryContext}
              onChange={(e) => setIndustryContext(e.target.value)}
              placeholder="e.g., Healthcare, Financial Services, Manufacturing"
              className="bg-[#151d2e] border-[#2a3548] text-white"
            />
          </div>

          <Button
            onClick={runSimulation}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          >
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Simulation
          </Button>
        </CardContent>
      </Card>

      {results && (
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-sm">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300">{results.executive_summary}</p>
              {results.aggregate_insights && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Average Risk Score</div>
                    <div className="text-2xl font-bold text-white">{results.aggregate_insights.average_risk_score}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#1a2332] border border-[#2a3548]">
                    <div className="text-xs text-slate-500 mb-1">Recommended Priority</div>
                    <Badge className={
                      results.aggregate_insights.recommended_priority === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      results.aggregate_insights.recommended_priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }>
                      {results.aggregate_insights.recommended_priority}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {results.simulations?.map((sim, idx) => (
            <Card key={idx} className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">Simulation #{sim.simulation_id}</CardTitle>
                    <Badge className={
                      sim.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-400' :
                      sim.risk_level === 'high' ? 'bg-amber-500/20 text-amber-400' :
                      sim.risk_level === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }>
                      {sim.risk_level}
                    </Badge>
                    <Badge className="bg-indigo-500/20 text-indigo-400">
                      {sim.confidence_level} confidence
                    </Badge>
                  </div>
                  <Button
                    onClick={() => createTestAssessment(sim)}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create Test Assessment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-white mb-2">{sim.assessment_name}</h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-rose-400" />
                      <span className="text-xs text-slate-400">Inherent Risk</span>
                    </div>
                    <div className="text-lg font-bold text-white">{sim.inherent_score}</div>
                    <div className="text-xs text-slate-500">
                      L: {sim.inherent_likelihood} × I: {sim.inherent_impact}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs text-slate-400">Residual Risk</span>
                    </div>
                    <div className="text-lg font-bold text-white">{sim.residual_score}</div>
                    <div className="text-xs text-slate-500">
                      L: {sim.residual_likelihood} × I: {sim.residual_impact}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-500 mb-2">Threat Analysis</div>
                    <p className="text-sm text-slate-300 p-3 rounded bg-[#151d2e] border border-[#2a3548]">
                      {sim.threat_analysis}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-2">Vulnerability Analysis</div>
                    <p className="text-sm text-slate-300 p-3 rounded bg-[#151d2e] border border-[#2a3548]">
                      {sim.vulnerability_analysis}
                    </p>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-2">Control Recommendations</div>
                    <div className="flex flex-wrap gap-2">
                      {sim.control_recommendations?.map((control, i) => (
                        <Badge key={i} className="bg-blue-500/10 text-blue-400 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {control}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500 mb-2">Mitigation Strategies</div>
                    <ul className="space-y-1">
                      {sim.mitigation_strategies?.map((strategy, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-indigo-400 mt-1">•</span>
                          <span>{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                      <div className="text-xs text-slate-500">Treatment</div>
                      <Badge className="bg-indigo-500/20 text-indigo-400 mt-1">{sim.risk_treatment}</Badge>
                    </div>
                    <div className="p-2 rounded bg-[#151d2e] border border-[#2a3548]">
                      <div className="text-xs text-slate-500">Success Probability</div>
                      <div className="text-sm font-semibold text-white mt-1">{sim.success_probability}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}