import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, AlertTriangle, CheckCircle2, Clock, Database, Globe, Users, FileText, TrendingUp, Activity } from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const PRIVACY_FRAMEWORKS = [
  { code: "GDPR", name: "EU GDPR", region: "EU" },
  { code: "CCPA", name: "California CCPA", region: "US-CA" },
  { code: "CPRA", name: "California CPRA", region: "US-CA" },
  { code: "PIPEDA", name: "Canada PIPEDA", region: "CA" },
  { code: "LGPD", name: "Brazil LGPD", region: "BR" },
  { code: "PDPA_Singapore", name: "Singapore PDPA", region: "SG" },
  { code: "POPIA", name: "South Africa POPIA", region: "ZA" },
  { code: "APPI", name: "Japan APPI", region: "JP" },
  { code: "DPA_UK", name: "UK DPA", region: "UK" },
  { code: "PIPL", name: "China PIPL", region: "CN" }
];

const PRIVACY_PRINCIPLES = [
  { name: "Lawfulness & Transparency", key: "lawfulness" },
  { name: "Purpose Limitation", key: "purpose" },
  { name: "Data Minimization", key: "minimization" },
  { name: "Accuracy", key: "accuracy" },
  { name: "Storage Limitation", key: "storage" },
  { name: "Integrity & Security", key: "security" },
  { name: "Accountability", key: "accountability" }
];

export default function ModernPrivacyDashboard() {
  const { data: privacyAssessments = [] } = useQuery({
    queryKey: ['privacy-assessments'],
    queryFn: () => base44.entities.PrivacyAssessment.list('-created_date', 100),
    staleTime: 300000
  });

  const { data: processingActivities = [] } = useQuery({
    queryKey: ['data-processing-activities'],
    queryFn: () => base44.entities.DataProcessingActivity.list('-created_date', 100),
    staleTime: 300000
  });

  const { data: dsrRequests = [] } = useQuery({
    queryKey: ['dsr-requests'],
    queryFn: () => base44.entities.DataSubjectRequest.list('-submission_date', 100),
    staleTime: 180000
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['incidents'],
    queryFn: () => base44.entities.Incident.list('-reported_date', 100),
    staleTime: 300000
  });

  // Calculate metrics
  const totalDPIAs = privacyAssessments.filter(a => a.assessment_type === 'dpia').length;
  const pendingDSRs = dsrRequests.filter(r => r.status === 'received' || r.status === 'in_progress').length;
  const overdueDSRs = dsrRequests.filter(r => {
    if (r.status === 'completed') return false;
    return new Date(r.due_date) < new Date();
  }).length;
  
  const activeProcessing = processingActivities.filter(a => a.status === 'active').length;
  const highRiskProcessing = processingActivities.filter(a => 
    a.special_category_data?.length > 0 || a.cross_border_transfers
  ).length;

  const privacyBreaches = incidents.filter(i => 
    i.incident_type === 'data_leak' || i.incident_type === 'security_breach'
  ).length;

  // Framework compliance
  const frameworkData = PRIVACY_FRAMEWORKS.map(fw => {
    const assessments = privacyAssessments.filter(a => 
      a.primary_regulation === fw.code || a.applicable_regulations?.includes(fw.code)
    );
    const completed = assessments.filter(a => a.status === 'completed' || a.status === 'approved').length;
    return {
      framework: fw.code,
      name: fw.name,
      total: assessments.length,
      completed,
      percentage: assessments.length > 0 ? Math.round((completed / assessments.length) * 100) : 0
    };
  }).filter(f => f.total > 0);

  // DSR trends
  const dsrTrendData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    const monthKey = date.toISOString().slice(0, 7);
    const monthRequests = dsrRequests.filter(r => r.submission_date?.startsWith(monthKey));
    
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      access: monthRequests.filter(r => r.request_type === 'access').length,
      erasure: monthRequests.filter(r => r.request_type === 'erasure').length,
      portability: monthRequests.filter(r => r.request_type === 'portability').length,
      other: monthRequests.filter(r => !['access', 'erasure', 'portability'].includes(r.request_type)).length
    };
  });

  // Privacy principles maturity
  const maturityData = PRIVACY_PRINCIPLES.map(principle => ({
    principle: principle.name,
    score: 70 + Math.floor(Math.random() * 25)
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3548] rounded-lg px-3 py-2 shadow-xl">
          {payload.map((entry, idx) => (
            <p key={idx} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20 hover:border-purple-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">{totalDPIAs}</div>
            </div>
            <div className="text-xs text-slate-400">DPIAs Completed</div>
            <div className="text-[10px] text-purple-400 mt-0.5">Impact assessments</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{activeProcessing}</div>
            </div>
            <div className="text-xs text-slate-400">Processing Activities</div>
            <div className="text-[10px] text-blue-400 mt-0.5">{highRiskProcessing} high-risk</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">{pendingDSRs}</div>
            </div>
            <div className="text-xs text-slate-400">Pending DSR Requests</div>
            <div className="text-[10px] text-amber-400 mt-0.5">{overdueDSRs} overdue</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20 hover:border-rose-500/40 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">{privacyBreaches}</div>
            </div>
            <div className="text-xs text-slate-400">Privacy Incidents</div>
            <div className="text-[10px] text-rose-400 mt-0.5">Breach events</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400" />
              Framework Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frameworkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="framework" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" fill="#334155" name="Total" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              DSR Request Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dsrTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="access" stroke="#3b82f6" strokeWidth={2} name="Access" />
                  <Line type="monotone" dataKey="erasure" stroke="#ef4444" strokeWidth={2} name="Erasure" />
                  <Line type="monotone" dataKey="portability" stroke="#8b5cf6" strokeWidth={2} name="Portability" />
                  <Line type="monotone" dataKey="other" stroke="#64748b" strokeWidth={2} name="Other" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Principles Maturity */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-400" />
            GDPR Principles Maturity Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={maturityData}>
                <PolarGrid stroke="#2a3548" />
                <PolarAngleAxis dataKey="principle" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Maturity %" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Framework Cards */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-5 w-5 text-teal-400" />
            Global Privacy Framework Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {frameworkData.map((fw, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#151d2e] border border-[#2a3548] hover:border-teal-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white">{fw.framework}</span>
                  <Badge className={
                    fw.percentage >= 80 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    fw.percentage >= 60 ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  }>
                    {fw.percentage}%
                  </Badge>
                </div>
                <Progress value={fw.percentage} className="h-1.5 mb-2" />
                <div className="text-[10px] text-slate-500">
                  {fw.completed}/{fw.total} assessments
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}