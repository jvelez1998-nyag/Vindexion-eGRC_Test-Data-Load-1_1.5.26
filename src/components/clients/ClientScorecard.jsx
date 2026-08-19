import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, TrendingUp, AlertTriangle, CheckCircle2, 
  Target, Activity, BarChart3, Zap
} from "lucide-react";
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  Radar, ResponsiveContainer, Tooltip 
} from "recharts";

export default function ClientScorecard({ client }) {
  const riskScore = client.risk_score || 0;
  const complianceScore = client.compliance_score || 0;
  const controlMaturity = client.control_maturity || 0;
  const securityPosture = client.security_posture || 0;

  const overallScore = Math.round((complianceScore + (100 - riskScore) + controlMaturity + securityPosture) / 4);

  const radarData = [
    { metric: 'Compliance', score: complianceScore },
    { metric: 'Controls', score: controlMaturity },
    { metric: 'Security', score: securityPosture },
    { metric: 'Risk Mgmt', score: 100 - riskScore },
    { metric: 'Maturity', score: overallScore }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (score >= 40) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-1">Overall Health Score</h3>
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <Badge className={`mt-2 ${getScoreBadge(overallScore)}`}>
                {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-6xl font-bold text-cyan-400/20">
                <Target className="h-20 w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Compliance</h4>
                <p className="text-xs text-slate-500">Maturity Score</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className={`text-3xl font-bold ${getScoreColor(complianceScore)}`}>
                {complianceScore}
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <Progress value={complianceScore} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Risk Score</h4>
                <p className="text-xs text-slate-500">Current Exposure</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className={`text-3xl font-bold ${getScoreColor(100 - riskScore)}`}>
                {riskScore}
              </div>
              <Activity className="h-5 w-5 text-amber-400" />
            </div>
            <Progress value={riskScore} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Controls</h4>
                <p className="text-xs text-slate-500">Maturity Level</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className={`text-3xl font-bold ${getScoreColor(controlMaturity)}`}>
                {controlMaturity}
              </div>
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <Progress value={controlMaturity} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Security</h4>
                <p className="text-xs text-slate-500">Posture Score</p>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className={`text-3xl font-bold ${getScoreColor(securityPosture)}`}>
                {securityPosture}
              </div>
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <Progress value={securityPosture} className="mt-3 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Radar Chart */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            Maturity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a3548" />
              <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
              <Radar name="Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                formatter={(value) => `${value}%`}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Issues Summary */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-white">Issues Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="text-2xl font-bold text-rose-400">{client.critical_issues || 0}</div>
              <div className="text-xs text-slate-400 mt-1">Critical Issues</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="text-2xl font-bold text-amber-400">{client.finding_count || 0}</div>
              <div className="text-xs text-slate-400 mt-1">Findings</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <div className="text-2xl font-bold text-violet-400">{client.incident_count || 0}</div>
              <div className="text-xs text-slate-400 mt-1">Incidents</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}