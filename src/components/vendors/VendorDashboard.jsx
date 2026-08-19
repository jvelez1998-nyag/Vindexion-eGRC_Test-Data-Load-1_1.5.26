import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Shield,
  FileText,
  Activity,
  Target,
  Calendar
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6'
};

export default function VendorDashboard({ onViewVendor, onAddVendor }) {
  const { data: vendors = [] } = useQuery({
    queryKey: ['vendors'],
    queryFn: () => base44.entities.Vendor.list('-updated_date', 100),
    staleTime: 120000
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['vendor-assessments'],
    queryFn: () => base44.entities.VendorAssessment.list('-assessment_date', 50),
    staleTime: 120000
  });

  const { data: audits = [] } = useQuery({
    queryKey: ['vendor-audits'],
    queryFn: () => base44.entities.VendorAudit.list('-created_date', 50),
    staleTime: 120000
  });

  const { data: onboardingTasks = [] } = useQuery({
    queryKey: ['vendor-onboarding-tasks'],
    queryFn: () => base44.entities.VendorOnboardingTask.list('-due_date', 50),
    staleTime: 120000
  });

  // Calculate statistics
  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.status === 'active').length,
    underReview: vendors.filter(v => v.status === 'under_review').length,
    critical: vendors.filter(v => v.criticality === 'critical').length,
    highRisk: vendors.filter(v => v.risk_tier === 'tier_1').length,
    averageScore: vendors.filter(v => v.security_score).reduce((sum, v) => sum + (v.security_score || 0), 0) / (vendors.filter(v => v.security_score).length || 1),
    compliant: vendors.filter(v => v.compliance_status === 'compliant').length,
    nonCompliant: vendors.filter(v => v.compliance_status === 'non_compliant').length,
    overdueReviews: vendors.filter(v => v.next_review_date && new Date(v.next_review_date) < new Date()).length,
    upcomingReviews: vendors.filter(v => {
      if (!v.next_review_date) return false;
      const days = differenceInDays(new Date(v.next_review_date), new Date());
      return days > 0 && days <= 30;
    }).length,
    activeAudits: audits.filter(a => a.status === 'in_progress').length,
    completedAssessments: assessments.filter(a => a.status === 'completed').length,
    pendingOnboarding: onboardingTasks.filter(t => t.status === 'not_started' || t.status === 'in_progress').length
  };

  // Risk distribution
  const riskDistribution = [
    { name: 'Critical', value: vendors.filter(v => v.criticality === 'critical').length, color: COLORS.critical },
    { name: 'High', value: vendors.filter(v => v.criticality === 'high').length, color: COLORS.high },
    { name: 'Medium', value: vendors.filter(v => v.criticality === 'medium').length, color: COLORS.medium },
    { name: 'Low', value: vendors.filter(v => v.criticality === 'low').length, color: COLORS.low }
  ];

  // Compliance status
  const complianceData = [
    { name: 'Compliant', value: stats.compliant, color: '#10b981' },
    { name: 'Under Review', value: stats.underReview, color: '#f59e0b' },
    { name: 'Non-Compliant', value: stats.nonCompliant, color: '#ef4444' }
  ];

  // Vendor types
  const vendorTypes = vendors.reduce((acc, v) => {
    acc[v.vendor_type] = (acc[v.vendor_type] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.entries(vendorTypes).map(([name, count]) => ({ name, count }));

  // Recent assessments trend
  const last6Months = [...Array(6)].map((_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return format(date, 'MMM yyyy');
  });
  const assessmentTrend = last6Months.map(month => {
    const count = assessments.filter(a => format(new Date(a.assessment_date), 'MMM yyyy') === month).length;
    return { month, assessments: count };
  });

  // Critical vendors requiring attention
  const criticalVendors = vendors
    .filter(v => v.criticality === 'critical' || v.risk_tier === 'tier_1' || 
                 (v.next_review_date && new Date(v.next_review_date) < new Date()))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-indigo-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Total Vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
                <p className="text-xs text-slate-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-rose-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.critical}</p>
                <p className="text-xs text-slate-400">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.averageScore.toFixed(0)}</p>
                <p className="text-xs text-slate-400">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.overdueReviews}</p>
                <p className="text-xs text-slate-400">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.activeAudits}</p>
                <p className="text-xs text-slate-400">Active Audits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Risk Distribution */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-rose-400" />
              Risk Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {riskDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={complianceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {complianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {complianceData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-slate-400">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vendor Types */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-400" />
              Vendor Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Assessment Trend */}
      <Card className="bg-[#1a2332] border-[#2a3548]">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-400" />
            Assessment Activity (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={assessmentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
              <XAxis dataKey="month" stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '11px' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a2332', border: '1px solid #2a3548', borderRadius: '8px' }} />
              <Legend />
              <Line type="monotone" dataKey="assessments" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Critical Vendors & Action Items */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Critical Vendors */}
        <Card className="bg-gradient-to-br from-rose-500/5 to-orange-500/5 border-rose-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              Requires Attention ({criticalVendors.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalVendors.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No vendors require immediate attention</p>
              ) : (
                criticalVendors.map(vendor => (
                  <div key={vendor.id} className="flex items-center justify-between p-3 rounded-lg bg-[#1a2332] border border-[#2a3548] hover:border-rose-500/30 transition-colors cursor-pointer" onClick={() => onViewVendor(vendor)}>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{vendor.vendor_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${vendor.criticality === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {vendor.criticality}
                        </Badge>
                        {vendor.next_review_date && new Date(vendor.next_review_date) < new Date() && (
                          <span className="text-xs text-rose-400">Review Overdue</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {vendor.security_score && (
                        <div className="text-lg font-bold text-white">{vendor.security_score}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Items */}
        <Card className="bg-[#1a2332] border-[#2a3548]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-amber-400" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{stats.overdueReviews} Overdue Reviews</p>
                    <p className="text-xs text-slate-400">Require immediate attention</p>
                  </div>
                </div>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Urgent</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{stats.upcomingReviews} Upcoming Reviews</p>
                    <p className="text-xs text-slate-400">Due within 30 days</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{stats.pendingOnboarding} Onboarding Tasks</p>
                    <p className="text-xs text-slate-400">Pending completion</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                <div className="flex items-center gap-3">
                  <Activity className="h-5 w-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{stats.activeAudits} Active Audits</p>
                    <p className="text-xs text-slate-400">In progress</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
        <CardContent className="p-6 text-center">
          <Building2 className="h-12 w-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">Ready to Add a New Vendor?</h3>
          <p className="text-slate-400 mb-4">Start the comprehensive onboarding and assessment process</p>
          <Button onClick={onAddVendor} className="bg-indigo-600 hover:bg-indigo-700">
            Add New Vendor
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}