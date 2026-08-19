import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, AlertTriangle, TrendingUp, TrendingDown, 
  Minus, Calendar, Bell, CheckCircle2 
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { format, subMonths } from "date-fns";

export default function ClientMonitoring({ client }) {
  // Generate historical trend data
  const trendData = (() => {
    const data = [];
    const history = client.assessment_history || [];
    
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStr = format(date, 'MMM');
      
      // Find assessment for this month or use current values
      const assessment = history.find(h => {
        const assessmentDate = new Date(h.date);
        return format(assessmentDate, 'MMM') === monthStr;
      });
      
      data.push({
        month: monthStr,
        risk: assessment?.risk_score || client.risk_score || 0,
        compliance: assessment?.compliance_score || client.compliance_score || 0,
        controls: assessment?.control_maturity || client.control_maturity || 0,
        security: assessment?.security_posture || client.security_posture || 0
      });
    }
    
    return data;
  })();

  // Calculate trends
  const calculateTrend = (metric) => {
    if (trendData.length < 2) return 'stable';
    const current = trendData[trendData.length - 1][metric];
    const previous = trendData[trendData.length - 2][metric];
    if (current > previous + 5) return 'improving';
    if (current < previous - 5) return 'declining';
    return 'stable';
  };

  const riskTrend = calculateTrend('risk');
  const complianceTrend = calculateTrend('compliance');
  const controlsTrend = calculateTrend('controls');
  const securityTrend = calculateTrend('security');

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (trend === 'declining') return <TrendingDown className="h-4 w-4 text-rose-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-emerald-400';
    if (trend === 'declining') return 'text-rose-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      {/* Monitoring Status */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-semibold text-white">Continuous Monitoring</h3>
                <p className="text-xs text-slate-400">Real-time client health tracking</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Trend Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Risk Trend</span>
              {getTrendIcon(riskTrend)}
            </div>
            <div className={`text-lg font-bold ${getTrendColor(riskTrend)}`}>
              {riskTrend === 'improving' ? 'Decreasing' : riskTrend === 'declining' ? 'Increasing' : 'Stable'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Compliance</span>
              {getTrendIcon(complianceTrend)}
            </div>
            <div className={`text-lg font-bold ${getTrendColor(complianceTrend)}`}>
              {complianceTrend === 'improving' ? 'Improving' : complianceTrend === 'declining' ? 'Declining' : 'Stable'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Controls</span>
              {getTrendIcon(controlsTrend)}
            </div>
            <div className={`text-lg font-bold ${getTrendColor(controlsTrend)}`}>
              {controlsTrend === 'improving' ? 'Improving' : controlsTrend === 'declining' ? 'Declining' : 'Stable'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Security</span>
              {getTrendIcon(securityTrend)}
            </div>
            <div className={`text-lg font-bold ${getTrendColor(securityTrend)}`}>
              {securityTrend === 'improving' ? 'Improving' : securityTrend === 'declining' ? 'Declining' : 'Stable'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historical Trends Chart */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            6-Month Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="complianceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="controlsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="securityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#94a3b8" tick={{ fontSize: 11 }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="compliance" stroke="#10b981" strokeWidth={2} fill="url(#complianceGrad)" name="Compliance" />
              <Area type="monotone" dataKey="controls" stroke="#06b6d4" strokeWidth={2} fill="url(#controlsGrad)" name="Controls" />
              <Area type="monotone" dataKey="security" stroke="#8b5cf6" strokeWidth={2} fill="url(#securityGrad)" name="Security" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Upcoming Reviews */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-400" />
            Scheduled Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {client.next_review_date && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-white">Next Assessment</span>
                </div>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {format(new Date(client.next_review_date), 'MMM d, yyyy')}
                </Badge>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-400" />
                <span className="text-sm text-white">Monitoring Alerts</span>
              </div>
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                Enabled
              </Badge>
            </div>

            {client.last_assessment_date && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-white">Last Assessment</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {format(new Date(client.last_assessment_date), 'MMM d, yyyy')}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Risk Score Alert</span>
              <span className="text-xs text-amber-400">Threshold: 70</span>
            </div>
            <Progress value={70} className="h-1.5" />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Compliance Minimum</span>
              <span className="text-xs text-blue-400">Target: 80</span>
            </div>
            <Progress value={80} className="h-1.5" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Critical Issues</span>
              <span className="text-xs text-rose-400">Max: 3</span>
            </div>
            <Progress value={(client.critical_issues || 0) / 3 * 100} className="h-1.5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}