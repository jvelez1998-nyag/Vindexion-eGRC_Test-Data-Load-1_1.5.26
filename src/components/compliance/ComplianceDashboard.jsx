import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Shield,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Target,
  Clock
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { toast } from "sonner";
import { format } from "date-fns";
import jsPDF from "jspdf";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ComplianceDashboard({ compliance }) {
  const [frameworkFilter, setFrameworkFilter] = useState("all");

  const filteredCompliance = useMemo(() => {
    if (frameworkFilter === "all") return compliance;
    return compliance.filter(c => c.framework === frameworkFilter);
  }, [compliance, frameworkFilter]);

  const frameworks = useMemo(() => 
    [...new Set(compliance.map(c => c.framework).filter(Boolean))],
    [compliance]
  );

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredCompliance.length;
    const implemented = filteredCompliance.filter(c => c.status === 'implemented').length;
    const verified = filteredCompliance.filter(c => c.status === 'verified').length;
    const inProgress = filteredCompliance.filter(c => c.status === 'in_progress').length;
    const notStarted = filteredCompliance.filter(c => c.status === 'not_started').length;
    const nonCompliant = filteredCompliance.filter(c => c.status === 'non_compliant').length;
    
    const compliant = implemented + verified;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 0;
    
    // Overdue items
    const now = new Date();
    const overdue = filteredCompliance.filter(c => 
      c.due_date && new Date(c.due_date) < now && 
      (c.status === 'not_started' || c.status === 'in_progress')
    ).length;
    
    return {
      total,
      implemented,
      verified,
      inProgress,
      notStarted,
      nonCompliant,
      compliant,
      complianceRate,
      overdue
    };
  }, [filteredCompliance]);

  // Status distribution
  const statusData = useMemo(() => [
    { name: 'Implemented', value: metrics.implemented, color: '#10b981' },
    { name: 'Verified', value: metrics.verified, color: '#059669' },
    { name: 'In Progress', value: metrics.inProgress, color: '#3b82f6' },
    { name: 'Not Started', value: metrics.notStarted, color: '#64748b' },
    { name: 'Non-Compliant', value: metrics.nonCompliant, color: '#ef4444' }
  ], [metrics]);

  // Framework distribution
  const frameworkData = useMemo(() => {
    const counts = {};
    filteredCompliance.forEach(c => {
      counts[c.framework] = (counts[c.framework] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCompliance]);

  // Framework compliance rates
  const frameworkComplianceData = useMemo(() => {
    const frameworkStats = {};
    
    compliance.forEach(item => {
      if (!frameworkStats[item.framework]) {
        frameworkStats[item.framework] = { total: 0, compliant: 0 };
      }
      frameworkStats[item.framework].total++;
      if (item.status === 'implemented' || item.status === 'verified') {
        frameworkStats[item.framework].compliant++;
      }
    });
    
    return Object.entries(frameworkStats).map(([framework, stats]) => ({
      framework,
      rate: Math.round((stats.compliant / stats.total) * 100),
      compliant: stats.compliant,
      total: stats.total
    }));
  }, [compliance]);

  // Radar chart data for framework coverage
  const radarData = useMemo(() => {
    return frameworkComplianceData.map(f => ({
      framework: f.framework,
      compliance: f.rate
    }));
  }, [frameworkComplianceData]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Framework', 'Requirement ID', 'Requirement', 'Status', 'Owner', 'Due Date', 'Evidence'];
    const rows = filteredCompliance.map(item => [
      item.framework,
      item.requirement_id || '',
      item.requirement,
      item.status,
      item.owner || '',
      item.due_date ? format(new Date(item.due_date), 'yyyy-MM-dd') : '',
      item.evidence_url || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast.success("CSV report exported");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Policy Compliance Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth / 2, 28, { align: 'center' });
    
    // Executive Summary
    doc.setFontSize(14);
    doc.text('Executive Summary', 14, 40);
    
    doc.setFontSize(10);
    let yPos = 50;
    doc.text(`Overall Compliance Rate: ${metrics.complianceRate}%`, 14, yPos);
    doc.text(`Total Requirements: ${metrics.total}`, 14, yPos + 6);
    doc.text(`Compliant: ${metrics.compliant}`, 14, yPos + 12);
    doc.text(`In Progress: ${metrics.inProgress}`, 14, yPos + 18);
    doc.text(`Not Started: ${metrics.notStarted}`, 14, yPos + 24);
    doc.text(`Non-Compliant: ${metrics.nonCompliant}`, 14, yPos + 30);
    doc.text(`Overdue: ${metrics.overdue}`, 14, yPos + 36);
    
    // Framework Compliance Rates
    yPos = 100;
    doc.setFontSize(14);
    doc.text('Framework Compliance Rates', 14, yPos);
    
    doc.setFontSize(10);
    yPos += 10;
    frameworkComplianceData.forEach(f => {
      doc.text(`${f.framework}: ${f.rate}% (${f.compliant}/${f.total})`, 14, yPos);
      yPos += 6;
    });
    
    // Requirements List
    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Requirements Details', 14, yPos);
    
    doc.setFontSize(9);
    yPos += 10;
    
    filteredCompliance.slice(0, 30).forEach(item => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      const text = `${item.framework} - ${item.requirement_id || ''} - ${item.status}`;
      doc.text(text.substring(0, 80), 14, yPos);
      yPos += 5;
    });
    
    doc.save(`compliance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success("PDF report exported");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Compliance Analytics</h2>
          <p className="text-slate-400 text-sm">Framework coverage and compliance metrics</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
            <SelectTrigger className="w-40 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white">All Frameworks</SelectItem>
              {frameworks.map(f => (
                <SelectItem key={f} value={f} className="text-white">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-500/20">
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          
          <Button onClick={exportToPDF} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/20">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.complianceRate}%</div>
                <div className="text-xs text-slate-400">Compliance Rate</div>
              </div>
            </div>
            <Progress value={metrics.complianceRate} className="h-2" />
            <div className="text-xs text-emerald-400 mt-2">{metrics.compliant} of {metrics.total} compliant</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.verified}</div>
                <div className="text-xs text-slate-400">Verified</div>
              </div>
            </div>
            <div className="text-xs text-blue-400">{metrics.implemented} implemented</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.inProgress}</div>
                <div className="text-xs text-slate-400">In Progress</div>
              </div>
            </div>
            <div className="text-xs text-amber-400">{metrics.notStarted} not started</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.overdue}</div>
                <div className="text-xs text-slate-400">Overdue</div>
              </div>
            </div>
            <div className="text-xs text-rose-400">{metrics.nonCompliant} non-compliant</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="frameworks">Framework Analysis</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Framework Compliance Radar */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-400" />
                  Framework Coverage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                  <p className="text-xs font-semibold text-white mb-2">About This Chart:</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Multi-dimensional view of compliance framework coverage. Each axis represents a different framework, with percentage completion radiating from the center.
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    <span className="font-medium text-slate-300">Use this to:</span> Quickly identify which frameworks need attention and compare relative compliance maturity across standards.
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#2a3548" />
                    <PolarAngleAxis dataKey="framework" stroke="#94a3b8" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#94a3b8" />
                    <Radar 
                      name="Compliance %" 
                      dataKey="compliance" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a2332', 
                        border: '1px solid #2a3548',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Pie Chart */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-blue-400" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                  <p className="text-xs font-semibold text-white mb-2">About This Chart:</p>
                  <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                    <li><span className="font-medium text-emerald-400">Implemented/Verified:</span> Requirements fully met</li>
                    <li><span className="font-medium text-blue-400">In Progress:</span> Active implementation underway</li>
                    <li><span className="font-medium text-slate-400">Not Started:</span> Planned but not initiated</li>
                    <li><span className="font-medium text-rose-400">Non-Compliant:</span> Requiring immediate action</li>
                  </ul>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a2332', 
                        border: '1px solid #2a3548',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Framework Requirements Bar Chart */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-400" />
                  Requirements by Framework
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                  <p className="text-xs font-semibold text-white mb-2">Framework Requirements Coverage</p>
                  <p className="text-xs text-slate-400">
                    Total requirements mapped per framework. Higher bars indicate more comprehensive framework adoption.
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={frameworkData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a2332', 
                        border: '1px solid #2a3548',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Framework Compliance Details */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  Framework Compliance Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {frameworkComplianceData.map(f => (
                  <div key={f.framework} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{f.framework}</span>
                      <Badge className={`${f.rate >= 80 ? 'bg-emerald-500/20 text-emerald-400' : f.rate >= 60 ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-500/20 text-amber-400'} border-0`}>
                        {f.rate}%
                      </Badge>
                    </div>
                    <Progress value={f.rate} className="h-2" />
                    <div className="text-xs text-slate-500">{f.compliant} of {f.total} requirements met</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="status">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-400" />
                Detailed Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-3 bg-[#0f1623] rounded-lg border border-[#2a3548]">
                <p className="text-xs font-semibold text-white mb-2">Detailed Status Analysis</p>
                <p className="text-xs text-slate-400 mb-2">
                  Comprehensive breakdown of requirement statuses across the organization.
                </p>
                <p className="text-xs text-slate-500">
                  Each bar represents exact counts for strategic planning and resource allocation.
                </p>
              </div>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a2332', 
                      border: '1px solid #2a3548',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Requirements">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}