import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subMonths } from "date-fns";

export default function ControlComplianceTrendAnalysis({ controls, compliance, tests }) {
  const trendData = useMemo(() => {
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      months.push({
        month: format(date, 'MMM yyyy'),
        date: date
      });
    }

    return months.map(({ month, date }) => {
      // Control effectiveness trend
      const relevantTests = tests.filter(t => 
        t.test_date && new Date(t.test_date) <= date
      );
      
      const controlsWithTests = controls.map(control => {
        const controlTests = relevantTests
          .filter(t => t.control_id === control.id)
          .sort((a, b) => new Date(b.test_date) - new Date(a.test_date));
        
        const latestTest = controlTests[0];
        const effectiveness = latestTest?.result === 'passed' ? 5 : 
                            latestTest?.result === 'passed_with_exceptions' ? 4 :
                            latestTest?.result === 'failed' ? 2 : control.effectiveness || 3;
        
        return { ...control, calculated_effectiveness: effectiveness };
      });

      const avgEffectiveness = controlsWithTests.reduce((sum, c) => sum + c.calculated_effectiveness, 0) / controlsWithTests.length || 0;
      
      const effectiveControls = controlsWithTests.filter(c => c.calculated_effectiveness >= 4).length;
      const ineffectiveControls = controlsWithTests.filter(c => c.calculated_effectiveness < 3).length;

      // Compliance trend
      const relevantCompliance = compliance.filter(c => 
        !c.last_review_date || new Date(c.last_review_date) <= date
      );

      const verifiedCompliance = relevantCompliance.filter(c => c.status === 'verified').length;
      const implementedCompliance = relevantCompliance.filter(c => c.status === 'implemented').length;
      const inProgressCompliance = relevantCompliance.filter(c => c.status === 'in_progress').length;
      const nonCompliant = relevantCompliance.filter(c => c.status === 'non_compliant').length;

      const complianceRate = relevantCompliance.length > 0 
        ? ((verifiedCompliance + implementedCompliance) / relevantCompliance.length) * 100 
        : 0;

      // Test pass rate
      const monthTests = tests.filter(t => {
        if (!t.test_date) return false;
        const testDate = new Date(t.test_date);
        return testDate.getMonth() === date.getMonth() && testDate.getFullYear() === date.getFullYear();
      });

      const passedTests = monthTests.filter(t => t.result === 'passed' || t.result === 'passed_with_exceptions').length;
      const testPassRate = monthTests.length > 0 ? (passedTests / monthTests.length) * 100 : 0;

      return {
        month,
        avgEffectiveness: Number(avgEffectiveness.toFixed(2)),
        effectiveControls,
        ineffectiveControls,
        complianceRate: Number(complianceRate.toFixed(1)),
        verifiedCompliance,
        implementedCompliance,
        inProgressCompliance,
        nonCompliant,
        testPassRate: Number(testPassRate.toFixed(1)),
        totalTests: monthTests.length
      };
    });
  }, [controls, compliance, tests]);

  const latestData = trendData[trendData.length - 1];
  const previousData = trendData[trendData.length - 2];

  const effectivenessTrend = latestData.avgEffectiveness - previousData.avgEffectiveness;
  const complianceTrend = latestData.complianceRate - previousData.complianceRate;

  return (
    <div className="space-y-4">
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base">Control Effectiveness Trend (12 Months)</CardTitle>
            </div>
            <div className="flex gap-3">
              <Badge className={effectivenessTrend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                {effectivenessTrend >= 0 ? '↗' : '↘'} {Math.abs(effectivenessTrend).toFixed(2)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="effectivenessGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} domain={[0, 5]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a2332', 
                  border: '1px solid #2a3548',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="avgEffectiveness" 
                stroke="#3b82f6" 
                strokeWidth={2}
                fill="url(#effectivenessGradient)"
                name="Avg Effectiveness"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-base">Compliance Status Trend</CardTitle>
            </div>
            <div className="flex gap-3">
              <Badge className={complianceTrend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}>
                {complianceTrend >= 0 ? '↗' : '↘'} {Math.abs(complianceTrend).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a2332', 
                  border: '1px solid #2a3548',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="complianceRate" 
                stroke="#10b981" 
                strokeWidth={2}
                fill="url(#complianceGradient)"
                name="Compliance Rate (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-base">Control Status Distribution Over Time</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a2332', 
                  border: '1px solid #2a3548',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Legend />
              <Bar dataKey="effectiveControls" stackId="a" fill="#10b981" name="Effective" />
              <Bar dataKey="ineffectiveControls" stackId="a" fill="#ef4444" name="Ineffective" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <CardTitle className="text-base">Testing Pass Rate Trend</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a2332', 
                  border: '1px solid #2a3548',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="testPassRate" 
                stroke="#6366f1" 
                strokeWidth={2}
                name="Pass Rate (%)"
                dot={{ fill: '#6366f1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}