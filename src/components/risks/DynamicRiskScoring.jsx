import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, TrendingUp, TrendingDown, Shield, AlertTriangle, 
  Zap, Brain, Target, Minus 
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";

export default function DynamicRiskScoring({ risk, controls, incidents }) {
  const linkedControls = controls.filter(c => risk.linked_controls?.includes(c.id));
  const relatedIncidents = incidents.filter(i => risk.linked_incidents?.includes(i.id));
  
  const baseScore = (risk.likelihood || 3) * (risk.impact || 3);
  const dynamicScore = risk.dynamic_score || baseScore;
  const controlFactor = risk.control_effectiveness_factor || 0;
  const incidentFactor = risk.incident_history_factor || 0;
  
  const effectiveControls = linkedControls.filter(c => c.status === 'effective').length;
  const controlCoverage = linkedControls.length > 0 
    ? Math.round((effectiveControls / linkedControls.length) * 100) 
    : 0;

  const getRiskLevel = (score) => {
    if (score >= 20) return { label: 'Critical', color: 'rose', icon: AlertTriangle };
    if (score >= 12) return { label: 'High', color: 'orange', icon: TrendingUp };
    if (score >= 6) return { label: 'Medium', color: 'amber', icon: Minus };
    return { label: 'Low', color: 'emerald', icon: TrendingDown };
  };

  const currentLevel = getRiskLevel(dynamicScore);
  const baseLevel = getRiskLevel(baseScore);
  const CurrentIcon = currentLevel.icon;

  // Score breakdown for radar chart
  const scoreBreakdown = [
    { factor: 'Base Risk', value: baseScore, fullMark: 25 },
    { factor: 'Controls', value: Math.round(controlFactor * 25), fullMark: 25 },
    { factor: 'Incidents', value: Math.round(incidentFactor * 25), fullMark: 25 },
    { factor: 'Likelihood', value: (risk.likelihood || 3) * 5, fullMark: 25 },
    { factor: 'Impact', value: (risk.impact || 3) * 5, fullMark: 25 }
  ];

  // Historical trend (simulated - in real app would come from historical data)
  const trendData = [
    { month: 'Jan', score: baseScore },
    { month: 'Feb', score: baseScore - 1 },
    { month: 'Mar', score: baseScore - 0.5 },
    { month: 'Apr', score: baseScore + 0.3 },
    { month: 'May', score: baseScore + 0.8 },
    { month: 'Jun', score: dynamicScore }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Main Score Card */}
      <Card className={`bg-gradient-to-br from-${currentLevel.color}-500/10 to-${currentLevel.color}-600/10 border-${currentLevel.color}-500/20`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Activity className={`h-5 w-5 text-${currentLevel.color}-400`} />
              Dynamic Risk Score
            </CardTitle>
            <Badge className={`bg-${currentLevel.color}-500/20 text-${currentLevel.color}-400 border-${currentLevel.color}-500/30`}>
              <CurrentIcon className="h-3 w-3 mr-1" />
              {currentLevel.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className={`text-6xl font-bold text-${currentLevel.color}-400 mb-2`}>
              {dynamicScore.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm">
              {dynamicScore > baseScore ? (
                <>
                  <TrendingUp className="h-4 w-4 text-rose-400" />
                  <span className="text-rose-400">+{(dynamicScore - baseScore).toFixed(1)} from base</span>
                </>
              ) : dynamicScore < baseScore ? (
                <>
                  <TrendingDown className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">{(dynamicScore - baseScore).toFixed(1)} from base</span>
                </>
              ) : (
                <span className="text-slate-500">No change from base score</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  Base Score
                </span>
                <span className="text-white font-medium">{baseScore}</span>
              </div>
              <Progress value={(baseScore / 25) * 100} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <Shield className="h-3 w-3 text-blue-400" />
                  Control Effectiveness
                </span>
                <span className="text-blue-400 font-medium">{controlCoverage}%</span>
              </div>
              <Progress value={controlCoverage} className="h-2 [&>div]:bg-blue-500" />
              <p className="text-xs text-slate-500 mt-1">
                {effectiveControls} of {linkedControls.length} controls effective
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-400" />
                  Incident History Impact
                </span>
                <span className="text-amber-400 font-medium">
                  {Math.round(incidentFactor * 100)}%
                </span>
              </div>
              <Progress value={incidentFactor * 100} className="h-2 [&>div]:bg-amber-500" />
              <p className="text-xs text-slate-500 mt-1">
                {relatedIncidents.length} related incidents (6 months)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown Radar */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-400" />
            Score Factors Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={scoreBreakdown}>
              <PolarGrid stroke="#2a3548" />
              <PolarAngleAxis 
                dataKey="factor" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 25]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar 
                name="Score" 
                dataKey="value" 
                stroke="#6366f1" 
                fill="#6366f1" 
                fillOpacity={0.6} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f1623', 
                  border: '1px solid #2a3548',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Trend Chart */}
      <Card className="bg-[#1a2332] border-[#2a3548] lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-cyan-400" />
              Risk Score Trend
            </CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-slate-400">Dynamic Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-500" />
                <span className="text-slate-400">Base Score</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[0, 25]}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f1623', 
                  border: '1px solid #2a3548',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}