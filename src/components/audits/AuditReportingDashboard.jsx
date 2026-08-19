import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Download, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Calendar
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
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

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

export default function AuditReportingDashboard({ audits, findings, workpapers }) {
  const [timeRange, setTimeRange] = useState("all");
  const [auditTypeFilter, setAuditTypeFilter] = useState("all");

  // Filter data based on selections
  const filteredAudits = useMemo(() => {
    let filtered = [...audits];
    
    if (auditTypeFilter !== "all") {
      filtered = filtered.filter(a => a.type === auditTypeFilter);
    }
    
    if (timeRange !== "all") {
      const now = new Date();
      const monthsAgo = timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
      const cutoff = new Date(now.setMonth(now.getMonth() - monthsAgo));
      filtered = filtered.filter(a => new Date(a.created_date) >= cutoff);
    }
    
    return filtered;
  }, [audits, timeRange, auditTypeFilter]);

  const filteredFindings = useMemo(() => {
    const auditIds = new Set(filteredAudits.map(a => a.id));
    return findings.filter(f => auditIds.has(f.audit_id));
  }, [findings, filteredAudits]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = filteredAudits.length;
    const completed = filteredAudits.filter(a => a.status === 'completed').length;
    const inProgress = filteredAudits.filter(a => a.status === 'in_progress').length;
    const totalFindings = filteredFindings.length;
    const criticalFindings = filteredFindings.filter(f => f.severity === 'critical').length;
    const highFindings = filteredFindings.filter(f => f.severity === 'high').length;
    const openFindings = filteredFindings.filter(f => f.status === 'open').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      inProgress,
      totalFindings,
      criticalFindings,
      highFindings,
      openFindings,
      completionRate
    };
  }, [filteredAudits, filteredFindings]);

  // Findings by severity chart data
  const findingsBySeverity = useMemo(() => {
    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    filteredFindings.forEach(f => {
      if (severityCounts[f.severity] !== undefined) {
        severityCounts[f.severity]++;
      }
    });
    
    return [
      { name: 'Critical', value: severityCounts.critical, color: '#ef4444' },
      { name: 'High', value: severityCounts.high, color: '#f59e0b' },
      { name: 'Medium', value: severityCounts.medium, color: '#3b82f6' },
      { name: 'Low', value: severityCounts.low, color: '#10b981' }
    ];
  }, [filteredFindings]);

  // Audit status distribution
  const auditStatusData = useMemo(() => {
    const statusCounts = {};
    filteredAudits.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, ' '),
      value: count
    }));
  }, [filteredAudits]);

  // Audit types distribution
  const auditTypeData = useMemo(() => {
    const typeCounts = {};
    filteredAudits.forEach(a => {
      typeCounts[a.type] = (typeCounts[a.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count
    }));
  }, [filteredAudits]);

  // Trend data (monthly)
  const trendData = useMemo(() => {
    const monthlyData = {};
    
    filteredAudits.forEach(audit => {
      const month = format(new Date(audit.created_date), 'MMM yyyy');
      if (!monthlyData[month]) {
        monthlyData[month] = { month, audits: 0, findings: 0 };
      }
      monthlyData[month].audits++;
    });
    
    filteredFindings.forEach(finding => {
      const month = format(new Date(finding.created_date), 'MMM yyyy');
      if (monthlyData[month]) {
        monthlyData[month].findings++;
      }
    });
    
    return Object.values(monthlyData).sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    ).slice(-6);
  }, [filteredAudits, filteredFindings]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Audit Title', 'Type', 'Status', 'Auditor', 'Start Date', 'Findings Count', 'Critical', 'High'];
    const rows = filteredAudits.map(audit => {
      const auditFindings = filteredFindings.filter(f => f.audit_id === audit.id);
      const critical = auditFindings.filter(f => f.severity === 'critical').length;
      const high = auditFindings.filter(f => f.severity === 'high').length;
      
      return [
        audit.title,
        audit.type,
        audit.status,
        audit.auditor || '',
        audit.start_date ? format(new Date(audit.start_date), 'yyyy-MM-dd') : '',
        auditFindings.length,
        critical,
        high
      ];
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast.success("CSV report exported");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(20);
    doc.text('Audit Dashboard Report', pageWidth / 2, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth / 2, 28, { align: 'center' });
    
    // Metrics Summary
    doc.setFontSize(14);
    doc.text('Executive Summary', 14, 40);
    
    doc.setFontSize(10);
    let yPos = 50;
    doc.text(`Total Audits: ${metrics.total}`, 14, yPos);
    doc.text(`Completed: ${metrics.completed} (${metrics.completionRate}%)`, 14, yPos + 6);
    doc.text(`In Progress: ${metrics.inProgress}`, 14, yPos + 12);
    doc.text(`Total Findings: ${metrics.totalFindings}`, 14, yPos + 18);
    doc.text(`Critical Findings: ${metrics.criticalFindings}`, 14, yPos + 24);
    doc.text(`High Findings: ${metrics.highFindings}`, 14, yPos + 30);
    
    // Findings by Severity
    yPos = 95;
    doc.setFontSize(14);
    doc.text('Findings by Severity', 14, yPos);
    
    doc.setFontSize(10);
    yPos += 10;
    findingsBySeverity.forEach(item => {
      doc.text(`${item.name}: ${item.value}`, 14, yPos);
      yPos += 6;
    });
    
    // Audit List
    yPos += 10;
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Audit Details', 14, yPos);
    
    doc.setFontSize(9);
    yPos += 10;
    
    filteredAudits.slice(0, 20).forEach(audit => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${audit.title} - ${audit.type} - ${audit.status}`, 14, yPos);
      yPos += 5;
    });
    
    doc.save(`audit-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success("PDF report exported");
  };

  return (
    <div className="space-y-6">
      {/* Header with filters and export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Audit Analytics Dashboard</h2>
          <p className="text-slate-400 text-sm">Comprehensive insights and reporting</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white">All Time</SelectItem>
              <SelectItem value="3m" className="text-white">Last 3 Months</SelectItem>
              <SelectItem value="6m" className="text-white">Last 6 Months</SelectItem>
              <SelectItem value="12m" className="text-white">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={auditTypeFilter} onValueChange={setAuditTypeFilter}>
            <SelectTrigger className="w-32 bg-[#151d2e] border-[#2a3548] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1a2332] border-[#2a3548]">
              <SelectItem value="all" className="text-white">All Types</SelectItem>
              <SelectItem value="internal" className="text-white">Internal</SelectItem>
              <SelectItem value="external" className="text-white">External</SelectItem>
              <SelectItem value="regulatory" className="text-white">Regulatory</SelectItem>
              <SelectItem value="it" className="text-white">IT</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToCSV} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
            <FileSpreadsheet className="h-4 w-4" />
            Export CSV
          </Button>
          
          <Button onClick={exportToPDF} variant="outline" className="gap-2 border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
            <FileText className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.total}</div>
                <div className="text-xs text-slate-400">Total Audits</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-blue-400">
              <CheckCircle2 className="h-3 w-3" />
              {metrics.completionRate}% completion rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.completed}</div>
                <div className="text-xs text-slate-400">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              {metrics.inProgress} in progress
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.totalFindings}</div>
                <div className="text-xs text-slate-400">Total Findings</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Clock className="h-3 w-3" />
              {metrics.openFindings} open
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{metrics.criticalFindings}</div>
                <div className="text-xs text-slate-400">Critical</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-rose-400">
              <AlertTriangle className="h-3 w-3" />
              {metrics.highFindings} high severity
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-[#1a2332] border border-[#2a3548]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings Analysis</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Status Distribution */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-indigo-400" />
                  Audit Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={auditStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {auditStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

            {/* Audit Types Distribution */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Audits by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={auditTypeData}>
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
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="findings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Findings by Severity */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                  Findings by Severity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={findingsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {findingsBySeverity.map((entry, index) => (
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

            {/* Findings Summary */}
            <Card className="bg-[#1a2332] border-[#2a3548]">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-400" />
                  Findings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {findingsBySeverity.map(item => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-[#151d2e] border border-[#2a3548]">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <Badge className="bg-slate-500/10 text-white border-slate-500/20">
                      {item.value} findings
                    </Badge>
                  </div>
                ))}
                
                <div className="pt-3 mt-3 border-t border-[#2a3548]">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Findings</span>
                    <span className="text-white font-semibold">{metrics.totalFindings}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-slate-400">Open Findings</span>
                    <span className="text-amber-400 font-semibold">{metrics.openFindings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-[#1a2332] border-[#2a3548]">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                6-Month Audit & Findings Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
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
                  <Line 
                    type="monotone" 
                    dataKey="audits" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    name="Audits Conducted"
                    dot={{ fill: '#3b82f6', r: 5 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="findings" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    name="Findings Identified"
                    dot={{ fill: '#ef4444', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}