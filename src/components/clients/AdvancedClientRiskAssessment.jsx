import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, Loader2, AlertTriangle, TrendingUp, 
  Shield, Target, Zap, CheckCircle2, Calculator,
  BarChart3, Activity
} from "lucide-react";
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import { toast } from "sonner";

const RISK_DIMENSIONS = [
  { id: 'operational', name: 'Operational Risk', icon: Activity, color: 'text-blue-400' },
  { id: 'financial', name: 'Financial Risk', icon: TrendingUp, color: 'text-emerald-400' },
  { id: 'compliance', name: 'Compliance Risk', icon: Shield, color: 'text-violet-400' },
  { id: 'cyber', name: 'Cyber Security Risk', icon: Zap, color: 'text-rose-400' },
  { id: 'reputational', name: 'Reputational Risk', icon: Target, color: 'text-amber-400' },
  { id: 'strategic', name: 'Strategic Risk', icon: BarChart3, color: 'text-cyan-400' }
];

export default function AdvancedClientRiskAssessment({ client, onAssessmentComplete }) {
  const [scores, setScores] = useState({
    operational: 50,
    financial: 50,
    compliance: 50,
    cyber: 50,
    reputational: 50,
    strategic: 50
  });
  const [notes, setNotes] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [aiEnhancing, setAiEnhancing] = useState(false);
  const [calculatedRisk, setCalculatedRisk] = useState(null);

  const calculateRisk = () => {
    setCalculating(true);
    
    // Advanced risk calculation algorithm
    const weights = {
      operational: 0.20,
      financial: 0.20,
      compliance: 0.20,
      cyber: 0.25,
      strategic: 0.10,
      reputational: 0.05
    };

    const weightedScore = Object.entries(scores).reduce((sum, [key, value]) => {
      return sum + (value * weights[key]);
    }, 0);

    const industryMultiplier = {
      'Financial Services': 1.2,
      'Healthcare': 1.15,
      'Technology': 1.1,
      'Government': 0.9,
      'Retail': 1.05
    };

    const multiplier = industryMultiplier[client.industry] || 1.0;
    const adjustedScore = Math.min(100, Math.round(weightedScore * multiplier));

    const riskLevel = 
      adjustedScore >= 75 ? 'critical' :
      adjustedScore >= 60 ? 'high' :
      adjustedScore >= 40 ? 'medium' : 'low';

    setCalculatedRisk({
      overall_score: adjustedScore,
      risk_level: riskLevel,
      dimension_scores: { ...scores },
      industry_adjusted: true,
      multiplier: multiplier
    });

    setTimeout(() => setCalculating(false), 500);
  };

  const enhanceWithAI = async () => {
    setAiEnhancing(true);
    try {
      const prompt = `As a risk assessment expert, enhance this client risk assessment with AI-driven insights:

CLIENT: ${client.name}
INDUSTRY: ${client.industry}

DIMENSION SCORES:
${Object.entries(scores).map(([dim, score]) => `- ${dim}: ${score}/100`).join('\n')}

CALCULATED OVERALL RISK: ${calculatedRisk?.overall_score || 'Not calculated'}

Provide:
1. **Validation** - Are the dimension scores reasonable for this industry?
2. **Risk Justification** - Why these scores make sense (or don't)
3. **Hidden Risks** - Risks that might be underestimated
4. **Risk Correlations** - How dimensions interact
5. **Industry Benchmarks** - How this compares to peers
6. **Improvement Priorities** - Which dimensions to focus on first
7. **Recommended Actions** - Specific next steps

Return detailed analysis as markdown.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setCalculatedRisk(prev => ({
        ...prev,
        ai_analysis: response
      }));

      toast.success("AI enhancement complete!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to enhance assessment");
    } finally {
      setAiEnhancing(false);
    }
  };

  const applyAssessment = () => {
    if (calculatedRisk && onAssessmentComplete) {
      onAssessmentComplete({
        risk_score: calculatedRisk.overall_score,
        risk_level: calculatedRisk.risk_level,
        last_assessment_date: new Date().toISOString().split('T')[0],
        assessment_history: [
          ...(client.assessment_history || []),
          {
            date: new Date().toISOString(),
            risk_score: calculatedRisk.overall_score,
            dimension_scores: calculatedRisk.dimension_scores,
            notes: notes
          }
        ]
      });
      toast.success("Assessment applied to client profile");
    }
  };

  const radarData = RISK_DIMENSIONS.map(dim => ({
    dimension: dim.name.split(' ')[0],
    score: scores[dim.id]
  }));

  const barData = RISK_DIMENSIONS.map(dim => ({
    name: dim.name.split(' Risk')[0],
    score: scores[dim.id]
  }));

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calculator className="h-5 w-5 text-rose-400" />
            <div>
              <h3 className="text-sm font-semibold text-white">Advanced Risk Assessment</h3>
              <p className="text-xs text-slate-400">Multi-dimensional risk scoring with AI validation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Dimension Sliders */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white">Risk Dimensions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {RISK_DIMENSIONS.map(dim => {
            const Icon = dim.icon;
            return (
              <div key={dim.id}>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-white flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${dim.color}`} />
                    {dim.name}
                  </Label>
                  <Badge className={`${
                    scores[dim.id] >= 75 ? 'bg-rose-500/20 text-rose-400' :
                    scores[dim.id] >= 60 ? 'bg-amber-500/20 text-amber-400' :
                    scores[dim.id] >= 40 ? 'bg-blue-500/20 text-blue-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {scores[dim.id]}
                  </Badge>
                </div>
                <Slider
                  value={[scores[dim.id]]}
                  onValueChange={([value]) => setScores({ ...scores, [dim.id]: value })}
                  max={100}
                  step={5}
                  className="mb-1"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Low Risk</span>
                  <span>High Risk</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Assessment Notes */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-white">Assessment Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document your assessment rationale, observations, and supporting evidence..."
            className="bg-[#151d2e] border-[#2a3548] text-white h-24"
          />
        </CardContent>
      </Card>

      {/* Calculate Button */}
      <Button 
        onClick={calculateRisk}
        disabled={calculating}
        className="w-full bg-rose-600 hover:bg-rose-700"
      >
        {calculating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Overall Risk Score
          </>
        )}
      </Button>

      {calculatedRisk && (
        <div className="space-y-4">
          {/* Risk Score Result */}
          <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Overall Risk Score</h3>
                  <div className={`text-5xl font-bold ${
                    calculatedRisk.overall_score >= 75 ? 'text-rose-400' :
                    calculatedRisk.overall_score >= 60 ? 'text-amber-400' :
                    calculatedRisk.overall_score >= 40 ? 'text-blue-400' :
                    'text-emerald-400'
                  }`}>
                    {calculatedRisk.overall_score}
                  </div>
                  <Badge className={`mt-2 ${
                    calculatedRisk.risk_level === 'critical' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    calculatedRisk.risk_level === 'high' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    calculatedRisk.risk_level === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {calculatedRisk.risk_level.toUpperCase()} RISK
                  </Badge>
                  {calculatedRisk.industry_adjusted && (
                    <p className="text-xs text-slate-400 mt-2">
                      Industry-adjusted (×{calculatedRisk.multiplier.toFixed(2)})
                    </p>
                  )}
                </div>
                <AlertTriangle className="h-20 w-20 text-rose-400/20" />
              </div>
            </CardContent>
          </Card>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Risk Profile Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="dimension" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar name="Risk Score" dataKey="score" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">Dimension Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis type="number" stroke="#94a3b8" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                    />
                    <Bar dataKey="score" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* AI Enhancement */}
          {!calculatedRisk.ai_analysis && (
            <Button 
              onClick={enhanceWithAI}
              disabled={aiEnhancing}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
            >
              {aiEnhancing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enhancing with AI...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Enhance with AI Intelligence
                </>
              )}
            </Button>
          )}

          {calculatedRisk.ai_analysis && (
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <Brain className="h-4 w-4 text-violet-400" />
                  AI Risk Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="prose prose-sm prose-invert max-w-none pr-4 text-slate-300 text-sm whitespace-pre-line">
                    {calculatedRisk.ai_analysis}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Apply Button */}
          <Button 
            onClick={applyAssessment}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Apply Assessment to Client Profile
          </Button>
        </div>
      )}
    </div>
  );
}